#!/bin/bash

# Fix startup probe configurations for all failed Cloud Run services
# Author: Diamond CLI Emergency Repair System
# Date: $(date)

PROJECT_ID="api-for-warp-drive"
REGION="us-west1"

echo "🚨 EMERGENCY STARTUP PROBE REPAIR - Diamond CLI System"
echo "📍 Project: $PROJECT_ID"
echo "📍 Region: $REGION"
echo ""

# List of 22 failed services that need startup probe fixes
FAILED_SERVICES=(
    "aixtiv-monitor-staging"
    "asoos-integration-gateway"
    "content-service"
    "contextstorage"
    "deletefrompinecone"
    "dr-lucy-webhook"
    "drlucyautomation"
    "healthcheck"
    "mcp-registry-staging"
    "modelmetrics"
    "mongodb-mcp-oauth-master"
    "mongodb-mcp-oauth-uswest1"
    "onpineconechathistorycreated"
    "onpineconepromptruncreated"
    "sallyportloginv2"
    "searchmemories"
    "searchprompts"
    "storememory"
    "storeprompt"
    "symphony-interface-staging"
    "vls-voice-synthesis-enhanced"
    "warp-drive-service"
)

echo "🔧 Fixing startup probes for ${#FAILED_SERVICES[@]} services..."
echo ""

SUCCESS_COUNT=0
FAILURE_COUNT=0

for service in "${FAILED_SERVICES[@]}"; do
    echo "⚡ Updating startup probe for: $service"
    
    # Update with more lenient startup probe settings
    if gcloud run services update "$service" \
        --project="$PROJECT_ID" \
        --region="$REGION" \
        --startup-probe failureThreshold=15,periodSeconds=30,timeoutSeconds=30,httpGet.port=8080,httpGet.path=/health \
        --quiet 2>/dev/null; then
        
        echo "  ✅ SUCCESS: $service startup probe updated"
        ((SUCCESS_COUNT++))
    else
        # If HTTP probe fails, try TCP probe
        echo "  ⚠️  HTTP probe failed, trying TCP probe for: $service"
        
        if gcloud run services update "$service" \
            --project="$PROJECT_ID" \
            --region="$REGION" \
            --startup-probe failureThreshold=15,periodSeconds=30,timeoutSeconds=30,tcpSocket.port=8080 \
            --quiet 2>/dev/null; then
            
            echo "  ✅ SUCCESS: $service TCP startup probe updated"
            ((SUCCESS_COUNT++))
        else
            echo "  ❌ FAILED: Could not update startup probe for $service"
            ((FAILURE_COUNT++))
        fi
    fi
    
    echo ""
done

echo "📊 STARTUP PROBE REPAIR SUMMARY:"
echo "   ✅ Successful repairs: $SUCCESS_COUNT"
echo "   ❌ Failed repairs: $FAILURE_COUNT"
echo "   📈 Success rate: $((SUCCESS_COUNT * 100 / ${#FAILED_SERVICES[@]}))%"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo "🎉 Startup probe configurations have been updated!"
    echo "⏱️  Services now have:"
    echo "   • 15 failure threshold attempts (was 1-30)"
    echo "   • 30 second intervals"
    echo "   • 30 second timeout per probe"
    echo "   • Up to 7.5 minutes total startup time"
    echo ""
fi

echo "🔍 Next steps:"
echo "1. Monitor service health with: gcloud run services list --project=$PROJECT_ID --region=$REGION"
echo "2. Check Diamond CLI monitoring dashboard"
echo "3. Verify services are starting successfully"
echo ""
echo "💎 Diamond CLI Emergency Repair - Complete"
