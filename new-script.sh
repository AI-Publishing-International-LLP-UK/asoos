#!/bin/bash

# New Shell Script
# Created: $(date)
# Author: User
# Description: General purpose shell script template

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Description:
    This is a template shell script. Customize it for your needs.

Options:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output
    -d, --debug     Enable debug mode
    
Examples:
    $0 --help
    $0 --verbose
    $0 --debug

EOF
}

# Main function
main() {
    local verbose=false
    local debug=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            -d|--debug)
                debug=true
                set -x  # Enable debug mode
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Script logic starts here
    log "Starting script execution..."
    
    if [[ "$verbose" == true ]]; then
        info "Verbose mode enabled"
    fi
    
    if [[ "$debug" == true ]]; then
        info "Debug mode enabled"
    fi
    
    # Add your script logic here
    info "Script template ready for customization"
    
    log "Script execution completed successfully"
}

# Run main function with all arguments
main "$@"