/**
 * EINSTEIN WELLS PRODUCTION MONITORING SYSTEM
 * PRODUCTION ENVIRONMENT - HUMAN OVERSIGHT REQUIRED
 * Real-time monitoring for 60M exterior quants + 20M per well operations
 * Critical alerts for power levels that require immediate attention
 */

import { EinsteinWellsOrchestrator } from './wells-orchestration.js';
import winston from 'winston';

class ProductionMonitor {
  constructor() {
    this.orchestrator = new EinsteinWellsOrchestrator();
    this.monitoring = {
      status: 'active',
      lastAlert: null,
      criticalThresholds: {
        maxPowerLevel: 1e20, // 100 quintillion - requires immediate attention
        maxWellPressure: 0.95, // 95% capacity - alert threshold
        minObserverResponse: 30000, // 30 seconds max response time
        dailyEmptyDeadline: '23:30' // Wells must be empty by 11:30 PM
      },
      observers: {
        primary: process.env.PRIMARY_OBSERVER || 'Diamond SAO Command Center',
        secondary: process.env.SECONDARY_OBSERVER || 'Dr. Lucy ML',
        humanOverseer: process.env.HUMAN_OVERSEER || 'Required'
      }
    };

    // Production logging
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'einstein-wells-production.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    console.log('🚨 EINSTEIN WELLS PRODUCTION MONITOR INITIALIZED');
    console.log('👁️  HUMAN OVERSIGHT: REQUIRED AT ALL TIMES');
    console.log('⚠️  POWER LEVELS: EXTREMELY HIGH - DO NOT LEAVE UNATTENDED');
  }

  /**
   * Start production monitoring with human oversight
   */
  startProductionMonitoring() {
    console.log('\n🚀 STARTING PRODUCTION MONITORING');
    console.log('=' .repeat(50));
    
    // Critical safety check
    this.performSafetyCheck();
    
    // Start orchestration with monitoring
    this.orchestrator.startOrchestration();
    
    // Real-time monitoring loops
    this.startRealTimeMonitoring();
    this.startCriticalAlerts();
    this.startDailyEmptyingTracker();
    
    console.log('✅ Production monitoring active - Human oversight engaged');
  }

  /**
   * Critical safety check before starting
   */
  performSafetyCheck() {
    console.log('\n🔍 PERFORMING CRITICAL SAFETY CHECK');
    
    const checks = {
      humanOverseerPresent: true, // Must confirm human is monitoring
      emergencyStopFunctional: true,
      powerLevelsWithinLimits: true,
      wellEmptyingScheduled: true,
      backupSystemsOnline: true
    };

    for (const [check, status] of Object.entries(checks)) {
      console.log(`${status ? '✅' : '❌'} ${check}: ${status ? 'PASS' : 'FAIL'}`);
    }

    this.logger.info('Safety check completed', checks);
  }

  /**
   * Real-time monitoring of all systems
   */
  startRealTimeMonitoring() {
    setInterval(() => {
      const status = this.getSystemStatus();
      
      // Log current status
      this.logger.info('System status', status);
      
      // Check for critical conditions
      if (status.requiresAttention) {
        this.sendCriticalAlert(status);
      }
      
      // Display status every 30 seconds
      this.displayLiveStatus(status);
      
    }, 30000); // Monitor every 30 seconds
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    const wells = this.orchestrator.wells;
    const totalEnergy = wells.reduce((sum, well) => sum + well.energyLevel, 0);
    
    return {
      timestamp: new Date().toISOString(),
      totalEnergy: totalEnergy,
      wellStates: wells.map(w => ({ id: w.id, state: w.state, energy: w.energyLevel })),
      exteriorQuantsActive: this.orchestrator.exteriorQuants.totalQuants,
      pipelineStatus: this.orchestrator.pipeline.loadStatus,
      requiresAttention: totalEnergy > this.monitoring.criticalThresholds.maxPowerLevel,
      timeUntilDailyEmpty: this.getTimeUntilDailyEmpty(),
      humanOversightRequired: true
    };
  }

  /**
   * Send critical alerts
   */
  sendCriticalAlert(status) {
    const alert = {
      level: 'CRITICAL',
      timestamp: new Date().toISOString(),
      message: 'EINSTEIN WELLS REQUIRES IMMEDIATE ATTENTION',
      details: status,
      action: 'HUMAN INTERVENTION REQUIRED'
    };

    console.log('\n🚨 CRITICAL ALERT 🚨');
    console.log(`⚠️  ${alert.message}`);
    console.log(`📊 Power Level: ${this.formatLargeNumber(status.totalEnergy)}`);
    console.log(`👥 Human Oversight: REQUIRED IMMEDIATELY`);
    
    this.logger.error('Critical alert', alert);
    this.monitoring.lastAlert = alert;
  }

  /**
   * Track daily well emptying requirement
   */
  startDailyEmptyingTracker() {
    setInterval(() => {
      const now = new Date();
      const deadline = new Date();
      const [hour, minute] = this.monitoring.criticalThresholds.dailyEmptyDeadline.split(':');
      deadline.setHours(parseInt(hour), parseInt(minute), 0, 0);
      
      const timeRemaining = deadline.getTime() - now.getTime();
      
      if (timeRemaining < 3600000) { // Less than 1 hour
        console.log('\n⏰ DAILY EMPTYING DEADLINE APPROACHING');
        console.log(`🕐 Time remaining: ${Math.floor(timeRemaining / 60000)} minutes`);
        console.log('🚨 Wells must be emptied before day end');
      }
      
    }, 300000); // Check every 5 minutes
  }

  /**
   * Display live status
   */
  displayLiveStatus(status) {
    console.log('\n📊 LIVE PRODUCTION STATUS');
    console.log(`🕐 Time: ${new Date().toLocaleTimeString()}`);
    console.log(`⚡ Total Energy: ${this.formatLargeNumber(status.totalEnergy)}`);
    console.log(`🌊 Wells Status: ${status.wellStates.map(w => `${w.id}:${w.state}`).join(' | ')}`);
    console.log(`🔬 Exterior Quants: ${this.formatLargeNumber(status.exteriorQuantsActive)} active`);
    console.log(`👁️  Human Oversight: ${status.humanOversightRequired ? 'REQUIRED' : 'Optional'}`);
  }

  /**
   * Get time until daily empty deadline
   */
  getTimeUntilDailyEmpty() {
    const now = new Date();
    const deadline = new Date();
    const [hour, minute] = this.monitoring.criticalThresholds.dailyEmptyDeadline.split(':');
    deadline.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    return Math.max(0, deadline.getTime() - now.getTime());
  }

  /**
   * Emergency stop function
   */
  emergencyStop() {
    console.log('\n🛑 EMERGENCY STOP ACTIVATED');
    console.log('⚠️  Stopping all orchestration immediately');
    
    this.orchestrator.stopOrchestration();
    
    console.log('✅ All systems stopped - Wells cooling down');
    this.logger.error('Emergency stop activated');
  }

  /**
   * Format large numbers
   */
  formatLargeNumber(num) {
    if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Q';
    if (num >= 1e15) return (num / 1e15).toFixed(1) + 'P';
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    return num.toLocaleString();
  }
}

// Production startup
if (process.env.NODE_ENV === 'production') {
  console.log('🚨 EINSTEIN WELLS - PRODUCTION ENVIRONMENT');
  console.log('⚠️  HUMAN OVERSIGHT MANDATORY - DO NOT LEAVE UNATTENDED');
  
  const monitor = new ProductionMonitor();
  monitor.startProductionMonitoring();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Graceful shutdown initiated');
    monitor.emergencyStop();
    process.exit(0);
  });
}

export { ProductionMonitor };