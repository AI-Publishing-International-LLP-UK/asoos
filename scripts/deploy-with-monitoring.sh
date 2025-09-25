#!/bin/bash

# 🚀 Integration Gateway - Enhanced Deployment with Self-Monitoring
# Ensures Node.js 24+ deployment and implements automated rollback
# Compatible with AIXTIV-SYMPHONY infrastructure

set -euo pipefail

# Configuration
PROJECT_ID="api-for-warp-drive"
SERVICE_NAME="integration-gateway-js"
REGION_PRIMARY="us-west1"
REGION_SECONDARY="us-central1"
REQUIRED_NODE_VERSION="24"
DIAMOND_SAO_WEBHOOK="https://mocoa-owner-interface-859242575175.us-central1.run.app/api/monitoring/deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Pre-flight checks
log_info "🔍 Running pre-flight checks..."

# Check if required tools are installed
for cmd in gcloud docker jq; do
    if ! command -v $cmd &> /dev/null; then
        log_error "$cmd is required but not installed"
        exit 1
    fi
done

# Verify GCP authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    log_error "Not authenticated with GCP. Run: gcloud auth login"
    exit 1
fi

# Verify project access
if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
    log_error "Cannot access project $PROJECT_ID"
    exit 1
fi

log_success "Pre-flight checks passed"

# Build and validate Docker image
log_info "🏗️  Building Docker image with Node.js $REQUIRED_NODE_VERSION..."

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:$TIMESTAMP"
IMAGE_LATEST="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

# Build image
docker build -t $IMAGE_TAG -t $IMAGE_LATEST .

# Validate Node.js version in built image
NODE_VERSION_IN_IMAGE=$(docker run --rm $IMAGE_TAG node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION_IN_IMAGE" -lt "$REQUIRED_NODE_VERSION" ]; then
    log_error "Image contains Node.js $NODE_VERSION_IN_IMAGE, but $REQUIRED_NODE_VERSION+ is required"
    exit 1
fi

log_success "Docker image built with Node.js $NODE_VERSION_IN_IMAGE"

# Push to Container Registry
log_info "📦 Pushing to Google Container Registry..."
docker push $IMAGE_TAG
docker push $IMAGE_LATEST

# Deploy with zero-downtime strategy
deploy_service() {
    local region=$1
    log_info "🚀 Deploying to $region..."
    
    # Deploy new revision without traffic
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_TAG \
        --region $region \
        --platform managed \
        --port 8080 \
        --memory 1Gi \
        --cpu 1000m \
        --min-instances 1 \
        --max-instances 100 \
        --concurrency 80 \
        --timeout 300 \
        --set-env-vars="NODE_ENV=production,DEPLOYMENT_TIMESTAMP=$TIMESTAMP,NODE_VERSION=$NODE_VERSION_IN_IMAGE" \
        --no-traffic \
        --quiet
    
    # Get the new revision name
    NEW_REVISION=$(gcloud run revisions list \
        --service $SERVICE_NAME \
        --region $region \
        --limit 1 \
        --format="value(metadata.name)")
    
    log_info "📊 New revision: $NEW_REVISION"
    
    # Gradual traffic migration with health checks
    log_info "🔄 Starting gradual traffic migration..."
    
    # 10% traffic
    gcloud run services update-traffic $SERVICE_NAME \
        --to-revisions $NEW_REVISION=10 \
        --region $region \
        --quiet
    
    log_info "⏳ Health check (10% traffic)..."
    sleep 120
    
    if ! health_check $region; then
        log_error "Health check failed at 10% traffic"
        rollback_deployment $region
        return 1
    fi
    
    # 50% traffic
    gcloud run services update-traffic $SERVICE_NAME \
        --to-revisions $NEW_REVISION=50 \
        --region $region \
        --quiet
    
    log_info "⏳ Health check (50% traffic)..."
    sleep 180
    
    if ! health_check $region; then
        log_error "Health check failed at 50% traffic"
        rollback_deployment $region
        return 1
    fi
    
    # 100% traffic
    gcloud run services update-traffic $SERVICE_NAME \
        --to-revisions $NEW_REVISION=100 \
        --region $region \
        --quiet
    
    log_info "⏳ Final health check (100% traffic)..."
    sleep 120
    
    if ! health_check $region; then
        log_error "Health check failed at 100% traffic"
        rollback_deployment $region
        return 1
    fi
    
    log_success "✅ Deployment successful in $region"
    return 0
}

# Health check function
health_check() {
    local region=$1
    local service_url=$(gcloud run services describe $SERVICE_NAME \
        --region $region \
        --format="value(status.url)")
    
    # Check /health endpoint
    if curl -sf "$service_url/health" > /dev/null; then
        log_success "Health check passed for $region"
        return 0
    else
        log_error "Health check failed for $region"
        return 1
    fi
}

# Rollback function
rollback_deployment() {
    local region=$1
    log_warning "🔄 Rolling back deployment in $region..."
    
    # Get previous revision
    PREVIOUS_REVISION=$(gcloud run revisions list \
        --service $SERVICE_NAME \
        --region $region \
        --limit 2 \
        --format="value(metadata.name)" | tail -1)
    
    if [ -n "$PREVIOUS_REVISION" ]; then
        gcloud run services update-traffic $SERVICE_NAME \
            --to-revisions $PREVIOUS_REVISION=100 \
            --region $region \
            --quiet
        log_success "Rolled back to $PREVIOUS_REVISION"
    else
        log_error "No previous revision found for rollback"
    fi
}

# Deploy to all regions
log_info "🌍 Starting multi-region deployment..."

DEPLOYMENT_SUCCESS=true

for region in $REGION_PRIMARY $REGION_SECONDARY; do
    if ! deploy_service $region; then
        DEPLOYMENT_SUCCESS=false
        log_error "Deployment failed in $region"
    fi
done

# Send deployment notification to Diamond SAO Command Center
send_deployment_notification() {
    local status=$1
    local payload='{
        "service": "'$SERVICE_NAME'",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "image_tag": "'$IMAGE_TAG'",
        "node_version": "'$NODE_VERSION_IN_IMAGE'",
        "regions": ["'$REGION_PRIMARY'", "'$REGION_SECONDARY'"],
        "status": "'$status'",
        "deployment_id": "'$TIMESTAMP'",
        "self_healing_enabled": true
    }'
    
    if curl -sf -X POST "$DIAMOND_SAO_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "$payload" > /dev/null; then
        log_success "Notification sent to Diamond SAO Command Center"
    else
        log_warning "Failed to send notification to Diamond SAO"
    fi
}

# Final status and cleanup
if [ "$DEPLOYMENT_SUCCESS" = true ]; then
    log_success "🎉 Deployment completed successfully!"
    log_info "📊 Service URLs:"
    echo "   Primary: https://$SERVICE_NAME-859242575175.$REGION_PRIMARY.run.app"
    echo "   Secondary: https://$SERVICE_NAME-859242575175.$REGION_SECONDARY.run.app"
    
    send_deployment_notification "success"
    
    # Clean up old images (keep last 10)
    log_info "🧹 Cleaning up old images..."
    gcloud container images list-tags gcr.io/$PROJECT_ID/$SERVICE_NAME \
        --limit=999 --sort-by=TIMESTAMP \
        --format="get(digest)" | tail -n +11 | \
        xargs -r gcloud container images delete --force-delete-tags --quiet || true
    
    exit 0
else
    log_error "❌ Deployment failed in one or more regions"
    send_deployment_notification "failed"
    exit 1
fi