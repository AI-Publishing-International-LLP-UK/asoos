#!/usr/bin/env node

/**
 * Dr. Pinion Bulk File Ingestion
 * Drop 1000+ files and vectorize them automatically
 * Handles: .txt, .md, .json, .csv, ChatGPT exports, Claude exports
 */

const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config();

class BulkIngestion {
  constructor() {
    this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.index = this.pinecone.index('conversation-history');

    this.batchSize = 100; // Process 100 files at a time
    this.supportedExtensions = ['.txt', '.md', '.json', '.csv', '.html'];
  }

  /**
   * Main ingestion function - just point it at a directory!
   */
  async ingestDirectory(directoryPath) {
    console.log(`🌲 Dr. Pinion starting bulk ingestion from: ${directoryPath}`);

    const files = this.getAllFiles(directoryPath);
    console.log(`📁 Found ${files.length} files to process`);

    if (files.length === 0) {
      console.log('❌ No supported files found!');
      return;
    }

    // Process in batches to avoid overwhelming APIs
    const batches = this.chunkArray(files, this.batchSize);
    console.log(`🔄 Processing in ${batches.length} batches of ${this.batchSize} files each`);

    let totalProcessed = 0;
    let totalVectorized = 0;

    for (let i = 0; i < batches.length; i++) {
      console.log(`\n📦 Processing batch ${i + 1}/${batches.length}`);

      const results = await this.processBatch(batches[i], i + 1);
      totalProcessed += results.processed;
      totalVectorized += results.vectorized;

      // Brief pause between batches to avoid rate limits
      if (i < batches.length - 1) {
        console.log('⏱️ Pausing 2 seconds between batches...');
        await this.sleep(2000);
      }
    }

    console.log('\n🎉 INGESTION COMPLETE!');
    console.log(`📊 Files processed: ${totalProcessed}`);
    console.log(`🌲 Vectors created: ${totalVectorized}`);
    console.log('💡 Ready to search with Dr. Pinion!');
  }

  /**
   * Process a batch of files
   */
  async processBatch(files, batchNumber) {
    const vectors = [];
    let processed = 0;

    for (const file of files) {
      try {
        const content = this.extractContent(file);
        if (content && content.length > 50) {
          // Skip tiny files

          // Create embedding
          const embedding = await this.createEmbedding(content);

          // Prepare metadata
          const metadata = {
            filename: path.basename(file),
            filepath: file,
            source: this.detectSource(file, content),
            size: fs.statSync(file).size,
            ingested_at: new Date().toISOString(),
            batch: batchNumber,
            content: content.substring(0, 1000), // Store first 1KB for previews
          };

          vectors.push({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            values: embedding,
            metadata: metadata,
          });

          processed++;
          console.log(`✅ ${processed}/${files.length}: ${path.basename(file)}`);
        }
      } catch (error) {
        console.log(`❌ Error processing ${file}: ${error.message}`);
      }
    }

    // Upsert vectors to Pinecone
    if (vectors.length > 0) {
      await this.index.upsert(vectors);
      console.log(`🌲 Batch ${batchNumber}: Uploaded ${vectors.length} vectors to Pinecone`);
    }

    return { processed, vectorized: vectors.length };
  }

  /**
   * Get all supported files from directory (recursive)
   */
  getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);

      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (this.supportedExtensions.includes(ext)) {
          arrayOfFiles.push(fullPath);
        }
      }
    });

    return arrayOfFiles;
  }

  /**
   * Extract text content from various file types
   */
  extractContent(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf8');

    switch (ext) {
      case '.json':
        try {
          const json = JSON.parse(content);
          // Handle ChatGPT exports
          if (json.title && json.mapping) {
            return this.extractChatGPTContent(json);
          }
          // Handle Claude exports or other JSON
          return JSON.stringify(json, null, 2);
        } catch {
          return content; // Fallback to raw text
        }

      case '.csv':
        // Simple CSV parsing - convert to readable text
        return content.split('\n').slice(0, 100).join('\n'); // First 100 lines

      case '.html':
        // Strip HTML tags (basic)
        return content
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      default:
        return content;
    }
  }

  /**
   * Extract content from ChatGPT export format
   */
  extractChatGPTContent(chatgptExport) {
    let conversation = `Title: ${chatgptExport.title}\n\n`;

    if (chatgptExport.mapping) {
      Object.values(chatgptExport.mapping).forEach((node) => {
        if (node.message && node.message.content && node.message.content.parts) {
          const role = node.message.author?.role || 'unknown';
          const content = node.message.content.parts.join(' ');
          conversation += `${role}: ${content}\n\n`;
        }
      });
    }

    return conversation;
  }

  /**
   * Detect source type from filename/content
   */
  detectSource(filePath, content) {
    const filename = path.basename(filePath).toLowerCase();

    if (filename.includes('chatgpt') || filename.includes('gpt')) return 'chatgpt';
    if (filename.includes('claude')) return 'claude';
    if (filename.includes('conversation')) return 'conversation';
    if (content.includes('ChatGPT')) return 'chatgpt';
    if (content.includes('Claude')) return 'claude';

    return 'document';
  }

  /**
   * Create embedding using OpenAI
   */
  async createEmbedding(text) {
    // Truncate if too long (OpenAI limit is ~8000 tokens)
    const truncatedText = text.substring(0, 6000);

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: truncatedText,
    });

    return response.data[0].embedding;
  }

  /**
   * Utility functions
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI Usage
if (require.main === module) {
  const directoryPath = process.argv[2];

  if (!directoryPath) {
    console.log('Usage: node bulk-ingest.js /path/to/your/files');
    console.log('Example: node bulk-ingest.js /Users/as/Downloads/chatgpt-conversations');
    process.exit(1);
  }

  if (!fs.existsSync(directoryPath)) {
    console.log(`❌ Directory not found: ${directoryPath}`);
    process.exit(1);
  }

  const ingester = new BulkIngestion();
  ingester
    .ingestDirectory(directoryPath)
    .then(() => {
      console.log('🎉 All done! Your files are now searchable via Dr. Pinion.');
    })
    .catch((error) => {
      console.error('❌ Ingestion failed:', error);
      process.exit(1);
    });
}

module.exports = BulkIngestion;
