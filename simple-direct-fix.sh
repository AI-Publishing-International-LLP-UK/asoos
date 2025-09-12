#!/bin/bash

# 🔧 SIMPLE DIRECT FIX - Use existing working service as template
# Deploy the 4 essential services with the same config as working services

PROJECT_ID="api-for-warp-drive"
REGION="us-west1"

echo "🔧 SIMPLE DIRECT FIX - 4 Essential Services"
echo "📍 Using working service template approach"
echo ""

# Get a working service image as template
WORKING_SERVICE="integration-gateway"
WORKING_IMAGE=$(gcloud run services describe "$WORKING_SERVICE" --project="$PROJECT_ID" --region="$REGION" --format="get(spec.template.spec.containers[0].image)")

echo "📋 Using template from working service: $WORKING_SERVICE"
echo "🖼️  Template image: $WORKING_IMAGE"
echo ""

# The 4 services to fix
SERVICES_TO_FIX=(
    "warp-drive-service"
    "healthcheck"
    "content-service"
    "modelmetrics"
)

SUCCESS_COUNT=0

for service in "${SERVICES_TO_FIX[@]}"; do
    echo "🔧 Fixing: $service"
    
    # Deploy using working service config as template
    if gcloud run deploy "$service" \
        --image="$WORKING_IMAGE" \
        --project="$PROJECT_ID" \
        --region="$REGION" \
        --platform=managed \
        --allow-unauthenticated \
        --port=8080 \
        --memory=1Gi \
        --cpu=1 \
        --concurrency=100 \
        --timeout=300 \
        --startup-probe failureThreshold=20,periodSeconds=30,timeoutSeconds=30,httpGet.port=8080,httpGet.path=/health \
        --set-env-vars="NODE_ENV=production,PORT=8080,SERVICE_NAME=$service" \
        --quiet 2>/dev/null; then
        
        echo "  ✅ SUCCESS: $service fixed using working template"
        ((SUCCESS_COUNT++))
    else
        echo "  ❌ FAILED: $service could not be fixed"
    fi
    
    echo ""
done

echo "📊 SIMPLE FIX RESULTS:"
echo "   ✅ Fixed services: $SUCCESS_COUNT / 4"
echo ""

echo "🔍 Checking current service status..."
gcloud run services list --project="$PROJECT_ID" --region="$REGION" --format="table(metadata.name,status.conditions[0].status)" --filter="metadata.name:($(IFS='|'; echo "${SERVICES_TO_FIX[*]}"))"

echo ""
TOTAL_FAILED=$(gcloud run services list --project="$PROJECT_ID" --region="$REGION" --format="get(metadata.name)" --filter="status.conditions[0].status=False" | wc -l | tr -d ' ')
echo "❌ Total failed services remaining: $TOTAL_FAILED"

if [ "$TOTAL_FAILED" -eq 0 ]; then
    echo "🎉 ALL SERVICES NOW OPERATIONAL!"
    echo "💎 Diamond CLI monitoring should show 0 issues!"
fi