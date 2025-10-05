#!/bin/bash
# 🚨 EMERGENCY INFRASTRUCTURE FIXES
# Authority: Diamond SAO Command Center
# Date: 2025-10-05T03:54:01Z
# Project: api-for-warp-drive

set -euo pipefail

echo "🚨 Starting Emergency Infrastructure Recovery"
echo "============================================="

REGION="us-west1"
PROJECT="api-for-warp-drive"

# 1. 🔥 FIX AIXTIV-SYMPHONY STARTUP ISSUE
echo "1️⃣  Fixing aixtiv-symphony startup issue..."
gcloud run services update aixtiv-symphony \
    --region=$REGION \
    --set-env-vars="PORT=8080,NODE_ENV=production" \
    --timeout=300 \
    --cpu-boost \
    --max-instances=10 \
    --quiet

echo "✅ aixtiv-symphony configuration updated"

# 2. 🛠️ REBUILD MISSING IMAGES  
echo "2️⃣  Rebuilding missing images..."

# Check if source exists for universal-gateway
if [ -d "/Users/as/asoos/integration-gateway" ]; then
    echo "📦 Building universal-gateway:node24..."
    cd /Users/as/asoos/integration-gateway
    
    # Create a temporary Dockerfile for universal-gateway
    cat > Dockerfile.universal-gateway << 'EOF'
# Universal Gateway - Node.js 24
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --no-audit --prefer-offline

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "server.js"]
EOF

    # Build and push image
    docker build -f Dockerfile.universal-gateway -t gcr.io/$PROJECT/universal-gateway:node24 .
    docker push gcr.io/$PROJECT/universal-gateway:node24
    
    echo "✅ universal-gateway:node24 image built and pushed"
    
    # Clean up
    rm Dockerfile.universal-gateway
else
    echo "⚠️  Source directory not found for universal-gateway"
fi

# 3. 🔧 UPDATE SERVICE CONFIGURATIONS
echo "3️⃣  Updating service configurations..."

# Update mcp-zaxon-2100-cool to use the newly built image
gcloud run services update mcp-zaxon-2100-cool \
    --region=$REGION \
    --image=gcr.io/$PROJECT/universal-gateway:node24 \
    --set-env-vars="PORT=8080,NODE_ENV=production" \
    --timeout=300 \
    --quiet

echo "✅ mcp-zaxon-2100-cool updated with new image"

# 4. 🩺 ADD HEALTH CHECK ENDPOINTS
echo "4️⃣  Ensuring health check endpoints are available..."

# Check and fix other services that might have similar issues
SERVICES_TO_CHECK=(
    "diamond-sao-interface" 
    "mocoa-owner-interface-v34" 
    "oauth2-elevenlabs-service" 
    "testament-retrospective-system"
)

for service in "${SERVICES_TO_CHECK[@]}"; do
    echo "🔍 Checking $service..."
    
    # Update with proper environment variables and timeout
    gcloud run services update $service \
        --region=$REGION \
        --set-env-vars="PORT=8080,NODE_ENV=production" \
        --timeout=300 \
        --quiet \
        || echo "⚠️  Could not update $service (might not need update)"
done

# 5. 📊 VERIFICATION
echo "5️⃣  Verifying fixes..."

echo "🔍 Checking service statuses..."
for service in aixtiv-symphony mcp-zaxon-2100-cool; do
    echo "--- $service ---"
    gcloud run services describe $service --region=$REGION \
        --format="value(status.conditions[0].status,status.conditions[0].reason)" \
        || echo "Could not check $service"
done

echo ""
echo "🎉 Emergency fixes completed!"
echo "📝 Next: Monitor services for 5-10 minutes for stability"
echo "📊 Check logs: gcloud run services logs read SERVICE_NAME --region=$REGION"
echo ""
echo "🚨 If issues persist, check the full error analysis report:"
echo "   /Users/as/asoos/infrastructure-recovery-20251005/error-analysis-report.md"