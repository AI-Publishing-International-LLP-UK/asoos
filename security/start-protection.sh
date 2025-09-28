#!/bin/bash

# AIXTIV SYMPHONY ROGUE AGENT PROTECTION
# Integrates with SallyPort, Diamond SAO, and existing security infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/as/asoos/aixtiv-symphony"
DETECTOR_SCRIPT="$SCRIPT_DIR/rogue-agent-detector.js"
LAUNCHD_PLIST="$SCRIPT_DIR/com.aixtiv.rogue-agent-detector.plist"
USER_LAUNCHD_DIR="$HOME/Library/LaunchAgents"

echo "🛡️  Starting AIXTIV Symphony Rogue Agent Protection"
echo "=================================================="

# Function to check if detector is already running
check_detector_status() {
    if pgrep -f "rogue-agent-detector.js" > /dev/null; then
        echo "✅ Detector is running (PID: $(pgrep -f 'rogue-agent-detector.js'))"
        return 0
    else
        echo "❌ Detector is not running"
        return 1
    fi
}

# Function to install LaunchAgent
install_launch_agent() {
    echo "📦 Installing LaunchAgent for automatic startup..."
    
    # Create LaunchAgents directory if it doesn't exist
    mkdir -p "$USER_LAUNCHD_DIR"
    
    # Copy plist file
    cp "$LAUNCHD_PLIST" "$USER_LAUNCHD_DIR/"
    
    # Load the LaunchAgent
    launchctl load "$USER_LAUNCHD_DIR/com.aixtiv.rogue-agent-detector.plist" 2>/dev/null || true
    
    echo "✅ LaunchAgent installed and loaded"
}

# Function to uninstall LaunchAgent
uninstall_launch_agent() {
    echo "🗑️  Uninstalling LaunchAgent..."
    
    # Unload the LaunchAgent
    launchctl unload "$USER_LAUNCHD_DIR/com.aixtiv.rogue-agent-detector.plist" 2>/dev/null || true
    
    # Remove plist file
    rm -f "$USER_LAUNCHD_DIR/com.aixtiv.rogue-agent-detector.plist"
    
    echo "✅ LaunchAgent uninstalled"
}

# Function to start detector manually
start_detector() {
    if check_detector_status; then
        echo "⚠️  Detector already running"
        return 0
    fi
    
    echo "🚀 Starting rogue agent detector..."
    
    # Make detector script executable
    chmod +x "$DETECTOR_SCRIPT"
    
    # Start detector in background
    nohup node "$DETECTOR_SCRIPT" > "$SCRIPT_DIR/detector.log" 2> "$SCRIPT_DIR/detector-error.log" &
    
    sleep 2
    
    if check_detector_status; then
        echo "✅ Detector started successfully"
        echo "📋 Logs: $SCRIPT_DIR/detector.log"
        echo "🚨 Errors: $SCRIPT_DIR/detector-error.log"
    else
        echo "❌ Failed to start detector"
        return 1
    fi
}

# Function to stop detector
stop_detector() {
    echo "🛑 Stopping rogue agent detector..."
    
    pkill -f "rogue-agent-detector.js" || true
    
    sleep 1
    
    if ! check_detector_status; then
        echo "✅ Detector stopped"
    else
        echo "❌ Failed to stop detector"
        return 1
    fi
}

# Function to restart detector
restart_detector() {
    echo "🔄 Restarting rogue agent detector..."
    stop_detector
    sleep 2
    start_detector
}

# Function to show status
show_status() {
    echo "Status Check"
    echo "============"
    check_detector_status
    
    echo ""
    echo "LaunchAgent Status:"
    if [ -f "$USER_LAUNCHD_DIR/com.aixtiv.rogue-agent-detector.plist" ]; then
        echo "✅ LaunchAgent installed"
    else
        echo "❌ LaunchAgent not installed"
    fi
    
    echo ""
    echo "Recent violations (if any):"
    if [ -d "$SCRIPT_DIR/violation-captures" ]; then
        find "$SCRIPT_DIR/violation-captures" -name "violation-*.json" -mtime -1 | head -3
    else
        echo "No violations recorded"
    fi
}

# Function to test the system
test_detector() {
    echo "🧪 Testing rogue agent detection..."
    
    # Create a test violation
    node -e "
        const RogueAgentDetector = require('$DETECTOR_SCRIPT');
        const detector = new RogueAgentDetector();
        console.log('Testing violation detection...');
        detector.checkForViolations('This is a test: agent is lying and blocking progress', 'test-system');
    "
}

# Function to view recent logs
view_logs() {
    echo "📋 Recent detector logs:"
    echo "======================="
    
    if [ -f "$SCRIPT_DIR/detector.log" ]; then
        tail -20 "$SCRIPT_DIR/detector.log"
    else
        echo "No logs found"
    fi
    
    echo ""
    echo "🚨 Recent errors:"
    echo "================"
    
    if [ -f "$SCRIPT_DIR/detector-error.log" ]; then
        tail -10 "$SCRIPT_DIR/detector-error.log"
    else
        echo "No errors found"
    fi
}

# Function to show violation captures
show_violations() {
    echo "🚨 Recent Violations:"
    echo "===================="
    
    if [ -d "$SCRIPT_DIR/violation-captures" ]; then
        find "$SCRIPT_DIR/violation-captures" -name "violation-*.json" -mtime -7 | sort -r | head -5 | while read file; do
            echo ""
            echo "📁 File: $(basename "$file")"
            echo "Time: $(jq -r '.timestamp' "$file" 2>/dev/null || echo 'Unknown')"
            echo "Type: $(jq -r '.violationType' "$file" 2>/dev/null || echo 'Unknown')"
            echo "Agent: $(jq -r '.agentData.source' "$file" 2>/dev/null || echo 'Unknown')"
            echo "---"
        done
    else
        echo "No violations recorded"
    fi
}

# Main command handling
case "${1:-start}" in
    "start")
        start_detector
        ;;
    "stop")
        stop_detector
        ;;
    "restart")
        restart_detector
        ;;
    "status")
        show_status
        ;;
    "install")
        install_launch_agent
        ;;
    "uninstall")
        uninstall_launch_agent
        ;;
    "test")
        test_detector
        ;;
    "logs")
        view_logs
        ;;
    "violations")
        show_violations
        ;;
    "help"|"-h"|"--help")
        echo "AIXTIV Symphony Rogue Agent Protection"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start      - Start the detector (default)"
        echo "  stop       - Stop the detector"
        echo "  restart    - Restart the detector"
        echo "  status     - Show current status"
        echo "  install    - Install as LaunchAgent (auto-start)"
        echo "  uninstall  - Remove LaunchAgent"
        echo "  test       - Test the detection system"
        echo "  logs       - View recent logs"
        echo "  violations - Show recent violations"
        echo "  help       - Show this help"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "🛡️  Protection system ready. Screen will freeze on violations."
echo "📁 Capture directory: $SCRIPT_DIR/violation-captures/"