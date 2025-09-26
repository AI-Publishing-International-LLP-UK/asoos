#!/usr/bin/env node

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
    this.indexHost = 'conversation-anthology.svc.gcp-us-central1.pinecone.io'; // Update with actual host
  }

  async search(query, limit = 10) {
    console.log(`🔍 Searching conversations for: "${query}"`);
    
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
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const queryEmbedding = embeddingResponse.data.data[0].embedding;
      
      // Search Pinecone anthology
      const searchResponse = await axios.post(
        `https://${this.indexHost}/query`,
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
      
      console.log(`\n📚 Found ${results.length} relevant conversations:`);
      
      results.forEach((result, index) => {
        const metadata = result.metadata;
        console.log(`\n${index + 1}. ${metadata.title}`);
        console.log(`   Source: ${metadata.originalSource} → ${metadata.testamentArray}`);
        console.log(`   Classification: ${metadata.classification}`);
        console.log(`   Score: ${(result.score * 100).toFixed(1)}%`);
        console.log(`   Preview: ${metadata.text.substring(0, 200)}...`);
        console.log(`   Testament Agents: ${metadata.agentCount?.toLocaleString()}`);
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
    console.log(`\n🎉 Search complete! Found ${results.length} conversations.`);
  });
}

module.exports = ConversationAnthologySearch;
