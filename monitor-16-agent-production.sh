#!/bin/bash

# Production monitoring for 16-Agent Personality System
echo "🔍 16-Agent Personality System - Production Status"
echo "================================================="

# Check if the system file exists and is readable
if [ -f "16-agent-personality-system.js" ]; then
    echo "✅ 16-Agent system file present"
else
    echo "❌ 16-Agent system file missing"
    exit 1
fi

# Test system initialization
echo "🧪 Testing system initialization..."
node --input-type=module -e "
import System from './16-agent-personality-system.js';
(async () => {
    try {
        const system = new System();
        await system.initialized;
        const status = system.getSystemStatus();
        console.log('✅ System Status:', status.systemStatus);
        console.log('🎯 Agents:', status.totalAgents);
        console.log('🔢 Quantum Capacity:', status.quantumAgents.toLocaleString());
        console.log('🎤 Voice Profiles:', status.voiceProfilesConfigured);
        console.log('🔗 VLS Solutions:', status.vlsSolutionsActive);
        console.log('⚡ Wing Coordination:', status.wingCoordinationActive);
    } catch (error) {
        console.error('❌ System Error:', error.message);
        process.exit(1);
    }
})();"

echo ""
echo "✅ Production monitoring complete"
echo "================================================="
