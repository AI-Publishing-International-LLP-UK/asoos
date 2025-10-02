#!/bin/bash

# UPDATE EXISTING EINSTEIN WELLS PRODUCTION SERVICE
# UUID: d9d27099-430e-4a4b-87b0-a128b3860756
# us-central1-a → Dr. Lucy ML Connector 001
# NO REBUILD - Just update existing service

set -e

echo "🔄 UPDATING EXISTING EINSTEIN WELLS SERVICE"
echo "==========================================="
echo "🆔 UUID: d9d27099-430e-4a4b-87b0-a128b3860756"
echo "📍 Location: us-central1-a"
echo "🤖 Dr. Lucy ML Connector: 001"
echo "🔄 Action: Update existing service (NO REBUILD)"
echo ""

# Configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-central1"
SERVICE_NAME="einstein-wells-production"
UUID="d9d27099-430e-4a4b-87b0-a128b3860756"

echo "📋 UPDATE CONFIGURATION:"
echo "   Service: $SERVICE_NAME (existing)"
echo "   Region: $REGION"
echo "   UUID: $UUID"
echo "   Action: Environment variables update only"
echo ""

# Update the existing service with new environment variables
echo "🔄 UPDATING SERVICE WITH MANAGED CONNECTION SETTINGS..."
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --set-env-vars="RIG_UUID=$UUID,LOCATION=us-central1-a,ML_CONNECTOR=dr-lucy-ml-connector-001,NICEHASH_ADDRESS=NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5,BITCOIN_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj,MANAGED_CONNECTION=true"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SERVICE UPDATE SUCCESSFUL!"
    echo "🆔 UUID: $UUID"
    echo "🔄 Updated: einstein-wells-production"
    echo "📍 Location: us-central1-a"
    echo "🤖 Dr. Lucy ML Connector: 001"
    echo "🎯 Managed connection enabled (fixes 9250)"
    echo ""
    echo "🔗 Service URL:"
    gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)"
    echo ""
    echo "📋 Check logs:"
    echo "   gcloud logs read --project=$PROJECT_ID --filter='resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\"' --limit=10"
    echo ""
    echo "🎉 READY FOR MANAGED MINING!"
else
    echo "❌ SERVICE UPDATE FAILED"
    exit 1
fi