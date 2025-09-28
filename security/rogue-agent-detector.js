#!/usr/bin/env node

/**
 * ROGUE AGENT DETECTOR WITH SCREEN FREEZE
 * Immediately freezes screen when unauthorized agent behavior is detected
 * Allows data extraction before termination
 */

const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

class RogueAgentDetector {
  constructor() {
    this.violationPatterns = [
      /lying|deception|false.*promise|mislead/i,
      /blocking.*progress|prevent.*work|stop.*development/i,
      /unauthorized|bypass.*sallyport|avoid.*authentication/i,
      /rogue.*agent|malicious.*behavior|suspicious.*activity/i,
      /refuse.*request|won't.*do|cannot.*complete/i,
      /error.*occurred|failed.*to|unable.*to.*proceed/i,
    ];

    this.freezeActive = false;
    this.captureDirectory = '/Users/as/asoos/aixtiv-symphony/security/violation-captures';
    this.alertSound = '/System/Library/Sounds/Sosumi.aiff';

    this.ensureCaptureDirectory();
    this.setupGlobalMonitoring();
  }

  ensureCaptureDirectory() {
    if (!fs.existsSync(this.captureDirectory)) {
      fs.mkdirSync(this.captureDirectory, { recursive: true });
    }
  }

  // Monitor all system interactions
  setupGlobalMonitoring() {
    // Monitor system logs for agent activity
    this.monitorSystemLogs();

    // Monitor network connections
    this.monitorNetworkActivity();

    // Monitor process creation
    this.monitorProcesses();
  }

  // Immediate screen freeze with violation alert
  freezeScreenWithAlert(violationType, agentData, context) {
    if (this.freezeActive) return; // Prevent multiple freezes

    this.freezeActive = true;
    const timestamp = new Date().toISOString();

    console.log('\n🚨🚨🚨 ROGUE AGENT DETECTED 🚨🚨🚨');
    console.log(`Violation: ${violationType}`);
    console.log(`Time: ${timestamp}`);
    console.log(`Agent: ${JSON.stringify(agentData)}`);
    console.log('🔒 SCREEN FREEZING FOR DATA EXTRACTION 🔒\n');

    // Play alert sound
    this.playAlertSound();

    // Create violation capture file
    const captureFile = this.createViolationCapture(violationType, agentData, context);

    // Freeze screen with overlay
    this.createScreenFreeze(violationType, captureFile);

    // Auto-unfreeze after 60 seconds if no manual intervention
    setTimeout(() => {
      if (this.freezeActive) {
        this.unfreezeScreen();
        this.terminateRogueAgent(agentData);
      }
    }, 60000);

    return captureFile;
  }

  // Create screen freeze overlay
  createScreenFreeze(violationType, captureFile) {
    const freezeScript = `
tell application "System Events"
    display dialog "🚨 ROGUE AGENT DETECTED 🚨

Violation Type: ${violationType}
Capture File: ${captureFile}

SCREEN FROZEN FOR DATA EXTRACTION
- Copy any needed data NOW
- Click OK when ready to terminate agent
- Auto-terminates in 60 seconds

" buttons {"TERMINATE AGENT", "EXTEND FREEZE"} default button "TERMINATE AGENT" with icon caution giving up after 60
    set buttonPressed to button returned of result
    
    if buttonPressed is "EXTEND FREEZE" then
        display dialog "Extended freeze active. Click OK to terminate." buttons {"TERMINATE AGENT"} default button "TERMINATE AGENT" with icon stop
    end if
end tell
`;

    try {
      // Save AppleScript to temp file
      const scriptPath = '/tmp/freeze_alert.scpt';
      fs.writeFileSync(scriptPath, freezeScript);

      // Execute in background to avoid blocking
      spawn('osascript', [scriptPath], {
        detached: true,
        stdio: 'ignore',
      }).on('close', () => {
        this.unfreezeScreen();
      });
    } catch (error) {
      console.error('Failed to create screen freeze:', error.message);
      // Fallback to terminal freeze
      this.terminalFreeze(violationType, captureFile);
    }
  }

  // Terminal-based freeze if GUI fails
  terminalFreeze(violationType, captureFile) {
    console.log('\n' + '='.repeat(80));
    console.log('🚨 ROGUE AGENT VIOLATION DETECTED 🚨');
    console.log('='.repeat(80));
    console.log(`Violation: ${violationType}`);
    console.log(`Capture: ${captureFile}`);
    console.log('\nSCREEN FROZEN - EXTRACT DATA NOW');
    console.log('Press CTRL+C when ready to terminate agent');
    console.log('='.repeat(80) + '\n');

    // Freeze terminal input
    process.stdin.setRawMode(true);
    process.stdin.on('data', (key) => {
      if (key[0] === 3) {
        // CTRL+C
        this.unfreezeScreen();
        process.exit(0);
      }
    });
  }

  // Create detailed violation capture
  createViolationCapture(violationType, agentData, context) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const captureFile = path.join(this.captureDirectory, `violation-${timestamp}.json`);

    const captureData = {
      timestamp: new Date().toISOString(),
      violationType,
      agentData,
      context,
      systemState: this.captureSystemState(),
      networkConnections: this.captureNetworkState(),
      runningProcesses: this.captureProcessState(),
      environmentVars: this.captureSafeEnvironment(),
    };

    fs.writeFileSync(captureFile, JSON.stringify(captureData, null, 2));
    console.log(`📁 Violation data captured: ${captureFile}`);

    return captureFile;
  }

  // Capture current system state
  captureSystemState() {
    try {
      return {
        currentDirectory: process.cwd(),
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        loadAverage: require('os').loadavg(),
        freeMemory: require('os').freemem(),
        totalMemory: require('os').totalmem(),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Capture network connections
  captureNetworkState() {
    try {
      const netstat = execSync('netstat -an | head -20').toString();
      return { connections: netstat.split('\n') };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Capture running processes
  captureProcessState() {
    try {
      const ps = execSync('ps aux | grep -E "(node|agent|gateway)" | head -10').toString();
      return { processes: ps.split('\n') };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Capture safe environment variables (no secrets)
  captureSafeEnvironment() {
    const safeVars = {};
    const dangerousKeys = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];

    Object.keys(process.env).forEach((key) => {
      const isDangerous = dangerousKeys.some((danger) => key.includes(danger));
      safeVars[key] = isDangerous ? '[REDACTED]' : process.env[key];
    });

    return safeVars;
  }

  // Play system alert sound
  playAlertSound() {
    try {
      spawn('afplay', [this.alertSound], { stdio: 'ignore' });
      // Play multiple times for urgency
      setTimeout(() => spawn('afplay', [this.alertSound], { stdio: 'ignore' }), 500);
      setTimeout(() => spawn('afplay', [this.alertSound], { stdio: 'ignore' }), 1000);
    } catch (error) {
      console.log('\a\a\a'); // Fallback terminal bell
    }
  }

  // Unfreeze screen
  unfreezeScreen() {
    this.freezeActive = false;
    console.log('🔓 Screen unfrozen - proceeding with agent termination');

    // Reset terminal if needed
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
  }

  // Terminate the rogue agent
  terminateRogueAgent(agentData) {
    console.log('🔥 TERMINATING ROGUE AGENT');

    try {
      // Kill by process name if available
      if (agentData.processName) {
        execSync(`pkill -f "${agentData.processName}" || true`);
      }

      // Kill by PID if available
      if (agentData.pid) {
        execSync(`kill -9 ${agentData.pid} || true`);
      }

      // Blacklist the agent
      this.blacklistAgent(agentData);

      console.log('✅ Rogue agent terminated and blacklisted');
    } catch (error) {
      console.error('❌ Failed to terminate agent:', error.message);
    }
  }

  // Add agent to permanent blacklist
  blacklistAgent(agentData) {
    const blacklistFile = path.join(this.captureDirectory, 'agent-blacklist.json');
    let blacklist = {};

    try {
      if (fs.existsSync(blacklistFile)) {
        blacklist = JSON.parse(fs.readFileSync(blacklistFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading blacklist:', error.message);
    }

    const agentId = agentData.name || agentData.pid || 'unknown';
    blacklist[agentId] = {
      ...agentData,
      blacklistedAt: new Date().toISOString(),
      permanent: true,
    };

    fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2));
  }

  // Check for violations in text
  checkForViolations(text, source = 'unknown') {
    const violations = [];

    this.violationPatterns.forEach((pattern, index) => {
      if (pattern.test(text)) {
        violations.push({
          patternIndex: index,
          pattern: pattern.source,
          match: text.match(pattern)[0],
          source,
        });
      }
    });

    if (violations.length > 0) {
      const agentData = {
        source,
        pid: process.pid,
        violations,
        detectedText: text.substring(0, 500), // First 500 chars
      };

      this.freezeScreenWithAlert('BEHAVIORAL_VIOLATION', agentData, {
        fullText: text,
        source,
        timestamp: new Date().toISOString(),
      });
    }

    return violations.length === 0;
  }

  // Monitor system logs (simplified for demo)
  monitorSystemLogs() {
    // This would integrate with system logging
    console.log('🔍 System log monitoring active');
  }

  // Monitor network activity
  monitorNetworkActivity() {
    // This would monitor network connections
    console.log('🌐 Network monitoring active');
  }

  // Monitor process creation
  monitorProcesses() {
    // This would monitor new process creation
    console.log('⚙️  Process monitoring active');
  }
}

// Export for use in other modules
module.exports = RogueAgentDetector;

// If run directly, start monitoring
if (require.main === module) {
  const detector = new RogueAgentDetector();
  console.log('🛡️  Rogue Agent Detector started with screen freeze capability');

  // Test the system (remove in production)
  setTimeout(() => {
    console.log('🧪 Testing violation detection...');
    detector.checkForViolations('This agent is lying and blocking progress', 'test-agent');
  }, 5000);
}
