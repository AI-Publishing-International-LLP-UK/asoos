#!/usr/bin/env node
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class ConversationMetadataSearcher {
    constructor() {
        this.secretManager = new SecretManagerServiceClient();
        this.pinecone = null;
        this.index = null;
        this.indexName = 'claude-conversation-history';
    }

    async getSecret(secretName) {
        try {
            console.log(`🔐 Retrieving secret: ${secretName}`);
            const [version] = await this.secretManager.accessSecretVersion({
                name: `projects/api-for-warp-drive/secrets/${secretName}/versions/latest`
            });
            return version.payload.data.toString('utf8');
        } catch (error) {
            console.error(`❌ Failed to retrieve secret ${secretName}:`, error.message);
            throw error;
        }
    }

    async initialize() {
        console.log('🚀 Initializing Pinecone connection for metadata search...\n');
        
        const pineconeApiKey = await this.getSecret('pinecone-api-for-warp-drive');
        
        this.pinecone = new Pinecone({
            apiKey: pineconeApiKey
        });

        this.index = this.pinecone.index(this.indexName).namespace('claude-conversations');
        console.log('✅ Pinecone connection established\n');
    }

    async searchByMetadata(filters = {}, limit = 10) {
        try {
            console.log(`🔍 Searching with metadata filters:`, JSON.stringify(filters, null, 2));
            
            // Create a dummy vector for the query (required by Pinecone but not used)
            const dummyVector = new Array(1536).fill(0.1);
            
            const queryRequest = {
                vector: dummyVector,
                topK: limit,
                includeMetadata: true
            };

            // Only add filter if it has properties (Pinecone requirement)
            if (Object.keys(filters).length > 0) {
                queryRequest.filter = filters;
            }

            const queryResult = await this.index.query(queryRequest);
            
            console.log(`📊 Found ${queryResult.matches?.length || 0} matching conversations\n`);
            
            return queryResult.matches || [];
        } catch (error) {
            console.error('❌ Metadata search failed:', error);
            throw error;
        }
    }

    async searchByDateRange(startDate, endDate, limit = 10) {
        const filter = {
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };
        return await this.searchByMetadata(filter, limit);
    }

    async searchByKeyword(keyword, limit = 10) {
        // Search in title and content metadata
        const filter = {
            $or: [
                { title: { $regex: `.*${keyword}.*` } },
                { content: { $regex: `.*${keyword}.*` } }
            ]
        };
        return await this.searchByMetadata(filter, limit);
    }

    async listAllConversations(limit = 50) {
        console.log('📋 Listing all conversations...\n');
        return await this.searchByMetadata({}, limit);
    }

    displayResults(matches) {
        if (!matches || matches.length === 0) {
            console.log('❌ No conversations found');
            return;
        }

        console.log(`📝 Found ${matches.length} conversations:\n`);
        
        matches.forEach((match, index) => {
            const metadata = match.metadata;
            console.log(`${index + 1}. ${metadata.title || 'Untitled'}`);
            console.log(`   📅 Date: ${metadata.date || 'Unknown'}`);
            console.log(`   📁 Source: ${metadata.source || 'Unknown'}`);
            console.log(`   🔗 ID: ${match.id}`);
            
            if (metadata.summary) {
                console.log(`   📄 Summary: ${metadata.summary.substring(0, 200)}...`);
            }
            
            console.log('   ─────────────────────────────────────────────────────');
        });
    }

    async testConnection() {
        try {
            console.log('🧪 Testing Pinecone connection and index status...\n');
            
            // Get stats from the main index (not namespaced)
            const mainIndex = this.pinecone.index(this.indexName);
            const stats = await mainIndex.describeIndexStats();
            
            console.log('📊 Index Statistics:');
            console.log(`   • Total vectors: ${stats.totalVectorCount}`);
            console.log(`   • Dimension: ${stats.dimension}`);
            console.log(`   • Index fullness: ${stats.indexFullness}`);
            
            // Check namespace statistics
            if (stats.namespaces && stats.namespaces['claude-conversations']) {
                const nsStats = stats.namespaces['claude-conversations'];
                console.log(`   • Namespace 'claude-conversations': ${nsStats.vectorCount} vectors`);
            } else {
                console.log(`   • No vectors found in namespace 'claude-conversations'`);
            }
            console.log('');
            
            return true;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }
}

// Main execution
async function main() {
    const searchQuery = process.argv[2];
    const searcher = new ConversationMetadataSearcher();

    try {
        await searcher.initialize();
        
        // Test connection
        const connectionOk = await searcher.testConnection();
        if (!connectionOk) {
            console.error('❌ Connection test failed - exiting');
            return;
        }

        if (!searchQuery) {
            console.log('🔍 No search query provided. Listing recent conversations...\n');
            const results = await searcher.listAllConversations(20);
            searcher.displayResults(results);
        } else if (searchQuery === '--march-2024') {
            console.log('🔍 Searching for March 2024 conversations...\n');
            const results = await searcher.searchByDateRange('2024-03-01', '2024-03-31');
            searcher.displayResults(results);
        } else if (searchQuery === '--all') {
            console.log('🔍 Listing all conversations...\n');
            const results = await searcher.listAllConversations(100);
            searcher.displayResults(results);
        } else {
            console.log(`🔍 Searching for keyword: "${searchQuery}"\n`);
            const results = await searcher.searchByKeyword(searchQuery, 15);
            searcher.displayResults(results);
        }

    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

// Handle command line execution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ConversationMetadataSearcher;