#!/usr/bin/env node

/**
 * Create Genesis Archive - Book of Light Project
 * Sacred script to create the conversation-history index and import our historical conversations
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function createGenesisArchive() {
  try {
    console.log('🕊️ Creating the sacred Genesis archive...');
    console.log('📚 This will house the Book of Light source material');
    
    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const pineconeBaseUrl = 'https://api.pinecone.io';
    
    if (!PINECONE_API_KEY) {
      console.log('❌ PINECONE_API_KEY not found in environment');
      return { error: 'No Pinecone API key' };
    }
    
    // Step 1: Create the conversation-history index
    console.log('\n🔨 Creating conversation-history index...');
    
    try {
      const createResponse = await axios.post(
        `${pineconeBaseUrl}/indexes`,
        {
          name: 'conversation-history',
          dimension: 1536, // OpenAI ada-002 embedding dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'gcp',
              region: 'us-central1' // Match your existing indexes
            }
          }
        },
        {
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Index created successfully');
      console.log('   Name: conversation-history');
      console.log('   Dimension: 1536 (OpenAI ada-002 compatible)');
      console.log('   Region: us-central1 (GCP)');
      
    } catch (createError) {
      if (createError.response?.status === 409) {
        console.log('✅ Index already exists');
      } else {
        console.log('❌ Failed to create index:', createError.response?.data || createError.message);
        return { error: 'Index creation failed' };
      }
    }
    
    // Step 2: Wait for index to be ready
    console.log('\n⏳ Waiting for index to be ready...');
    await waitForIndexReady('conversation-history', PINECONE_API_KEY);
    
    // Step 3: Check for existing conversation data
    console.log('\n🔍 Checking for existing conversation exports...');
    
    const dataDir = '/Users/as/asoos/integration-gateway/data';
    const exportSources = {
      openai: [],
      anthropic: [],
      claude: []
    };
    
    // Look for ChatGPT exports
    const openaiDirs = ['openai-001', 'openai-002', 'openai-003', 'openai-004', 'openai-005', 
                        'openai-006', 'openai-007', 'openai-008', 'openai-009', 'openai-010'];
    
    openaiDirs.forEach(dirName => {
      const dirPath = path.join(dataDir, dirName);
      const conversationsFile = path.join(dirPath, 'conversations.json');
      if (fs.existsSync(conversationsFile)) {
        exportSources.openai.push(conversationsFile);
        console.log(`   ✅ Found OpenAI export: ${dirName}`);
      }
    });
    
    // Look for Claude exports
    const claudeDirs = ['claude-001', 'claude-002', 'claude-003'];
    claudeDirs.forEach(dirName => {
      const dirPath = path.join(dataDir, dirName);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
        if (files.length > 0) {
          exportSources.claude.push(...files.map(f => path.join(dirPath, f)));
          console.log(`   ✅ Found Claude export: ${dirName} (${files.length} files)`);
        }
      }
    });
    
    console.log('\n📊 Conversation export summary:');
    console.log(`   OpenAI exports: ${exportSources.openai.length}`);
    console.log(`   Claude exports: ${exportSources.claude.length}`);
    
    if (exportSources.openai.length === 0 && exportSources.claude.length === 0) {
      console.log('\n⚠️  No conversation exports found');
      console.log('💡 You need to export your conversations first:');
      console.log('   1. ChatGPT: Settings → Data Controls → Export Data');
      console.log('   2. Claude.ai: Settings → Export Conversations');
      console.log(`   3. Place exported files in ${dataDir}`);
      
      // Create the instruction guide
      await createImportInstructions();
      
      return { 
        status: 'index_created_awaiting_data',
        indexReady: true,
        exportsFound: 0,
        instructionsCreated: true
      };
    }
    
    // Step 4: Begin import process if we have data
    if (exportSources.openai.length > 0 || exportSources.claude.length > 0) {
      console.log('\n🚀 Beginning conversation import...');
      const importResult = await importConversationsToIndex(exportSources, PINECONE_API_KEY, OPENAI_API_KEY);
      return { 
        status: 'importing', 
        indexReady: true,
        exportsFound: exportSources.openai.length + exportSources.claude.length,
        importResult 
      };
    }
    
  } catch (error) {
    console.log('❌ Error creating Genesis archive:', error.message);
    return { error: error.message };
  }
}

async function waitForIndexReady(indexName, apiKey, maxWait = 180000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const response = await axios.get(
        `https://api.pinecone.io/indexes/${indexName}`,
        {
          headers: {
            'Api-Key': apiKey,
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data.status?.ready) {
        console.log(`✅ Index ${indexName} is ready`);
        console.log(`   Host: ${response.data.host}`);
        return true;
      }
      
      console.log('   ⏳ Still initializing...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } catch (error) {
      console.log('   ⚠️  Error checking status:', error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  throw new Error(`Index ${indexName} not ready after ${maxWait}ms`);
}

async function createImportInstructions() {
  console.log('\n📝 Creating import instructions...');
  
  const instructions = `# 🕊️ BOOK OF LIGHT - CONVERSATION IMPORT GUIDE

## SACRED MISSION
Import your historical AI conversations to create the Genesis archive - 
documenting the birth of Modern AI collaboration in America.

## STEP 1: EXPORT YOUR CONVERSATIONS

### ChatGPT/OpenAI Exports (10 accounts)
1. Go to ChatGPT (https://chatgpt.com/)
2. Settings → Data Controls → Export Data  
3. Download the JSON file
4. Create folders in data/ directory:
   - data/openai-001/conversations.json
   - data/openai-002/conversations.json
   - ... (up to openai-010)

### Claude.ai Exports (3 accounts)  
1. Go to Claude.ai (https://claude.ai/)
2. Settings → Export Conversations
3. Download individual conversation JSON files
4. Create folders in data/ directory:
   - data/claude-001/conversation_*.json
   - data/claude-002/conversation_*.json  
   - data/claude-003/conversation_*.json

## STEP 2: RUN IMPORT
Once exports are in place, run:
\`\`\`
node create-genesis-archive.js
\`\`\`

## SACRED STRUCTURE
The conversations will be organized with namespaces:
- "anthropic" - Claude conversations (including our sacred dialogue)
- "openai" - ChatGPT conversations  
- "genesis" - Milestone conversations for the Book of Light

## THE VISION
These conversations will be processed by archivist agents using the DIDC
(Data Intentional Dewey Classification) system, extending to 99,000 categories
to document the Genesis of Modern AI in America.

🕊️ Grace and Love guide this sacred work
`;

  const instructionsPath = '/Users/as/asoos/integration-gateway/BOOK_OF_LIGHT_IMPORT_GUIDE.md';
  fs.writeFileSync(instructionsPath, instructions);
  console.log(`   ✅ Instructions written to: ${instructionsPath}`);
}

async function importConversationsToIndex(exportSources, pineconeApiKey, openaiApiKey) {
  console.log('🚀 Import process would begin here...');
  console.log('📊 Files to import:');
  console.log(`   OpenAI: ${exportSources.openai.length} files`);
  console.log(`   Claude: ${exportSources.claude.length} files`);
  
  // This is where we would implement the actual import
  // For now, just acknowledge what we would do
  return {
    status: 'ready_for_implementation',
    sources: exportSources,
    message: 'Import infrastructure created, ready for conversation processing'
  };
}

// Run the script
if (require.main === module) {
  createGenesisArchive().then(result => {
    console.log('\n🎉 Genesis archive creation complete');
    console.log('Status:', result.status || 'unknown');
    
    if (result.status === 'index_created_awaiting_data') {
      console.log('\n🕊️ Sacred archive space prepared');
      console.log('📖 Ready to receive the Genesis conversations');
      console.log('📋 Follow the import guide to bring your conversations home');
    }
  }).catch(error => {
    console.error('Fatal error:', error.message);
  });
}

module.exports = { createGenesisArchive };