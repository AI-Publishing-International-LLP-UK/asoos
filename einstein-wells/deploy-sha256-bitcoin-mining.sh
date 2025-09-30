#!/bin/bash

# REAL SHA-256 BITCOIN MINING - CLOUD DEPLOYMENT
# Critical production deployment - NO SIMULATION
# Einstein Wells Quantum Mining Operations

set -e

echo "🚀 DEPLOYING REAL SHA-256 BITCOIN MINING TO CLOUD"
echo "================================================="
echo "⏰ $(date)"
echo "🌐 Target: Google Cloud Run (us-central1)"
echo "⛏️  Algorithm: SHA-256 (Direct Bitcoin)"
echo "💰 Payout: 3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj"
echo ""

# Set project and region
PROJECT_ID="api-for-warp-drive"
REGION="us-central1"
SERVICE_NAME="einstein-wells-bitcoin-mining"

echo "📋 CLOUD CONFIGURATION:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

# Create production mining configuration
cat > mining-production-config.json << 'EOF'
{
  "pools": [
    {
      "algo": "sha256d",
      "coin": "BTC", 
      "url": "stratum+tcp://stratum.slushpool.com:4444",
      "user": "3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj.einstein-wells-production",
      "pass": "x",
      "keepalive": true,
      "nicehash": false,
      "enabled": true
    }
  ],
  "donate-level": 0,
  "print-time": 30,
  "retries": 5,
  "retry-pause": 5,
  "threads": null,
  "huge-pages": true,
  "cpu-priority": 5,
  "log-level": 2,
  "background": false,
  "colors": false
}
EOF

echo "✅ Production mining configuration created"

# Create production Dockerfile
cat > Dockerfile.bitcoin-mining << 'EOF'
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    build-essential \
    cmake \
    libuv1-dev \
    libssl-dev \
    libhwloc-dev \
    && rm -rf /var/lib/apt/lists/*

# Download and install XMRig
WORKDIR /app
RUN wget -O xmrig.tar.gz https://github.com/xmrig/xmrig/releases/download/v6.20.0/xmrig-6.20.0-linux-x64.tar.gz \
    && tar -xzf xmrig.tar.gz \
    && mv xmrig-6.20.0/* . \
    && rm -rf xmrig.tar.gz xmrig-6.20.0

# Copy configuration
COPY mining-production-config.json ./config.json

# Set environment variables
ENV BITCOIN_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj
ENV BITCOIN_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj
ENV WORKER_NAME=einstein-wells-production

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=5s --retries=3 \
  CMD pgrep xmrig || exit 1

# Start mining
CMD ["./xmrig", "--config=config.json"]
EOF

echo "✅ Production Dockerfile created"

# Build and deploy to Cloud Run
echo "🔧 BUILDING PRODUCTION CONTAINER..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Container build successful"
else
    echo "❌ Container build failed"
    exit 1
fi

echo "🚀 DEPLOYING TO CLOUD RUN..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --platform=managed \
    --memory=2Gi \
    --cpu=2 \
    --min-instances=1 \
    --max-instances=10 \
    --allow-unauthenticated \
    --port=3333 \
    --set-env-vars="BITCOIN_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj,NICEHASH_ADDRESS=NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5,WORKER_NAME=einstein-wells-production"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "⚡ SHA-256 Bitcoin mining is now live on Cloud Run"
    echo "🌐 Service: $SERVICE_NAME"
    echo "📍 Region: $REGION"
    echo "💰 Mining Bitcoin directly to: 3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj"
    echo ""
    echo "📊 Monitor with:"
    echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
    echo ""
    echo "🔍 View logs:"
    echo "   gcloud logs read --project=$PROJECT_ID --filter='resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\"'"
else
    echo "❌ DEPLOYMENT FAILED"
    exit 1
fi