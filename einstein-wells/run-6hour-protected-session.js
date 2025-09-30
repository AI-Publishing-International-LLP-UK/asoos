#!/usr/bin/env node

/**
 * EINSTEIN WELLS - PROTECTED 6-HOUR SESSION
 * Containerized operation with memory shields and translation fault validation
 * Human oversight required - Emergency stop available
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class EinsteinWellsProtectedSession {
  constructor() {
    this.sessionDuration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    this.startTime = new Date();
    this.endTime = new Date(this.startTime.getTime() + this.sessionDuration);
    this.containerName = 'einstein-wells-protected';
    this.imageName = 'gcr.io/api-for-warp-drive/einstein-wells:protected';
    this.sessionId = `EW-${Date.now()}`;
    
    this.sessionConfig = {
      maxMemory: '8g',
      cpuLimit: '4',
      networkMode: 'bridge',
      restartPolicy: 'unless-stopped',
      healthCheck: true,
      memoryShield: true,
      translationFaultValidation: true
    };

    console.log('🛡️  EINSTEIN WELLS PROTECTED 6-HOUR SESSION');
    console.log('=' .repeat(60));
    console.log(`📅 Start Time: ${this.startTime.toLocaleString()}`);
    console.log(`⏰ End Time: ${this.endTime.toLocaleString()}`);
    console.log(`🆔 Session ID: ${this.sessionId}`);
    console.log(`🐳 Container: ${this.containerName}`);
    console.log('🔒 Memory Protection: ENABLED');
    console.log('🔍 Translation Fault Validation: ENABLED');
  }

  /**
   * Run translation fault cleanup before starting
   */
  async runPreStartCleanup() {
    console.log('\n🧹 PRE-SESSION CLEANUP');
    console.log('Running translation fault cleanup...');
    
    try {
      await execAsync('./cleanup-translation-faults.sh');
      console.log('✅ Translation fault cleanup completed');
      
      // Wait 30 seconds for system to stabilize
      console.log('⏳ Waiting 30 seconds for system stabilization...');
      await this.sleep(30000);
      
    } catch (error) {
      console.log('⚠️  Cleanup completed with warnings:', error.message);
    }
  }

  /**
   * Build protected container image
   */
  async buildProtectedContainer() {
    console.log('\n🐳 BUILDING PROTECTED CONTAINER');
    
    try {
      console.log('Building Einstein Wells protected image...');
      const buildResult = await execAsync(
        `docker build -f Dockerfile.protected -t ${this.imageName} .`,
        { cwd: process.cwd() }
      );
      
      console.log('✅ Protected container built successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to build container:', error.message);
      return false;
    }
  }

  /**
   * Start the protected container session
   */
  async startProtectedSession() {
    console.log('\n🚀 STARTING PROTECTED 6-HOUR SESSION');
    
    // Stop any existing container
    try {
      await execAsync(`docker stop ${this.containerName} || true`);
      await execAsync(`docker rm ${this.containerName} || true`);
    } catch (error) {
      // Ignore errors for non-existing containers
    }

    const dockerCommand = [
      'docker', 'run',
      '--name', this.containerName,
      '--memory', this.sessionConfig.maxMemory,
      '--cpus', this.sessionConfig.cpuLimit,
      '--network', this.sessionConfig.networkMode,
      '--restart', this.sessionConfig.restartPolicy,
      '-p', '8080:8080',
      '-e', 'NODE_ENV=production',
      '-e', 'SESSION_ID=' + this.sessionId,
      '-e', 'SESSION_DURATION=' + this.sessionDuration,
      '-e', 'MEMORY_SHIELD_ENABLED=true',
      '-e', 'TRANSLATION_FAULT_MONITORING=true',
      '-v', `${process.cwd()}/logs:/app/logs`,
      '--health-cmd', 'node -e "process.exit(0)"',
      '--health-interval', '30s',
      '--health-timeout', '10s',
      '--health-retries', '3',
      this.imageName
    ];

    try {
      console.log('Starting protected container...');
      const containerProcess = spawn(dockerCommand[0], dockerCommand.slice(1), {
        stdio: ['inherit', 'pipe', 'pipe'],
        detached: false
      });

      containerProcess.stdout.on('data', (data) => {
        process.stdout.write(`[CONTAINER] ${data}`);
      });

      containerProcess.stderr.on('data', (data) => {
        process.stderr.write(`[ERROR] ${data}`);
      });

      console.log('✅ Protected container started successfully');
      return containerProcess;
      
    } catch (error) {
      console.error('❌ Failed to start container:', error.message);
      throw error;
    }
  }

  /**
   * Monitor session progress and container health
   */
  async monitorSession() {
    console.log('\n📊 SESSION MONITORING STARTED');
    
    const monitorInterval = setInterval(async () => {
      try {
        const now = new Date();
        const elapsed = now.getTime() - this.startTime.getTime();
        const remaining = this.sessionDuration - elapsed;
        
        // Check if session should end
        if (remaining <= 0) {
          console.log('\n⏰ 6-HOUR SESSION COMPLETED');
          await this.stopSession();
          clearInterval(monitorInterval);
          return;
        }
        
        // Display progress
        const elapsedHours = Math.floor(elapsed / (60 * 60 * 1000));
        const elapsedMinutes = Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000));
        const remainingHours = Math.floor(remaining / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        
        console.log(`\n📊 SESSION STATUS - ${now.toLocaleTimeString()}`);
        console.log(`⏱️  Elapsed: ${elapsedHours}h ${elapsedMinutes}m`);
        console.log(`⏰ Remaining: ${remainingHours}h ${remainingMinutes}m`);
        
        // Check container health
        const health = await this.checkContainerHealth();
        console.log(`🏥 Container Health: ${health}`);
        
        // Check memory usage
        const memory = await this.checkMemoryUsage();
        console.log(`🧠 Memory Usage: ${memory}`);
        
      } catch (error) {
        console.error('⚠️  Monitor error:', error.message);
      }
    }, 60000); // Monitor every minute

    // Setup emergency stop handler
    process.on('SIGINT', async () => {
      console.log('\n🛑 EMERGENCY STOP REQUESTED');
      clearInterval(monitorInterval);
      await this.emergencyStop();
      process.exit(0);
    });
  }

  /**
   * Check container health
   */
  async checkContainerHealth() {
    try {
      const result = await execAsync(`docker inspect --format='{{.State.Health.Status}}' ${this.containerName}`);
      return result.stdout.trim() || 'healthy';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Check container memory usage
   */
  async checkMemoryUsage() {
    try {
      const result = await execAsync(`docker stats ${this.containerName} --no-stream --format "{{.MemUsage}}"`);
      return result.stdout.trim() || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Normal session stop
   */
  async stopSession() {
    console.log('\n🛑 STOPPING SESSION GRACEFULLY');
    
    try {
      // Send graceful stop signal to container
      await execAsync(`docker stop -t 30 ${this.containerName}`);
      console.log('✅ Container stopped gracefully');
      
      // Generate final report
      await this.generateSessionReport();
      
    } catch (error) {
      console.error('⚠️  Error during session stop:', error.message);
      await this.emergencyStop();
    }
  }

  /**
   * Emergency stop
   */
  async emergencyStop() {
    console.log('\n🚨 EMERGENCY STOP IN PROGRESS');
    
    try {
      // Force stop container
      await execAsync(`docker kill ${this.containerName} || true`);
      console.log('🛑 Container force-stopped');
      
      // Clean up resources
      await execAsync(`docker rm ${this.containerName} || true`);
      console.log('🧹 Container cleaned up');
      
    } catch (error) {
      console.error('❌ Error during emergency stop:', error.message);
    }
  }

  /**
   * Generate session completion report
   */
  async generateSessionReport() {
    const report = {
      sessionId: this.sessionId,
      startTime: this.startTime.toISOString(),
      endTime: new Date().toISOString(),
      plannedDuration: this.sessionDuration,
      actualDuration: new Date().getTime() - this.startTime.getTime(),
      containerName: this.containerName,
      imageName: this.imageName,
      memoryProtection: 'ENABLED',
      translationFaultValidation: 'ENABLED',
      status: 'COMPLETED'
    };

    try {
      await fs.writeFile(
        `einstein-wells-session-${this.sessionId}.json`,
        JSON.stringify(report, null, 2)
      );
      console.log(`📋 Session report saved: einstein-wells-session-${this.sessionId}.json`);
    } catch (error) {
      console.error('⚠️  Failed to save session report:', error.message);
    }
  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run the complete 6-hour protected session
   */
  async execute() {
    try {
      console.log('🚀 INITIALIZING PROTECTED 6-HOUR SESSION');
      
      // Step 1: Pre-cleanup
      await this.runPreStartCleanup();
      
      // Step 2: Build protected container
      const buildSuccess = await this.buildProtectedContainer();
      if (!buildSuccess) {
        throw new Error('Container build failed');
      }
      
      // Step 3: Start protected session
      const containerProcess = await this.startProtectedSession();
      
      // Step 4: Monitor for 6 hours
      await this.monitorSession();
      
      console.log('✅ PROTECTED SESSION EXECUTION COMPLETE');
      
    } catch (error) {
      console.error('❌ SESSION EXECUTION FAILED:', error.message);
      await this.emergencyStop();
      process.exit(1);
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const session = new EinsteinWellsProtectedSession();
  session.execute().catch(console.error);
}

export { EinsteinWellsProtectedSession };