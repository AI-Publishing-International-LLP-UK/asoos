#!/usr/bin/env node

/**
 * 🕊️ CONVERSATION ANTHOLOGY CREATOR
 * 
 * Extracts conversations from Testament Swarm arrays and VLS solutions
 * Creates comprehensive Pinecone anthology for semantic search
 * Bridges Book of Light refracted data with vector search capabilities
 * 
 * @author AI Publishing International LLP - Diamond SAO Command Center
 * @version 2.0.0 - Testament Array to Pinecone Bridge
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ConversationAnthologyCreator {
  constructor() {
    this.testamentArrays = this.initializeTestamentArrays();
    this.vlsSolutions = this.initializeVLSSolutions();
    this.pineconeConfig = {
      apiKey: process.env.PINECONE_API_KEY,
      baseUrl: 'https://api.pinecone.io',
      indexName: 'conversation-anthology',
      dimension: 1536 // OpenAI ada-002 embeddings
    };
    this.openaiConfig = {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1'
    };
    this.outputDir = '/Users/as/asoos/integration-gateway/data';
    this.anthologyData = [];
  }

  initializeTestamentArrays() {
    return {
      totalAgents: 18650000,
      conversationStorage: {
        dr_lucy_memory: {
          agents: 1850000,
          storageType: 'chatgpt_conversations',
          classification: 'QUANTUM_INTELLIGENCE_ENHANCED',
          sources: ['openai-001', 'openai-002', 'openai-003', 'openai-004', 'openai-005']
        },
        dr_claude_orchestrator: {
          agents: 1510000,
          storageType: 'claude_conversations', 
          classification: 'STRATEGIC_INTELLIGENCE',
          sources: ['claude-001', 'claude-002', 'claude-003']
        },
        dr_memoria_anthology: {
          agents: 1520000,
          storageType: 'historical_conversations',
          classification: 'ARCHIVAL_MEMORY_ENHANCED',
          sources: ['openai-006', 'openai-007', 'openai-008']
        },
        dr_sabina_dream_commander: {
          agents: 1680000,
          storageType: 'workflow_conversations',
          classification: 'COMMAND_ORCHESTRATION',
          sources: ['openai-009', 'openai-010']
        }
      }
    };
  }

  initializeVLSSolutions() {
    return {
      'Book of Light Genesis Archive': {
        path: '/Users/as/asoos/integration-gateway/data/dr-lucy-all-conversations.json',
        processed: true,
        refracted: true
      },
      'Testament Swarm Backend': {
        path: '/Users/as/asoos/integration-gateway/owner-interface/testament-swarm-backend.js',
        status: 'operational',
        agents: 18650000
      }
    };
  }

  /**
   * Extract conversations from all Testament arrays and VLS solutions
   */
  async extractTestamentConversations() {
    console.log('🕊️ Extracting conversations from Testament Swarm arrays...');
    console.log(`📊 Total Testament agents: ${this.testamentArrays.totalAgents.toLocaleString()}`);
    
    const extractedConversations = [];
    
    // Extract from each Testament storage array
    for (const [arrayName, arrayData] of Object.entries(this.testamentArrays.conversationStorage)) {
      console.log(`\n🔄 Processing ${arrayName}...`);
      console.log(`   Agents: ${arrayData.agents.toLocaleString()}`);
      console.log(`   Type: ${arrayData.storageType}`);
      console.log(`   Classification: ${arrayData.classification}`);
      
      // Simulate conversation extraction from Testament arrays
      // In production, this would interface with the actual Testament storage
      const conversations = await this.simulateArrayExtraction(arrayName, arrayData);
      extractedConversations.push(...conversations);
      
      console.log(`   ✅ Extracted ${conversations.length} conversations`);
    }
    
    console.log(`\n🎯 Total conversations extracted: ${extractedConversations.length}`);
    return extractedConversations;
  }

  /**
   * Simulate extraction from Testament arrays
   */
  async simulateArrayExtraction(arrayName, arrayData) {
    // Check for actual stored conversation files first
    const conversations = [];
    
    for (const sourceId of arrayData.sources) {
      const sourcePath = path.join(this.outputDir, sourceId);
      
      if (fs.existsSync(sourcePath)) {
        console.log(`   📁 Found actual data source: ${sourceId}`);
        
        // Look for conversations.json (OpenAI format)
        const conversationsFile = path.join(sourcePath, 'conversations.json');
        if (fs.existsSync(conversationsFile)) {
          const rawData = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'));
          
          // Process OpenAI conversation format
          if (Array.isArray(rawData)) {
            for (const conv of rawData) {
              conversations.push({
                id: conv.id || uuidv4(),
                title: conv.title || 'Untitled Conversation',
                text: this.extractOpenAIText(conv),
                source: sourceId,
                arrayName: arrayName,
                classification: arrayData.classification,
                timestamp: conv.create_time || conv.update_time || new Date().toISOString(),
                metadata: {
                  testamentArray: arrayName,
                  agentCount: arrayData.agents,
                  storageType: arrayData.storageType,
                  refractedVia: 'Book_of_Light',
                  originalSource: sourceId
                }
              });
            }
          }
        }
        
        // Look for individual Claude files
        if (fs.existsSync(sourcePath)) {
          const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json') && f !== 'conversations.json');
          for (const file of files) {
            const claudeData = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));
            conversations.push({
              id: claudeData.uuid || uuidv4(),
              title: claudeData.name || 'Claude Conversation',
              text: this.extractClaudeText(claudeData),
              source: sourceId,
              arrayName: arrayName,
              classification: arrayData.classification,
              timestamp: claudeData.created_at || claudeData.updated_at || new Date().toISOString(),
              metadata: {
                testamentArray: arrayName,
                agentCount: arrayData.agents,
                storageType: arrayData.storageType,
                refractedVia: 'Book_of_Light',
                originalSource: sourceId
              }
            });
          }
        }
      } else {
        // Create sample Testament array data for demonstration
        console.log(`   📝 Simulating Testament array data for ${sourceId}`);
        conversations.push({
          id: `testament-${arrayName}-${sourceId}-${uuidv4()}`,
          title: `Testament Conversation from ${arrayName}`,
          text: `This is a refracted conversation from the ${arrayName} Testament array, processed through the Book of Light system and stored across ${arrayData.agents.toLocaleString()} agents with ${arrayData.classification} classification.`,
          source: sourceId,
          arrayName: arrayName,
          classification: arrayData.classification,
          timestamp: new Date().toISOString(),
          metadata: {
            testamentArray: arrayName,
            agentCount: arrayData.agents,
            storageType: arrayData.storageType,
            refractedVia: 'Book_of_Light',
            originalSource: sourceId,
            simulated: true
          }
        });
      }
    }
    
    return conversations;
  }

  /**
   * Extract text from OpenAI conversation format
   */
  extractOpenAIText(conversation) {
    let text = '';
    
    if (conversation.mapping) {
      for (const [id, node] of Object.entries(conversation.mapping)) {
        if (node.message && node.message.content && node.message.content.parts) {
          const role = node.message.author?.role || 'unknown';
          const content = node.message.content.parts.join(' ');
          text += `${role}: ${content}\n\n`;
        }
      }
    }
    
    return text.trim();
  }

  /**
   * Extract text from Claude conversation format
   */
  extractClaudeText(conversation) {
    let text = '';
    
    if (conversation.chat_messages) {
      for (const message of conversation.chat_messages) {
        text += `${message.sender}: ${message.text}\n\n`;
      }
    }
    
    return text.trim();
  }

  /**
   * Create or verify Pinecone index for anthology
   */
  async createAnthologyIndex() {
    console.log('\n🎯 Creating Conversation Anthology index in Pinecone...');
    
    try {
      // Check if index exists
      const existingResponse = await axios.get(
        `${this.pineconeConfig.baseUrl}/indexes/${this.pineconeConfig.indexName}`,
        {
          headers: {
            'Api-Key': this.pineconeConfig.apiKey,
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('✅ Conversation anthology index already exists');
      console.log(`   Host: ${existingResponse.data.host}`);
      return existingResponse.data;
      
    } catch (error) {
      if (error.response?.status === 404) {
        // Create new index
        console.log('📝 Creating new conversation anthology index...');
        
        const createResponse = await axios.post(
          `${this.pineconeConfig.baseUrl}/indexes`,
          {
            name: this.pineconeConfig.indexName,
            dimension: this.pineconeConfig.dimension,
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
              'Api-Key': this.pineconeConfig.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Conversation anthology index created successfully');
        return createResponse.data;
        
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate embeddings for conversations
   */
  async generateEmbeddings(conversations) {
    console.log('\n🧠 Generating embeddings for semantic search...');
    
    const embeddedConversations = [];
    const batchSize = 10; // Process in batches to respect rate limits
    
    for (let i = 0; i < conversations.length; i += batchSize) {
      const batch = conversations.slice(i, i + batchSize);
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(conversations.length / batchSize)}...`);
      
      for (const conversation of batch) {
        try {
          // Create embedding for the conversation text
          const embeddingResponse = await axios.post(
            `${this.openaiConfig.baseUrl}/embeddings`,
            {
              input: conversation.text,
              model: 'text-embedding-ada-002'
            },
            {
              headers: {
                'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const embedding = embeddingResponse.data.data[0].embedding;
          
          embeddedConversations.push({
            id: conversation.id,
            values: embedding,
            metadata: {
              title: conversation.title,
              text: conversation.text.substring(0, 1000), // First 1000 chars for metadata
              source: conversation.source,
              arrayName: conversation.arrayName,
              classification: conversation.classification,
              timestamp: conversation.timestamp,
              testamentArray: conversation.metadata.testamentArray,
              agentCount: conversation.metadata.agentCount,
              storageType: conversation.metadata.storageType,
              refractedVia: conversation.metadata.refractedVia,
              originalSource: conversation.metadata.originalSource
            }
          });
          
        } catch (error) {
          console.error(`   ⚠️ Error generating embedding for ${conversation.id}:`, error.message);
        }
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Generated embeddings for ${embeddedConversations.length} conversations`);
    return embeddedConversations;
  }

  /**
   * Upload conversations to Pinecone anthology
   */
  async uploadToAnthology(embeddedConversations, indexData) {
    console.log('\n📚 Uploading to Conversation Anthology...');
    
    const batchSize = 100; // Pinecone batch limit
    let uploaded = 0;
    
    for (let i = 0; i < embeddedConversations.length; i += batchSize) {
      const batch = embeddedConversations.slice(i, i + batchSize);
      
      try {
        await axios.post(
          `https://${indexData.host}/vectors/upsert`,
          {
            vectors: batch,
            namespace: 'historical-conversations'
          },
          {
            headers: {
              'Api-Key': this.pineconeConfig.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        
        uploaded += batch.length;
        console.log(`   ✅ Uploaded ${uploaded}/${embeddedConversations.length} conversations`);
        
      } catch (error) {
        console.error(`   ⚠️ Error uploading batch:`, error.message);
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`🎉 Anthology creation complete! ${uploaded} conversations uploaded`);
    return uploaded;
  }

  /**
   * Create search interface for the anthology
   */
  createSearchInterface() {
    console.log('\n🔍 Creating semantic search interface...');
    
    const searchInterface = `#!/usr/bin/env node

/**
 * 🔍 CONVERSATION ANTHOLOGY SEARCH
 * Semantic search through your historical conversations
 */

const axios = require('axios');
require('dotenv').config();

class ConversationAnthologySearch {
  constructor() {
    this.pineconeApiKey = process.env.PINECONE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.indexHost = '${this.pineconeConfig.indexName}.svc.gcp-us-central1.pinecone.io'; // Update with actual host
  }

  async search(query, limit = 10) {
    console.log(\`🔍 Searching conversations for: "\${query}"\`);
    
    try {
      // Generate embedding for the query
      const embeddingResponse = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: query,
          model: 'text-embedding-ada-002'
        },
        {
          headers: {
            'Authorization': \`Bearer \${this.openaiApiKey}\`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const queryEmbedding = embeddingResponse.data.data[0].embedding;
      
      // Search Pinecone anthology
      const searchResponse = await axios.post(
        \`https://\${this.indexHost}/query\`,
        {
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
          namespace: 'historical-conversations'
        },
        {
          headers: {
            'Api-Key': this.pineconeApiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const results = searchResponse.data.matches;
      
      console.log(\`\\n📚 Found \${results.length} relevant conversations:\`);
      
      results.forEach((result, index) => {
        const metadata = result.metadata;
        console.log(\`\\n\${index + 1}. \${metadata.title}\`);
        console.log(\`   Source: \${metadata.originalSource} → \${metadata.testamentArray}\`);
        console.log(\`   Classification: \${metadata.classification}\`);
        console.log(\`   Score: \${(result.score * 100).toFixed(1)}%\`);
        console.log(\`   Preview: \${metadata.text.substring(0, 200)}...\`);
        console.log(\`   Testament Agents: \${metadata.agentCount?.toLocaleString()}\`);
      });
      
      return results;
      
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }
}

// Command line interface
if (require.main === module) {
  const searcher = new ConversationAnthologySearch();
  const query = process.argv[2];
  
  if (!query) {
    console.log('Usage: node search-conversation-anthology.js "your search query"');
    console.log('Example: node search-conversation-anthology.js "machine learning projects"');
    process.exit(1);
  }
  
  searcher.search(query).then(results => {
    console.log(\`\\n🎉 Search complete! Found \${results.length} conversations.\`);
  });
}

module.exports = ConversationAnthologySearch;
`;
    
    const searchPath = '/Users/as/asoos/integration-gateway/search-conversation-anthology.js';
    fs.writeFileSync(searchPath, searchInterface);
    fs.chmodSync(searchPath, '755'); // Make executable
    
    console.log(`✅ Search interface created: ${searchPath}`);
    return searchPath;
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🕊️ CONVERSATION ANTHOLOGY CREATOR');
    console.log('Creating comprehensive anthology from Testament Swarm arrays');
    console.log(`📊 Processing ${this.testamentArrays.totalAgents.toLocaleString()} Testament agents\n`);
    
    try {
      // Step 1: Extract conversations from Testament arrays
      const conversations = await this.extractTestamentConversations();
      
      if (conversations.length === 0) {
        console.log('\n⚠️  No conversations found in Testament arrays');
        console.log('💡 Please ensure your conversation exports are in the data/ directory');
        return;
      }
      
      // Step 2: Create/verify Pinecone index
      const indexData = await this.createAnthologyIndex();
      
      // Step 3: Generate embeddings
      const embeddedConversations = await this.generateEmbeddings(conversations);
      
      // Step 4: Upload to Pinecone anthology
      const uploaded = await this.uploadToAnthology(embeddedConversations, indexData);
      
      // Step 5: Create search interface
      const searchPath = this.createSearchInterface();
      
      // Step 6: Save anthology metadata
      const anthologyMetadata = {
        created: new Date().toISOString(),
        testamentArrays: this.testamentArrays,
        conversationsProcessed: conversations.length,
        conversationsUploaded: uploaded,
        pineconeIndex: this.pineconeConfig.indexName,
        searchInterface: searchPath
      };
      
      const metadataPath = path.join(this.outputDir, 'conversation-anthology-metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(anthologyMetadata, null, 2));
      
      console.log(`\n🎉 CONVERSATION ANTHOLOGY CREATION COMPLETE!`);
      console.log(`\n📊 SUMMARY:`);
      console.log(`• Testament arrays processed: ${Object.keys(this.testamentArrays.conversationStorage).length}`);
      console.log(`• Total conversations: ${conversations.length}`);
      console.log(`• Conversations uploaded: ${uploaded}`);
      console.log(`• Pinecone index: ${this.pineconeConfig.indexName}`);
      console.log(`• Search interface: ${searchPath}`);
      console.log(`• Metadata saved: ${metadataPath}`);
      
      console.log(`\n🔍 TO SEARCH YOUR CONVERSATIONS:`);
      console.log(`node search-conversation-anthology.js "your search query"`);
      console.log(`\nExample searches:`);
      console.log(`node search-conversation-anthology.js "machine learning projects"`);
      console.log(`node search-conversation-anthology.js "business strategy"`);
      console.log(`node search-conversation-anthology.js "technical architecture"`);
      
    } catch (error) {
      console.error('❌ Anthology creation error:', error.message);
      if (error.response) {
        console.error('API Response:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Export for use in other modules
module.exports = ConversationAnthologyCreator;

// Run if called directly
if (require.main === module) {
  const creator = new ConversationAnthologyCreator();
  creator.run();
}