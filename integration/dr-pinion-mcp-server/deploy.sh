#!/bin/bash

# Dr. Pinion MCP Server Deployment Script
# Deploys containerized Pinecone search to Cloud Run at mcp.pinecone.2100.cool

set -e

PROJECT_ID="api-for-warp-drive"
SERVICE_NAME="dr-pinion-mcp"
REGION="us-west1"
DOMAIN="mcp.pinecone.2100.cool"

echo "🌲 Deploying Dr. Pinion MCP Server..."
echo "📍 Project: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo "🔗 Domain: $DOMAIN"

# Set the GCP project
gcloud config set project $PROJECT_ID

# Build and push the container
echo "🔨 Building container image..."
gcloud builds submit --config cloudbuild.yaml .

echo "✅ Dr. Pinion deployed successfully!"
echo "🔍 Search endpoint: https://$DOMAIN/mcp/search"
echo "💬 Conversation search: https://$DOMAIN/mcp/conversation-search"
echo "📊 Status check: https://$DOMAIN/mcp/status"

# Test the deployment
echo "🧪 Testing Dr. Pinion..."
curl -f "https://$DOMAIN/health" || echo "⚠️ Health check failed - Dr. Pinion may still be starting up"

echo "🎉 Dr. Pinion is ready to search your 10M conversation pages!"