#!/usr/bin/env node

/**
 * Access Genesis Archive - Book of Light Project
 * Sacred script to access our historical conversations from Pinecone
 */

const axios = require('axios');

async function accessGenesisArchive() {
  try {
    console.log('🕊️ Sacred key received - accessing the Genesis archive...');
    
    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
    const pineconeBaseUrl = 'https://api.pinecone.io';
    
    if (!PINECONE_API_KEY) {
      console.log('❌ PINECONE_API_KEY not found in environment');
      return { error: 'No API key' };
    }
    
    console.log('🔑 API Key authenticated: YES');
    console.log('📡 Connecting to Pinecone...');
    
    // First, list all indexes to see what exists
    const response = await axios.get(
      `${pineconeBaseUrl}/indexes`,
      {
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('\n📚 Available indexes in the sacred archive:');
    const indexes = response.data.indexes || [];
    
    if (indexes.length === 0) {
      console.log('   ⚠️  No indexes found - the archive may be empty');
      console.log('   💡 This means we need to trigger the import process');
      return { status: 'empty', needsImport: true };
    }
    
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}`);
      console.log(`      Dimension: ${index.dimension || 'unknown'}`);
      console.log(`      Status: ${index.status?.ready ? '✅ Ready' : '⏳ Loading'}`);
      console.log(`      Host: ${index.host || 'unknown'}`);
    });
    
    // Look for the conversation-history index specifically
    const conversationIndex = indexes.find(idx => 
      idx.name === 'conversation-history' || 
      idx.name.includes('conversation') ||
      idx.name.includes('history') ||
      idx.name.includes('genesis') ||
      idx.name.includes('claude') ||
      idx.name.includes('chat')
    );
    
    if (conversationIndex) {
      console.log(`\n🎯 Found conversation archive: ${conversationIndex.name}`);
      console.log(`   Host: ${conversationIndex.host}`);
      console.log(`   Dimension: ${conversationIndex.dimension}`);
      
      // Try to query this index for some sample data
      await sampleArchiveData(conversationIndex, PINECONE_API_KEY);
      
      return { status: 'found', indexName: conversationIndex.name, index: conversationIndex };
    } else {
      console.log('\n⚠️  No conversation-history index found');
      console.log('💡 Available indexes:');
      indexes.forEach(idx => console.log(`   - ${idx.name}`));
      console.log('\n🔧 We need to create the conversation archive and import our historical data');
      return { status: 'needs_creation', allIndexes: indexes };
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Pinecone API Error:', error.response.status);
      console.log('   Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Connection Error:', error.message);
    }
    return { error: error.message };
  }
}

async function sampleArchiveData(index, apiKey) {
  try {
    console.log('\n🔍 Sampling data from the archive...');
    
    // Try to get stats from the index
    const statsResponse = await axios.post(
      `https://${index.host}/describe_index_stats`,
      {},
      {
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const stats = statsResponse.data;
    console.log('📊 Archive Statistics:');
    console.log(`   Total vectors: ${stats.totalVectorCount || 0}`);
    console.log(`   Dimension: ${stats.dimension || 'unknown'}`);
    
    if (stats.namespaces) {
      console.log('   Namespaces:');
      Object.entries(stats.namespaces).forEach(([name, info]) => {
        console.log(`     • ${name}: ${info.vectorCount} vectors`);
      });
      
      // Check specifically for anthropic and openai namespaces
      const anthropicCount = stats.namespaces.anthropic?.vectorCount || 0;
      const openaiCount = stats.namespaces.openai?.vectorCount || 0;
      
      console.log(`\n🎯 Genesis conversations found:`);
      console.log(`   Claude/Anthropic: ${anthropicCount} conversations`);
      console.log(`   OpenAI/ChatGPT: ${openaiCount} conversations`);
      
      if (anthropicCount > 0 || openaiCount > 0) {
        console.log(`\n✨ The Book of Light source material is present!`);
        console.log(`   Total historical conversations: ${anthropicCount + openaiCount}`);
      }
    }
    
  } catch (error) {
    console.log('⚠️  Could not sample archive data:', error.message);
  }
}

// Run the script
if (require.main === module) {
  accessGenesisArchive().then(result => {
    console.log('\n🎉 Archive access complete');
    console.log('Status:', result.status || 'unknown');
    
    if (result.status === 'found') {
      console.log('\n🕊️ Sacred archive accessed successfully');
      console.log('📖 Ready for archivist categorization and Book of Light creation');
    } else if (result.status === 'needs_creation') {
      console.log('\n📋 Next steps:');
      console.log('1. Create conversation-history index');
      console.log('2. Import ChatGPT conversations (OpenAI export)');
      console.log('3. Import Claude conversations (Anthropic export)');
      console.log('4. Begin DIDC classification process');
    }
  }).catch(error => {
    console.error('Fatal error:', error.message);
  });
}

module.exports = { accessGenesisArchive, sampleArchiveData };