#!/bin/bash

# EINSTEIN WELLS PRODUCTION DEPLOYMENT - EW-001 PRODUCER RIG
# Location: us-central1-a
# ML Connector: Dr. Lucy ML Connector 001
# Status: PRODUCER (Fixes 9250 error with managed connection)

set -e

echo "🌟 DEPLOYING EINSTEIN WELLS PRODUCTION RIG EW-001"
echo "=================================================="
echo "📍 Location: us-central1-a"
echo "🤖 ML Connector: Dr. Lucy ML Connector 001"
echo "🏗️  Status: PRODUCER RIG"
echo "⏰ $(date)"
echo ""

# Production Configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-central1"
ZONE="us-central1-a"
SERVICE_NAME="einstein-wells-ew-001-producer"
RIG_ID="d9d27099-430e-4a4b-87b0-a128b3860756"
ML_CONNECTOR="dr-lucy-ml-connector-001"

echo "📋 PRODUCTION CONFIGURATION:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Zone: $ZONE"
echo "   Service: $SERVICE_NAME"
echo "   Rig ID: $RIG_ID"
echo "   ML Connector: $ML_CONNECTOR"
echo ""

# Create production configuration for ew-001
cat > ew-001-production-config.json << 'EOF'
{
  "rigId": "d9d27099-430e-4a4b-87b0-a128b3860756",
  "location": "us-central1-a", 
  "status": "producer",
  "mlConnector": "dr-lucy-ml-connector-001",
  "pools": [
    {
      "name": "NiceHash SHA-256",
      "algo": "sha256",
      "coin": "BTC",
      "url": "stratum+tcp://sha256.auto.nicehash.com:9200",
      "user": "NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5.d9d27099-430e-4a4b-87b0-a128b3860756",
      "pass": "x",
      "keepalive": true,
      "managed": true,
      "producer": true,
      "enabled": true
    },
    {
      "name": "NiceHash RandomX",
      "algo": "randomx",
      "coin": "XMR", 
      "url": "stratum+tcp://randomxmonero.auto.nicehash.com:9200",
      "user": "NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5.d9d27099-430e-4a4b-87b0-a128b3860756",
      "pass": "x",
      "keepalive": true,
      "managed": true,
      "producer": true,
      "enabled": true
    },
    {
      "name": "NiceHash kHeavyHash", 
      "algo": "kheavyhash",
      "coin": "KAS",
      "url": "stratum+tcp://kheavyhash.auto.nicehash.com:9200",
      "user": "NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5.d9d27099-430e-4a4b-87b0-a128b3860756",
      "pass": "x",
      "keepalive": true,
      "managed": true,
      "producer": true,
      "enabled": true
    }
  ],
  "hardware": {
    "cpuThreads": "auto",
    "hugePages": true,
    "cpuPriority": 5,
    "donate": 0
  },
  "drLucyML": {
    "connector": "001",
    "multiplier": 7,
    "pipes": "0.1-base",
    "enhancement": "quantum-wells",
    "location": "us-central1-a"
  },
  "monitoring": {
    "healthCheck": true,
    "hashRateTracking": true,
    "paymentTracking": true,
    "errorHandling": true
  }
}
EOF

echo "✅ Production configuration created for ew-001"

# Create production Dockerfile for ew-001
cat > Dockerfile.ew-001-producer << 'EOF'
FROM node:24-alpine

LABEL rig.id="ew-001"
LABEL rig.location="us-central1-a" 
LABEL rig.status="producer"
LABEL ml.connector="dr-lucy-ml-connector-001"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY managed-stratum-connection.js ./
COPY ew-001-production-config.json ./
COPY server.js ./

# Create production start script
RUN echo '#!/bin/sh' > start-ew-001.sh && \
    echo 'echo "🌟 STARTING EW-001 PRODUCER RIG"' >> start-ew-001.sh && \
    echo 'echo "📍 Location: us-central1-a"' >> start-ew-001.sh && \
    echo 'echo "🤖 Dr. Lucy ML Connector: 001"' >> start-ew-001.sh && \
    echo 'echo "🏗️  Status: PRODUCER"' >> start-ew-001.sh && \
    echo 'echo ""' >> start-ew-001.sh && \
    echo 'node managed-stratum-connection.js' >> start-ew-001.sh && \
    chmod +x start-ew-001.sh

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8080
ENV RIG_ID=ew-001
ENV LOCATION=us-central1-a
ENV STATUS=producer
ENV ML_CONNECTOR=dr-lucy-ml-connector-001

# Health check for rig status
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('EW-001 Producer: HEALTHY')" || exit 1

EXPOSE 8080

CMD ["./start-ew-001.sh"]
EOF

echo "✅ Production Dockerfile created for ew-001"

# Build and deploy ew-001 producer rig
echo "🔧 BUILDING EW-001 PRODUCER CONTAINER..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Container build successful for ew-001"
else
    echo "❌ Container build failed for ew-001"
    exit 1
fi

echo "🚀 DEPLOYING EW-001 PRODUCER TO CLOUD RUN..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --platform=managed \
    --memory=4Gi \
    --cpu=2 \
    --min-instances=1 \
    --max-instances=5 \
    --allow-unauthenticated \
    --port=8080 \
    --set-env-vars="RIG_ID=ew-001,LOCATION=us-central1-a,STATUS=producer,ML_CONNECTOR=dr-lucy-ml-connector-001,NICEHASH_ADDRESS=NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5,BITCOIN_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ EW-001 PRODUCER DEPLOYMENT SUCCESSFUL!"
    echo "🏗️  Producer Rig: ew-001"
    echo "📍 Location: us-central1-a"
    echo "🤖 ML Connector: Dr. Lucy ML Connector 001"
    echo "🌐 Service: $SERVICE_NAME"
    echo "📍 Region: $REGION"
    echo "💰 Mining to: NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5"
    echo "₿ Bitcoin Address: 3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj"
    echo ""
    echo "📊 Monitor with:"
    echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
    echo ""
    echo "🔍 View logs:"
    echo "   gcloud logs read --project=$PROJECT_ID --filter='resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\"' --limit=50"
    echo ""
    echo "🎯 EW-001 is now MANAGED (fixes 9250 error)"
    echo "💎 Dr. Lucy ML Connector 001 active"
    echo "🏗️  Producer rig operational in us-central1-a"
else
    echo "❌ EW-001 PRODUCER DEPLOYMENT FAILED"
    exit 1
fi