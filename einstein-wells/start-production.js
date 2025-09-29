#!/usr/bin/env node

/**
 * EINSTEIN WELLS PRODUCTION STARTUP
 * COMPLETE ACTIVITY LOGGING + EMERGENCY SEAL READY
 * Human oversight required - do not leave unattended
 */

import { emergencySealer } from './emergency-seal.js';

console.log('🚨 EINSTEIN WELLS PRODUCTION STARTUP');
console.log('=' .repeat(50));
console.log('⚠️  HUMAN OVERSIGHT REQUIRED - DO NOT LEAVE UNATTENDED');
console.log('📋 COMPLETE ACTIVITY LOGGING: ACTIVE');
console.log('🛑 EMERGENCY SEAL: READY');
console.log('');

// Log startup
emergencySealer.logActivity('PRODUCTION_START', 'Einstein Wells production startup initiated');

// Production environment check
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  Setting NODE_ENV to production');
  process.env.NODE_ENV = 'production';
}

// Display emergency commands
console.log('🚨 EMERGENCY COMMANDS READY:');
console.log('   Type: EMERGENCY_SEAL()     - STOP EVERYTHING');
console.log('   Type: SEAL_STATUS()        - Check if sealed');
console.log('   Type: ACTIVITY_REPORT()    - Get complete log');
console.log('   Press: Ctrl+C              - Graceful shutdown');
console.log('');

// Start the production monitor
async function startProduction() {
  try {
    emergencySealer.logActivity('IMPORTING_MONITOR', 'Loading production monitor');
    
    const { ProductionMonitor } = await import('./production-monitor.js');
    const monitor = new ProductionMonitor();
    
    emergencySealer.logActivity('MONITOR_LOADED', 'Production monitor loaded successfully');
    
    // Start monitoring with complete logging
    monitor.startProductionMonitoring();
    
    emergencySealer.logActivity('PRODUCTION_ACTIVE', 'Einstein Wells production fully active', {
      monitoring: true,
      logging: true,
      emergencyReady: true
    });
    
  } catch (error) {
    emergencySealer.logActivity('STARTUP_ERROR', 'Failed to start production', { 
      error: error.message,
      stack: error.stack 
    });
    console.error('❌ Production startup failed:', error);
    process.exit(1);
  }
}

// Handle emergency shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 EMERGENCY SHUTDOWN INITIATED');
  emergencySealer.logActivity('EMERGENCY_SHUTDOWN', 'Emergency shutdown via SIGINT');
  
  // Emergency seal everything
  EMERGENCY_SEAL();
  
  console.log('✅ Emergency shutdown complete');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  emergencySealer.logActivity('UNCAUGHT_EXCEPTION', 'Critical system error', {
    error: error.message,
    stack: error.stack
  });
  
  console.log('\n🚨 CRITICAL ERROR - EMERGENCY SEALING');
  EMERGENCY_SEAL();
  process.exit(1);
});

// Start production
startProduction();

console.log('✅ Einstein Wells production startup complete');
console.log('👁️  WATCHING: Every activity is being logged');
console.log('🚨 READY: Emergency seal available at any time');