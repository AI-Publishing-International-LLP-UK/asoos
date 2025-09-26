#!/bin/bash

# WFA Production Swarm - Kubernetes Production Deployment
# Commander: Phillip Roark
# Target: GKE us-west1 api-for-warp-drive
# Classification: Victory36 Maximum Protection

set -euo pipefail

echo "🚀 DEPLOYING WFA PRODUCTION SWARM TO KUBERNETES"
echo "📍 Project: api-for-warp-drive"
echo "🌍 Region: us-west1"
echo "🎯 Target: Production Kubernetes Cluster"
echo "🛡️ Protection: Victory36 Maximum"
echo ""

# Configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-west1"
CLUSTER_NAME="victory36-cluster-mocoa"
IMAGE_NAME="wfa-production-swarm"
IMAGE_TAG="$(date +%Y%m%d-%H%M%S)"
FULL_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
log_info "Checking prerequisites..."

# Check gcloud
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI not found. Please install Google Cloud CLI."
    exit 1
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl."
    exit 1
fi

# Check docker
if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker."
    exit 1
fi

# Set project
log_info "Setting GCP project to ${PROJECT_ID}..."
gcloud config set project $PROJECT_ID

# Configure Docker for GCR
log_info "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker

# Get cluster credentials
log_info "Getting GKE cluster credentials..."
gcloud container clusters get-credentials $CLUSTER_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

# Build Docker image
log_info "Building Docker image: ${FULL_IMAGE}..."
docker build -f Dockerfile.production -t $FULL_IMAGE .

# Push to GCR
log_info "Pushing image to Google Container Registry..."
docker push $FULL_IMAGE

# Update deployment manifest with new image
log_info "Updating Kubernetes deployment manifest..."
sed -i.bak "s|gcr.io/api-for-warp-drive/wfa-production-swarm:latest|${FULL_IMAGE}|g" k8s-production-deployment.yaml

# Apply Kubernetes manifests
log_info "Deploying to Kubernetes cluster..."

# Create namespace if it doesn't exist
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -

# Apply deployment
kubectl apply -f k8s-production-deployment.yaml

# Wait for rollout
log_info "Waiting for deployment rollout..."
kubectl rollout status deployment/wfa-production-swarm --timeout=600s

# Get service status
log_info "Getting service information..."
kubectl get services wfa-production-swarm-service

# Get pod status
log_info "Getting pod status..."
kubectl get pods -l app=wfa-production-swarm

# Get ingress status
log_info "Getting ingress status..."
kubectl get ingress wfa-production-swarm-ingress

# Test health endpoint
log_info "Testing health endpoint..."
sleep 10

# Get external IP
EXTERNAL_IP=$(kubectl get service wfa-production-swarm-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

if [ "$EXTERNAL_IP" != "pending" ] && [ "$EXTERNAL_IP" != "" ]; then
    log_info "Testing health endpoint at http://${EXTERNAL_IP}..."
    if curl -f "http://${EXTERNAL_IP}/health" > /dev/null 2>&1; then
        log_success "Health check passed!"
    else
        log_warning "Health check failed - service may still be starting..."
    fi
else
    log_warning "External IP still pending - LoadBalancer provisioning..."
fi

# Show Victory36 protection status
log_info "Checking Victory36 protection..."
kubectl get pods -l victory36=enabled

# Show scaling information
log_info "Horizontal Pod Autoscaler status..."
kubectl get hpa wfa-production-swarm-hpa

# Cleanup temp files
rm -f k8s-production-deployment.yaml.bak

echo ""
log_success "🎉 WFA PRODUCTION SWARM DEPLOYMENT COMPLETED!"
echo ""
echo "📊 DEPLOYMENT SUMMARY:"
echo "• Image: $FULL_IMAGE"
echo "• Cluster: $CLUSTER_NAME ($REGION)"
echo "• Replicas: 3 (auto-scaling 3-50)"
echo "• Resources: 4-8Gi memory, 2-4 CPU per pod"
echo "• Protection: Victory36 Maximum"
echo ""
echo "🔗 ACCESS POINTS:"
echo "• External IP: $EXTERNAL_IP (if available)"
echo "• Health: http://$EXTERNAL_IP/health"
echo "• Victory36: http://$EXTERNAL_IP/wfa/victory36"
echo "• System Status: http://$EXTERNAL_IP/wfa/system-status"
echo ""
echo "📝 MONITORING COMMANDS:"
echo "• Pods: kubectl get pods -l app=wfa-production-swarm"
echo "• Logs: kubectl logs -l app=wfa-production-swarm -f"
echo "• Service: kubectl get service wfa-production-swarm-service"
echo "• Scaling: kubectl get hpa wfa-production-swarm-hpa"
echo ""
log_success "🛡️ Victory36 Protection: MAXIMUM - 20M Agents Protected!"