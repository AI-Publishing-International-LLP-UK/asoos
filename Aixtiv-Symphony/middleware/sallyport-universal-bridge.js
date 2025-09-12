#!/usr/bin/env node

/**
 * 🔐 SALLYPORT UNIVERSAL SERVICE AUTHENTICATION BRIDGE
 * 💎 Diamond SAO Command Center - Universal Cookie Integration
 * 
 * Bridges SallyPort.2100.cool OAuth2 system with Universal Service Authentication
 * Supports multi-tenant, multi-tier (5-level) security architecture
 * 
 * Authority: Diamond SAO Command Center
 * Classification: UNIVERSAL_OAUTH2_SERVICE_BRIDGE
 * Integration: SallyPort → Universal Services (OpenAI, Anthropic, GCP, etc.)
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

class SallyPortUniversalBridge {
  constructor(options = {}) {
    this.sallyPortUrl = 'https://sallyport.2100.cool';
    this.authority = 'Diamond SAO Command Center';
    this.version = '1.0.0-universal-bridge';
    
    // Multi-Tenant Configuration
    this.tenantConfig = {
      diamond_sao: {
        level: 5, // Highest security level
        services: ['all'], // Full access
        copilots: ['dr_lucy', 'dr_claude', 'victory36', 'maestro']
      },
      owner_interface: {
        level: 4, // Owner level
        services: ['openai', 'anthropic', 'gcp', 'cloudflare', 'elevenlabs'],
        copilots: ['dr_lucy', 'dr_claude']
      },
      team_lead: {
        level: 3, // Team leadership
        services: ['openai', 'gcp', 'github', 'slack'],
        copilots: ['dr_claude']
      },
      practitioner: {
        level: 2, // Standard access
        services: ['openai', 'github', 'notion'],
        copilots: []
      },
      guest: {
        level: 1, // Limited access
        services: ['basic_apis'],
        copilots: []
      }
    };

    // Universal Service Registry (100+ services)
    this.universalServices = {
      // AI/LLM Services
      ai_services: {
        openai: { endpoint: 'https://api.openai.com', auth_type: 'bearer' },
        anthropic: { endpoint: 'https://api.anthropic.com', auth_type: 'x-api-key' },
        google_ai: { endpoint: 'https://generativelanguage.googleapis.com', auth_type: 'bearer' },
        cohere: { endpoint: 'https://api.cohere.ai', auth_type: 'bearer' },
        huggingface: { endpoint: 'https://api-inference.huggingface.co', auth_type: 'bearer' },
        elevenlabs: { endpoint: 'https://api.elevenlabs.io', auth_type: 'xi-api-key' },
        replicate: { endpoint: 'https://api.replicate.com', auth_type: 'bearer' },
      },
      
      // Cloud Providers
      cloud_services: {
        gcp: { endpoint: 'https://googleapis.com', auth_type: 'oauth2' },
        aws: { endpoint: 'https://amazonaws.com', auth_type: 'signature' },
        azure: { endpoint: 'https://management.azure.com', auth_type: 'bearer' },
        cloudflare: { endpoint: 'https://api.cloudflare.com', auth_type: 'bearer' },
        digitalocean: { endpoint: 'https://api.digitalocean.com', auth_type: 'bearer' }
      },
      
      // Databases & Storage
      data_services: {
        mongodb: { endpoint: 'mongodb+srv://', auth_type: 'connection_string' },
        pinecone: { endpoint: 'https://api.pinecone.io', auth_type: 'bearer' },
        supabase: { endpoint: 'https://supabase.com', auth_type: 'bearer' },
        redis: { endpoint: 'redis://', auth_type: 'connection_string' },
        firestore: { endpoint: 'https://firestore.googleapis.com', auth_type: 'oauth2' }
      },
      
      // Developer Tools
      dev_services: {
        github: { endpoint: 'https://api.github.com', auth_type: 'bearer' },
        gitlab: { endpoint: 'https://gitlab.com/api', auth_type: 'bearer' },
        zapier: { endpoint: 'https://hooks.zapier.com', auth_type: 'webhook' },
        notion: { endpoint: 'https://api.notion.com', auth_type: 'bearer' },
        linear: { endpoint: 'https://api.linear.app', auth_type: 'bearer' }
      },
      
      // Communication
      comm_services: {
        slack: { endpoint: 'https://slack.com/api', auth_type: 'bearer' },
        discord: { endpoint: 'https://discord.com/api', auth_type: 'bearer' },
        twilio: { endpoint: 'https://api.twilio.com', auth_type: 'basic' },
        sendgrid: { endpoint: 'https://api.sendgrid.com', auth_type: 'bearer' }
      },
      
      // Analytics & Monitoring
      analytics_services: {
        datadog: { endpoint: 'https://api.datadoghq.com', auth_type: 'api-key' },
        newrelic: { endpoint: 'https://api.newrelic.com', auth_type: 'api-key' },
        mixpanel: { endpoint: 'https://api.mixpanel.com', auth_type: 'bearer' },
        amplitude: { endpoint: 'https://api2.amplitude.com', auth_type: 'bearer' }
      }
    };

    this.encryption = {
      algorithm: 'aes-256-gcm',
      key: process.env.UNIVERSAL_COOKIE_KEY || crypto.randomBytes(32),
      ivLength: 16
    };
  }

  /**
   * Main authentication middleware for Universal Services
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        // 1. Validate SallyPort OAuth2 cookie
        const sallyPortAuth = await this.validateSallyPortAuth(req);
        
        if (!sallyPortAuth) {
          return this.redirectToSallyPort(req, res);
        }

        // 2. Extract user tenant and security level
        const userTenant = this.extractTenant(sallyPortAuth);
        const securityLevel = this.extractSecurityLevel(sallyPortAuth);
        
        // 3. Load Universal Service tokens for this user
        const serviceTokens = await this.loadUniversalServiceTokens(sallyPortAuth.user_id);
        
        // 4. Attach to request
        req.auth = {
          sallyport: sallyPortAuth,
          tenant: userTenant,
          security_level: securityLevel,
          services: serviceTokens,
          authority: this.authority
        };

        // 5. Set Universal Service cookies
        this.setUniversalServiceCookies(res, serviceTokens);

        next();
      } catch (error) {
        console.error('Universal auth error:', error);
        return this.redirectToSallyPort(req, res);
      }
    };
  }

  /**
   * Validate SallyPort OAuth2 authentication
   */
  async validateSallyPortAuth(req) {
    try {
      // Check for SallyPort session cookie
      const sallyPortSession = req.cookies['sallyport_session'] || 
                              req.cookies['diamond_sao_auth'] ||
                              req.cookies['aixtiv_symphony_auth'];

      if (!sallyPortSession) {
        return null;
      }

      // Verify with SallyPort OAuth2 server
      const response = await axios.post(`${this.sallyPortUrl}/api/oauth2/verify`, {
        session_token: sallyPortSession
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Diamond SAO Universal Bridge'
        }
      });

      if (response.data.valid) {
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('SallyPort validation error:', error);
      return null;
    }
  }

  /**
   * Extract tenant information from SallyPort auth
   */
  extractTenant(sallyPortAuth) {
    // Map SallyPort user roles to tenant levels
    const userRoles = sallyPortAuth.roles || [];
    
    if (userRoles.includes('diamond_sao') || sallyPortAuth.user_id === '0000001') {
      return this.tenantConfig.diamond_sao;
    } else if (userRoles.includes('owner')) {
      return this.tenantConfig.owner_interface;
    } else if (userRoles.includes('team_lead')) {
      return this.tenantConfig.team_lead;
    } else if (userRoles.includes('practitioner')) {
      return this.tenantConfig.practitioner;
    } else {
      return this.tenantConfig.guest;
    }
  }

  /**
   * Extract security level (1-5)
   */
  extractSecurityLevel(sallyPortAuth) {
    const tenant = this.extractTenant(sallyPortAuth);
    return tenant.level;
  }

  /**
   * Load Universal Service tokens for authenticated user
   */
  async loadUniversalServiceTokens(userId) {
    try {
      // In production, this would load from secure storage
      // For now, return service configuration based on user level
      
      const response = await axios.get(`${this.sallyPortUrl}/api/user/${userId}/service-tokens`, {
        headers: {
          'Authorization': `Bearer ${process.env.SALLYPORT_API_KEY}`,
          'User-Agent': 'Diamond SAO Universal Bridge'
        }
      });

      return response.data.service_tokens || {};
    } catch (error) {
      console.error('Failed to load service tokens:', error);
      return {};
    }
  }

  /**
   * Set encrypted Universal Service cookies
   */
  setUniversalServiceCookies(res, serviceTokens) {
    Object.entries(serviceTokens).forEach(([service, token]) => {
      const encryptedToken = this.encryptServiceToken(token);
      
      res.cookie(`${service}_auth`, encryptedToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000, // 4 hours
        domain: '.2100.cool' // Allow across all 2100.cool subdomains
      });
    });
  }

  /**
   * Encrypt service token for cookie storage
   */
  encryptServiceToken(token) {
    const iv = crypto.randomBytes(this.encryption.ivLength);
    const cipher = crypto.createCipher(this.encryption.algorithm, this.encryption.key);
    cipher.setAAD(Buffer.from('diamond-sao-universal', 'utf8'));
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted: encrypted,
      tag: tag.toString('hex')
    });
  }

  /**
   * Decrypt service token from cookie
   */
  decryptServiceToken(encryptedData) {
    try {
      const data = JSON.parse(encryptedData);
      const decipher = crypto.createDecipher(this.encryption.algorithm, this.encryption.key);
      decipher.setAAD(Buffer.from('diamond-sao-universal', 'utf8'));
      decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Token decryption error:', error);
      return null;
    }
  }

  /**
   * Universal Service Proxy - Route to any of 100+ services
   */
  createUniversalProxy() {
    return async (req, res, next) => {
      const { service, category } = req.params;
      
      // Check if user has access to this service
      const userTenant = req.auth?.tenant;
      if (!userTenant || !this.hasServiceAccess(userTenant, service)) {
        return res.status(403).json({
          error: 'Service access denied',
          service: service,
          required_level: this.getRequiredServiceLevel(service),
          user_level: userTenant?.level || 0,
          authority: this.authority
        });
      }

      // Get encrypted service token from cookies
      const encryptedToken = req.cookies[`${service}_auth`];
      if (!encryptedToken) {
        return res.status(401).json({
          error: 'Service authentication required',
          service: service,
          message: 'Please reauthenticate via SallyPort',
          authority: this.authority
        });
      }

      // Decrypt and use service token
      const serviceToken = this.decryptServiceToken(encryptedToken);
      if (!serviceToken) {
        return res.status(401).json({
          error: 'Invalid service token',
          service: service,
          authority: this.authority
        });
      }

      // Route to service
      req.serviceToken = serviceToken;
      req.serviceConfig = this.universalServices[category]?.[service];
      
      next();
    };
  }

  /**
   * Check if user has access to specific service
   */
  hasServiceAccess(tenant, service) {
    return tenant.services.includes('all') || 
           tenant.services.includes(service) ||
           tenant.level >= this.getRequiredServiceLevel(service);
  }

  /**
   * Get required security level for service
   */
  getRequiredServiceLevel(service) {
    // Define service security requirements
    const securityMap = {
      'openai': 2,
      'anthropic': 2, 
      'gcp': 3,
      'aws': 3,
      'github': 2,
      'elevenlabs': 2,
      'mongodb': 3,
      'pinecone': 3
    };
    
    return securityMap[service] || 1;
  }

  /**
   * Redirect to SallyPort for authentication
   */
  redirectToSallyPort(req, res) {
    const returnUrl = encodeURIComponent(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const sallyPortAuth = `${this.sallyPortUrl}/oauth2/authorize?return=${returnUrl}&client=diamond-sao-universal`;
    
    if (req.headers['content-type']?.includes('application/json') || req.xhr) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate via SallyPort OAuth2',
        auth_url: sallyPortAuth,
        authority: this.authority
      });
    } else {
      return res.redirect(sallyPortAuth);
    }
  }
}

// Export singleton instance
const universalBridge = new SallyPortUniversalBridge();

module.exports = {
  SallyPortUniversalBridge,
  universalBridge,
  
  // Middleware exports
  authenticate: universalBridge.authenticate(),
  universalProxy: universalBridge.createUniversalProxy(),
  
  // Utility exports
  encryptToken: (token) => universalBridge.encryptServiceToken(token),
  decryptToken: (encrypted) => universalBridge.decryptServiceToken(encrypted)
};
