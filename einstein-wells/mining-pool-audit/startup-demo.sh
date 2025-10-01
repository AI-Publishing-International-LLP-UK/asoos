#!/bin/bash

# Mining Pool Audit System - Startup Demo
# Einstein Wells Division - AI Publishing International LLP
# 
# OAuth2/OIDC secured internal audit system - no external API sharing

set -e

echo "🚀 Einstein Wells Mining Pool Audit System - Internal Demo"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mining-pool-audit directory"
    exit 1
fi

# Check Node.js version (require Node 24+)
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "⚠️  Warning: Node.js version 24 or higher recommended (current: $(node -v))"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

# Set environment for demonstration
export NODE_ENV="development"
export GCP_PROJECT_ID="api-for-warp-drive"
export AUDIT_LOG_LEVEL="info"

echo "🔐 OAuth2/OIDC Authentication - Internal Systems Only"
echo "📍 Region: us-west1"
echo "🏢 Organization: AI Publishing International LLP"
echo "🚚 Division: Einstein Wells"

echo ""
echo "Available commands:"
echo "  npm run dev                    # Run audit with default settings"
echo "  npm run audit:pools           # Audit NiceHash and SlushPool"
echo "  npm run audit:full           # Full audit with chain verification"
echo ""

# Prompt user to setup Google Cloud Secret Manager secrets
echo "🔧 Setup Required:"
echo ""
echo "1. Ensure Google Cloud Secret Manager contains these secrets:"
echo "   - mining-pool-oauth2-nicehash-client-id"
echo "   - mining-pool-oauth2-nicehash-client-secret"
echo "   - mining-pool-oauth2-slushpool-client-id"
echo "   - mining-pool-oauth2-slushpool-client-secret"
echo "   - mining-wallet-btc-address"
echo "   - mining-wallet-xmr-address"
echo ""
echo "2. For local development, create .env file with:"
echo "   MINING_POOL_OAUTH2_NICEHASH_CLIENT_ID=your_client_id"
echo "   MINING_POOL_OAUTH2_NICEHASH_CLIENT_SECRET=your_client_secret"
echo "   MINING_WALLET_BTC_ADDRESS=your_btc_address"
echo "   # ... etc"
echo ""

echo "✅ Demo environment ready!"
echo ""
echo "To create Google Cloud secrets (example):"
echo 'gcloud secrets create mining-pool-oauth2-nicehash-client-id --data-file=- <<< "your_client_id"'
echo 'gcloud secrets create mining-wallet-btc-address --data-file=- <<< "3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj"'
echo ""
echo "Run: npm run dev --pools nicehash,slushpool --verbose"