#!/bin/bash

# Universal AI API Key Management for MCP Customer Isolation
# Supports: Hume AI, ElevenLabs, OpenAI, Anthropic, Deepgram, and more
# Integrates with your MCP company architecture and Diamond SAO Command Center

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
GCP_PROJECT=${GCP_PROJECT:-"api-for-warp-drive"}

# Supported AI services configuration
declare -A AI_SERVICES=(
    ["hume"]="Hume AI,hume-api-key,X-Hume-Api-Key,https://api.hume.ai/v0/tts/voices?provider=CUSTOM_VOICE&page_size=1,true,true"
    ["elevenlabs"]="ElevenLabs,elevenlabs-api-key,xi-api-key,https://api.elevenlabs.io/v1/voices,false,false"
    ["openai"]="OpenAI,openai-api-key,Authorization,https://api.openai.com/v1/models,false,false,bearer"
    ["anthropic"]="Anthropic Claude,anthropic-api-key,x-api-key,https://api.anthropic.com/v1/messages,false,false"
    ["deepgram"]="Deepgram,deepgram-api-key,Authorization,https://api.deepgram.com/v1/projects,false,false,token"
)

# Function to display usage
usage() {
    echo -e "${CYAN}Universal AI API Key Management${NC}"
    echo -e "${CYAN}For MCP Customer Isolation & Diamond SAO Command Center${NC}"
    echo ""
    echo "Usage: $0 <service> [company] [tier] [command]"
    echo ""
    echo "Services:"
    for service in "${!AI_SERVICES[@]}"; do
        IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
        echo -e "  ${BLUE}$service${NC} - ${CONFIG[0]}"
    done
    echo ""
    echo "Tiers:"
    echo "  customer-managed     Customer provides their own API keys"
    echo "  managed-basic       Shared API keys (\$50/month)"
    echo "  managed-premium     Dedicated API keys (\$150/month)"  
    echo "  managed-enterprise  Full isolation + rotation (\$500/month)"
    echo ""
    echo "Commands:"
    echo "  get        Retrieve API key (default)"
    echo "  validate   Validate API key by testing"
    echo "  list       List configured keys for company"
    echo "  services   Show supported services"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 hume acme managed-enterprise get"
    echo "  $0 elevenlabs coaching managed-basic validate"
    echo "  $0 openai zaxon customer-managed list"
    echo "  $0 services"
}

# Function to get service configuration
get_service_config() {
    local service="$1"
    local field="$2"
    
    if [[ -z "${AI_SERVICES[$service]}" ]]; then
        echo -e "${RED}❌ Unsupported AI service: $service${NC}" >&2
        echo -e "${YELLOW}Supported services: ${!AI_SERVICES[*]}${NC}" >&2
        return 1
    fi
    
    IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
    
    case "$field" in
        "name") echo "${CONFIG[0]}" ;;
        "prefix") echo "${CONFIG[1]}" ;;
        "header") echo "${CONFIG[2]}" ;;
        "test_endpoint") echo "${CONFIG[3]}" ;;
        "customer_keys") echo "${CONFIG[4]}" ;;
        "provisioning") echo "${CONFIG[5]}" ;;
        "auth_type") echo "${CONFIG[6]:-header}" ;;
        *) echo "" ;;
    esac
}

# Function to determine key strategy based on service, company, and tier
determine_key_strategy() {
    local service="$1"
    local company="$2" 
    local tier="$3"
    
    local supports_provisioning
    supports_provisioning=$(get_service_config "$service" "provisioning")
    
    case "$tier" in
        "customer-managed")
            echo "customer-provided"
            ;;
        "managed-enterprise")
            if [[ -n "$company" ]]; then
                if [[ "$supports_provisioning" == "true" ]]; then
                    echo "dedicated-provisioned"
                else
                    echo "dedicated-static"
                fi
            else
                echo "shared"
            fi
            ;;
        "managed-premium")
            if [[ -n "$company" ]]; then
                echo "dedicated-static"
            else
                echo "shared"
            fi
            ;;
        *)
            echo "shared"
            ;;
    esac
}

# Function to get API key using universal strategy
get_universal_api_key() {
    local service="$1"
    local company="$2"
    local tier="${3:-managed-basic}"
    
    local service_name
    service_name=$(get_service_config "$service" "name")
    
    echo -e "${PURPLE}═══════════════════════════════════════════════${NC}" >&2
    echo -e "${PURPLE}🤖 UNIVERSAL AI API KEY MANAGEMENT${NC}" >&2
    echo -e "${PURPLE}   MCP Customer Isolation & Diamond SAO${NC}" >&2
    echo -e "${PURPLE}═══════════════════════════════════════════════${NC}" >&2
    echo "" >&2
    
    echo -e "${CYAN}🔐 Retrieving $service_name API key${NC}" >&2
    echo -e "${BLUE}🏢 Company: ${company:-"shared"}${NC}" >&2
    echo -e "${BLUE}📊 Tier: $tier${NC}" >&2
    echo -e "${BLUE}🎯 Project: $GCP_PROJECT${NC}" >&2
    echo "" >&2
    
    local strategy
    strategy=$(determine_key_strategy "$service" "$company" "$tier")
    echo -e "${YELLOW}🎯 Strategy: $strategy${NC}" >&2
    echo "" >&2
    
    case "$strategy" in
        "customer-provided")
            get_customer_provided_key "$service" "$company" "$tier"
            ;;
        "dedicated-provisioned")
            get_dedicated_key "$service" "$company" "$tier" "true"
            ;;
        "dedicated-static")
            get_dedicated_key "$service" "$company" "$tier" "false"
            ;;
        "shared")
            get_shared_key "$service" "$tier"
            ;;
        *)
            echo -e "${RED}❌ Unknown strategy: $strategy${NC}" >&2
            return 1
            ;;
    esac
}

# Function to get customer-provided API key
get_customer_provided_key() {
    local service="$1"
    local company="$2"
    local tier="$3"
    
    local prefix
    prefix=$(get_service_config "$service" "prefix")
    local secret_name="${prefix}-${company}-customer"
    
    local service_name
    service_name=$(get_service_config "$service" "name")
    
    echo -e "${CYAN}🏢 Retrieving customer-provided $service_name key${NC}" >&2
    
    if retrieve_secret_from_gcp "$secret_name"; then
        echo -e "${GREEN}✅ Retrieved customer-provided $service_name key${NC}" >&2
        log_api_key_usage "$service" "$company" "$tier" "customer-provided" "success"
        return 0
    else
        echo -e "${RED}❌ Customer-provided API key not found: $secret_name${NC}" >&2
        echo -e "${YELLOW}💡 Customer must provide their $service_name API key via onboarding${NC}" >&2
        log_api_key_usage "$service" "$company" "$tier" "customer-provided" "missing"
        return 1
    fi
}

# Function to get dedicated API key
get_dedicated_key() {
    local service="$1"
    local company="$2"
    local tier="$3"
    local auto_provision="$4"
    
    local prefix
    prefix=$(get_service_config "$service" "prefix")
    local secret_name="${prefix}-${company}"
    
    local service_name
    service_name=$(get_service_config "$service" "name")
    
    echo -e "${PURPLE}🎯 Retrieving dedicated $service_name key for $company${NC}" >&2
    
    if retrieve_secret_from_gcp "$secret_name"; then
        echo -e "${GREEN}✅ Retrieved dedicated $service_name key for $company${NC}" >&2
        log_api_key_usage "$service" "$company" "$tier" "dedicated" "success"
        return 0
    else
        if [[ "$auto_provision" == "true" ]]; then
            echo -e "${YELLOW}🚀 Auto-provisioning not yet implemented in shell version${NC}" >&2
            echo -e "${YELLOW}💡 Use Node.js version for auto-provisioning: node lib/universal-ai-key-manager.js${NC}" >&2
        fi
        
        echo -e "${RED}❌ Dedicated API key not found: $secret_name${NC}" >&2
        echo -e "${YELLOW}💡 Manual provisioning required for $service_name${NC}" >&2
        log_api_key_usage "$service" "$company" "$tier" "dedicated" "missing"
        return 1
    fi
}

# Function to get shared API key
get_shared_key() {
    local service="$1"
    local tier="$2"
    
    local prefix
    prefix=$(get_service_config "$service" "prefix")
    local secret_name="$prefix"
    
    local service_name
    service_name=$(get_service_config "$service" "name")
    
    echo -e "${CYAN}🌐 Retrieving shared $service_name key${NC}" >&2
    
    if retrieve_secret_from_gcp "$secret_name"; then
        echo -e "${GREEN}✅ Retrieved shared $service_name key${NC}" >&2
        log_api_key_usage "$service" "shared" "$tier" "shared" "success"
        return 0
    else
        # Try environment variable fallback
        local env_name
        env_name=$(echo "$secret_name" | tr '[:lower:]' '[:upper:]' | sed 's/-/_/g')
        
        if [[ -n "${!env_name}" ]]; then
            echo -e "${YELLOW}⚠️  Using environment variable fallback for $service_name${NC}" >&2
            echo "${!env_name}"
            log_api_key_usage "$service" "shared" "$tier" "shared" "fallback"
            return 0
        fi
        
        echo -e "${RED}❌ Shared API key not available: $secret_name${NC}" >&2
        echo -e "${YELLOW}💡 Consider setting up $service_name API key:${NC}" >&2
        echo -e "${YELLOW}   echo 'your-api-key' | gcloud secrets create $secret_name --data-file=- --project=$GCP_PROJECT${NC}" >&2
        log_api_key_usage "$service" "shared" "$tier" "shared" "missing"
        return 1
    fi
}

# Function to retrieve secret from GCP Secret Manager
retrieve_secret_from_gcp() {
    local secret_name="$1"
    
    if gcloud secrets versions access latest --secret="$secret_name" --project="$GCP_PROJECT" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to validate API key by making a test request
validate_api_key() {
    local service="$1"
    local api_key="$2"
    local company="${3:-test}"
    
    local service_name
    service_name=$(get_service_config "$service" "name")
    local test_endpoint
    test_endpoint=$(get_service_config "$service" "test_endpoint")
    local header_name
    header_name=$(get_service_config "$service" "header")
    local auth_type
    auth_type=$(get_service_config "$service" "auth_type")
    
    echo -e "${BLUE}🔍 Validating $service_name API key for: $company${NC}" >&2
    
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
    
    local response
    response=$(curl -s -w "\n%{http_code}" "${curl_headers[@]}" "$test_endpoint")
    
    local http_code
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}✅ $service_name API key validation successful${NC}" >&2
        log_api_key_usage "$service" "$company" "validation" "test" "valid"
        return 0
    else
        echo -e "${RED}❌ $service_name API key validation failed (HTTP $http_code)${NC}" >&2
        local response_body
        response_body=$(echo "$response" | head -n -1)
        if [[ -n "$response_body" ]]; then
            echo -e "${RED}Response: $response_body${NC}" >&2
        fi
        log_api_key_usage "$service" "$company" "validation" "test" "invalid"
        return 1
    fi
}

# Function to list company API keys
list_company_keys() {
    local company="$1"
    
    echo -e "${CYAN}📋 API Keys configured for: $company${NC}"
    echo -e "${BLUE}─────────────────────────────────────${NC}"
    
    for service in "${!AI_SERVICES[@]}"; do
        local service_name
        service_name=$(get_service_config "$service" "name")
        local prefix
        prefix=$(get_service_config "$service" "prefix")
        
        echo -e "${PURPLE}$service ($service_name):${NC}"
        
        # Check dedicated key
        local dedicated_secret="${prefix}-${company}"
        if gcloud secrets versions access latest --secret="$dedicated_secret" --project="$GCP_PROJECT" >/dev/null 2>&1; then
            echo -e "  ✅ Dedicated key: $dedicated_secret"
        else
            # Check customer-provided key
            local customer_secret="${prefix}-${company}-customer"
            if gcloud secrets versions access latest --secret="$customer_secret" --project="$GCP_PROJECT" >/dev/null 2>&1; then
                echo -e "  ✅ Customer-provided key: $customer_secret"
            else
                echo -e "  ❌ Not configured"
            fi
        fi
        echo ""
    done
}

# Function to show supported services
show_services() {
    echo -e "${CYAN}📋 Supported AI Services${NC}"
    echo -e "${BLUE}─────────────────────────────────────${NC}"
    
    for service in "${!AI_SERVICES[@]}"; do
        IFS=',' read -ra CONFIG <<< "${AI_SERVICES[$service]}"
        local name="${CONFIG[0]}"
        local customer_keys="${CONFIG[4]}"
        local provisioning="${CONFIG[5]}"
        
        echo -e "${PURPLE}$service${NC} - $name"
        echo -e "  Customer Keys: ${customer_keys:-false}"
        echo -e "  Auto-provisioning: ${provisioning:-false}"
        echo ""
    done
}

# Function to log API key usage for monitoring and billing
log_api_key_usage() {
    local service="$1"
    local company="$2"
    local tier="$3"
    local key_type="$4"
    local status="$5"
    
    local service_name
    service_name=$(get_service_config "$service" "name")
    
    # Create usage log entry
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    local log_entry
    log_entry=$(cat << EOF
{
  "service": "$service",
  "service_name": "$service_name",
  "company": "${company:-shared}",
  "tier": "$tier",
  "key_type": "$key_type",
  "status": "$status",
  "timestamp": "$timestamp",
  "project": "$GCP_PROJECT"
}
EOF
)
    
    # Send to Pub/Sub for downstream processing (if available)
    if command -v gcloud &> /dev/null; then
        echo "$log_entry" | gcloud pubsub topics publish "ai-api-key-usage" --message=- --project="$GCP_PROJECT" 2>/dev/null || true
    fi
    
    echo -e "${BLUE}📝 Usage logged: ${service}:${company:-shared}:${status}${NC}" >&2
}

# Main function
main() {
    local service="$1"
    local company="$2"
    local tier="${3:-managed-basic}"
    local command="${4:-get}"
    
    # Handle special commands
    case "$command" in
        "services")
            show_services
            return 0
            ;;
        "help"|"-h"|"--help")
            usage
            return 0
            ;;
    esac
    
    # Validate service parameter
    if [[ -z "$service" ]]; then
        echo -e "${RED}❌ Service parameter is required${NC}"
        usage
        exit 1
    fi
    
    # Validate service exists
    if [[ -z "${AI_SERVICES[$service]}" ]]; then
        echo -e "${RED}❌ Unsupported AI service: $service${NC}"
        echo -e "${YELLOW}Use '$0 services' to see supported services${NC}"
        exit 1
    fi
    
    # Execute command
    case "$command" in
        "get")
            if get_universal_api_key "$service" "$company" "$tier"; then
                echo -e "${GREEN}✨ API key retrieved successfully for Diamond SAO operations${NC}" >&2
            else
                echo -e "${RED}❌ Failed to retrieve API key${NC}" >&2
                exit 1
            fi
            ;;
        "validate")
            local api_key
            if api_key=$(get_universal_api_key "$service" "$company" "$tier"); then
                if validate_api_key "$service" "$api_key" "$company"; then
                    echo -e "${GREEN}✅ API key validation passed${NC}" >&2
                else
                    echo -e "${RED}❌ API key validation failed${NC}" >&2
                    exit 1
                fi
            else
                echo -e "${RED}❌ Could not retrieve API key for validation${NC}" >&2
                exit 1
            fi
            ;;
        "list")
            if [[ -n "$company" ]]; then
                list_company_keys "$company"
            else
                show_services
            fi
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            usage
            exit 1
            ;;
    esac
}

# Check dependencies
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is required but not installed${NC}"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is required but not installed${NC}"
    exit 1
fi

# Export main function for sourcing
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being run directly
    main "$@"
else
    # Script is being sourced
    echo -e "${CYAN}Universal AI API Key Management functions loaded${NC}" >&2
fi