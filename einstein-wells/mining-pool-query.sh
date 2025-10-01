#!/bin/bash

# Mining Pool Query Script
# Author: Einstein Wells Division
# Purpose: Query mining pools for unpaid balances and payout rules
# Usage: ./mining-pool-query.sh [options]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/mining-pool-query.log"
CONFIG_FILE="${SCRIPT_DIR}/mining-pool-config.json"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if required environment variables are set
check_env_vars() {
    local required_vars=("MINING_POOL_API_KEY" "MINING_POOL_URL")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_status "$RED" "ERROR: Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
                    - $var"
        done
        echo ""
        echo "Please set these variables before running the script:"
        echo "export MINING_POOL_API_KEY='your_api_key_here'"
        echo "export MINING_POOL_URL='https://your-mining-pool-api.com'"
        exit 1
    fi
}

# Function to create config file template
create_config_template() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        cat > "$CONFIG_FILE" << 'CONFIG_EOF'
{
  "mining_pools": [
    {
      "name": "Primary Pool",
      "url": "${MINING_POOL_URL}",
      "api_key": "${MINING_POOL_API_KEY}",
      "endpoints": {
        "unpaid_balances": "/unpaid_balances",
        "payout_rules": "/payout_rules",
        "worker_stats": "/worker_stats",
        "pool_stats": "/pool_stats"
      }
    }
  ],
  "query_options": {
    "timeout": 30,
    "retry_count": 3,
    "output_form    "output_form    "output_form    "outpu_status "$GREEN" "Created config template: $CONFIG_FILE"
        print_status "$YELLOW" "Please edit the config file to add your mining pool details."
    fi
}

# Function to query unpaid balances
query_unpaid_balances() {
    local pool_url="$1"
    local api_key="$2"
    local endpoint="${3:-/unpaid_balances}"
    
    print_status "$BLUE" "Querying unpaid balances..."
    log "Qu    log "Qu d balances from: ${pool_url}${endpoint}"
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H         -H         -H         -H         - -H "        -H        ication/json" \
        -H "User-Agent: Einstein-Wells-Mining-Query/1.0" \
        --max-time 30 \
        "${pool_url}${endpoint}" 2>/de        "${pool_url}${endpoint}" 2>/de      tp_        "${pool_url}${endpoint}" 2>/de  l        "${pool_url}${endpoint}" 2>/de')
    
    if [[ "$http_code" == "200" ]]; the          print_status "$GREEN" "✓ Successfully r    if [[ "$httpbalances"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 0
    else
        print_status "$RED" "✗ Failed to retrieve unpaid balances (HTTP: $http_code)"
        if [[ -n "$body" ]]; then
            echo "$body"
        fi
        r        r        r      tion to query payout rules        r        r    {
    local pool_url="$1"
    local api_key="$2"
    local endpoint="${3:-/payout_rules}"
    
    print_status "$BLUE" "Querying payout rules..."
    log "Querying payout rules from: ${pool_url}${endpoint}"
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $api_key" \
                                                                ge                     ning-Query/1.0" \
        --max-time 30 \
        "${pool_url}${endpoint}" 2>/dev/null || echo -e "\n000")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" == "200" ]]; then
        print_status "$GREEN" "✓ Successfully retrieved payout rules"
        echo "$body" |        echo "$null || echo "$body"
        return 0
    else
        print_status "$RED" "✗ Failed to retrieve payout rules (HTTP: $http_code)"
        if [[ -n "$body" ]]; then
            echo "$body"
        fi
        return 1
    fi
}

# Function to query worker stats
query_worker_stats() {
    local pool_url="$1"
    local api_key="$2"
    local endpoint="${3:-/worker_stats}"
    
    print_status "$BLUE" "Querying worker statistics..."
    log "Querying worker stats from: ${pool_url}${endpoint}"
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -H "User-Agent: Einstein-Wells-Mining-Query/1.0" \
        --max-time 30 \
        "${pool_url}${endpoint}" 2>/dev/null || echo -e "\n000")
    
    local http_code=$(echo "$response" | tail -n1)
    loca   ody=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" == "200" ]]; then
        print_status "$GREEN" "✓ Successfully retrieved worker statistics"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 0
    else
        print_status "$RED" "✗ Failed to retrieve worker statistics (HTTP: $http_code)"
        if [[ -n "$bod        if [[ -         echo "$body"
        fi
        return 1
    fi
}

# Function to save results to file
save_results() {
    local query_type="$1"
    local data="$2"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local output_file="${SCRIPT_DIR}/mining_pool_${query_type}_${timestamp}.json"
    
    echo "$data" > "$output_file"
    print_status "$GREEN" "Results saved to: $output_file"
}

# Function to display help
show_help() {
    cat << HELP_EOF
Mining Pool Query Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -b, --balanc    -b, --balanc    -b, --balanc    -b, --balanc    -b, --balary payout rules only
    -w, --workers       Query worker statistics
    -a, --all           Query all available data (default)
    -s, --save          Save results to timestamped files
    -c, --config        Create/show config file
    -h, --help          Show this help message

ENVIENVIENVIENVIENVES:
    MINING_POOL_API_KEY    Your mining pool API key
    MINING_POOL_URL        Base URL of your mining pool API

EXAMPLES:
    # Query unpaid balances only
    $0 --balances
    
    # Query all data and save results
    $0 --all --save
    
                            les and run
    export    export    export    export    export  xport MINING_POOL_URL="https://api.your-pool.com"
    $0

HELP_EOF
}

# Main function
main() {
    local query_balances=false
    local query_payouts=false
    local query_workers=false
    local query_all=true
    local save_results_flag=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--balances)
                query_balances=true
                query_all=false
                shift
                ;;
            -p|--payouts)
                query_payouts=true
                query_all=false
                shift
                ;;
            -w|--workers)
                query_workers=true
                query_all=false
                shift
                ;;
                                                                     shift
                                s|--save)
                save_results_flag=true
                                      ;;
            -c|--config)
                create_config_template
                exit 0
                ;;
            -h|--help)
                show_help
                exit                          exit                       print_status "$RED" "Unknown option: $1"
                show_help
                exit 1
                ;;
                                    ate log file
    touch "$LOG_FI    touch "$LOG_rting mining pool query script    touch "$LOG_FI    touch "$LOG_ols
    if ! command -v curl >/dev/null 2>&1; then
        print_status "$RED" "ERROR: curl is required but not installed."
        exit 1
    fi
    
    if ! command     if ! command   &1; then
        print        print        prING: jq is not installed. JSON output will not be formatted."
    fi
                     ronment variables
    check_env_vars
    
    # Create config template if it doesn't exist
    create_config_template
    
    print_status "$BLUE" "Einstein Wells Mining Pool Query Tool"
    print_status "$BLUE" "====================================="
    echo ""
    
    # Execute queries based on options
    if [[ "$query_all" == true || "$query_balances" == true ]]; then
        echo "==================== UNPAID BALANCES ===================="
        if query_unpaid_balances "$MINING_POOL_URL" "$MINING_POOL_API_KEY"; then
            if [[ "$save_results_flag" == true ]]; then
                                                                                                                   _POOL_API_KEY" 2>/dev/null)
                save_results "balances" "$balance_data"
            fi
        fi
        echo ""
    fi
    
    if [[ "$query_all" == true || "$query_payouts" == true ]]; then
        echo "==================== PAYOUT RULES ===================="
        if query_     t_rules "$MINING_POOL_URL" "$MINING_POOL_API_KEY"; then
                                                                                  ut_   a
                payout_data=$(query_payout_rules "$MINING_POOL_URL" "$MINING_POOL_API_KEY" 2>/dev/null)
                save_results "payouts" "$payout_data"
            fi
        fi
        echo ""
    fi
    
    if [[ "$query_all" == true || "$query_workers" == true ]]; then
        echo "==================== WORKER STATIS        echo "==================== WORKER STATIS        echo "=========URL" "$MINING_POOL_API_KEY"; then
            if [[ "$save_results_flag" == true ]]; then
                local worker_data
                worker_data=$(query_worker_stats "$MINING_POOL_URL" "$MINING_POOL_API_KEY" 2>/dev/null)
                save_results "workers" "$worker_data"
            fi
        fi
        echo ""
    fi
    
    log "Mining pool query completed"
    print_status "$GREEN" "Query completed. Check $LOG_FILE for detailed logs."
}

# Run main function with all arguments
main "$@"
