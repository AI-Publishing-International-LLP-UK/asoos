/**
 * Self-Healing MongoDB Connector for Diamond CLI
 * Automatically tries multiple MongoDB connection strategies and heals connection issues
 */

const { MongoClient } = require('mongodb');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SelfHealingMongoDBConnector {
  constructor(options = {}) {
    this.project = options.project || 'api-for-warp-drive';
    this.secretManager = new SecretManagerServiceClient();
    this.connectionStrategies = [
      'MONGODB_ATLAS_URI',
      'mongodb-atlas-uri', 
      'mongodb-atlas-connection',
      'mongodb-uri'
    ];
    // DIDC and HRAI-CRMS specific database names
    this.systemDatabases = {
      didc: 'didc_archives',
      hrai_crms: 'diamond_sao_hr_crms',
      aixtiv_symphony: 'aixtiv_symphony',
      asoos: 'asoos'
    };
    this.client = null;
    this.activeConnectionString = null;
    this.lastSuccessfulStrategy = null;
    this.maxRetries = 3;
    this.connectionTimeout = 15000; // 15 seconds for Atlas
  }

  /**
   * Self-healing connection method
   * Tries multiple strategies until one works
   */
  async connect() {
    console.log('🔄 Starting self-healing MongoDB connection process...');
    
    for (const strategy of this.connectionStrategies) {
      console.log(`🔍 Trying connection strategy: ${strategy}`);
      
      try {
        const connectionString = await this.getSecretValue(strategy);
        
        if (!connectionString) {
          console.log(`⚠️  No connection string found for ${strategy}`);
          continue;
        }

        // Validate connection string format
        if (!this.isValidConnectionString(connectionString)) {
          console.log(`❌ Invalid connection string format for ${strategy}`);
          console.log(`   Pattern: ${this.maskConnectionString(connectionString)}`);
          continue;
        }

        // Test the connection
        const testResult = await this.testConnection(connectionString);
        
        if (testResult.success) {
          this.client = testResult.client;
          this.activeConnectionString = connectionString;
          this.lastSuccessfulStrategy = strategy;
          
          console.log(`✅ Successfully connected using strategy: ${strategy}`);
          console.log(`📊 Database: ${testResult.database}`);
          console.log(`🏢 Collections: ${testResult.collections.length}`);
          
          // Update the primary secret with working connection string
          await this.updatePrimarySecret(connectionString);
          
          return {
            success: true,
            strategy: strategy,
            database: testResult.database,
            collections: testResult.collections,
            client: this.client
          };
        } else {
          console.log(`❌ Connection failed for ${strategy}: ${testResult.error}`);
        }
        
      } catch (error) {
        console.log(`❌ Strategy ${strategy} failed: ${error.message}`);
      }
    }

    // If all strategies failed, try to auto-heal
    console.log('🚑 All strategies failed, attempting auto-healing...');
    const healResult = await this.attemptAutoHeal();
    
    if (!healResult.success) {
      throw new Error(`MongoDB self-healing failed: ${healResult.error}`);
    }
    
    return healResult;
  }

  /**
   * Test a specific connection string
   */
  async testConnection(connectionString) {
    try {
      const client = new MongoClient(connectionString, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: this.connectionTimeout,
        connectTimeoutMS: this.connectionTimeout,
        socketTimeoutMS: this.connectionTimeout,
      });

      await client.connect();
      
      // Test database operations
      const admin = client.db().admin();
      const dbStats = await admin.listDatabases();
      
      // Try to access a specific database
      const targetDb = this.extractDatabaseName(connectionString) || 'aixtiv_symphony';
      const db = client.db(targetDb);
      const collections = await db.listCollections().toArray();
      
      return {
        success: true,
        client: client,
        database: targetDb,
        collections: collections,
        stats: dbStats
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate connection string format
   */
  isValidConnectionString(connectionString) {
    if (!connectionString) return false;
    
    // Check for placeholder hostnames
    const placeholders = ['cluster.mongodb.net', 'your-cluster.mongodb.net', 'example.mongodb.net'];
    const hasPlaceholder = placeholders.some(placeholder => 
      connectionString.includes(placeholder)
    );
    
    if (hasPlaceholder) {
      console.log('   ⚠️  Connection string contains placeholder hostname');
      return false;
    }
    
    // Validate MongoDB URI format
    const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
    return mongoUriPattern.test(connectionString);
  }

  /**
   * Attempt to auto-heal connection issues
   */
  async attemptAutoHeal() {
    console.log('🔧 Attempting MongoDB connection auto-healing...');
    
    try {
      // Strategy 1: Try to construct connection string from environment
      const envConnectionString = await this.constructFromEnvironment();
      if (envConnectionString) {
        console.log('🔧 Trying environment-constructed connection string...');
        const testResult = await this.testConnection(envConnectionString);
        if (testResult.success) {
          this.client = testResult.client;
          this.activeConnectionString = envConnectionString;
          
          // Store the working connection string
          await this.storeWorkingConnectionString(envConnectionString);
          
          return {
            success: true,
            strategy: 'auto-healed-environment',
            database: testResult.database,
            collections: testResult.collections,
            client: this.client
          };
        }
      }

      // Strategy 2: Try local MongoDB connection
      console.log('🔧 Trying local MongoDB connection...');
      const localConnectionString = 'mongodb://localhost:27017/aixtiv_symphony';
      const localTest = await this.testConnection(localConnectionString);
      if (localTest.success) {
        this.client = localTest.client;
        this.activeConnectionString = localConnectionString;
        
        console.log('✅ Connected to local MongoDB as fallback');
        return {
          success: true,
          strategy: 'auto-healed-local',
          database: localTest.database,
          collections: localTest.collections,
          client: this.client,
          isLocalFallback: true
        };
      }

      return {
        success: false,
        error: 'All auto-healing strategies failed'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Try to construct connection string from available environment/secrets
   */
  async constructFromEnvironment() {
    try {
      console.log('🔧 Attempting to construct MongoDB Atlas connection from secrets...');
      
      // Get MongoDB Atlas service account credentials
      const serviceAccountId = await this.getSecretValue('mongo_mdb_sa_id');
      const serviceAccountKey = await this.getSecretValue('mongodb_sa_sk');
      const dbName = await this.getSecretValue('MONGODB_ATLAS_DB_NAME') || 'aixtiv_symphony';
      
      if (serviceAccountId && serviceAccountKey) {
        // Try common MongoDB Atlas cluster patterns for api-for-warp-drive project
        const clusterPatterns = [
          // DIDC patterns
          'didc-cluster-0.atlasv2.mongodb.net',
          'didc-archives.atlasv2.mongodb.net',
          'didc-production.atlasv2.mongodb.net',
          // HRAI-CRMS patterns
          'hrai-crms-prod.atlasv2.mongodb.net',
          'diamond-sao-crms.atlasv2.mongodb.net',
          // General patterns
          'api-for-warp-drive.atlasv2.mongodb.net',
          'asoos-production.atlasv2.mongodb.net',
          'aixtiv-symphony.atlasv2.mongodb.net',
          'cluster0.atlasv2.mongodb.net',
          'cluster1.atlasv2.mongodb.net'
        ];
        
        for (const clusterHostname of clusterPatterns) {
          const constructedUri = `mongodb+srv://${serviceAccountId.replace('mdb_sa_id_', '')}:${serviceAccountKey.replace('mdb_sa_sk_', '')}@${clusterHostname}/${dbName}?retryWrites=true&w=majority`;
          
          console.log(`🔍 Testing constructed URI with cluster: ${clusterHostname}`);
          
          // Test this constructed connection
          const testResult = await this.testConnection(constructedUri);
          if (testResult.success) {
            console.log('✅ Successfully constructed working Atlas connection!');
            return constructedUri;
          }
        }
      }
      
      // Try alternative Atlas patterns with different TLD
      const alternativePatterns = [
        'didc-cluster.mongodb.net',
        'hrai-crms.mongodb.net',
        'api-for-warp-drive.mongodb.net',
        'asoos.mongodb.net'
      ];
      
      if (serviceAccountId && serviceAccountKey) {
        for (const pattern of alternativePatterns) {
          const constructedUri = `mongodb+srv://${serviceAccountId.replace('mdb_sa_id_', '')}:${serviceAccountKey.replace('mdb_sa_sk_', '')}@${pattern}/${dbName}?retryWrites=true&w=majority`;
          
          const testResult = await this.testConnection(constructedUri);
          if (testResult.success) {
            console.log('✅ Successfully constructed working Atlas connection with alternative pattern!');
            return constructedUri;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log('⚠️  Error constructing from environment:', error.message);
      return null;
    }
  }

  /**
   * Store a working connection string back to secrets
   */
  async storeWorkingConnectionString(connectionString) {
    try {
      const secretName = `projects/${this.project}/secrets/MONGODB_ATLAS_URI_WORKING`;
      
      await this.secretManager.addSecretVersion({
        parent: secretName,
        payload: {
          data: Buffer.from(connectionString),
        },
      });
      
      console.log('💾 Stored working connection string to MONGODB_ATLAS_URI_WORKING');
    } catch (error) {
      console.log('⚠️  Could not store working connection string:', error.message);
    }
  }

  /**
   * Update primary secret with working connection string
   */
  async updatePrimarySecret(connectionString) {
    try {
      const secretName = `projects/${this.project}/secrets/MONGODB_ATLAS_URI`;
      
      // Only update if it's different from current
      const currentSecret = await this.getSecretValue('MONGODB_ATLAS_URI');
      if (currentSecret === connectionString) {
        return;
      }
      
      await this.secretManager.addSecretVersion({
        parent: secretName,
        payload: {
          data: Buffer.from(connectionString),
        },
      });
      
      console.log('💾 Updated primary MongoDB secret with working connection');
    } catch (error) {
      console.log('⚠️  Could not update primary secret:', error.message);
    }
  }

  /**
   * Get secret value from Secret Manager
   */
  async getSecretValue(secretName) {
    try {
      const name = `projects/${this.project}/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({ name });
      return version.payload.data.toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract database name from connection string
   */
  extractDatabaseName(connectionString) {
    try {
      const matches = connectionString.match(/\/([^/?]+)(?:\?|$)/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Mask connection string for logging
   */
  maskConnectionString(connectionString) {
    return connectionString.replace(/:\/\/[^@]+@/, '://***:***@');
  }

  /**
   * Get database instance
   */
  getDatabase(dbName = 'aixtiv_symphony') {
    if (!this.client) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }
    return this.client.db(dbName);
  }

  /**
   * Test the current connection
   */
  async ping() {
    if (!this.client) {
      return false;
    }
    
    try {
      await this.client.db().admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

module.exports = SelfHealingMongoDBConnector;