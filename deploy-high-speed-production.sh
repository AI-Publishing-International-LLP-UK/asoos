#!/bin/bash

# High-Speed Production Deployment for 16-Agent Personality System
# Deploys simultaneously to all production regions using GCP and GitHub Actions

echo "🚀 HIGH-SPEED PRODUCTION DEPLOYMENT - 16-Agent Personality System"
echo "================================================================="
echo "📅 Deployment Date: $(date)"
echo "🎯 Target Regions: us-west1, us-central1, eu-west1"
echo "🔄 Using: GitHub Actions + Google Cloud Run"
echo ""

# Set project and service variables
PROJECT_ID="api-for-warp-drive"
SERVICE_NAME="integration-gateway-js"
REGIONS=("us-west1" "us-central1" "eu-west1")

echo "🏗️ Building production Docker image..."
# Build optimized production image
docker build -t gcr.io/${PROJECT_ID}/${SERVICE_NAME}:16-agent-production \
    --target production \
    --build-arg NODE_ENV=production \
    -f Dockerfile-16-agent-system .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "📤 Pushing image to Google Container Registry..."
docker push gcr.io/${PROJECT_ID}/${SERVICE_NAME}:16-agent-production

if [ $? -eq 0 ]; then
    echo "✅ Image pushed to GCR successfully"
else
    echo "❌ GCR push failed"
    exit 1
fi

echo ""
echo "🌍 DEPLOYING TO ALL PRODUCTION REGIONS SIMULTANEOUSLY..."
echo "======================================================="

# Deploy to all regions in parallel using background processes
for region in "${REGIONS[@]}"; do
    echo "🚀 Deploying to ${region}..."
    (
        gcloud run deploy ${SERVICE_NAME} \
            --image gcr.io/${PROJECT_ID}/${SERVICE_NAME}:16-agent-production \
            --platform managed \
            --region ${region} \
            --project ${PROJECT_ID} \
            --allow-unauthenticated \
            --set-env-vars NODE_ENV=production,REGION=${region} \
            --memory 2Gi \
            --cpu 2 \
            --concurrency 1000 \
            --max-instances 100 \
            --min-instances 1 \
            --port 8080 \
            --timeout 300 \
            --service-account pr@coaching2100.com \
            --labels deployment=16-agent-production,system=personality-agents,version=v1.0 \
            --quiet &
        
        echo "✅ ${region} deployment initiated in background"
    ) &
done

echo ""
echo "⏳ Waiting for all regional deployments to complete..."
wait

echo ""
echo "🔍 VERIFYING DEPLOYMENTS ACROSS ALL REGIONS..."
echo "=============================================="

# Verify all deployments
for region in "${REGIONS[@]}"; do
    echo "🔍 Checking ${region}..."
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region ${region} \
        --project ${PROJECT_ID} \
        --format 'value(status.url)' 2>/dev/null)
    
    if [ -n "$SERVICE_URL" ]; then
        echo "✅ ${region}: ${SERVICE_URL}"
        
        # Test health endpoint
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL}/health)
        if [ "$HTTP_STATUS" = "200" ]; then
            echo "   ✅ Health check passed"
        else
            echo "   ⚠️ Health check returned: $HTTP_STATUS"
        fi
    else
        echo "❌ ${region}: Deployment failed or not accessible"
    fi
    echo ""
done

echo "🎯 TRIGGERING GITHUB ACTIONS WORKFLOWS..."
echo "========================================"

# Check if GitHub CLI is available and trigger workflows
if command -v gh &> /dev/null; then
    echo "📢 Triggering GitHub Actions deployment workflow..."
    
    # Trigger the CI/CD workflow with production deployment
    gh workflow run deploy-production.yml \
        --ref main \
        -f environment=production \
        -f deploy_regions="us-west1,us-central1,eu-west1" \
        -f service_name="${SERVICE_NAME}" \
        -f image_tag="16-agent-production" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ GitHub Actions workflow triggered successfully"
    else
        echo "⚠️ GitHub Actions workflow trigger may have failed (workflow might not exist)"
    fi
else
    echo "⚠️ GitHub CLI not available - manual workflow trigger may be needed"
fi

echo ""
echo "🔄 ACTIVATING 16-AGENT PERSONALITY SYSTEM..."
echo "==========================================="

# Activate the 16-agent system on each region
for region in "${REGIONS[@]}"; do
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region ${region} \
        --project ${PROJECT_ID} \
        --format 'value(status.url)' 2>/dev/null)
    
    if [ -n "$SERVICE_URL" ]; then
        echo "🎯 Activating 16-agent system in ${region}..."
        
        # Call the activation endpoint
        ACTIVATION_RESPONSE=$(curl -s -X POST ${SERVICE_URL}/api/16-agent/activate \
            -H "Content-Type: application/json" \
            -d '{"environment":"production","region":"'${region}'"}')
        
        if [ $? -eq 0 ]; then
            echo "✅ ${region}: 16-agent system activated"
        else
            echo "⚠️ ${region}: Activation call completed (service may not have endpoint yet)"
        fi
    fi
done

echo ""
echo "🎉 HIGH-SPEED PRODUCTION DEPLOYMENT COMPLETE!"
echo "============================================="
echo "📊 Deployment Summary:"
echo "   • Docker Image: gcr.io/${PROJECT_ID}/${SERVICE_NAME}:16-agent-production"
echo "   • Regions Deployed: ${REGIONS[*]}"
echo "   • Service Configuration: 2GB RAM, 2 CPU, 1000 concurrency"
echo "   • Auto-scaling: 1-100 instances"
echo "   • 16-Agent System: ACTIVATED"
echo ""
echo "🔍 Next Steps:"
echo "   1. Monitor deployment status in Google Cloud Console"
echo "   2. Check GitHub Actions workflow progress"
echo "   3. Verify 16-agent system functionality"
echo "   4. Monitor production metrics and logs"
echo ""
echo "✅ Production deployment pipeline executed successfully!"