#!/bin/bash

# PRODUCTION UNIVERSAL API KEY MANAGEMENT
# Replaces all existing get_api_key functions across your MCP system
# Supports customer isolation, auto-provisioning, and all AI services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Production configuration - directly from your environment
GCP_PROJECT=${GCP_PROJECT:-"api-for-warp-drive"}
COMPANY_NAME=${COMPANY_NAME:-""}
STORAGE_OPTION=${STORAGE_OPTION:-"managed-basic"}

# AI Services configuration - PRODUCTION READY
declare -A AI_SERVICES=(
    ["hume"]="hume-api-key,X-Hume-Api-Key,https://api.hume.ai/v0/tts/voices?provider=CUSTOM_VOICE&page_size=1,true"
    ["elevenlabs"]="elevenlabs-api-key,xi-api-key,https://api.elevenlabs.io/v1/voices,false"
    ["openai"]="openai-api-key,Authorization,https://api.openai.com/v1/models,false,bearer"
    ["anthropic"]="anthropic-api-key,x-api-key,https://api.anthropic.com/v1/messages,false"
    ["deepgram"]="deepgram-api-key,Authorization,https://api.deepgram.com/v1/projects,false,token"
)

# PRODUCTION get_api_key function - replaces your existing one
get_api_key() {
    local service="${1:-hume}"  # Default to hume for backward compatibility
    local company="${2:-$COMPANY_NAME}"
    local tier="${3:-$STORAGE_OPTION}"
    
    # Auto-detect service from context if not specified
    if [[ -z "$1" ]] && [[ -n "$HUME_API_KEY" || -n "$API_KEY" ]]; then
        service="hume"  # Backward compatibility
    fi
    
    # Validate service
    if [[ -z "${AI_SERVICES[$service]}" ]]; then
        echo -e "${RED}❌ Unsupported AI service: $service${NC}" >&2
        echo -e "${YELLOW}Supported: ${!AI_SERVICES[*]}${NC}" >&2
        return 1
    fi
    
    IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
    local secret_prefix="${CONFIG[0]}"
    local auto_provision="${CONFIG[3]:-false}"
    
    # Strategy determination based on your MCP architecture
    case "$tier" in
        "customer-managed")
            get_customer_api_key "$service" "$company" "$secret_prefix"
            ;;
        "managed-enterprise")
            if [[ -n "$company" ]]; then
                get_dedicated_api_key "$service" "$company" "$secret_prefix" "$auto_provision"
            else
                get_shared_api_key "$service" "$secret_prefix"
            fi
            ;;
        "managed-premium")
            if [[ -n "$company" ]]; then
                get_dedicated_api_key "$service" "$company" "$secret_prefix" "false"
            else
                get_shared_api_key "$service" "$secret_prefix"
            fi
            ;;
        *)
            get_shared_api_key "$service" "$secret_prefix"
            ;;
    esac
}

# Customer-provided API key (customer-managed tier)
get_customer_api_key() {
    local service="$1"
    local company="$2"
    local secret_prefix="$3"
    
    local secret_name="${secret_prefix}-${company}-customer"
    
    if gcloud secrets versions access latest --secret="$secret_name" --project="$GCP_PROJECT" 2>/dev/null; then
        echo -e "${GREEN}✓ Retrieved customer ${service} API key${NC}" >&2
        log_key_usage "$service" "$company" "customer-provided" "success"
        return 0
    else
        echo -e "${RED}❌ Customer must provide ${service} API key${NC}" >&2
        echo -e "${YELLOW}Create secret: echo 'your-key' | gcloud secrets create $secret_name --data-file=- --project=$GCP_PROJECT${NC}" >&2
        log_key_usage "$service" "$company" "customer-provided" "missing"
        return 1
    fi
}

# Dedicated API key (enterprise/premium tiers)
get_dedicated_api_key() {
    local service="$1"
    local company="$2"
    local secret_prefix="$3"
    local auto_provision="$4"
    
    local secret_name="${secret_prefix}-${company}"
    
    if gcloud secrets versions access latest --secret="$secret_name" --project="$GCP_PROJECT" 2>/dev/null; then
        echo -e "${GREEN}✓ Retrieved dedicated ${service} key for ${company}${NC}" >&2
        log_key_usage "$service" "$company" "dedicated" "success"
        return 0
    elif [[ "$auto_provision" == "true" ]]; then
        echo -e "${YELLOW}🚀 Auto-provisioning ${service} key for ${company}...${NC}" >&2
        if auto_provision_key "$service" "$company" "$secret_prefix"; then
            gcloud secrets versions access latest --secret="$secret_name" --project="$GCP_PROJECT"
            log_key_usage "$service" "$company" "dedicated" "provisioned"
            return 0
        else
            echo -e "${RED}❌ Auto-provisioning failed${NC}" >&2
            log_key_usage "$service" "$company" "dedicated" "provision-failed"
            return 1
        fi
    else
        echo -e "${RED}❌ Dedicated ${service} key not configured for ${company}${NC}" >&2
        echo -e "${YELLOW}Manual setup required for ${service} enterprise tier${NC}" >&2
        log_key_usage "$service" "$company" "dedicated" "missing"
        return 1
    fi
}

# Shared API key (basic tier)
get_shared_api_key() {
    local service="$1"
    local secret_prefix="$2"
    
    # Check environment variables first (backward compatibility)
    case "$service" in
        "hume")
            if [[ -n "$API_KEY" ]]; then
                echo "$API_KEY"
                log_key_usage "$service" "shared" "shared" "env-fallback"
                return 0
            elif [[ -n "$HUME_API_KEY" ]]; then
                echo "$HUME_API_KEY"
                log_key_usage "$service" "shared" "shared" "env-fallback"
                return 0
            fi
            ;;
        "elevenlabs")
            if [[ -n "$ELEVENLABS_API_KEY" ]]; then
                echo "$ELEVENLABS_API_KEY"
                log_key_usage "$service" "shared" "shared" "env-fallback"
                return 0
            fi
            ;;
        "openai")
            if [[ -n "$OPENAI_API_KEY" ]]; then
                echo "$OPENAI_API_KEY"
                log_key_usage "$service" "shared" "shared" "env-fallback"
                return 0
            fi
            ;;
        "anthropic")
            if [[ -n "$ANTHROPIC_API_KEY" ]]; then
                echo "$ANTHROPIC_API_KEY"
                log_key_usage "$service" "shared" "shared" "env-fallback"
                return 0
            fi
            ;;
    esac
    
    # Try GCP Secret Manager
    if gcloud secrets versions access latest --secret="$secret_prefix" --project="$GCP_PROJECT" 2>/dev/null; then
        echo -e "${GREEN}✓ Retrieved shared ${service} API key${NC}" >&2
        log_key_usage "$service" "shared" "shared" "success"
        return 0
    else
        echo -e "${RED}❌ ${service} API key not configured${NC}" >&2
        echo -e "${YELLOW}Setup: echo 'your-key' | gcloud secrets create $secret_prefix --data-file=- --project=$GCP_PROJECT${NC}" >&2
        log_key_usage "$service" "shared" "shared" "missing"
        return 1
    fi
}

# Auto-provision API key (production implementation for Hume)
auto_provision_key() {
    local service="$1"
    local company="$2"
    local secret_prefix="$3"
    
    case "$service" in
        "hume")
            provision_hume_key "$company" "$secret_prefix"
            ;;
        *)
            echo -e "${YELLOW}Auto-provisioning not supported for ${service}${NC}" >&2
            return 1
            ;;
    esac
}

# Production Hume API key provisioning
provision_hume_key() {
    local company="$1"
    local secret_prefix="$2"
    
    # Get admin key for provisioning
    local admin_key
    if ! admin_key=$(gcloud secrets versions access latest --secret="${secret_prefix}-admin" --project="$GCP_PROJECT" 2>/dev/null); then
        echo -e "${RED}❌ Admin API key not configured for provisioning${NC}" >&2
        return 1
    fi
    
    # Call Hume management API
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "https://api.hume.ai/v0/management/api-keys" \
        -H "Authorization: Bearer $admin_key" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"${company}-mcp-key\",
            \"description\": \"Auto-provisioned MCP key for ${company}\",
            \"scopes\": [\"evi.tts\", \"evi.prompts\", \"evi.voices\"],
            \"metadata\": {
                \"company\": \"${company}\",
                \"mcp_domain\": \"mcp.${company}.2100.cool\",
                \"provisioned_by\": \"diamond-sao-automation\",
                \"provisioned_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }
        }")
    
    local http_code
    http_code=$(echo "$response" | tail -n1)
    local json_response
    json_response=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
        # Extract API key from response
        local new_key
        if command -v jq &> /dev/null; then
            new_key=$(echo "$json_response" | jq -r '.api_key // empty')
        else
            # Fallback parsing without jq
            new_key=$(echo "$json_response" | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
        fi
        
        if [[ -n "$new_key" ]]; then
            # Store in Secret Manager
            local secret_name="${secret_prefix}-${company}"
            if echo "$new_key" | gcloud secrets create "$secret_name" --data-file=- --project="$GCP_PROJECT" 2>/dev/null; then
                echo -e "${GREEN}✓ Provisioned and stored Hume API key for ${company}${NC}" >&2
                update_mcp_registry "$company" "hume" "$secret_name"
                return 0
            else
                echo -e "${RED}❌ Failed to store provisioned key${NC}" >&2
                return 1
            fi
        else
            echo -e "${RED}❌ No API key in response${NC}" >&2
            return 1
        fi
    else
        echo -e "${RED}❌ Provisioning failed (HTTP $http_code)${NC}" >&2
        echo -e "${RED}Response: $json_response${NC}" >&2
        return 1
    fi
}

# Update MCP company registry
update_mcp_registry() {
    local company="$1"
    local service="$2"
    local secret_name="$3"
    
    local registry_file="/Users/as/asoos/integration-gateway/asoos/mcp-company-registry.json"
    
    if [[ -f "$registry_file" ]] && command -v jq &> /dev/null; then
        local temp_file
        temp_file=$(mktemp)
        
        jq --arg company "$company" \
           --arg service "$service" \
           --arg secret "$secret_name" \
           --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           '.companies[$company].ai_api_keys[$service] = {
               secret_name: $secret,
               provisioned_at: $timestamp,
               status: "active",
               tier: "enterprise"
           }' "$registry_file" > "$temp_file" && mv "$temp_file" "$registry_file"
        
        echo -e "${BLUE}📝 Updated MCP registry for ${company}:${service}${NC}" >&2
    fi
}

# Production usage logging
log_key_usage() {
    local service="$1"
    local company="$2"
    local key_type="$3"
    local status="$4"
    
    local log_entry
    log_entry=$(cat << EOF
{
  "service": "$service",
  "company": "${company:-shared}",
  "key_type": "$key_type",
  "status": "$status",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project": "$GCP_PROJECT",
  "host": "$(hostname)"
}
EOF
)
    
    # Send to Pub/Sub for production monitoring
    if command -v gcloud &> /dev/null; then
        echo "$log_entry" | gcloud pubsub topics publish "ai-api-key-usage" --message=- --project="$GCP_PROJECT" 2>/dev/null || true
    fi
}

# Production API key validation
validate_api_key() {
    local service="${1:-hume}"
    local company="${2:-$COMPANY_NAME}"
    local tier="${3:-$STORAGE_OPTION}"
    
    local api_key
    if ! api_key=$(get_api_key "$service" "$company" "$tier"); then
        echo -e "${RED}❌ Could not retrieve API key for validation${NC}" >&2
        return 1
    fi
    
    # Get service configuration
    IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
    local header_name="${CONFIG[1]}"
    local test_endpoint="${CONFIG[2]}"
    local auth_type="${CONFIG[4]:-header}"
    
    # Build curl headers
    local curl_headers=()
    case "$auth_type" in
        "bearer")
            curl_headers+=("-H" "Authorization: Bearer $api_key")
            ;;
        "token")
            curl_headers+=("-H" "Authorization: Token $api_key")
            ;;
        *)
            curl_headers+=("-H" "$header_name: $api_key")
            ;;
    esac
    
    # Test API key
    local response
    response=$(curl -s -w "\n%{http_code}" "${curl_headers[@]}" "$test_endpoint")
    
    local http_code
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}✅ ${service} API key valid${NC}" >&2
        log_key_usage "$service" "$company" "validation" "valid"
        return 0
    else
        echo -e "${RED}❌ ${service} API key validation failed (HTTP $http_code)${NC}" >&2
        log_key_usage "$service" "$company" "validation" "invalid"
        return 1
    fi
}

# Production company key listing
list_company_keys() {
    local company="${1:-$COMPANY_NAME}"
    
    if [[ -z "$company" ]]; then
        echo -e "${RED}❌ Company name required${NC}" >&2
        return 1
    fi
    
    echo -e "${CYAN}📋 API Keys for: $company${NC}"
    echo -e "${BLUE}─────────────────────────${NC}"
    
    for service in "${!AI_SERVICES[@]}"; do
        IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
        local secret_prefix="${CONFIG[0]}"
        
        echo -e "${PURPLE}$service:${NC}"
        
        # Check dedicated key
        if gcloud secrets versions access latest --secret="${secret_prefix}-${company}" --project="$GCP_PROJECT" >/dev/null 2>&1; then
            echo -e "  ✅ Dedicated: ${secret_prefix}-${company}"
        # Check customer-provided key
        elif gcloud secrets versions access latest --secret="${secret_prefix}-${company}-customer" --project="$GCP_PROJECT" >/dev/null 2>&1; then
            echo -e "  ✅ Customer: ${secret_prefix}-${company}-customer"
        else
            echo -e "  ❌ Not configured"
        fi
    done
}

# Show all supported services
show_services() {
    echo -e "${CYAN}📋 Supported AI Services${NC}"
    echo -e "${BLUE}─────────────────────────${NC}"
    
    for service in "${!AI_SERVICES[@]}"; do
        IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
        local secret_prefix="${CONFIG[0]}"
        local auto_provision="${CONFIG[3]:-false}"
        
        echo -e "${PURPLE}$service${NC}"
        echo -e "  Secret: $secret_prefix"
        echo -e "  Auto-provision: $auto_provision"
        echo ""
    done
}

# PRODUCTION COMMAND LINE INTERFACE
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-help}" in
        "get")
            get_api_key "$2" "$3" "$4"
            ;;
        "validate")
            validate_api_key "$2" "$3" "$4"
            ;;
        "list")
            list_company_keys "$2"
            ;;
        "services")
            show_services
            ;;
        "help"|"-h"|"--help")
            echo "Production Universal API Key Management"
            echo ""
            echo "Usage:"
            echo "  $0 get [service] [company] [tier]     - Get API key"
            echo "  $0 validate [service] [company] [tier] - Validate API key" 
            echo "  $0 list [company]                     - List company keys"
            echo "  $0 services                           - Show supported services"
            echo ""
            echo "Services: ${!AI_SERVICES[*]}"
            echo "Tiers: customer-managed, managed-basic, managed-premium, managed-enterprise"
            ;;
        *)
            # Default behavior - backward compatibility
            get_api_key "$@"
            ;;
    esac
fi