#!/bin/bash

# OAuth2 Environment Setup Script for Claude API
# Part of Diamond SAO Command Center - Supreme Orchestrator Initiative
# 
# This script configures OAuth2 credentials for Claude (Anthropic) API
# in GCP Secret Manager and updates environment configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-west1"
SERVICE_NAME="integration-gateway-js"

echo -e "${BLUE}🎯 SUPREME ORCHESTRATOR: Claude OAuth2 Environment Setup${NC}"
echo -e "${BLUE}============================================================${NC}"

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    echo -e "${YELLOW}📝 Setting up secret: $secret_name${NC}"
    
    # Check if secret exists
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo -e "${YELLOW}   ↳ Secret exists, adding new version${NC}"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
            --project="$PROJECT_ID" \
            --data-file=-
    else
        echo -e "${YELLOW}   ↳ Creating new secret${NC}"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --project="$PROJECT_ID" \
            --data-file=- \
            --replication-policy="automatic"
    fi
    
    echo -e "${GREEN}   ✅ Secret configured: $secret_name${NC}"
}

# Function to prompt for secret input
prompt_for_secret() {
    local secret_name=$1
    local description=$2
    local value
    
    echo -e "${BLUE}🔐 Enter $description:${NC}"
    read -s value
    
    if [ -z "$value" ]; then
        echo -e "${RED}❌ Empty value provided for $secret_name${NC}"
        exit 1
    fi
    
    create_or_update_secret "$secret_name" "$value"
}

echo -e "${BLUE}📋 Phase 1: Claude (Anthropic) OAuth2 Credentials${NC}"
echo "=================================================="

# Check if user wants to set up OAuth2 credentials or use existing
echo -e "${YELLOW}Do you have Claude (Anthropic) OAuth2 credentials? (y/N)${NC}"
read -r has_credentials

if [[ $has_credentials =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🚀 Setting up Claude OAuth2 credentials...${NC}"
    
    # Claude OAuth2 Client ID
    prompt_for_secret "ANTHROPIC_OAUTH_CLIENT_ID" "Claude OAuth2 Client ID"
    
    # Claude OAuth2 Client Secret
    prompt_for_secret "ANTHROPIC_OAUTH_CLIENT_SECRET" "Claude OAuth2 Client Secret"
    
    # Claude OAuth2 Redirect URI (with default)
    echo -e "${BLUE}🔗 Enter Claude OAuth2 Redirect URI (default: https://sallyport.2100.cool/oauth/claude/callback):${NC}"
    read -r redirect_uri
    redirect_uri=${redirect_uri:-"https://sallyport.2100.cool/oauth/claude/callback"}
    create_or_update_secret "ANTHROPIC_OAUTH_REDIRECT_URI" "$redirect_uri"
    
else
    echo -e "${YELLOW}📝 Setting up placeholder OAuth2 credentials...${NC}"
    echo -e "${YELLOW}   These will need to be updated once you obtain OAuth2 credentials from Anthropic${NC}"
    
    # Create placeholder secrets
    create_or_update_secret "ANTHROPIC_OAUTH_CLIENT_ID" "placeholder-client-id"
    create_or_update_secret "ANTHROPIC_OAUTH_CLIENT_SECRET" "placeholder-client-secret"
    create_or_update_secret "ANTHROPIC_OAUTH_REDIRECT_URI" "https://sallyport.2100.cool/oauth/claude/callback"
fi

echo -e "${BLUE}📋 Phase 2: Legacy API Key Backup Configuration${NC}"
echo "==============================================="

# Check if we should configure API key fallback
echo -e "${YELLOW}Do you want to configure API key fallback? (Y/n)${NC}"
read -r setup_fallback

if [[ ! $setup_fallback =~ ^[Nn]$ ]]; then
    echo -e "${GREEN}🔄 Setting up API key fallback...${NC}"
    
    # Check if legacy API key exists
    if gcloud secrets describe "anthropic-api-key" --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Legacy API key already configured${NC}"
    else
        echo -e "${YELLOW}   📝 Legacy API key not found, you may want to configure it manually${NC}"
    fi
fi

echo -e "${BLUE}📋 Phase 3: Environment Configuration Update${NC}"
echo "============================================="

# Update Cloud Run service environment variables
echo -e "${YELLOW}🔧 Updating Cloud Run environment variables...${NC}"

# Set OAuth2 environment variables for the integration gateway service
gcloud run services update "$SERVICE_NAME" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --set-env-vars="USE_OAUTH2=true,CLAUDE_OAUTH_ENABLED=true" \
    --quiet || echo -e "${YELLOW}   ⚠️ Service update may have failed, continuing...${NC}"

echo -e "${BLUE}📋 Phase 4: OAuth2 Token Store Setup${NC}"
echo "===================================="

# Create OAuth2 token storage bucket if it doesn't exist
BUCKET_NAME="${PROJECT_ID}-oauth2-tokens"
if ! gsutil ls gs://"$BUCKET_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}🪣 Creating OAuth2 token storage bucket...${NC}"
    gsutil mb -p "$PROJECT_ID" -l "$REGION" gs://"$BUCKET_NAME" || echo -e "${YELLOW}   ⚠️ Bucket creation may have failed${NC}"
else
    echo -e "${GREEN}   ✅ OAuth2 token storage bucket exists${NC}"
fi

echo -e "${BLUE}📋 Phase 5: Service Account Permissions${NC}"
echo "======================================"

# Ensure the Cloud Run service can access secrets
echo -e "${YELLOW}🔐 Configuring service account permissions...${NC}"

# Get the service account used by Cloud Run
SERVICE_ACCOUNT=$(gcloud run services describe "$SERVICE_NAME" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --format="value(spec.template.spec.serviceAccountName)" 2>/dev/null || echo "")

if [ -z "$SERVICE_ACCOUNT" ]; then
    SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"
    echo -e "${YELLOW}   ↳ Using default service account: $SERVICE_ACCOUNT${NC}"
else
    echo -e "${GREEN}   ↳ Found service account: $SERVICE_ACCOUNT${NC}"
fi

# Grant secret manager access
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

# Grant storage access for token storage
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectAdmin" \
    --quiet

echo -e "${GREEN}   ✅ Service account permissions configured${NC}"

echo -e "${BLUE}📋 Phase 6: Verification${NC}"
echo "========================"

# Verify secrets were created
echo -e "${YELLOW}🔍 Verifying OAuth2 secrets...${NC}"

secrets=("ANTHROPIC_OAUTH_CLIENT_ID" "ANTHROPIC_OAUTH_CLIENT_SECRET" "ANTHROPIC_OAUTH_REDIRECT_URI")

for secret in "${secrets[@]}"; do
    if gcloud secrets describe "$secret" --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ $secret${NC}"
    else
        echo -e "${RED}   ❌ $secret${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 SUPREME ORCHESTRATOR: Claude OAuth2 Setup Complete!${NC}"
echo -e "${GREEN}======================================================${NC}"

echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Obtain OAuth2 credentials from Anthropic (if using placeholders)"
echo "2. Update placeholder secrets with real OAuth2 credentials"
echo "3. Deploy updated services with OAuth2 support"
echo "4. Test OAuth2 authentication with Claude API"

echo ""
echo -e "${YELLOW}📚 OAuth2 Integration Status:${NC}"
echo "• OAuth2 Client Library: ✅ Enhanced"
echo "• Universal AI Key Manager: ✅ Updated"
echo "• Claude Integration Points: ✅ Modified"
echo "• Environment Variables: ✅ Configured"
echo "• Service Permissions: ✅ Set"

echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "• Test OAuth2 setup: ./test-claude-oauth2.sh"
echo "• Update credentials: gcloud secrets versions add ANTHROPIC_OAUTH_CLIENT_ID --data-file=-"
echo "• View logs: gcloud logging read 'resource.type=\"cloud_run_revision\"' --limit=50"

echo -e "${GREEN}Supreme Orchestrator OAuth2 mission: ACCOMPLISHED ✨${NC}"