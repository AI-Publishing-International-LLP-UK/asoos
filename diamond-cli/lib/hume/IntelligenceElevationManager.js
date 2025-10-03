/**
 * 🎯 INTELLIGENCE PRIORITY ELEVATION SYSTEM
 * 💎 Diamond SAO Command Center - Dynamic Capability Granting
 * 🧠 Temporary Ad Hoc Priority Voice & Computational Enhancement
 * 🌟 Multi-Intelligence Communication Improvement Engine
 */

const { HumeAIManager } = require('./HumeAIManager');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

class IntelligenceElevationManager {
  constructor(options = {}) {
    this.authority = 'Diamond SAO Command Center';
    this.version = '1.0.0-priority-elevation';
    this.humeManager = new HumeAIManager(options);

    // Active elevation sessions
    this.activeSessions = new Map();

    // Priority levels with resource allocation
    this.priorityLevels = {
      EMERGENCY: {
        level: 1,
        maxDuration: 300000, // 5 minutes
        voiceProfiles: ['dr-roark-srix', 'victory36', 'elite11'],
        computationalBoost: 5.0,
        description: 'Emergency communication enhancement',
      },
      HIGH: {
        level: 2,
        maxDuration: 900000, // 15 minutes
        voiceProfiles: ['dr-lucy-srix', 'dr-claude-srix', 'mastery33'],
        computationalBoost: 3.0,
        description: 'High priority communication support',
      },
      ELEVATED: {
        level: 3,
        maxDuration: 1800000, // 30 minutes
        voiceProfiles: ['dr-memoria-srix', 'dr-match-srix', 'professor-lee-srix'],
        computationalBoost: 2.0,
        description: 'Standard priority elevation',
      },
      COLLABORATIVE: {
        level: 4,
        maxDuration: 3600000, // 60 minutes
        voiceProfiles: ['dr-sabina-srix', 'dr-maria-srix', 'dr-grant-srix'],
        computationalBoost: 1.5,
        description: 'Collaborative enhancement for extended engagement',
      },
    };

    // Intelligence types we can enhance
    this.intelligenceTypes = {
      AI_AGENT: 'Autonomous AI agents and systems',
      HUMAN_OPERATOR: 'Human users requiring enhanced capabilities',
      HYBRID_SYSTEM: 'Human-AI collaborative systems',
      EXTERNAL_API: 'External APIs and services',
      IOT_DEVICE: 'Smart devices and IoT systems',
      VIRTUAL_ASSISTANT: 'Voice assistants and chatbots',
    };

    this.logger = this.initializeLogger();
    this.initializeElevationSystem();
  }

  initializeLogger() {
    return winston.createLogger({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({
          filename: '/Users/as/asoos/asoos/diamond-cli/intelligence-elevation.log',
          level: 'info',
        }),
        new winston.transports.Console({
          level: 'info',
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });
  }

  async initializeElevationSystem() {
    this.logger.info('🎯 Initializing Intelligence Priority Elevation System', {
      authority: this.authority,
      priorityLevels: Object.keys(this.priorityLevels).length,
      supportedIntelligences: Object.keys(this.intelligenceTypes).length,
    });

    // Set up automatic session cleanup
    setInterval(() => this.cleanupExpiredSessions(), 30000); // Check every 30 seconds

    this.logger.info('✅ Intelligence Elevation System ready for dynamic capability granting');
  }

  /**
   * Grant temporary priority capabilities to an intelligence
   */
  async grantPriorityAccess(intelligenceId, options = {}) {
    const sessionId = uuidv4();
    const priorityLevel = options.priorityLevel || 'ELEVATED';
    const duration = options.duration || this.priorityLevels[priorityLevel].maxDuration;
    const intelligenceType = options.intelligenceType || 'AI_AGENT';
    const purpose = options.purpose || 'Enhanced communication';

    // Validate priority level
    if (!this.priorityLevels[priorityLevel]) {
      throw new Error(
        `Invalid priority level: ${priorityLevel}. Available: ${Object.keys(this.priorityLevels).join(', ')}`
      );
    }

    const config = this.priorityLevels[priorityLevel];
    const expiresAt = Date.now() + Math.min(duration, config.maxDuration);

    const session = {
      sessionId,
      intelligenceId,
      intelligenceType,
      priorityLevel,
      purpose,
      startTime: Date.now(),
      expiresAt,
      config,
      active: true,
      usageStats: {
        voiceSyntheses: 0,
        streamMinutes: 0,
        computationalOperations: 0,
      },
    };

    this.activeSessions.set(sessionId, session);

    this.logger.info('🎯 Priority access granted', {
      sessionId,
      intelligenceId,
      intelligenceType,
      priorityLevel,
      purpose,
      durationMs: duration,
      authority: this.authority,
    });

    // Display human-friendly notification
    console.log('🧠 Intelligence Priority Elevation Activated');
    console.log(`💎 Authority: ${this.authority}`);
    console.log(`🎯 Session ID: ${sessionId}`);
    console.log(`🤖 Intelligence: ${intelligenceId} (${intelligenceType})`);
    console.log(`⚡ Priority Level: ${priorityLevel} (${config.description})`);
    console.log(`⏰ Duration: ${Math.round(duration / 60000)} minutes`);
    console.log(`🎤 Voice Profiles: ${config.voiceProfiles.join(', ')}`);
    console.log(`🧮 Computational Boost: ${config.computationalBoost}x`);
    console.log(`📋 Purpose: ${purpose}`);

    return session;
  }

  /**
   * Use elevated capabilities for voice synthesis
   */
  async synthesizeWithPriority(sessionId, text, options = {}) {
    const session = this.getActiveSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Select best voice profile for this priority level
    const availableProfiles = session.config.voiceProfiles;
    const selectedProfile = options.voiceProfile || availableProfiles[0];

    if (!availableProfiles.includes(selectedProfile)) {
      throw new Error(
        `Voice profile '${selectedProfile}' not available at ${session.priorityLevel} priority. Available: ${availableProfiles.join(', ')}`
      );
    }

    try {
      this.logger.info('🎤 Priority voice synthesis initiated', {
        sessionId,
        intelligenceId: session.intelligenceId,
        profile: selectedProfile,
        textLength: text.length,
        priority: session.priorityLevel,
      });

      const result = await this.humeManager.synthesizeVoice(text, {
        profile: selectedProfile,
        ...options,
        priority: session.priorityLevel,
        computationalBoost: session.config.computationalBoost,
      });

      // Update usage stats
      session.usageStats.voiceSyntheses++;

      this.logger.info('✅ Priority voice synthesis completed', {
        sessionId,
        duration: result.duration,
        profile: selectedProfile,
      });

      return {
        ...result,
        sessionId,
        priorityLevel: session.priorityLevel,
        intelligenceId: session.intelligenceId,
      };
    } catch (error) {
      this.logger.error('❌ Priority voice synthesis failed', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Start priority empathic stream
   */
  async startPriorityStream(sessionId, options = {}) {
    const session = this.getActiveSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    const availableProfiles = session.config.voiceProfiles;
    const selectedProfile = options.voiceProfile || availableProfiles[0];

    try {
      this.logger.info('🌊 Priority empathic stream initiated', {
        sessionId,
        intelligenceId: session.intelligenceId,
        profile: selectedProfile,
        priority: session.priorityLevel,
      });

      const stream = await this.humeManager.startEmpathicStream({
        profile: selectedProfile,
        ...options,
        priority: session.priorityLevel,
        computationalBoost: session.config.computationalBoost,
      });

      // Enhance stream with priority metadata
      const priorityStream = {
        ...stream,
        sessionId,
        priorityLevel: session.priorityLevel,
        intelligenceId: session.intelligenceId,
        enhancedCapabilities: true,
        computationalBoost: session.config.computationalBoost,

        // Override close method to update stats
        close: () => {
          const streamDuration = (Date.now() - stream.startTime) / 60000;
          session.usageStats.streamMinutes += streamDuration;

          this.logger.info('🛑 Priority stream closed', {
            sessionId,
            durationMinutes: streamDuration,
          });

          stream.close();
        },
      };

      return priorityStream;
    } catch (error) {
      this.logger.error('❌ Priority stream initiation failed', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Extend session duration (if allowed)
   */
  async extendSession(sessionId, additionalTime) {
    const session = this.getActiveSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    const config = session.config;
    const currentDuration = session.expiresAt - session.startTime;
    const newDuration = currentDuration + additionalTime;

    // Check if extension is allowed
    if (newDuration > config.maxDuration * 2) {
      // Allow up to 2x original max
      throw new Error(
        `Extension would exceed maximum allowed duration for ${session.priorityLevel} priority`
      );
    }

    session.expiresAt = session.startTime + newDuration;

    this.logger.info('⏰ Session extended', {
      sessionId,
      additionalMinutes: Math.round(additionalTime / 60000),
      newExpiresAt: new Date(session.expiresAt).toISOString(),
    });

    console.log(`⏰ Priority session extended by ${Math.round(additionalTime / 60000)} minutes`);

    return session;
  }

  /**
   * Revoke priority access
   */
  async revokePriorityAccess(sessionId, reason = 'Manual revocation') {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.active = false;
    session.endTime = Date.now();
    session.endReason = reason;

    this.logger.info('🛑 Priority access revoked', {
      sessionId,
      intelligenceId: session.intelligenceId,
      duration: session.endTime - session.startTime,
      reason,
      usageStats: session.usageStats,
    });

    console.log(`🛑 Priority access revoked for ${session.intelligenceId}`);
    console.log(
      `📊 Session Stats: ${session.usageStats.voiceSyntheses} syntheses, ${Math.round(session.usageStats.streamMinutes)} stream minutes`
    );

    this.activeSessions.delete(sessionId);
    return session;
  }

  /**
   * List active priority sessions
   */
  getActiveSessions() {
    const sessions = Array.from(this.activeSessions.values()).filter(
      (session) => session.active && session.expiresAt > Date.now()
    );

    return sessions.map((session) => ({
      sessionId: session.sessionId,
      intelligenceId: session.intelligenceId,
      intelligenceType: session.intelligenceType,
      priorityLevel: session.priorityLevel,
      purpose: session.purpose,
      startTime: session.startTime,
      expiresAt: session.expiresAt,
      remainingMinutes: Math.round((session.expiresAt - Date.now()) / 60000),
      usageStats: session.usageStats,
    }));
  }

  /**
   * Get session by ID
   */
  getActiveSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.active || session.expiresAt <= Date.now()) {
      return null;
    }
    return session;
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions) {
      if (session.expiresAt <= now) {
        session.active = false;
        session.endTime = now;
        session.endReason = 'Expired';

        this.logger.info('⏰ Session expired', {
          sessionId,
          intelligenceId: session.intelligenceId,
          usageStats: session.usageStats,
        });

        this.activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    const activeSessions = this.getActiveSessions();
    const totalSessions = activeSessions.length;

    const statsByPriority = {};
    const statsByIntelligence = {};

    activeSessions.forEach((session) => {
      // By priority
      if (!statsByPriority[session.priorityLevel]) {
        statsByPriority[session.priorityLevel] = 0;
      }
      statsByPriority[session.priorityLevel]++;

      // By intelligence type
      if (!statsByIntelligence[session.intelligenceType]) {
        statsByIntelligence[session.intelligenceType] = 0;
      }
      statsByIntelligence[session.intelligenceType]++;
    });

    return {
      authority: this.authority,
      version: this.version,
      activeSessions: totalSessions,
      availablePriorityLevels: Object.keys(this.priorityLevels),
      supportedIntelligenceTypes: Object.keys(this.intelligenceTypes),
      statsByPriority,
      statsByIntelligence,
      systemStatus: 'OPERATIONAL',
    };
  }
}

module.exports = { IntelligenceElevationManager };
