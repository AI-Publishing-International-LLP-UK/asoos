#!/bin/bash

# CLOUD TO CLOUD DEPLOYMENT
# UUID: d9d27099-430e-4a4b-87b0-a128b3860756  
# us-central1-a → Dr. Lucy ML Connector 001
# Uses existing Dockerfile

set -e

echo "☁️  CLOUD TO CLOUD DEPLOYMENT"
echo "============================="
echo "🆔 UUID: d9d27099-430e-4a4b-87b0-a128b3860756"
echo "📍 Target: us-central1-a"
echo "🤖 Dr. Lucy ML Connector: 001"
echo "🐳 Using: Existing Dockerfile"
echo "⏰ $(date)"
echo ""

# Cloud Configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-central1"
SERVICE_NAME="einstein-wells-managed"
UUID="d9d27099-430e-4a4b-87b0-a128b3860756"

echo "☁️  CLOUD CONFIGURATION:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION (us-central1-a)"
echo "   Service: $SERVICE_NAME"
echo "   UUID: $UUID"
echo "   Dockerfile: ./Dockerfile (existing)"
echo ""

# Build in cloud using existing Dockerfile
echo "🔧 BUILDING IN CLOUD (using existing Dockerfile)..."
gcloud builds submit . --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Cloud build successful"
else
    echo "❌ Cloud build failed"
    exit 1
fi

# Deploy to Cloud Run in us-central1
echo "🚀 DEPLOYING TO CLOUD RUN (us-central1-a)..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --platform=managed \
    --memory=2Gi \
    --cpu=2 \
    --min-instances=1 \
    --max-instances=5 \
    --allow-unauthenticated \
    --port=8080 \
    --set-env-vars="RIG_UUID=$UUID,LOCATION=us-central1-a,ML_CONNECTOR=dr-lucy-ml-connector-001,NICEHASH_ADDRESS=NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5,BITCOIN_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CLOUD TO CLOUD DEPLOYMENT SUCCESSFUL!"
    echo "☁️  Source: Local (build files)"
    echo "☁️  Target: Cloud Run us-central1-a"
    echo "🆔 UUID: $UUID"
    echo "🤖 Dr. Lucy ML Connector: 001"
    echo "🎯 Managed stratum connection (fixes 9250)"
    echo ""
    echo "🔗 Service URL:"
    gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)"
    echo ""
    echo "📊 Monitor:"
    echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
    echo ""
    echo "📋 Logs:"
    echo "   gcloud logs read --project=$PROJECT_ID --filter='resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\"'"
    echo ""
    echo "🎉 CLOUD MINING ACTIVE!"
else
    echo "❌ CLOUD DEPLOYMENT FAILED"
    exit 1
fi