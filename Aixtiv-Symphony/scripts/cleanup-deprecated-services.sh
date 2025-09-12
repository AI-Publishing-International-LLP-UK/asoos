#!/bin/bash

# 🧹 Diamond CLI - Deprecated Service Cleanup Script
# 🏛️  Authority: Diamond SAO Command Center
# 🎯 Purpose: Remove broken services that have working alternatives

set -e

PROJECT="api-for-warp-drive"
REGION="us-west1"

echo "💎 Diamond CLI - Deprecated Service Cleanup"
echo "🏛️  Authority: Diamond SAO Command Center"
echo "🎯 Cleaning up deprecated services in $PROJECT ($REGION)"
echo ""

# Services to remove - these are all broken and have working alternatives
DEPRECATED_SERVICES=(
    "asoos-integration-gateway"  # Replaced by integration-gateway-js
)

# Services with missing images - need decision on whether to rebuild or remove
MISSING_IMAGE_SERVICES=(
    "aixtiv-monitor-staging"
    "contextstorage"
    "deletefrompinecone"
    "dr-lucy-webhook"
    "healthcheck"
    "mcp-registry-staging"
    "modelmetrics"
    "mongodb-mcp-oauth-master"
    "mongodb-mcp-oauth-uswest1"
    "onpineconechathistorycreated"
    "onpineconepromptruncreated"
    "searchmemories"
    "searchprompts"
    "storememory"
    "storeprompt"
    "symphony-interface-staging"
    "vls-voice-synthesis-enhanced"
)

# Services with configuration issues - manual fixes needed
CONFIG_ISSUE_SERVICES=(
    "content-service"
    "drlucyautomation"
    "warp-drive-service"
)

cleanup_service() {
    local service_name=$1
    local reason=$2
    
    echo "🗑️  Removing deprecated service: $service_name"
    echo "   Reason: $reason"
    
    if gcloud run services describe "$service_name" --region="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
        echo "   ⚠️  Confirming removal of $service_name..."
        read -p "   Proceed? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gcloud run services delete "$service_name" \
                --region="$REGION" \
                --project="$PROJECT" \
                --quiet
            echo "   ✅ Service $service_name removed"
        else
            echo "   ⏩ Skipped $service_name"
        fi
    else
        echo "   ℹ️  Service $service_name not found - already removed"
    fi
    echo ""
}

echo "🏷️  STEP 1: Removing services with working alternatives"
echo "=============================================="
for service in "${DEPRECATED_SERVICES[@]}"; do
    cleanup_service "$service" "Has working alternative (integration-gateway-js)"
done

echo "🏷️  STEP 2: List services with missing images (manual decision needed)"
echo "=================================================================="
echo "These services have missing container images and need manual review:"
for service in "${MISSING_IMAGE_SERVICES[@]}"; do
    echo "   🤔 $service - Missing image: gcr.io/$PROJECT/$service"
done
echo ""
echo "   To remove these services, run:"
echo "   for service in ${MISSING_IMAGE_SERVICES[*]}; do"
echo "       gcloud run services delete \$service --region=$REGION --project=$PROJECT --quiet"
echo "   done"
echo ""

echo "🏷️  STEP 3: List services with configuration issues"
echo "=============================================="
echo "These services need configuration fixes (PORT binding, etc.):"
for service in "${CONFIG_ISSUE_SERVICES[@]}"; do
    echo "   🔧 $service - Needs configuration fixes"
done
echo ""

echo "✅ Cleanup analysis complete!"
echo "💡 Services with alternatives have been processed"
echo "💡 Review the missing image services and decide whether to rebuild or remove"
echo "💡 Configuration issue services need manual fixes"