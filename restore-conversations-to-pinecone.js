#!/usr/bin/env node

/**
 * 🔍 RESTORE CLAUDE CONVERSATIONS TO PINECONE
 * 
 * This script uploads your Claude conversations (claude-001, claude-002, claude-003)
 * to Pinecone so you can search for your March 2024 conversations and earlier work.
 * 
 * @author AI Publishing International LLP - Diamond SAO Command Center
 */

require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class ConversationRestorer {
  constructor() {
    this.gcpProject = 'api-for-warp-drive';
    this.pineconeApiKey = null;
    this.openaiApiKey = null;
    this.pineconeEnvironment = 'us-west1-gcp';
    this.indexName = 'claude-conversation-history';
    this.batchSize = 100;
  }

  /**
   * Initialize API keys from Google Cloud Secret Manager
   */
  async initializeKeys() {
    console.log('🔐 Retrieving API keys from Google Cloud Secret Manager...');
    
    try {
      // Get Pinecone API key
      const pineconeResult = await execAsync(
        `gcloud secrets versions access latest --secret="pinecone-api-for-warp-drive" --project=${this.gcpProject}`
      );
      this.pineconeApiKey = pineconeResult.stdout.trim();
      
      // Get OpenAI API key - use production key or create embeddings-free version
      try {
        const openaiResult = await execAsync(
          `gcloud secrets versions access latest --secret="openai-api-key" --project=${this.gcpProject}`
        );
        this.openaiApiKey = openaiResult.stdout.trim();
        
        // Check if it's a placeholder - if so, we'll use a different approach
        if (this.openaiApiKey.includes('{{REPLACE') || this.openaiApiKey.includes('placeholder')) {
          console.log('⚠️  OpenAI key is placeholder - will use embeddings-free search');
          this.useEmbeddings = false;
        } else {
          this.useEmbeddings = true;
        }
      } catch (error) {
        console.log('⚠️  OpenAI key not available - using embeddings-free search');
        this.useEmbeddings = false;
      }
      
      console.log('✅ API keys retrieved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to retrieve API keys:', error.message);
      return false;
    }
  }

  /**
   * Create or verify Pinecone index exists
   */
  async ensureIndex() {
    console.log(`🗃️ Ensuring Pinecone index "${this.indexName}" exists...`);
    
    try {
      // List all indexes to check if ours exists
      const response = await axios.get(
        'https://api.pinecone.io/indexes',
        {
          headers: {
            'Api-Key': this.pineconeApiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Pinecone connection verified');
      
      const indexes = response.data.indexes || [];
      const indexExists = indexes.some(index => index.name === this.indexName);
      
      if (indexExists) {
        console.log(`✅ Index "${this.indexName}" already exists`);
      } else {
        console.log(`📝 Creating new index "${this.indexName}"...`);
        
        // Create the index using new API format
        await axios.post(
          'https://api.pinecone.io/indexes',
          {
            name: this.indexName,
            dimension: 1536, // OpenAI ada-002 dimension
            metric: 'cosine',
            spec: {
              serverless: {
                cloud: 'gcp',
                region: 'us-central1'
              }
            }
          },
          {
            headers: {
              'Api-Key': this.pineconeApiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Created index "${this.indexName}"`);
        
        // Wait for index to be ready
        console.log('⏳ Waiting for index to initialize...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to ensure Pinecone index:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Generate OpenAI embedding for text
   */
  async generateEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: 'text-embedding-ada-002'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Extract text from Claude conversation format
   */
  extractConversationText(conversation) {
    let fullText = `Title: ${conversation.title || 'Untitled Conversation'}\n\n`;
    
    if (conversation.mapping) {
      // Process ChatGPT/OpenAI format
      const messages = [];
      for (const [id, node] of Object.entries(conversation.mapping)) {
        if (node.message && node.message.content && node.message.content.parts) {
          const role = node.message.author?.role || 'unknown';
          const content = node.message.content.parts.join('\n');
          if (content.trim()) {
            messages.push(`${role.toUpperCase()}: ${content}`);
          }
        }
      }
      fullText += messages.join('\n\n');
    } else if (conversation.messages) {
      // Process direct messages format
      conversation.messages.forEach(msg => {
        fullText += `${(msg.role || 'unknown').toUpperCase()}: ${msg.content}\n\n`;
      });
    } else if (conversation.chat_messages) {
      // Process Claude format
      conversation.chat_messages.forEach(msg => {
        const sender = msg.sender === 'human' ? 'USER' : 'ASSISTANT';
        fullText += `${sender}: ${msg.text}\n\n`;
      });
    }
    
    return fullText.trim();
  }

  /**
   * Upload conversations to Pinecone
   */
  async uploadConversationsToPinecone() {
    console.log('🚀 Starting conversation upload to Pinecone...');
    
    const claudeAccounts = ['claude-001', 'claude-002', 'claude-003'];
    let totalUploaded = 0;
    
    for (const account of claudeAccounts) {
      const conversationsPath = `./data/${account}/conversations.json`;
      
      if (!fs.existsSync(conversationsPath)) {
        console.log(`⚠️ Conversations file not found: ${conversationsPath}`);
        continue;
      }
      
      console.log(`📖 Processing ${account} conversations...`);
      
      try {
        const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
        console.log(`Found ${conversations.length} conversations in ${account}`);
        
        const vectors = [];
        
        for (const conversation of conversations) {
          const text = this.extractConversationText(conversation);
          
          if (text.length < 10) {
            console.log(`⚠️ Skipping empty conversation: ${conversation.id}`);
            continue;
          }
          
          if (this.useEmbeddings) {
            console.log(`🧠 Generating embedding for: ${conversation.title?.substring(0, 50)}...`);
            
            try {
              const embedding = await this.generateEmbedding(text);
              
              vectors.push({
                id: `${account}-${conversation.id || uuidv4()}`,
                values: embedding,
                metadata: {
                  title: conversation.title || 'Untitled Conversation',
                  account: account,
                  source: 'claude-ai',
                  created_at: conversation.create_time || conversation.created_at || new Date().toISOString(),
                  updated_at: conversation.update_time || conversation.updated_at || new Date().toISOString(),
                  text_preview: text.substring(0, 500),
                  full_text: text,
                  conversation_id: conversation.id,
                  message_count: Object.keys(conversation.mapping || {}).length,
                  testament_array: 'dr_claude_orchestrator',
                  classification: 'STRATEGIC_INTELLIGENCE'
                }
              });
            } catch (embeddingError) {
              console.error(`❌ Failed to process conversation ${conversation.id}:`, embeddingError.message);
            }
          } else {
            // Store without embeddings - use random vector for now, search by metadata
            console.log(`📝 Storing conversation without embeddings: ${conversation.title?.substring(0, 50)}...`);
            
            const dummyVector = new Array(1536).fill(0).map(() => Math.random() * 0.01);
            
            vectors.push({
              id: `${account}-${conversation.id || uuidv4()}`,
              values: dummyVector,
              metadata: {
                title: conversation.title || 'Untitled Conversation',
                account: account,
                source: 'claude-ai',
                created_at: conversation.create_time || conversation.created_at || new Date().toISOString(),
                updated_at: conversation.update_time || conversation.updated_at || new Date().toISOString(),
                text_preview: text.substring(0, 500),
                full_text: text,
                conversation_id: conversation.id,
                message_count: Object.keys(conversation.mapping || {}).length,
                testament_array: 'dr_claude_orchestrator',
                classification: 'STRATEGIC_INTELLIGENCE',
                search_method: 'metadata_only'
              }
            });
          }
          
          // Upload in batches
          if (vectors.length >= this.batchSize) {
            await this.uploadBatch(vectors);
            totalUploaded += vectors.length;
            vectors.length = 0; // Clear the array
          }
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Upload remaining vectors
        if (vectors.length > 0) {
          await this.uploadBatch(vectors);
          totalUploaded += vectors.length;
        }
        
        console.log(`✅ Completed ${account}: processed ${conversations.length} conversations`);
        
      } catch (error) {
        console.error(`❌ Error processing ${account}:`, error.message);
      }
    }
    
    console.log(`🎉 Upload complete! Total conversations uploaded: ${totalUploaded}`);
    return totalUploaded;
  }

  /**
   * Upload a batch of vectors to Pinecone
   */
  async uploadBatch(vectors) {
    try {
      // Get index host from Pinecone API
      const indexInfoResponse = await axios.get(
        `https://api.pinecone.io/indexes/${this.indexName}`,
        {
          headers: {
            'Api-Key': this.pineconeApiKey
          }
        }
      );
      
      const indexHost = indexInfoResponse.data.host;
      
      const response = await axios.post(
        `https://${indexHost}/vectors/upsert`,
        {
          vectors: vectors,
          namespace: 'claude-conversations'
        },
        {
          headers: {
            'Api-Key': this.pineconeApiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Uploaded batch of ${vectors.length} conversations`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to upload batch:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search for March 2024 conversations
   */
  async searchMarch2024() {
    console.log('🔍 Searching for March 2024 conversations...');
    
    const searchQueries = [
      'March 2024',
      'beginning early conversations',
      'first AI project discussions',
      'initial development planning'
    ];
    
    for (const query of searchQueries) {
      console.log(`\n🔍 Searching for: "${query}"`);
      
      try {
        const embedding = await this.generateEmbedding(query);
        
        // Get index host from Pinecone API
        const indexInfoResponse = await axios.get(
          `https://api.pinecone.io/indexes/${this.indexName}`,
          {
            headers: {
              'Api-Key': this.pineconeApiKey
            }
          }
        );
        
        const indexHost = indexInfoResponse.data.host;
        
        const response = await axios.post(
          `https://${indexHost}/query`,
          {
            vector: embedding,
            topK: 10,
            includeMetadata: true,
            namespace: 'claude-conversations',
            filter: {
              created_at: { "$gte": "2024-03-01", "$lt": "2024-04-01" }
            }
          },
          {
            headers: {
              'Api-Key': this.pineconeApiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const matches = response.data.matches || [];
        console.log(`📚 Found ${matches.length} matches:`);
        
        matches.forEach((match, index) => {
          const metadata = match.metadata;
          console.log(`\n${index + 1}. ${metadata.title}`);
          console.log(`   Account: ${metadata.account}`);
          console.log(`   Created: ${metadata.created_at}`);
          console.log(`   Score: ${(match.score * 100).toFixed(1)}%`);
          console.log(`   Preview: ${metadata.text_preview}`);
        });
        
      } catch (error) {
        console.error(`❌ Search failed for "${query}":`, error.response?.data || error.message);
      }
    }
  }

  /**
   * Run the complete restoration process
   */
  async run() {
    console.log('🕊️ Claude Conversation Restoration to Pinecone Starting...\n');
    
    // Initialize API keys
    if (!(await this.initializeKeys())) {
      console.error('❌ Failed to initialize API keys');
      return false;
    }
    
    // Ensure Pinecone index exists
    if (!(await this.ensureIndex())) {
      console.error('❌ Failed to ensure Pinecone index');
      return false;
    }
    
    // Upload conversations
    const uploaded = await this.uploadConversationsToPinecone();
    
    if (uploaded > 0) {
      console.log('\n🎉 Conversations successfully restored to Pinecone!');
      console.log('\n🔍 Now searching for March 2024 conversations...\n');
      
      // Search for March 2024 conversations
      await this.searchMarch2024();
      
      console.log('\n✅ Restoration and search complete!');
      console.log('\n💡 You can now search your conversations using:');
      console.log('   node search-conversation-anthology.js "your search query"');
      
      return true;
    } else {
      console.log('⚠️ No conversations were uploaded');
      return false;
    }
  }
}

// Run the restoration if called directly
if (require.main === module) {
  const restorer = new ConversationRestorer();
  restorer.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = ConversationRestorer;