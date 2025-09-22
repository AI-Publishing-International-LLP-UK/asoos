/**
 * HRAI-CRMS Connector
 * Human Resources AI - Customer Relationship Management System
 * 20 Million Agents + Pinecone Vector DB + Firestore Integration
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Firestore } = require('@google-cloud/firestore');
const { PineconeClient } = require('pinecone-client');
const axios = require('axios');

class HRAICRMSConnector {
  constructor() {
    this.secretClient = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'api-for-warp-drive';
    this.firestore = new Firestore({ projectId: this.projectId });
    this.pinecone = null;
    this.credentials = null;

    // HRAI-CRMS Configuration
    this.collections = {
      agents: 'hrai_agents',
      organizations: 'hrai_organizations',
      interactions: 'hrai_interactions',
      analytics: 'hrai_analytics',
      hr_classifications: 'hrai_hr_classifications',
    };

    // HR Classification System
    this.hrClassifications = {
      '.hr1': 'LLP members working as full-time contractors',
      '.hr2': 'LLP members working as employees',
      '.hr3': 'Non-members working as employees or contractors',
      '.hr4': 'LLP members not working for the LLP',
    };

    // Agent Capacity Configuration
    this.agentCapacity = {
      total_agents: 20000000,
      active_agents: 0,
      sectors: 200,
      job_clusters: 64000000,
      career_clusters: 319998,
      regions: ['us-west1', 'us-central1', 'eu-west1'],
    };

    console.log('👥 HRAI-CRMS Connector initialized');
    console.log(`🎯 Total Agent Capacity: ${this.agentCapacity.total_agents.toLocaleString()}`);
  }

  /**
   * Initialize HRAI-CRMS with Pinecone and Firestore
   */
  async initialize() {
    try {
      console.log('🔧 Initializing HRAI-CRMS system...');

      // Load credentials
      await this.loadCredentials();

      // Initialize Pinecone vector database
      await this.initializePinecone();

      // Initialize Firestore collections
      await this.initializeFirestore();

      // Load current agent statistics
      await this.loadAgentStatistics();

      console.log('✅ HRAI-CRMS fully initialized');
      return true;
    } catch (error) {
      console.error('❌ HRAI-CRMS initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load HRAI-CRMS credentials from Secret Manager
   */
  async loadCredentials() {
    try {
      const [version] = await this.secretClient.accessSecretVersion({
        name: `projects/${this.projectId}/secrets/hrai-crms-credentials/versions/latest`,
      });

      const credentialsData = version.payload.data.toString();
      this.credentials = JSON.parse(credentialsData);

      console.log('🔐 HRAI-CRMS credentials loaded');
    } catch (error) {
      console.warn('⚠️ HRAI-CRMS credentials not found, using environment variables');
      this.credentials = {
        pineconeApiKey: process.env.PINECONE_API_KEY,
        pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp',
        firestoreKeyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      };
    }
  }

  /**
   * Initialize Pinecone vector database for agent intelligence
   */
  async initializePinecone() {
    try {
      console.log('🧠 Initializing Pinecone vector database...');

      this.pinecone = new PineconeClient({
        apiKey: this.credentials.pineconeApiKey,
        environment: this.credentials.pineconeEnvironment,
      });

      // Ensure HRAI index exists
      const indexName = 'hrai-agents-index';
      try {
        await this.pinecone.describeIndex({ indexName });
        console.log(`✅ Pinecone index '${indexName}' connected`);
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log(`🔧 Creating Pinecone index '${indexName}'...`);
          await this.pinecone.createIndex({
            indexName,
            dimension: 1536, // OpenAI embedding dimension
            metric: 'cosine',
          });
          console.log(`✅ Pinecone index '${indexName}' created`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Pinecone initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Firestore collections for HRAI-CRMS
   */
  async initializeFirestore() {
    try {
      console.log('🔥 Initializing Firestore collections...');

      // Create collection references
      this.agentsCollection = this.firestore.collection(this.collections.agents);
      this.organizationsCollection = this.firestore.collection(this.collections.organizations);
      this.interactionsCollection = this.firestore.collection(this.collections.interactions);
      this.analyticsCollection = this.firestore.collection(this.collections.analytics);
      this.hrCollection = this.firestore.collection(this.collections.hr_classifications);

      // Ensure indexes exist (create sample documents to initialize)
      await this.ensureFirestoreIndexes();

      console.log('✅ Firestore collections initialized');
    } catch (error) {
      console.error('❌ Firestore initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ensure Firestore indexes are created
   */
  async ensureFirestoreIndexes() {
    try {
      // Create sample agent document to ensure collection exists
      const sampleAgent = {
        id: 'sample_agent_000000001',
        name: 'Sample HRAI Agent',
        type: 'initialization_sample',
        created_at: new Date(),
        hr_classification: '.hr3',
        status: 'sample',
        region: 'us-west1',
        capabilities: ['natural_language', 'data_analysis', 'customer_service'],
      };

      await this.agentsCollection.doc('sample_agent_000000001').set(sampleAgent, { merge: true });

      // Create HR classification reference documents
      for (const [classification, description] of Object.entries(this.hrClassifications)) {
        await this.hrCollection.doc(classification.substring(1)).set(
          {
            classification,
            description,
            updated_at: new Date(),
          },
          { merge: true }
        );
      }

      console.log('📋 Firestore indexes ensured');
    } catch (error) {
      console.warn('⚠️ Firestore index creation warning:', error.message);
    }
  }

  /**
   * Load current agent statistics
   */
  async loadAgentStatistics() {
    try {
      console.log('📊 Loading agent statistics...');

      // Get agent counts from Firestore
      const agentsSnapshot = await this.agentsCollection.where('status', '!=', 'sample').get();

      this.agentCapacity.active_agents = agentsSnapshot.size;

      // Load by region
      const regionCounts = {};
      for (const region of this.agentCapacity.regions) {
        const regionSnapshot = await this.agentsCollection
          .where('region', '==', region)
          .where('status', '!=', 'sample')
          .get();
        regionCounts[region] = regionSnapshot.size;
      }

      console.log(`📈 Active Agents: ${this.agentCapacity.active_agents.toLocaleString()}`);
      console.log('🌍 Regional Distribution:', regionCounts);
    } catch (error) {
      console.warn('⚠️ Agent statistics loading failed:', error.message);
      this.agentCapacity.active_agents = 0;
    }
  }

  /**
   * Register new agent in HRAI-CRMS
   */
  async registerAgent(agentData) {
    try {
      console.log(`👤 Registering agent: ${agentData.name}...`);

      const agent = {
        ...agentData,
        id: agentData.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'active',
        hr_classification: agentData.hr_classification || '.hr3',
        region: agentData.region || 'us-west1',
        version: '1.0.0',
      };

      // Store in Firestore
      await this.agentsCollection.doc(agent.id).set(agent);

      // Create vector embedding for Pinecone
      if (agent.description || agent.capabilities) {
        await this.createAgentEmbedding(agent);
      }

      // Update statistics
      this.agentCapacity.active_agents++;

      console.log(`✅ Agent ${agent.name} registered successfully`);
      return agent;
    } catch (error) {
      console.error(`❌ Agent registration failed for ${agentData.name}:`, error);
      throw error;
    }
  }

  /**
   * Create vector embedding for agent in Pinecone
   */
  async createAgentEmbedding(agent) {
    try {
      const embeddingText = [
        agent.name,
        agent.description || '',
        agent.capabilities ? agent.capabilities.join(' ') : '',
        agent.specialization || '',
      ].join(' ');

      // Create embedding using OpenAI (you'll need to implement this)
      const embedding = await this.createEmbedding(embeddingText);

      // Store in Pinecone
      const indexName = 'hrai-agents-index';
      await this.pinecone.upsert({
        indexName,
        vectors: [
          {
            id: agent.id,
            values: embedding,
            metadata: {
              name: agent.name,
              hr_classification: agent.hr_classification,
              region: agent.region,
              capabilities: agent.capabilities || [],
            },
          },
        ],
      });

      console.log(`🧠 Vector embedding created for ${agent.name}`);
    } catch (error) {
      console.warn(`⚠️ Embedding creation failed for ${agent.name}:`, error.message);
    }
  }

  /**
   * Search agents using vector similarity
   */
  async searchAgents(query, limit = 10) {
    try {
      console.log(`🔍 Searching agents for: "${query}"`);

      // Create query embedding
      const queryEmbedding = await this.createEmbedding(query);

      // Search in Pinecone
      const searchResults = await this.pinecone.query({
        indexName: 'hrai-agents-index',
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
      });

      // Enrich with Firestore data
      const agents = [];
      for (const match of searchResults.matches) {
        const agentDoc = await this.agentsCollection.doc(match.id).get();
        if (agentDoc.exists) {
          agents.push({
            ...agentDoc.data(),
            similarity_score: match.score,
          });
        }
      }

      console.log(`✅ Found ${agents.length} matching agents`);
      return agents;
    } catch (error) {
      console.error(`❌ Agent search failed for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get agents by HR classification
   */
  async getAgentsByHRClassification(classification) {
    try {
      console.log(`🏢 Getting agents with classification: ${classification}`);

      const snapshot = await this.agentsCollection
        .where('hr_classification', '==', classification)
        .where('status', '==', 'active')
        .get();

      const agents = [];
      snapshot.forEach((doc) => {
        agents.push(doc.data());
      });

      console.log(`✅ Found ${agents.length} agents with ${classification} classification`);
      return agents;
    } catch (error) {
      console.error(`❌ HR classification query failed for ${classification}:`, error);
      throw error;
    }
  }

  /**
   * Create text embedding (placeholder - implement with OpenAI)
   */
  async createEmbedding(text) {
    // This is a placeholder - you'll need to implement actual OpenAI API call
    // For now, return a random embedding for testing
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  /**
   * Get HRAI-CRMS system status
   */
  getSystemStatus() {
    return {
      name: 'HRAI-CRMS',
      status: 'operational',
      agent_capacity: this.agentCapacity,
      collections: this.collections,
      hr_classifications: this.hrClassifications,
      integrations: {
        firestore: 'connected',
        pinecone: this.pinecone ? 'connected' : 'disconnected',
        secret_manager: 'connected',
      },
    };
  }
}

module.exports = HRAICRMSConnector;
