#!/bin/bash

# List Hume AI Voices
# Quick curl-based script for voice management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${CYAN}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo "Options:"
    echo "  -p, --preset        List preset voices from Hume AI Voice Library"
    echo "  -c, --custom        List custom voices from your account"
    echo "  -a, --all          List all voices (default)"
    echo "  -k, --key KEY      Specify API key (or set HUME_API_KEY env var)"
    echo "  -h, --help         Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 --preset                    # List preset voices"
    echo "  $0 --custom                    # List custom voices"
    echo "  $0 --all                       # List all voices"
    echo "  $0 --key 'your-api-key'       # Use specific API key"
}

# Function to get API key
get_api_key() {
    if [[ -n "$API_KEY" ]]; then
        echo "$API_KEY"
    elif [[ -n "$HUME_API_KEY" ]]; then
        echo "$HUME_API_KEY"
    else
        echo -e "${YELLOW}🔐 Retrieving Hume API key from Google Secret Manager...${NC}"
        if gcloud secrets versions access latest --secret="hume-api-key" 2>/dev/null; then
            echo -e "${GREEN}✓ API key retrieved successfully${NC}" >&2
        else
            echo -e "${RED}✗ Failed to retrieve API key${NC}" >&2
            echo -e "${RED}Please set HUME_API_KEY environment variable or use --key option${NC}" >&2
            exit 1
        fi
    fi
}

# Function to list voices
list_voices() {
    local provider="$1"
    local provider_name="$2"
    local api_key="$3"
    
    echo -e "${PURPLE}📚 $provider_name:${NC}"
    echo -e "${BLUE}─────────────────────────────────────${NC}"
    
    # Make API call
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "X-Hume-Api-Key: $api_key" \
        "https://api.hume.ai/v0/tts/voices?provider=$provider&page_size=100")
    
    local http_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" != "200" ]]; then
        echo -e "${RED}✗ Error fetching $provider_name (HTTP $http_code)${NC}"
        echo "$json_response" | jq . 2>/dev/null || echo "$json_response"
        return 1
    fi
    
    # Parse and display voices
    local voices_count
    voices_count=$(echo "$json_response" | jq '.voices_page | length' 2>/dev/null)
    
    if [[ "$voices_count" -eq 0 ]]; then
        echo -e "${YELLOW}No voices found${NC}"
        return 0
    fi
    
    echo "$json_response" | jq -r '.voices_page[] | "\(.name)\n   ID: \(.id)\n   Provider: \(.provider)\n"' 2>/dev/null || {
        echo -e "${RED}✗ Error parsing response${NC}"
        return 1
    }
    
    echo -e "${GREEN}Total: $voices_count voices${NC}"
    echo ""
}

# Function to display voice pilot mapping
show_voice_pilots() {
    echo -e "${CYAN}🎭 YOUR 14 COMPUTATIONAL VOICE PILOTS:${NC}"
    echo -e "${BLUE}─────────────────────────────────────${NC}"
    
    local pilots=(
        "Dr. Memoria sRIX"
        "Dr. Lucy sRIX" 
        "Dr. Match sRIX"
        "Dr. Cypriot sRIX"
        "Dr. Claude sRIX"
        "Professor Lee sRIX"
        "Dr. Sabina sRIX"
        "Dr. Maria sRIX"
        "Dr. Roark sRIX"
        "Dr. Grant sRIX"
        "Dr. Burby sRIX"
        "Elite11"
        "Mastery33"
        "Victory36"
    )
    
    local i=1
    for pilot in "${pilots[@]}"; do
        echo -e "${GREEN}$i.${NC} $pilot"
        ((i++))
    done
    
    echo ""
    echo -e "${YELLOW}💡 Integration Notes:${NC}"
    echo -e "${YELLOW}•${NC} Zena (PCP) uses CRx01 - Dr. Lucy ML model"
    echo -e "${YELLOW}•${NC} Smooth voice preference maintained"
    echo -e "${YELLOW}•${NC} No basic TTS - computational voices only"
    echo -e "${YELLOW}•${NC} OAuth2 enterprise security integrated"
    echo ""
}

# Parse command line arguments
MODE="all"
API_KEY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--preset)
            MODE="preset"
            shift
            ;;
        -c|--custom)
            MODE="custom"
            shift
            ;;
        -a|--all)
            MODE="all"
            shift
            ;;
        -k|--key)
            API_KEY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo -e "${PURPLE}═══════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🎤 HUME AI VOICE SYNTHESIS SYSTEM${NC}"
    echo -e "${PURPLE}   Integrated with Diamond SAO Command Center${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════${NC}"
    echo ""
    
    # Get API key
    local hume_api_key
    hume_api_key=$(get_api_key)
    
    if [[ -z "$hume_api_key" ]]; then
        echo -e "${RED}✗ No API key available${NC}"
        exit 1
    fi
    
    # List voices based on mode
    case "$MODE" in
        "preset")
            list_voices "HUME_AI" "PRESET VOICES (Hume AI Voice Library)" "$hume_api_key"
            ;;
        "custom")
            list_voices "CUSTOM_VOICE" "CUSTOM VOICES (Your Account)" "$hume_api_key"
            ;;
        "all")
            list_voices "HUME_AI" "PRESET VOICES (Hume AI Voice Library)" "$hume_api_key"
            list_voices "CUSTOM_VOICE" "CUSTOM VOICES (Your Account)" "$hume_api_key"
            ;;
    esac
    
    # Show voice pilot system
    show_voice_pilots
    
    echo -e "${GREEN}✨ Voice system ready for Diamond SAO operations${NC}"
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    echo -e "${RED}✗ curl is required but not installed${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}✗ jq is required but not installed${NC}"
    echo -e "${YELLOW}Install with: brew install jq${NC}"
    exit 1
fi

# Run main function
main