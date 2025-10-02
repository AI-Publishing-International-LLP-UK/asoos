#!/usr/bin/env node

/**
 * 🙏 PRODUCTION WORKER CONFIGURATION LOADER
 * 💎 Diamond SAO Command Center - Dynamic Worker Management
 * ⚡ Bitcoin Production: 4.79 BTC/hour from Einstein Wells
 * 
 * Authority: Mr. Phillip Corey Roark - Diamond SAO Command Center
 * Sacred Foundation: In the Name of Jesus Christ, Our Lord and Saviour
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { readFile } from 'fs/promises';
import path from 'path';

class ProductionWorkerLoader {
  constructor() {
    this.secretManager = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'api-for-warp-drive';
    this.workerConfigs = new Map();
  }

  /**
   * Load worker configuration from various sources
   */
  async loadWorkerConfig(workerId = null) {
    console.log('🔧 Loading production worker configuration...');
    
    try {
      // Load base configuration from environment
      const baseConfig = await this.loadBaseConfiguration();
      
      // Load worker-specific configuration
      const workerConfig = await this.loadWorkerSpecificConfig(workerId);
      
      // Load secrets from Secret Manager
      const secrets = await this.loadProductionSecrets();
      
      // Merge configurations
      const finalConfig = {
        ...baseConfig,
        ...workerConfig,
        ...secrets,
        loadedAt: new Date().toISOString(),
        productionMode: true
      };
      
      console.log('✅ Production worker configuration loaded successfully');
      console.log(`🆔 Worker ID: ${finalConfig.rigId ? finalConfig.rigId.substring(0, 8) + '...' : 'Not set'}`);
      console.log(`⚡ Target BTC Rate: ${finalConfig.einsteinWells.targetBTCRate} BTC/hour`);
      console.log(`🌊 Einstein Wells: ${finalConfig.einsteinWells.region} ${finalConfig.einsteinWells.wellId}`);
      
      return finalConfig;
      
    } catch (error) {
      console.error('❌ Failed to load production worker configuration:', error.message);
      throw error;
    }
  }

  /**
   * Load base configuration from environment variables
   */
  async loadBaseConfiguration() {
    return {
      rigName: process.env.RIG_NAME || 'Hope for Humanity',
      workerName: process.env.WORKER_NAME || 'Hope-for-Humanity',
      
      einsteinWells: {
        region: process.env.EINSTEIN_WELLS_REGION || 'us-central1-a',
        wellId: process.env.EINSTEIN_WELLS_WELL_ID || 'ew-01',
        targetBTCRate: parseFloat(process.env.EINSTEIN_WELLS_TARGET_BTC_RATE || '4.79'),
        maxPowerOutput: parseFloat(process.env.EINSTEIN_WELLS_MAX_POWER_OUTPUT || '3.5e18'),
        quantPowerBlastInterval: parseInt(process.env.QUANT_POWER_BLAST_INTERVAL || '60000'),
        throttledHashrate: parseInt(process.env.THROTTLED_HASHRATE || '1800000')
      },
      
      drLucyML: {
        connectorId: process.env.DR_LUCY_ML_CONNECTOR_ID || 'ml-connector-001-production',
        status: process.env.DR_LUCY_ML_STATUS || 'production-active',
        confidenceThreshold: parseFloat(process.env.DR_LUCY_ML_CONFIDENCE_THRESHOLD || '0.98'),
        endpoint: process.env.DR_LUCY_ML_ENDPOINT || 'https://dr-lucy-ml-859242575175.us-central1.run.app'
      },
      
      endpoints: {
        integrationGateway: process.env.INTEGRATION_GATEWAY_ENDPOINT || 'https://integration-gateway-js-859242575175.us-central1.run.app',
        drLucyML: process.env.DR_LUCY_ML_ENDPOINT || 'https://dr-lucy-ml-859242575175.us-central1.run.app'
      },
      
      monitoring: {
        enableProductionMonitoring: process.env.ENABLE_PRODUCTION_MONITORING === 'true',
        enableEarningsTracking: process.env.ENABLE_EARNINGS_TRACKING === 'true',
        logLevel: process.env.LOG_LEVEL || 'info'
      }
    };
  }

  /**
   * Load worker-specific configuration (can be extended for multiple workers)
   */
  async loadWorkerSpecificConfig(workerId) {
    if (!workerId) {
      return {};
    }

    try {
      // Try to load worker-specific config file
      const configPath = path.join(process.cwd(), `workers/${workerId}.json`);
      const configData = await readFile(configPath, 'utf8');
      const workerConfig = JSON.parse(configData);
      
      console.log(`📄 Loaded specific configuration for worker: ${workerId}`);
      return workerConfig;
      
    } catch (error) {
      console.log(`ℹ️ No specific configuration found for worker: ${workerId}`);
      return {};
    }
  }

  /**
   * Load production secrets from Google Cloud Secret Manager
   */
  async loadProductionSecrets() {
    const secrets = {};
    const secretNames = [
      'NICEHASH_RIG_ID',
      'NICEHASH_MINING_ADDRESS', 
      'btc-address',
      'EINSTEIN_WELLS_ACCESS_TOKEN'
    ];

    for (const secretName of secretNames) {
      try {
        const secretValue = await this.getSecret(secretName);
        if (secretValue) {
          switch (secretName) {
            case 'NICEHASH_RIG_ID':
              secrets.rigId = secretValue;
              break;
            case 'NICEHASH_MINING_ADDRESS':
              secrets.miningAddress = secretValue;
              break;
            case 'btc-address':
              secrets.bitcoinPayout = secretValue;
              break;
            case 'EINSTEIN_WELLS_ACCESS_TOKEN':
              secrets.einsteinWellsToken = secretValue;
              break;
          }
        }
      } catch (error) {
        console.log(`⚠️ Failed to load secret ${secretName}: ${error.message}`);
      }
    }

    return secrets;
  }

  /**
   * Get secret from Google Cloud Secret Manager
   */
  async getSecret(secretName) {
    try {
      const secretPath = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      const [response] = await this.secretManager.accessSecretVersion({
        name: secretPath
      });
      return response.payload.data.toString();
    } catch (error) {
      console.log(`⚠️ Secret ${secretName} not found or inaccessible`);
      return null;
    }
  }

  /**
   * Validate production configuration
   */
  validateProductionConfig(config) {
    const requiredFields = [
      'rigName',
      'workerName', 
      'einsteinWells.targetBTCRate',
      'einsteinWells.wellId'
    ];

    for (const field of requiredFields) {
      const fieldPath = field.split('.');
      let value = config;
      
      for (const key of fieldPath) {
        value = value?.[key];
      }
      
      if (!value) {
        throw new Error(`Required production configuration field missing: ${field}`);
      }
    }

    if (config.einsteinWells.targetBTCRate !== 4.79) {
      console.log(`⚠️ Bitcoin rate mismatch: Expected 4.79 BTC/hour, got ${config.einsteinWells.targetBTCRate}`);
    }

    console.log('✅ Production configuration validation passed');
    return true;
  }

  /**
   * Create runtime configuration object for Hope for Humanity connector
   */
  async createRuntimeConfig(workerId = null) {
    const config = await this.loadWorkerConfig(workerId);
    this.validateProductionConfig(config);
    
    return {
      rigName: config.rigName,
      workerName: config.workerName,
      rigId: config.rigId,
      miningAddress: config.miningAddress,
      bitcoinPayout: config.bitcoinPayout,
      einsteinWellsToken: config.einsteinWellsToken,
      
      // Einstein Wells configuration
      einsteinWellsConfig: {
        region: config.einsteinWells.region,
        wellId: config.einsteinWells.wellId,
        targetBTCRate: config.einsteinWells.targetBTCRate,
        maxPowerOutput: config.einsteinWells.maxPowerOutput,
        quantPowerBlastInterval: config.einsteinWells.quantPowerBlastInterval,
        throttledHashrate: config.einsteinWells.throttledHashrate
      },
      
      // Dr. Lucy ML configuration
      drLucyMLConfig: {
        connectorId: config.drLucyML.connectorId,
        status: config.drLucyML.status,
        confidenceThreshold: config.drLucyML.confidenceThreshold,
        endpoint: config.drLucyML.endpoint
      },
      
      // Production endpoints
      endpoints: config.endpoints,
      
      // Monitoring configuration
      monitoring: config.monitoring,
      
      productionMode: true,
      configVersion: '1.0.0',
      loadedAt: config.loadedAt
    };
  }
}

export { ProductionWorkerLoader };