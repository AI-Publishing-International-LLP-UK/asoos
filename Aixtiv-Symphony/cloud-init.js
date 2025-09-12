#!/usr/bin/env node

/**
 * 💎 DIAMOND SAO CLOUD SERVICES INITIALIZATION
 * 🏗️ Google Cloud Platform Integration Module
 * 
 * Initializes and configures all Google Cloud services for:
 * - Secret Manager (API keys and sensitive data)
 * - Cloud Storage (file storage and assets)
 * - Cloud Logging (centralized logging)
 * - Cloud Monitoring (performance metrics)
 * - Firestore (document database)
 * - Pub/Sub (messaging and events)
 * - Cloud Run (container orchestration)
 * 
 * Authority: Diamond SAO Command Center
 * Environment: Production us-west1 (mocoa production zone)
 * 
 * @version 1.0.0-diamond-sao
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Storage } = require('@google-cloud/storage');
const { Logging } = require('@google-cloud/logging');
const monitoring = require('@google-cloud/monitoring');
const { Firestore } = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');
const { ServicesClient } = require('@google-cloud/run');
const winston = require('winston');

class DiamondSAOCloudServices {
  constructor(options = {}) {
    this.projectId = options.projectId || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.region = options.region || process.env.CLOUD_ML_REGION || 'us-west1';
    this.zone = options.zone || process.env.GOOGLE_CLOUD_ZONE || 'us-west1-b';
    this.environment = options.environment || process.env.NODE_ENV || 'production';
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [DIAMOND-CLOUD-${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/diamond-cloud-services.log' })
      ],
    });

    // Initialize service clients
    this.clients = {};
    this.initialized = false;
  }

  /**
   * Initialize all Google Cloud services
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing Diamond SAO Cloud Services...');

      // Initialize Secret Manager
      this.clients.secretManager = new SecretManagerServiceClient({
        projectId: this.projectId
      });

      // Initialize Cloud Storage
      this.clients.storage = new Storage({
        projectId: this.projectId
      });

      // Initialize Cloud Logging
      this.clients.logging = new Logging({
        projectId: this.projectId
      });

      // Initialize Cloud Monitoring
      this.clients.monitoring = new monitoring.MetricServiceClient({
        projectId: this.projectId
      });

      // Initialize Firestore
      this.clients.firestore = new Firestore({
        projectId: this.projectId,
        databaseId: '(default)'
      });

      // Initialize Pub/Sub
      this.clients.pubsub = new PubSub({
        projectId: this.projectId
      });

      // Initialize Cloud Run
      this.clients.run = new ServicesClient({
        projectId: this.projectId
      });

      this.initialized = true;
      this.logger.info('✅ All Diamond SAO Cloud Services initialized successfully');

      // Verify connectivity
      await this.verifyConnectivity();

      return {
        status: 'initialized',
        projectId: this.projectId,
        region: this.region,
        environment: this.environment,
        services: Object.keys(this.clients)
      };

    } catch (error) {
      this.logger.error('❌ Failed to initialize cloud services:', error);
      throw error;
    }
  }

  /**
   * Verify connectivity to all services
   */
  async verifyConnectivity() {
    const results = {};

    try {
      // Test Secret Manager
      try {
        const [secrets] = await this.clients.secretManager.listSecrets({
          parent: `projects/${this.projectId}`,
          pageSize: 1
        });
        results.secretManager = { status: 'connected', count: secrets.length };
      } catch (error) {
        results.secretManager = { status: 'error', error: error.message };
      }

      // Test Cloud Storage
      try {
        const [buckets] = await this.clients.storage.getBuckets();
        results.storage = { status: 'connected', count: buckets.length };
      } catch (error) {
        results.storage = { status: 'error', error: error.message };
      }

      // Test Firestore
      try {
        const healthDoc = this.clients.firestore.collection('_health').doc('connectivity-test');
        await healthDoc.set({ 
          tested: new Date().toISOString(),
          service: 'diamond-sao-cloud-services'
        });
        results.firestore = { status: 'connected' };
      } catch (error) {
        results.firestore = { status: 'error', error: error.message };
      }

      // Test Pub/Sub
      try {
        const [topics] = await this.clients.pubsub.getTopics();
        results.pubsub = { status: 'connected', count: topics.length };
      } catch (error) {
        results.pubsub = { status: 'error', error: error.message };
      }

      this.logger.info('🔍 Cloud Services Connectivity Check:', results);
      return results;

    } catch (error) {
      this.logger.error('❌ Connectivity verification failed:', error);
      throw error;
    }
  }

  /**
   * Get secret from Secret Manager
   */
  async getSecret(secretName) {
    if (!this.initialized) {
      throw new Error('Cloud services not initialized');
    }

    try {
      const [version] = await this.clients.secretManager.accessSecretVersion({
        name: `projects/${this.projectId}/secrets/${secretName}/versions/latest`,
      });

      const payload = version.payload.data.toString('utf8');
      this.logger.info(`🔐 Retrieved secret: ${secretName}`);
      
      return payload;
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve secret ${secretName}:`, error.message);
      throw error;
    }
  }

  /**
   * Upload file to Cloud Storage
   */
  async uploadToStorage(bucketName, fileName, data, options = {}) {
    if (!this.initialized) {
      throw new Error('Cloud services not initialized');
    }

    try {
      const bucket = this.clients.storage.bucket(bucketName);
      const file = bucket.file(fileName);

      await file.save(data, {
        metadata: {
          contentType: options.contentType || 'application/octet-stream',
          metadata: {
            uploadedBy: 'diamond-sao-cloud-services',
            timestamp: new Date().toISOString(),
            ...options.metadata
          }
        }
      });

      this.logger.info(`📁 Uploaded file to storage: ${bucketName}/${fileName}`);
      
      return {
        bucket: bucketName,
        file: fileName,
        size: data.length,
        url: `gs://${bucketName}/${fileName}`
      };
    } catch (error) {
      this.logger.error('❌ Failed to upload to storage:', error.message);
      throw error;
    }
  }

  /**
   * Log to Cloud Logging
   */
  async logToCloud(logName, entry, severity = 'INFO') {
    if (!this.initialized) {
      throw new Error('Cloud services not initialized');
    }

    try {
      const log = this.clients.logging.log(logName);
      const metadata = {
        severity: severity,
        resource: { type: 'global' }
      };

      const logEntry = log.entry(metadata, entry);
      await log.write(logEntry);

      this.logger.info(`📊 Logged to cloud: ${logName}`);
      
      return { logged: true, logName, severity };
    } catch (error) {
      this.logger.error('❌ Failed to log to cloud:', error.message);
      throw error;
    }
  }

  /**
   * Publish message to Pub/Sub
   */
  async publishMessage(topicName, data, attributes = {}) {
    if (!this.initialized) {
      throw new Error('Cloud services not initialized');
    }

    try {
      const topic = this.clients.pubsub.topic(topicName);
      const message = {
        data: Buffer.from(JSON.stringify(data)),
        attributes: {
          source: 'diamond-sao-cloud-services',
          timestamp: new Date().toISOString(),
          ...attributes
        }
      };

      const messageId = await topic.publishMessage(message);
      
      this.logger.info(`📨 Published message to topic: ${topicName}, ID: ${messageId}`);
      
      return { messageId, topic: topicName };
    } catch (error) {
      this.logger.error('❌ Failed to publish message:', error.message);
      throw error;
    }
  }

  /**
   * Save document to Firestore
   */
  async saveToFirestore(collection, docId, data) {
    if (!this.initialized) {
      throw new Error('Cloud services not initialized');
    }

    try {
      const docRef = this.clients.firestore.collection(collection).doc(docId);
      await docRef.set({
        ...data,
        _metadata: {
          createdBy: 'diamond-sao-cloud-services',
          timestamp: new Date().toISOString(),
          environment: this.environment
        }
      }, { merge: true });

      this.logger.info(`💾 Saved document to Firestore: ${collection}/${docId}`);
      
      return { collection, docId, saved: true };
    } catch (error) {
      this.logger.error('❌ Failed to save to Firestore:', error.message);
      throw error;
    }
  }

  /**
   * Get cloud service health status
   */
  async getHealthStatus() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }

    try {
      const connectivity = await this.verifyConnectivity();
      
      return {
        status: 'healthy',
        initialized: true,
        projectId: this.projectId,
        region: this.region,
        environment: this.environment,
        services: connectivity,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      this.logger.info('🔄 Shutting down Diamond SAO Cloud Services...');
      
      // Close Firestore connection
      if (this.clients.firestore) {
        await this.clients.firestore.terminate();
      }

      this.initialized = false;
      this.logger.info('✅ Cloud services shutdown complete');
      
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

// Export singleton instance
const cloudServices = new DiamondSAOCloudServices();

module.exports = {
  DiamondSAOCloudServices,
  cloudServices
};
