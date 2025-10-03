#!/bin/bash
# k8s-guardian.sh - Prevents Mac sleep when K8s is active
# Protects your 6.348 trillion processing units from sleep disruption

echo "🛡️ K8s Guardian: Protecting your 6.348 trillion processing units..."
echo "🚀 Diamond SAO Infrastructure Protection - ACTIVATED"

check_k8s_running() {
    /opt/homebrew/bin/kubectl get nodes &>/dev/null
    return $?
}

# Create logs directory if it doesn't exist
mkdir -p /Users/as/asoos/logs

# Main guardian loop
while true; do
    if check_k8s_running; then
        echo "✅ $(date): Kubernetes active - preventing sleep..."
        echo "✅ $(date): Kubernetes active - preventing sleep..." >> /Users/as/asoos/logs/k8s-guardian.log
        
        # Prevent sleep for 5 minutes
        caffeinate -d -t 300 &
        CAFFEINATE_PID=$!
        
        # Wait 4 minutes, then check again
        sleep 240
        
        # Kill the previous caffeinate process
        kill $CAFFEINATE_PID 2>/dev/null
    else
        echo "⚠️  $(date): Kubernetes not responding - allowing normal sleep"
        echo "⚠️  $(date): Kubernetes not responding - allowing normal sleep" >> /Users/as/asoos/logs/k8s-guardian.log
        sleep 60
    fi
done