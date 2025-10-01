#!/usr/bin/env node

/**
 * Test Claude Voice Configuration
 */

async function testVoiceConfig() {
  try {
    console.log('🧪 Testing Claude Voice Configuration...');
    
    // Test requiring the module
const voiceConfigModule = require('./lib/claude-voice-config.cjs');
    console.log('✅ Module loaded successfully');
    console.log('Available exports:', Object.keys(voiceConfigModule));
    
    // Get instance
    const voiceConfig = voiceConfigModule.getInstance();
    console.log('✅ Instance created');
    
    // Test validation
    console.log('🔍 Running validation...');
    const validation = await voiceConfig.validateConfig();
    console.log('Validation Result:', JSON.stringify(validation, null, 2));
    
    // Test health status
    console.log('🏥 Getting health status...');
    const health = await voiceConfig.getHealthStatus();
    console.log('Health Status:', JSON.stringify(health, null, 2));
    
    // Test Claude agent config
    console.log('🤖 Testing Claude agent config...');
    const agentConfig = await voiceConfig.getClaudeAgentConfig('test-claude-agent');
    console.log('Agent Config Voice ID:', agentConfig.voice_id);
    console.log('Agent Config Synthesis Engine:', agentConfig.synthesis_engine);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testVoiceConfig();