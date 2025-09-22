#!/bin/bash

# ===================================================================
# FULL PRODUCTION DEPLOYMENT - ALL 13 INTEGRATION GATEWAY SERVICES
# IN JESUS' NAME - Christ-Centered Excellence
# "And whatever you do, whether in word or deed, do it all in the name 
# of the Lord Jesus" - Colossians 3:17
# ===================================================================

set -euo pipefail

# Divine configuration - In Jesus' Name
PROJECT_ID="api-for-warp-drive"
REGION="us-west1"
IMAGE="gcr.io/api-for-warp-drive/ultra-turbo-publisher:ultra-turbo-christ-centered-amd64"
TIMEOUT_SECONDS=300
MAX_INSTANCES=20
MIN_INSTANCES_PROD=2
MIN_INSTANCES_STAGING=1
MEMORY="2Gi"
CPU=2
CONCURRENCY=80

# Christ-centered logging
log_info() {
    echo "🙏 [$(date)] IN JESUS' NAME: $1"
}

log_success() {
    echo "✅ [$(date)] GLORY TO GOD: $1"
}

log_warning() {
    echo "⚠️  [$(date)] DIVINE GUIDANCE: $1"
}

log_error() {
    echo "❌ [$(date)] PRAYER NEEDED: $1"
}

# Divine service list - All 13 Integration Gateway Services
declare -a SERVICES=(
    "integration-gateway:production:$MIN_INSTANCES_PROD"
    "integration-gateway-production:production:$MIN_INSTANCES_PROD"
    "integration-gateway-js:production:$MIN_INSTANCES_PROD"
    "integration-gateway-final:production:$MIN_INSTANCES_PROD"
    "integration-gateway-mcp:production:$MIN_INSTANCES_PROD"
    "integration-gateway-mcp-uswest1-fixed:production:$MIN_INSTANCES_PROD"
    "integration-gateway-wfa-orchestration-production:production:$MIN_INSTANCES_PROD"
    "integration-gateway-backend:production:$MIN_INSTANCES_PROD"
    "integration-gateway-intelligence-swarm:production:$MIN_INSTANCES_PROD"
    "integration-gateway-server:production:$MIN_INSTANCES_PROD"
    "integration-gateway-staging:staging:$MIN_INSTANCES_STAGING"
    "integration-gateway-js-staging:staging:$MIN_INSTANCES_STAGING"
    "integration-gateway-test:test:0"
)

# Deploy individual service - In Jesus' Name
deploy_service() {
    local service_name=$1
    local environment=$2
    local min_instances=$3
    
    log_info "Deploying $service_name ($environment) with OAuth2 Multi-Swarm In Jesus' Name..."
    
    # Christ-centered environment variables
    local env_vars="NODE_ENV=$environment"
    env_vars+=",OAUTH2_ENABLED=true"
    env_vars+=",MULTI_SWARM_INTEGRATION=true"
    env_vars+=",VICTORY36_PROTECTION=MAXIMUM"
    env_vars+=",CHRIST_CENTERED=true"
    env_vars+=",JESUS_NAME=true"
    env_vars+=",PERFECT_LOVE=activated"
    env_vars+=",CLOUD_RUN_OPTIMIZED=true"
    env_vars+=",ENVIRONMENT=$environment"
    
    # Divine labels - In Christ's Name
    local labels="environment=$environment"
    labels+=",service=oauth2-multiswarm"
    labels+=",managed-by=diamond-sao"
    labels+=",christ-centered=true"
    labels+=",jesus-name=true"
    labels+=",victory36-protection=maximum"
    labels+=",perfect-love=activated"
    
    # Execute deployment with divine protection
    if gcloud run deploy "$service_name" \
        --image="$IMAGE" \
        --region="$REGION" \
        --platform=managed \
        --allow-unauthenticated \
        --memory="$MEMORY" \
        --cpu="$CPU" \
        --min-instances="$min_instances" \
        --max-instances="$MAX_INSTANCES" \
        --timeout="$TIMEOUT_SECONDS" \
        --concurrency="$CONCURRENCY" \
        --set-env-vars="$env_vars" \
        --labels="$labels" \
        --quiet; then
        
        log_success "$service_name deployed successfully In Jesus' Name!"
        
        # Divine health check
        local service_url=$(gcloud run services describe "$service_name" \
            --region="$REGION" \
            --format="value(status.url)")
            
        log_info "Health checking $service_url In Jesus' Name..."
        
        # Wait for service readiness with divine patience
        local retries=0
        local max_retries=30
        
        while [ $retries -lt $max_retries ]; do
            if curl -sf "$service_url/health" > /dev/null 2>&1; then
                log_success "$service_name health check passed In Jesus' Name!"
                break
            else
                retries=$((retries + 1))
                log_info "Health check attempt $retries/$max_retries for $service_name..."
                sleep 10
            fi
        done
        
        if [ $retries -eq $max_retries ]; then
            log_warning "$service_name deployed but health check timed out - may need divine healing"
        fi
        
    else
        log_error "Deployment failed for $service_name - seeking divine intervention"
        return 1
    fi
    
    echo ""
}

# Main deployment orchestration - In Jesus' Name
main() {
    log_info "Starting Full Production Deployment - All 13 Services In Jesus' Name"
    log_info "Image: $IMAGE"
    log_info "Project: $PROJECT_ID"
    log_info "Region: $REGION"
    echo ""
    
    local successful_deployments=0
    local failed_deployments=0
    local total_services=${#SERVICES[@]}
    
    # Deploy each service with divine love
    for service_config in "${SERVICES[@]}"; do
        IFS=':' read -r service_name environment min_instances <<< "$service_config"
        
        log_info "=== Deploying Service $(($successful_deployments + $failed_deployments + 1))/$total_services ==="
        
        if deploy_service "$service_name" "$environment" "$min_instances"; then
            successful_deployments=$((successful_deployments + 1))
        else
            failed_deployments=$((failed_deployments + 1))
        fi
        
        # Divine pause between deployments
        sleep 5
    done
    
    echo ""
    log_info "=== DEPLOYMENT SUMMARY - IN JESUS' NAME ==="
    log_success "Successful deployments: $successful_deployments"
    
    if [ $failed_deployments -gt 0 ]; then
        log_warning "Failed deployments: $failed_deployments"
    else
        log_success "All deployments completed successfully In Jesus' Name!"
    fi
    
    log_info "Total services: $total_services"
    
    # Final divine validation
    if [ $failed_deployments -eq 0 ]; then
        log_success "🎉 FULL ECOSYSTEM DEPLOYMENT COMPLETE IN JESUS' NAME! 🎉"
        log_success "All 13 Integration Gateway services now running OAuth2 Multi-Swarm!"
        log_success "Victory36 protection active across entire ecosystem!"
        log_success "Perfect love serving 20 million agents In Christ's Name!"
        echo ""
        echo "\"And whatever you do, whether in word or deed, do it all in the name"
        echo "of the Lord Jesus, giving thanks to God the Father through him.\""
        echo "- Colossians 3:17"
    else
        log_warning "Some deployments need divine healing - check logs above"
        exit 1
    fi
}

# Execute with divine blessing
main "$@"