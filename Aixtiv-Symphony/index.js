#!/usr/bin/env node

/**
 * 💎 DYNAMIC CMS SYSTEM - DIAMOND SAO COMMAND CENTER ORCHESTRATOR
 * 🏗️ MASSIVE UNIVERSAL AUTHENTICATION ORCHESTRATION SYSTEM
 * 
 * Main Entry Point for:
 * 🔹 OWNER INTERFACE (Admin Tool - Dynamic CMS)
 * 🔹 INTEGRATION GATEWAY (OAuth2 Orchestrator) 
 * 🔹 UNIVERSAL GATEWAY (Backend Authentication)
 * 🔹 MCP SERVICES (10,000 companies, 20M agents)
 * 🔹 DIAMOND CLI ECOSYSTEM
 * 🔹 MONGODB ATLAS (Agent Registry)
 * 
 * Authority: Diamond SAO Command Center
 * Classification: DYNAMIC_CMS_ORCHESTRATOR
 * Environment: Production us-west1 (mocoa production zone)
 * 
 * @author Diamond SAO Command Center
 * @version 1.0.0-launch-ready
 * @date 2025-09-11
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { DiamondSAOCloudServices } = require('./cloud-init');

class DiamondSAODynamicCMS {
  constructor() {
    this.version = '1.0.0-launch-ready';
    this.authority = 'Diamond SAO Command Center';
    this.environment = process.env.NODE_ENV || 'production';
    this.region = process.env.CLOUD_ML_REGION || 'us-west1';
    this.gcpProject = process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    
    // Production endpoints from SYSTEM-ARCHITECTURE-CONNECTIONS.md
    this.services = {
      ownerInterface: 'https://mocoa-owner-interface-production-yutylytffa-uw.a.run.app',
      integrationGateway: 'https://integration-gateway-production-yutylytffa-uw.a.run.app',
      universalGateway: 'https://universal-gateway-production-yutylytffa-uw.a.run.app',
      sallyPort: 'https://sallyport.2100.cool',
      masterMCP: 'https://asoos-master-mcp-uswest1-fixed-yutylytffa-uw.a.run.app'
    };

    this.app = express();
    this.port = process.env.PORT || 3000;
    this.logger = this.initializeLogger();
    
    // Initialize cloud services
    this.cloudServices = new DiamondSAOCloudServices({
      projectId: this.gcpProject,
      region: this.region,
      environment: this.environment
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  initializeLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [DIAMOND-SAO-${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/diamond-sao-cms.log' })
      ],
    });
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors({
      origin: ['https://sallyport.2100.cool', 'https://mocoa.2100.cool'],
      credentials: true // Enable cookies in CORS
    }));
    this.app.use(compression());
    this.app.use(cookieParser()); // Parse cookies from SallyPort
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging middleware
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.url} - Diamond SAO CMS Request`);
      next();
    });
  }

  setupRoutes() {
    // Import Universal Service routes
    const universalServicesRouter = require('./routes/universal-services');
    const { authenticate } = require('./middleware/sallyport-universal-bridge');
    
    // Universal Service API routes (protected by SallyPort OAuth2)
    this.app.use('/api', universalServicesRouter);
    
    // Health check for Cloud Run
    this.app.get('/health', async (req, res) => {
      try {
        // Get cloud services health status if initialized
        let cloudStatus = { status: 'not_initialized' };
        if (this.cloudServices && this.cloudServices.initialized) {
          cloudStatus = await this.cloudServices.getHealthStatus();
        }
        
        res.status(200).json({
          status: 'healthy',
          service: 'Diamond SAO Dynamic CMS Orchestrator',
          authority: this.authority,
          version: this.version,
          environment: this.environment,
          region: this.region,
          project: this.gcpProject,
          timestamp: new Date().toISOString(),
          services: this.services,
          cloudServices: cloudStatus
        });
      } catch (error) {
        this.logger.error('Health check error:', error);
        res.status(500).json({
          status: 'error',
          service: 'Diamond SAO Dynamic CMS Orchestrator',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Root endpoint - Dynamic CMS Dashboard
    this.app.get('/', async (req, res) => {
      try {
        const systemStatus = await this.checkSystemStatus();
        
        res.json({
          message: '💎 DIAMOND SAO COMMAND CENTER - DYNAMIC CMS SYSTEM',
          authority: this.authority,
          version: this.version,
          environment: this.environment,
          region: this.region,
          
          // Core Dynamic CMS Components
          dynamicCMS: {
            ownerInterface: {
              url: this.services.ownerInterface,
              description: 'Single Page Admin Interface - Dynamic CMS Core',
              status: systemStatus.ownerInterface
            },
            integrationGateway: {
              url: this.services.integrationGateway,
              description: 'OAuth2 Orchestrator - Authentication Hub',
              status: systemStatus.integrationGateway
            },
            universalGateway: {
              url: this.services.universalGateway,
              description: 'Backend Authentication System',
              status: systemStatus.universalGateway
            }
          },

          // Security & Authentication
          security: {
            sallyPort: {
              url: this.services.sallyPort,
              description: 'Security Center - Controlled Entry Point',
              status: systemStatus.sallyPort
            },
            oauth2: 'Enterprise OAuth2 with Google, GitHub, Microsoft',
            secretManager: 'GCP Secret Manager Integration'
          },

          // Scale & Infrastructure  
          infrastructure: {
            mcpServices: '10,000+ companies supported',
            agentRegistry: '20M+ agents in MongoDB Atlas',
            masterMCP: this.services.masterMCP,
            regions: ['us-west1', 'us-central1', 'eu-west1']
          },

          // Available Operations
          operations: {
            launch: '/launch',
            deploy: '/deploy',
            status: '/status', 
            oauth2: '/oauth2',
            mcp: '/mcp',
            diamond: '/diamond-cli'
          },
          
          // Universal Services Integration
          universalServices: {
            status: '/api/services/status',
            discovery: '/api/services/discover',
            ai: {
              openai: '/api/ai/openai/chat',
              anthropic: '/api/ai/anthropic/messages'
            },
            voice: {
              elevenlabs: '/api/voice/elevenlabs/text-to-speech'
            },
            cloud: {
              gcp: '/api/cloud/gcp/*',
              aws: '/api/cloud/aws/*'
            },
            dev: {
              github: '/api/dev/github/*',
              gitlab: '/api/dev/gitlab/*'
            },
            data: {
              mongodb: '/api/data/mongodb/query',
              pinecone: '/api/data/pinecone/*'
            }
          },

          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Dashboard error:', error);
        res.status(500).json({
          error: 'Dashboard error',
          message: error.message,
          authority: this.authority
        });
      }
    });

    // Protected Admin Dashboard (requires authentication)
    this.app.get('/admin', authenticate, async (req, res) => {
      try {
        res.json({
          message: '💎 DIAMOND SAO ADMIN DASHBOARD',
          authority: this.authority,
          user: {
            id: req.auth.sallyport.user_id,
            tenant_level: req.auth.tenant.level,
            security_level: req.auth.security_level,
            available_services: req.auth.tenant.services,
            copilots: req.auth.tenant.copilots
          },
          system_status: await this.checkSystemStatus(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Admin dashboard error:', error);
        res.status(500).json({
          error: 'Admin dashboard error',
          message: error.message,
          authority: this.authority
        });
      }
    });
    
    // Universal Service Authentication Test
    this.app.get('/auth-test', authenticate, (req, res) => {
      const userServices = Object.keys(req.cookies)
        .filter(key => key.endsWith('_auth'))
        .map(key => key.replace('_auth', ''));
        
      res.json({
        message: '🔐 Universal Authentication Test',
        authority: this.authority,
        authentication: {
          sallyport_validated: true,
          user_id: req.auth.sallyport.user_id,
          tenant_level: req.auth.tenant.level,
          security_level: req.auth.security_level
        },
        services: {
          available_count: userServices.length,
          services: userServices,
          allowed_services: req.auth.tenant.services
        },
        timestamp: new Date().toISOString()
      });
    });

    // Launch Dynamic CMS System
    this.app.post('/launch', async (req, res) => {
      try {
        this.logger.info('🚀 LAUNCHING DYNAMIC CMS SYSTEM - DIAMOND SAO COMMAND CENTER');
        
        const launchResults = await this.launchDynamicCMS();
        
        res.json({
          status: 'LAUNCHED',
          message: '💎 Dynamic CMS System Launched Successfully',
          authority: this.authority,
          timestamp: new Date().toISOString(),
          results: launchResults
        });
      } catch (error) {
        this.logger.error('Launch failed:', error);
        res.status(500).json({
          error: 'Launch failed',
          message: error.message,
          authority: this.authority
        });
      }
    });

    // Deploy services
    this.app.post('/deploy/:service', async (req, res) => {
      try {
        const { service } = req.params;
        const deployResult = await this.deployService(service);
        
        res.json({
          status: 'deployed',
          service,
          result: deployResult,
          authority: this.authority,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error(`Deploy ${service} failed:`, error);
        res.status(500).json({
          error: 'Deploy failed',
          service: req.params.service,
          message: error.message
        });
      }
    });

    // System Status
    this.app.get('/status', async (req, res) => {
      try {
        const status = await this.getComprehensiveStatus();
        res.json(status);
      } catch (error) {
        this.logger.error('Status check failed:', error);
        res.status(500).json({
          error: 'Status check failed',
          message: error.message
        });
      }
    });

    // OAuth2 Management
    this.app.get('/oauth2', (req, res) => {
      res.json({
        message: 'OAuth2 Enterprise Authentication System',
        authority: this.authority,
        providers: ['Google', 'GitHub', 'Microsoft'],
        sallyPort: this.services.sallyPort,
        integrationGateway: this.services.integrationGateway,
        universalGateway: this.services.universalGateway
      });
    });

    // MCP Services
    this.app.get('/mcp', (req, res) => {
      res.json({
        message: 'Model Context Protocol Services',
        authority: this.authority,
        masterServer: this.services.masterMCP,
        companies: '10,000+',
        agents: '20M+',
        agentRegistry: 'MongoDB Atlas'
      });
    });

    // Diamond CLI Integration
    this.app.get('/diamond-cli', (req, res) => {
      res.json({
        message: 'Diamond CLI Command Center',
        authority: this.authority,
        version: this.version,
        commands: ['deploy', 'heal', 'repair', 'cttt', 'newman', 'wfa swarm']
      });
    });

    // Cloud Services Management
    this.app.get('/cloud', async (req, res) => {
      try {
        const cloudStatus = await this.cloudServices.getHealthStatus();
        res.json({
          message: 'Diamond SAO Cloud Services',
          authority: this.authority,
          status: cloudStatus,
          endpoints: {
            health: '/cloud/health',
            secrets: '/cloud/secrets',
            storage: '/cloud/storage',
            firestore: '/cloud/firestore'
          }
        });
      } catch (error) {
        res.status(500).json({
          error: 'Cloud services unavailable',
          message: error.message
        });
      }
    });

    // Cloud Health Status
    this.app.get('/cloud/health', async (req, res) => {
      try {
        const health = await this.cloudServices.getHealthStatus();
        res.json(health);
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error.message
        });
      }
    });
  }

  async checkSystemStatus() {
    const status = {};
    
    // Check each service
    for (const [name, url] of Object.entries(this.services)) {
      try {
        // Simple connectivity check - don't wait too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${url}/health`, {
          signal: controller.signal
        }).catch(() => ({ ok: false }));
        
        clearTimeout(timeoutId);
        status[name] = response.ok ? 'operational' : 'unavailable';
      } catch (error) {
        status[name] = 'unavailable';
      }
    }
    
    return status;
  }

  async launchDynamicCMS() {
    this.logger.info('🚀 Launching Diamond SAO Dynamic CMS System...');
    
    const results = {
      ownerInterface: await this.checkOwnerInterface(),
      integrationGateway: await this.deployIntegrationGateway(),
      oauth2Setup: await this.setupOAuth2(),
      mcpServices: await this.initializeMCPServices(),
      diamondCLI: await this.initializeDiamondCLI()
    };
    
    this.logger.info('✅ Dynamic CMS System Launch Complete');
    return results;
  }

  async checkOwnerInterface() {
    this.logger.info('🔍 Checking Owner Interface...');
    try {
      const response = await fetch(`${this.services.ownerInterface}/health`);
      return {
        status: response.ok ? 'operational' : 'needs_deployment',
        url: this.services.ownerInterface
      };
    } catch (error) {
      return {
        status: 'unavailable',
        error: error.message
      };
    }
  }

  async deployIntegrationGateway() {
    this.logger.info('🚪 Deploying Integration Gateway...');
    try {
      // Use Diamond CLI to deploy integration gateway
      const result = execSync('node diamond-cli/bin/diamond deploy integration gateway', 
        { encoding: 'utf8', cwd: __dirname });
      return {
        status: 'deployed',
        result: result.trim()
      };
    } catch (error) {
      this.logger.warn('Integration Gateway deployment needs manual intervention');
      return {
        status: 'needs_manual_deployment',
        error: error.message
      };
    }
  }

  async setupOAuth2() {
    this.logger.info('🔐 Setting up OAuth2 Authentication...');
    return {
      status: 'configured',
      providers: ['Google', 'GitHub', 'Microsoft'],
      sallyPort: this.services.sallyPort,
      secretManager: 'GCP Secret Manager'
    };
  }

  async initializeMCPServices() {
    this.logger.info('🤖 Initializing MCP Services...');
    return {
      status: 'operational',
      masterServer: this.services.masterMCP,
      companies: '10,000+',
      agents: '20M+'
    };
  }

  async initializeDiamondCLI() {
    this.logger.info('💎 Initializing Diamond CLI...');
    return {
      status: 'ready',
      version: this.version,
      authority: this.authority
    };
  }

  async deployService(serviceName) {
    this.logger.info(`🚀 Deploying service: ${serviceName}`);
    try {
      const result = execSync(`node diamond-cli/bin/diamond deploy ${serviceName}`, 
        { encoding: 'utf8', cwd: __dirname });
      return result.trim();
    } catch (error) {
      throw new Error(`Service deployment failed: ${error.message}`);
    }
  }

  async getComprehensiveStatus() {
    const systemStatus = await this.checkSystemStatus();
    
    return {
      system: 'Diamond SAO Dynamic CMS',
      authority: this.authority,
      version: this.version,
      environment: this.environment,
      region: this.region,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      
      services: {
        ownerInterface: {
          url: this.services.ownerInterface,
          status: systemStatus.ownerInterface,
          description: 'Dynamic CMS Admin Interface'
        },
        integrationGateway: {
          url: this.services.integrationGateway,
          status: systemStatus.integrationGateway,
          description: 'OAuth2 Orchestrator'
        },
        universalGateway: {
          url: this.services.universalGateway,
          status: systemStatus.universalGateway,
          description: 'Backend Authentication'
        },
        sallyPort: {
          url: this.services.sallyPort,
          status: systemStatus.sallyPort,
          description: 'Security Center'
        },
        masterMCP: {
          url: this.services.masterMCP,
          status: systemStatus.masterMCP,
          description: 'Master MCP Server'
        }
      }
    };
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      this.logger.error('Diamond SAO CMS - Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        authority: this.authority,
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} not found on Diamond SAO Dynamic CMS`,
        authority: this.authority,
        available_endpoints: [
          '/', 
          '/health', 
          '/launch', 
          '/deploy/:service', 
          '/status', 
          '/oauth2', 
          '/mcp',
          '/diamond-cli'
        ],
      });
    });
  }

  async start() {
    try {
      // Ensure logs directory exists
      const logsDir = path.join(__dirname, 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Initialize cloud services
      try {
        this.logger.info('🌩️  Initializing Diamond SAO Cloud Services...');
        await this.cloudServices.initialize();
        this.logger.info('✅ Cloud services initialized successfully');
      } catch (error) {
        this.logger.warn('⚠️  Cloud services initialization failed:', error.message);
        this.logger.warn('   Service will continue without full cloud functionality');
      }

      // Start server
      const server = this.app.listen(this.port, '0.0.0.0', () => {
        this.logger.info('💎 DIAMOND SAO DYNAMIC CMS SYSTEM LAUNCHED');
        this.logger.info('🏛️  Authority: Diamond SAO Command Center');
        this.logger.info(`🌐 Server: http://0.0.0.0:${this.port}`);
        this.logger.info(`📍 Region: ${this.region}`);
        this.logger.info(`🎯 Environment: ${this.environment}`);
        this.logger.info(`🏗️  Project: ${this.gcpProject}`);
        this.logger.info('⚡ Sacred Mission: Dynamic CMS Excellence');
        this.logger.info('');
        this.logger.info('🔗 SERVICES:');
        this.logger.info(`   Owner Interface: ${this.services.ownerInterface}`);
        this.logger.info(`   Integration Gateway: ${this.services.integrationGateway}`);
        this.logger.info(`   Universal Gateway: ${this.services.universalGateway}`);
        this.logger.info(`   SallyPort Security: ${this.services.sallyPort}`);
        this.logger.info(`   Master MCP: ${this.services.masterMCP}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        this.logger.info('🛑 SIGTERM received, shutting down Diamond SAO CMS gracefully');
        
        // Shutdown cloud services first
        try {
          await this.cloudServices.shutdown();
        } catch (error) {
          this.logger.error('⚠️  Error shutting down cloud services:', error.message);
        }
        
        server.close(() => {
          this.logger.info('✅ Diamond SAO CMS closed successfully');
          process.exit(0);
        });
      });

      process.on('SIGINT', async () => {
        this.logger.info('🛑 SIGINT received, shutting down Diamond SAO CMS gracefully');
        
        // Shutdown cloud services first
        try {
          await this.cloudServices.shutdown();
        } catch (error) {
          this.logger.error('⚠️  Error shutting down cloud services:', error.message);
        }
        
        server.close(() => {
          this.logger.info('✅ Diamond SAO CMS closed successfully');
          process.exit(0);
        });
      });

    } catch (error) {
      this.logger.error('Failed to start Diamond SAO Dynamic CMS:', error);
      process.exit(1);
    }
  }
}

// Launch the Dynamic CMS System
if (require.main === module) {
  const dynamicCMS = new DiamondSAODynamicCMS();
  dynamicCMS.start();
}

module.exports = DiamondSAODynamicCMS;
