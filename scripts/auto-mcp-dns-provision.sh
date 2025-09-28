#!/bin/bash
# Automatic MCP DNS Provisioning Webhook
# Triggered when new MCP services are deployed

MCP_SERVICE_NAME="$1"
MCP_CATEGORY="${2:-general}"
PROJECT="api-for-warp-drive"
ZONE="main-zone"
REGION="us-west1"

if [ -z "$MCP_SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [category]"
    exit 1
fi

echo "🚀 Auto-provisioning MCP DNS for: $MCP_SERVICE_NAME"

# Get service URL
SERVICE_URL=$(gcloud run services describe "$MCP_SERVICE_NAME" --region="$REGION" --format="value(status.url)" 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
    echo "⚠️  Service $MCP_SERVICE_NAME not found in Cloud Run"
    exit 1
fi

# Generate DNS records using universal template
CLEAN_URL=$(echo "$SERVICE_URL" | sed 's/https\?:\/\///')

echo "🔧 Creating DNS: $MCP_SERVICE_NAME.mcp.asoos.2100.cool → $CLEAN_URL"
node /Users/as/asoos/integration-gateway/universal-mcp-dns-manager.js --provision "$MCP_SERVICE_NAME" "$SERVICE_URL"

echo "🎉 MCP DNS provisioning complete for $MCP_SERVICE_NAME"
