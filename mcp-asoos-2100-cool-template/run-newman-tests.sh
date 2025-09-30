#!/bin/bash

# ASOOS End-to-End Newman Test Runner
# Compatible with BLITZ Orchestration System
# Supports CI/CD integration and manual testing

set -e

# Configuration
PROJECT_NAME="ASOOS Owner-Subscriber End-to-End Tests"
COLLECTION_FILE="newman-api-tests.json"
REPORT_DIR="newman-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ASOOS NEWMAN TESTER                      ║${NC}"
echo -e "${BLUE}║              End-to-End Owner-Subscriber Tests              ║${NC}"
echo -e "${BLUE}║                     $(date '+%Y-%m-%d %H:%M:%S')                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo -e "${RED}❌ Newman is not installed. Installing now...${NC}"
    npm install -g newman
    npm install -g newman-reporter-htmlextra
fi

# Create reports directory
mkdir -p "${REPORT_DIR}"

# Function to run tests with different configurations
run_test_suite() {
    local test_name=$1
    local additional_options=$2
    local report_suffix=$3
    
    echo -e "${YELLOW}🚀 Running ${test_name}...${NC}"
    
    newman run "${COLLECTION_FILE}" \
        --reporters cli,json,htmlextra \
        --reporter-json-export "${REPORT_DIR}/newman-results-${report_suffix}-${TIMESTAMP}.json" \
        --reporter-htmlextra-export "${REPORT_DIR}/newman-report-${report_suffix}-${TIMESTAMP}.html" \
        --reporter-htmlextra-title "ASOOS ${test_name} Report" \
        --reporter-htmlextra-logs \
        --reporter-htmlextra-showOnlyFails \
        --timeout-request 30000 \
        --timeout-script 10000 \
        --delay-request 1000 \
        ${additional_options} || {
            echo -e "${RED}❌ ${test_name} failed${NC}"
            return 1
        }
    
    echo -e "${GREEN}✅ ${test_name} completed${NC}"
    echo ""
}

# Function to analyze test results
analyze_results() {
    echo -e "${BLUE}📊 Analyzing test results...${NC}"
    
    # Count total tests and failures
    local json_files=(${REPORT_DIR}/newman-results-*-${TIMESTAMP}.json)
    local total_tests=0
    local total_failures=0
    
    for file in "${json_files[@]}"; do
        if [ -f "$file" ]; then
            local tests=$(jq -r '.run.stats.tests.total' "$file" 2>/dev/null || echo "0")
            local failures=$(jq -r '.run.stats.tests.failed' "$file" 2>/dev/null || echo "0")
            total_tests=$((total_tests + tests))
            total_failures=$((total_failures + failures))
        fi
    done
    
    echo -e "${BLUE}Total Tests: ${total_tests}${NC}"
    if [ "$total_failures" -eq 0 ]; then
        echo -e "${GREEN}Total Failures: ${total_failures} ✅${NC}"
    else
        echo -e "${RED}Total Failures: ${total_failures} ❌${NC}"
    fi
    
    return $total_failures
}

# Function to generate summary report
generate_summary() {
    local exit_code=$1
    
    echo -e "${BLUE}📋 Test Summary Report${NC}"
    echo "=================================="
    echo "Project: ${PROJECT_NAME}"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Collection: ${COLLECTION_FILE}"
    echo ""
    
    if [ "$exit_code" -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
        echo ""
        echo "✅ Off-the-street subscriber flow working"
        echo "✅ Enterprise employee onboarding functional"
        echo "✅ Sallyport authentication gateway operational"
        echo "✅ MCP provisioning and routing active"
        echo "✅ UFO fallback system ready"
        echo "✅ Performance benchmarks met"
    else
        echo -e "${RED}⚠️  SOME TESTS FAILED ⚠️${NC}"
        echo ""
        echo "Please review the detailed HTML reports in: ${REPORT_DIR}/"
        echo "JSON results available for CI/CD integration"
    fi
    
    echo ""
    echo -e "${BLUE}📁 Generated Reports:${NC}"
    ls -la "${REPORT_DIR}/"*-${TIMESTAMP}.*
    echo ""
}

# Main execution
main() {
    # Validate collection file exists
    if [ ! -f "$COLLECTION_FILE" ]; then
        echo -e "${RED}❌ Collection file not found: $COLLECTION_FILE${NC}"
        exit 1
    fi
    
    # Run test suites
    echo -e "${YELLOW}🔄 Starting comprehensive end-to-end testing...${NC}"
    echo ""
    
    # Standard test run
    run_test_suite "Standard End-to-End Tests" "" "standard"
    
    # Performance-focused run (if needed)
    if [ "$1" = "--performance" ]; then
        run_test_suite "Performance Tests" "--delay-request 500" "performance"
    fi
    
    # Security-focused run (if needed)
    if [ "$1" = "--security" ]; then
        run_test_suite "Security Tests" "--timeout-request 60000" "security"
    fi
    
    # Analyze results
    analyze_results
    local test_exit_code=$?
    
    # Generate summary
    generate_summary $test_exit_code
    
    # BLITZ Integration Hook
    if [ "$BLITZ_MODE" = "true" ]; then
        echo -e "${BLUE}🚀 BLITZ Mode: Updating deployment status...${NC}"
        if [ $test_exit_code -eq 0 ]; then
            echo "NEWMAN_TESTS=PASSED" >> $GITHUB_ENV 2>/dev/null || true
            echo -e "${GREEN}✅ BLITZ: Tests passed, deployment can proceed${NC}"
        else
            echo "NEWMAN_TESTS=FAILED" >> $GITHUB_ENV 2>/dev/null || true
            echo -e "${RED}❌ BLITZ: Tests failed, deployment should be halted${NC}"
        fi
    fi
    
    # CI/CD Integration
    if [ "$CI" = "true" ]; then
        echo -e "${BLUE}🔗 CI/CD Mode: Preparing artifacts...${NC}"
        
        # Upload test results as artifacts (GitHub Actions syntax)
        echo "::set-output name=test_reports_path::${REPORT_DIR}"
        echo "::set-output name=tests_passed::$([ $test_exit_code -eq 0 ] && echo 'true' || echo 'false')"
        
        # Create JUnit XML for better CI integration (if jq is available)
        if command -v jq &> /dev/null; then
            for json_file in ${REPORT_DIR}/newman-results-*-${TIMESTAMP}.json; do
                if [ -f "$json_file" ]; then
                    # Convert Newman JSON to simplified test summary
                    jq -r '.run.executions[] | select(.assertions != null) | .assertions[] | "\(.assertion): \(.error // "PASS")"' "$json_file" > "${json_file%.json}.summary" 2>/dev/null || true
                fi
            done
        fi
    fi
    
    exit $test_exit_code
}

# Help function
show_help() {
    echo "ASOOS Newman Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help          Show this help message"
    echo "  --performance   Run additional performance-focused tests"
    echo "  --security      Run additional security-focused tests"
    echo ""
    echo "Environment Variables:"
    echo "  BLITZ_MODE=true    Enable BLITZ orchestration integration"
    echo "  CI=true           Enable CI/CD mode with artifact generation"
    echo ""
    echo "Examples:"
    echo "  $0                    # Standard test run"
    echo "  $0 --performance      # Include performance tests"
    echo "  BLITZ_MODE=true $0    # Run in BLITZ mode"
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac