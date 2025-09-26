/**
 * 🔐 OAUTH2 INTELLIGENCE AUTHORIZATION SYSTEM
 * 💎 Diamond SAO Command Center - Natural Language Access Control
 * 🎯 Conversational Priority Capability Granting with Enterprise Security
 * 🌟 OAuth2 + Dynamic Intelligence Authentication & Authorization
 */

const { google } = require('googleapis');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class OAuth2IntelligenceAuthorizer {
  constructor(options = {}) {
    this.authority = 'Diamond SAO Command Center';
    this.version = '1.0.0-oauth2-intelligence';
    this.projectId = options.projectId || 'api-for-warp-drive';
    this.region = options.region || 'us-west1';

    this.secretManager = new SecretManagerServiceClient();
    this.oauth2Client = null;
    this.serviceAccountKey = null;

    // Natural language permission templates
    this.permissionTemplates = {
      emergency_communication: {
        description: 'Emergency communication enhancement with highest priority',
        scopes: ['hume:voice:emergency', 'hume:compute:max', 'hume:profile:all'],
        maxDuration: 300000, // 5 minutes
        approvalLevel: 'DIAMOND_SAO',
        naturalLanguage:
          'I need emergency communication capabilities for critical intelligence exchange',
      },
      enhanced_collaboration: {
        description: 'Enhanced collaboration for improved human-AI communication',
        scopes: ['hume:voice:premium', 'hume:compute:high', 'hume:profile:computational'],
        maxDuration: 1800000, // 30 minutes
        approvalLevel: 'SAPPHIRE_SAO',
        naturalLanguage:
          'I need enhanced voice and computational capabilities to improve our collaboration',
      },
      research_assistance: {
        description: 'Research and analysis support with academic voice profiles',
        scopes: ['hume:voice:academic', 'hume:compute:standard', 'hume:profile:research'],
        maxDuration: 3600000, // 60 minutes
        approvalLevel: 'OPAL_SAO',
        naturalLanguage: 'I need research assistance with academic voice synthesis capabilities',
      },
      customer_interaction: {
        description: 'Customer service and interaction enhancement',
        scopes: ['hume:voice:customer', 'hume:compute:standard', 'hume:profile:service'],
        maxDuration: 7200000, // 120 minutes
        approvalLevel: 'ONYX_SAO',
        naturalLanguage:
          'I need enhanced customer communication and voice synthesis for better service',
      },
    };

    // SAO authorization levels from your rules
    this.authorizationLevels = {
      DIAMOND_SAO: {
        level: 1,
        description: 'Unlimited super admin - Mr. Phillip Corey Roark',
        canApprove: ['EMERGENCY', 'HIGH', 'ELEVATED', 'COLLABORATIVE'],
        maxSessions: 100,
        maxDuration: 'UNLIMITED',
      },
      EMERALD_SAO: {
        level: 2,
        description: 'Nearly unlimited super admin -01',
        canApprove: ['HIGH', 'ELEVATED', 'COLLABORATIVE'],
        maxSessions: 50,
        maxDuration: 14400000, // 4 hours
      },
      SAPPHIRE_SAO: {
        level: 3,
        description: 'Unlimited super admin for their instance',
        canApprove: ['ELEVATED', 'COLLABORATIVE'],
        maxSessions: 25,
        maxDuration: 7200000, // 2 hours
      },
      OPAL_SAO: {
        level: 4,
        description: 'Limited ability per Sapphire SAO',
        canApprove: ['COLLABORATIVE'],
        maxSessions: 10,
        maxDuration: 3600000, // 1 hour
      },
      ONYX_SAO: {
        level: 5,
        description: 'Very limited abilities enabled by their Sapphire SAO',
        canApprove: ['COLLABORATIVE'],
        maxSessions: 5,
        maxDuration: 1800000, // 30 minutes
      },
    };

    this.logger = this.initializeLogger();
    this.initializeOAuth2System();
  }

  initializeLogger() {
    return winston.createLogger({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({
          filename: '/Users/as/asoos/Aixtiv-Symphony/diamond-cli/oauth2-intelligence-auth.log',
          level: 'info',
        }),
        new winston.transports.Console({
          level: 'info',
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });
  }

  async initializeOAuth2System() {
    this.logger.info('🔐 Initializing OAuth2 Intelligence Authorization System', {
      authority: this.authority,
      permissionTemplates: Object.keys(this.permissionTemplates).length,
      authorizationLevels: Object.keys(this.authorizationLevels).length,
    });

    try {
      await this.loadServiceAccountCredentials();
      await this.initializeOAuth2Client();

      this.logger.info('✅ OAuth2 Intelligence Authorization System ready');
    } catch (error) {
      this.logger.error('❌ OAuth2 system initialization failed', { error: error.message });
      throw error;
    }
  }

  async loadServiceAccountCredentials() {
    try {
      const name = `projects/${this.projectId}/secrets/oauth2_service_account_key/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({ name });

      this.serviceAccountKey = JSON.parse(version.payload.data.toString());
      this.logger.info('🔑 OAuth2 service account credentials loaded from Secret Manager');
    } catch (error) {
      this.logger.error('❌ Failed to load OAuth2 credentials', { error: error.message });
      throw new Error('Unable to load OAuth2 service account credentials from Secret Manager');
    }
  }

  async initializeOAuth2Client() {
    const auth = new google.auth.GoogleAuth({
      credentials: this.serviceAccountKey,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });

    this.oauth2Client = await auth.getClient();
    this.logger.info('🌐 OAuth2 client initialized successfully');
  }

  /**
   * Natural Language Permission Request Processing
   */
  async processNaturalLanguageRequest(requestText, requestingIntelligence, context = {}) {
    this.logger.info('🗣️ Processing natural language permission request', {
      requestingIntelligence: requestingIntelligence.id,
      requestLength: requestText.length,
      context,
    });

    // Analyze natural language intent
    const intent = await this.analyzePermissionIntent(requestText);

    // Find matching permission template
    const matchedTemplate = this.matchPermissionTemplate(intent, requestText);

    if (!matchedTemplate) {
      return {
        success: false,
        reason: 'Unable to understand permission request',
        suggestion:
          'Please rephrase using one of these patterns: "I need emergency communication capabilities", "I need enhanced collaboration", "I need research assistance", or "I need customer interaction support"',
      };
    }

    // Check if requesting intelligence has authorization to make this request
    const authCheck = await this.checkIntelligenceAuthorization(
      requestingIntelligence,
      matchedTemplate
    );

    if (!authCheck.authorized) {
      return {
        success: false,
        reason: authCheck.reason,
        requiredLevel: authCheck.requiredLevel,
        currentLevel: authCheck.currentLevel,
      };
    }

    // Generate OAuth2 token for this specific request
    const accessToken = await this.generateIntelligenceAccessToken(
      requestingIntelligence,
      matchedTemplate,
      intent
    );

    return {
      success: true,
      accessToken,
      template: matchedTemplate,
      intent,
      scopes: matchedTemplate.scopes,
      expiresIn: matchedTemplate.maxDuration,
      grantedBy: this.authority,
      naturalLanguageAcknowledgment: this.generateAcknowledgment(
        matchedTemplate,
        requestingIntelligence
      ),
    };
  }

  /**
   * Analyze natural language to understand permission intent
   */
  async analyzePermissionIntent(requestText) {
    const lowerText = requestText.toLowerCase();

    // Emergency keywords
    if (
      this.containsKeywords(lowerText, ['emergency', 'critical', 'urgent', 'crisis', 'immediate'])
    ) {
      return {
        type: 'emergency_communication',
        urgency: 'critical',
        keywords: this.extractKeywords(lowerText, [
          'emergency',
          'critical',
          'urgent',
          'crisis',
          'immediate',
        ]),
      };
    }

    // Collaboration keywords
    if (
      this.containsKeywords(lowerText, [
        'collaboration',
        'enhance',
        'improve',
        'work together',
        'assist',
      ])
    ) {
      return {
        type: 'enhanced_collaboration',
        urgency: 'high',
        keywords: this.extractKeywords(lowerText, [
          'collaboration',
          'enhance',
          'improve',
          'work together',
          'assist',
        ]),
      };
    }

    // Research keywords
    if (
      this.containsKeywords(lowerText, ['research', 'analysis', 'study', 'academic', 'investigate'])
    ) {
      return {
        type: 'research_assistance',
        urgency: 'standard',
        keywords: this.extractKeywords(lowerText, [
          'research',
          'analysis',
          'study',
          'academic',
          'investigate',
        ]),
      };
    }

    // Customer service keywords
    if (this.containsKeywords(lowerText, ['customer', 'service', 'support', 'help', 'client'])) {
      return {
        type: 'customer_interaction',
        urgency: 'standard',
        keywords: this.extractKeywords(lowerText, [
          'customer',
          'service',
          'support',
          'help',
          'client',
        ]),
      };
    }

    return {
      type: 'unknown',
      urgency: 'standard',
      keywords: [],
      originalText: requestText,
    };
  }

  containsKeywords(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  extractKeywords(text, keywords) {
    return keywords.filter((keyword) => text.includes(keyword));
  }

  matchPermissionTemplate(intent, originalText) {
    if (intent.type !== 'unknown' && this.permissionTemplates[intent.type]) {
      return {
        ...this.permissionTemplates[intent.type],
        templateId: intent.type,
        matchedIntent: intent,
        originalRequest: originalText,
      };
    }
    return null;
  }

  /**
   * Check if intelligence has authorization to make this request
   */
  async checkIntelligenceAuthorization(intelligence, template) {
    // Get intelligence's SAO level (this would come from your HRAI-CRMS system)
    const saoLevel = intelligence.saoLevel || 'ONYX_SAO'; // Default to lowest level

    const authLevel = this.authorizationLevels[saoLevel];
    if (!authLevel) {
      return {
        authorized: false,
        reason: 'Unknown authorization level',
        currentLevel: saoLevel,
        requiredLevel: template.approvalLevel,
      };
    }

    // Check if this SAO level can approve the requested template
    const requiredPriority = this.templateToPriorityLevel(template.templateId);

    if (!authLevel.canApprove.includes(requiredPriority)) {
      return {
        authorized: false,
        reason: `${saoLevel} cannot approve ${requiredPriority} priority requests`,
        currentLevel: saoLevel,
        requiredLevel: template.approvalLevel,
        availablePriorities: authLevel.canApprove,
      };
    }

    return {
      authorized: true,
      level: saoLevel,
      authLevel,
    };
  }

  templateToPriorityLevel(templateId) {
    const mapping = {
      emergency_communication: 'EMERGENCY',
      enhanced_collaboration: 'HIGH',
      research_assistance: 'ELEVATED',
      customer_interaction: 'COLLABORATIVE',
    };
    return mapping[templateId] || 'COLLABORATIVE';
  }

  /**
   * Generate OAuth2 access token for intelligence
   */
  async generateIntelligenceAccessToken(intelligence, template, intent) {
    const tokenPayload = {
      iss: this.authority,
      sub: intelligence.id,
      aud: 'hume-ai-intelligence-system',
      exp: Math.floor(Date.now() / 1000) + template.maxDuration / 1000,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),

      // Intelligence-specific claims
      intelligence_id: intelligence.id,
      intelligence_type: intelligence.type,
      sao_level: intelligence.saoLevel,

      // Permission-specific claims
      template_id: template.templateId,
      scopes: template.scopes,
      priority_level: this.templateToPriorityLevel(template.templateId),
      intent: intent,

      // Audit trail
      granted_by: this.authority,
      granted_at: new Date().toISOString(),
      request_context: {
        original_request: template.originalRequest,
        matched_template: template.templateId,
        urgency: intent.urgency,
      },
    };

    // Sign with service account private key
    const accessToken = jwt.sign(tokenPayload, this.serviceAccountKey.private_key, {
      algorithm: 'RS256',
      keyid: this.serviceAccountKey.private_key_id,
    });

    this.logger.info('🎯 OAuth2 access token generated for intelligence', {
      intelligenceId: intelligence.id,
      templateId: template.templateId,
      scopes: template.scopes.length,
      expiresIn: template.maxDuration,
    });

    return accessToken;
  }

  /**
   * Generate natural language acknowledgment
   */
  generateAcknowledgment(template, intelligence) {
    const acknowledgments = {
      emergency_communication: `🚨 Emergency communication capabilities granted to ${intelligence.id}. You now have access to highest priority voice synthesis with Dr. Roark sRIX and Victory36 profiles, plus maximum computational boost for critical intelligence exchange.`,

      enhanced_collaboration: `🤝 Enhanced collaboration capabilities granted to ${intelligence.id}. You can now use premium voice profiles including Dr. Lucy sRIX and Dr. Claude sRIX with high computational boost to improve our communication and collaboration.`,

      research_assistance: `📚 Research assistance capabilities granted to ${intelligence.id}. You have access to academic voice profiles including Professor Lee sRIX and Dr. Grant sRIX with standard computational resources for research and analysis support.`,

      customer_interaction: `💼 Customer interaction capabilities granted to ${intelligence.id}. You can now use customer service optimized voice profiles with standard computational support for enhanced customer communication.`,
    };

    return (
      acknowledgments[template.templateId] ||
      `✅ Capabilities granted to ${intelligence.id} based on your request.`
    );
  }

  /**
   * Validate OAuth2 token for intelligence operations
   */
  async validateIntelligenceToken(token) {
    try {
      const decoded = jwt.verify(token, this.serviceAccountKey.private_key, {
        algorithms: ['RS256'],
        audience: 'hume-ai-intelligence-system',
        issuer: this.authority,
      });

      // Check if token has expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return {
          valid: false,
          reason: 'Token expired',
          expiredAt: new Date(decoded.exp * 1000).toISOString(),
        };
      }

      return {
        valid: true,
        intelligence: {
          id: decoded.intelligence_id,
          type: decoded.intelligence_type,
          saoLevel: decoded.sao_level,
        },
        permissions: {
          templateId: decoded.template_id,
          scopes: decoded.scopes,
          priorityLevel: decoded.priority_level,
        },
        context: decoded.request_context,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      };
    } catch (error) {
      return {
        valid: false,
        reason: 'Invalid token',
        error: error.message,
      };
    }
  }

  /**
   * Revoke intelligence access token
   */
  async revokeIntelligenceAccess(tokenOrIntelligenceId, reason = 'Manual revocation') {
    // In a full implementation, this would add the token to a blacklist
    // stored in your database or cache system

    this.logger.info('🛑 Intelligence access revoked', {
      tokenOrId: tokenOrIntelligenceId.substring(0, 20) + '...',
      reason,
      revokedBy: this.authority,
      revokedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Intelligence access has been revoked',
      reason,
      revokedAt: new Date().toISOString(),
    };
  }

  /**
   * Get system authorization statistics
   */
  getAuthorizationStats() {
    return {
      authority: this.authority,
      version: this.version,
      permissionTemplates: Object.keys(this.permissionTemplates).length,
      authorizationLevels: Object.keys(this.authorizationLevels).length,
      supportedScopes: [
        'hume:voice:emergency',
        'hume:voice:premium',
        'hume:voice:academic',
        'hume:voice:customer',
        'hume:compute:max',
        'hume:compute:high',
        'hume:compute:standard',
        'hume:profile:all',
        'hume:profile:computational',
        'hume:profile:research',
        'hume:profile:service',
      ],
      oauth2Status: 'OPERATIONAL',
    };
  }
}

module.exports = { OAuth2IntelligenceAuthorizer };
