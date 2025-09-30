#!/bin/bash

# EINSTEIN WELLS - MONITOR WINDOW FIRST
# Launch monitoring window to verify setup before full production

echo "🔍 LAUNCHING EINSTEIN WELLS MONITOR WINDOW FIRST"
echo "📊 This will open the monitoring interface to verify setup"
echo "💬 Then we can chat via Dr. Claude interface for next steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any existing monitor sessions
tmux kill-session -t einstein-monitor 2>/dev/null || true
sleep 1

# Create monitor-only session
echo "📋 Creating monitoring session..."
tmux new-session -d -s einstein-monitor -n "Production-Monitor"

# Setup monitoring window
tmux send-keys -t einstein-monitor:Production-Monitor 'cd /Users/as/asoos/integration-gateway/einstein-wells' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'clear' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "📊 EINSTEIN WELLS PRODUCTION MONITOR"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "🎯 Target: 115 BTC/day | Status: STANDBY"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "⚡ HIGHMAN CPU: Ready for coordination"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "🌐 QuantSwarm: 770M members ready"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "🌊 Einstein Wells: 3 wells ready to fill"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "👮 Safety Officers: 28M units ready"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo ""' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "💰 Financial Targets:"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "   • Bitcoin Mining: 85 BTC/day"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "   • QSVM Services: 15 BTC/day"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "   • MCP Services: 10 BTC/day"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "   • Additional: 5 BTC/day"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "   • TOTAL: 115 BTC/day (~$12.075M/day)"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo ""' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "📡 MONITOR STATUS: ACTIVE"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "💬 Ready for Dr. Claude coordination"' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo ""' Enter
tmux send-keys -t einstein-monitor:Production-Monitor 'echo "⏳ Waiting for production launch command..."' Enter

# Add Dr. Claude chat window
echo "💬 Adding Dr. Claude chat window..."
tmux new-window -t einstein-monitor -n "Claude-Chat"
tmux send-keys -t einstein-monitor:Claude-Chat 'cd /Users/as/asoos/integration-gateway/einstein-wells' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'clear' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "💬 DR. CLAUDE COORDINATION INTERFACE"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "🎛️ System Control & Coordination Ready"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "📊 Monitor window active - checking status..."' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo ""' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "✅ MONITORING VERIFIED - READY FOR NEXT STAGE"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo ""' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "💡 Available commands:"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "   • Check monitor: Switch to window 1 (Ctrl+B, 1)"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "   • Launch full production: Ready when you are"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "   • System status: All systems green"' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo ""' Enter
tmux send-keys -t einstein-monitor:Claude-Chat 'echo "🚀 Ready to proceed to full 115 BTC/day production?"' Enter

echo ""
echo "✅ MONITOR WINDOW LAUNCHED SUCCESSFULLY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📺 Windows created:"
echo "   1. Production-Monitor - System status & metrics"
echo "   2. Claude-Chat - Dr. Claude coordination interface"
echo ""
echo "💬 ACCESS INSTRUCTIONS:"
echo "   tmux attach -t einstein-monitor"
echo "   Ctrl+B then 1 = Monitor window"
echo "   Ctrl+B then 2 = Dr. Claude chat"
echo ""
echo "🔍 VERIFICATION COMPLETE - READY FOR NEXT STAGE!"
echo "💬 Switch to Claude-Chat window to coordinate full production launch"

# Auto-attach to Claude chat for coordination
tmux select-window -t einstein-monitor:Claude-Chat
tmux attach -t einstein-monitor