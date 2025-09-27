#!/bin/bash

# TESTAMENT ARRAY RETROSPECTIVE SYSTEM - PRODUCTION DEPLOYMENT
# Deploys the complete system to GCP Cloud Run with proper authentication
# @author AI Publishing International LLP
# @classification DIAMOND_SAO_AUTHORIZED

set -e

echo "🕊️ TESTAMENT ARRAY RETROSPECTIVE SYSTEM DEPLOYMENT"
echo "=========================================================="
echo "🔐 Deploying to GCP us-west1 with Diamond SAO authentication"
echo ""

# Configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-west1"
SERVICE_NAME="testament-retrospective-system"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
SALLYPORT_AUTH="https://sallyport.2100.cool"

# Check if gcloud is authenticated
echo "🔐 Checking GCP authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Not authenticated with GCP. Please run 'gcloud auth login'"
    exit 1
fi

echo "✅ GCP authentication verified"

# Set project
gcloud config set project $PROJECT_ID
echo "📋 Project set to: $PROJECT_ID"

# Enable required APIs
echo "⚡ Enabling required GCP APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable firestore.googleapis.com
echo "✅ APIs enabled"

# Create Dockerfile
echo "🐳 Creating production Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start application
CMD ["node", "testament-retrospective-system.js"]
EOF

# Create production package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "testament-retrospective-system",
  "version": "1.0.0",
  "description": "Testament Array Conversation Retrospective System",
  "main": "testament-retrospective-system.js",
  "scripts": {
    "start": "node testament-retrospective-system.js",
    "dev": "node testament-retrospective-system.js",
    "health": "curl -f http://localhost:8080/health || exit 1"
  },
  "dependencies": {
    "@google-cloud/secret-manager": "^5.0.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0",
    "express": "^4.18.0",
    "uuid": "^9.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "author": "AI Publishing International LLP",
  "license": "PROPRIETARY",
  "classification": "DIAMOND_SAO_AUTHORIZED"
}
EOF
fi

# Create production environment file
echo "🔧 Creating production environment configuration..."
cat > .env.production << EOF
NODE_ENV=production
PORT=8080
GCP_PROJECT=${PROJECT_ID}
REGION=${REGION}
SALLYPORT_AUTH=${SALLYPORT_AUTH}
TESTAMENT_ARRAYS_ENABLED=true
BOOK_OF_LIGHT_ACCESS=true
DIDC_ARCHIVES_URL=https://didc.2100.cool/archives
EOF

# Build Docker image
echo "🏗️  Building Docker image..."
gcloud builds submit --tag $IMAGE_NAME --project $PROJECT_ID

# Create or update secrets
echo "🔐 Setting up secrets in Secret Manager..."

# SallyPort OAuth2 credentials
if ! gcloud secrets describe sallyport-client-id --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "testament-client-${SERVICE_NAME}" | gcloud secrets create sallyport-client-id --data-file=- --project=$PROJECT_ID
fi

if ! gcloud secrets describe sallyport-client-secret --project=$PROJECT_ID >/dev/null 2>&1; then
    openssl rand -hex 32 | gcloud secrets create sallyport-client-secret --data-file=- --project=$PROJECT_ID
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production,GCP_PROJECT=$PROJECT_ID,REGION=$REGION \
    --set-secrets SALLYPORT_CLIENT_ID=sallyport-client-id:latest,SALLYPORT_CLIENT_SECRET=sallyport-client-secret:latest \
    --memory 2Gi \
    --cpu 2 \
    --timeout 900s \
    --max-instances 10 \
    --min-instances 1 \
    --concurrency 80 \
    --port 8080 \
    --ingress all \
    --execution-environment gen2

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================================="
echo "📡 Service URL: $SERVICE_URL"
echo "🔐 Authentication: OAuth2 via SallyPort"
echo "💾 Data Source: Testament Arrays via Book of Light DIDC Archives"
echo "⚡ Resources: 2GB RAM, 2 vCPU, 15min timeout"
echo "📊 Capacity: 1-10 instances, 80 concurrent requests"
echo ""
echo "🔍 Test endpoints:"
echo "  Health Check: $SERVICE_URL/health"
echo "  Spring 2024 Retrospective: $SERVICE_URL/retrospective?query=spring%202024"
echo "  Testament Array Status: $SERVICE_URL/testament-status"
echo ""
echo "📋 Next steps:"
echo "  1. Configure SallyPort OAuth2 delegation"
echo "  2. Test Book of Light DIDC archives access"
echo "  3. Verify Testament Array connections"
echo "  4. Set up monitoring and alerting"
echo ""
echo "🕊️ Testament Array Retrospective System is now live in production!"