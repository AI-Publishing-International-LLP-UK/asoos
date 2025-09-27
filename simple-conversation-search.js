#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

class SimpleConversationSearcher {
    constructor() {
        this.dataPath = './data';
        this.results = [];
    }

    // Search for conversations containing specific text or date patterns
    async searchConversations(searchTerms = [], dateFilter = null) {
        console.log('🔍 Searching conversation files directly...\n');
        
        const accounts = ['claude-001', 'claude-002', 'claude-003'];
        let totalFound = 0;
        
        for (const account of accounts) {
            const conversationFile = path.join(this.dataPath, account, 'conversations.json');
            
            if (!fs.existsSync(conversationFile)) {
                console.log(`⚠️  File not found: ${conversationFile}`);
                continue;
            }
            
            console.log(`📖 Searching ${account}...`);
            
            try {
                const conversations = JSON.parse(fs.readFileSync(conversationFile, 'utf8'));
                let accountFound = 0;
                
                for (const conv of conversations) {
                    const match = this.matchesConversation(conv, searchTerms, dateFilter);
                    if (match) {
                        this.results.push({
                            account,
                            conversation: conv,
                            matchReasons: match.reasons
                        });
                        accountFound++;
                    }
                }
                
                console.log(`   Found ${accountFound} matches in ${account}`);
                totalFound += accountFound;
                
            } catch (error) {
                console.error(`❌ Error reading ${account}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Total conversations found: ${totalFound}\n`);
        return this.results;
    }
    
    matchesConversation(conv, searchTerms, dateFilter) {
        const reasons = [];
        let matches = false;
        
        // Extract all text content
        const allText = this.extractAllText(conv).toLowerCase();
        const title = (conv.title || '').toLowerCase();
        
        // Date filtering
        if (dateFilter) {
            const dates = this.extractDates(conv);
            for (const date of dates) {
                if (this.matchesDateFilter(date, dateFilter)) {
                    reasons.push(`Date match: ${date}`);
                    matches = true;
                }
            }
        }
        
        // Term searching
        if (searchTerms.length === 0) {
            matches = true; // If no search terms, return all (filtered by date if specified)
        } else {
            for (const term of searchTerms) {
                const lowerTerm = term.toLowerCase();
                if (title.includes(lowerTerm) || allText.includes(lowerTerm)) {
                    reasons.push(`Text match: "${term}"`);
                    matches = true;
                }
            }
        }
        
        return matches ? { reasons } : null;
    }
    
    extractAllText(conv) {
        let text = conv.title || '';
        
        if (conv.mapping) {
            for (const [id, node] of Object.entries(conv.mapping)) {
                if (node.message && node.message.content && node.message.content.parts) {
                    text += ' ' + node.message.content.parts.join(' ');
                }
            }
        }
        
        if (conv.messages) {
            text += ' ' + conv.messages.map(m => m.content).join(' ');
        }
        
        if (conv.chat_messages) {
            text += ' ' + conv.chat_messages.map(m => m.text).join(' ');
        }
        
        return text;
    }
    
    extractDates(conv) {
        const dates = [];
        
        // Main conversation dates
        if (conv.create_time) dates.push(conv.create_time);
        if (conv.update_time) dates.push(conv.update_time);
        if (conv.created_at) dates.push(conv.created_at);
        if (conv.updated_at) dates.push(conv.updated_at);
        
        // Message dates from mapping
        if (conv.mapping) {
            for (const [id, node] of Object.entries(conv.mapping)) {
                if (node.message && node.message.create_time) {
                    dates.push(node.message.create_time);
                }
            }
        }
        
        return dates;
    }
    
    matchesDateFilter(dateString, filter) {
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // JavaScript months are 0-indexed
            
            if (filter.year && year !== filter.year) return false;
            if (filter.months && !filter.months.includes(month)) return false;
            
            return true;
        } catch {
            return false;
        }
    }
    
    displayResults(limit = 20) {
        if (this.results.length === 0) {
            console.log('❌ No conversations found');
            return;
        }
        
        console.log(`📝 Showing ${Math.min(limit, this.results.length)} of ${this.results.length} results:\n`);
        
        const displayResults = this.results.slice(0, limit);
        
        displayResults.forEach((result, index) => {
            const conv = result.conversation;
            const dates = this.extractDates(conv);
            const earliestDate = dates.length > 0 ? 
                new Date(Math.min(...dates.map(d => new Date(d).getTime()))) : null;
            
            console.log(`${index + 1}. ${conv.title || 'Untitled'}`);
            console.log(`   📁 Account: ${result.account}`);
            console.log(`   🗓️  Earliest Date: ${earliestDate ? earliestDate.toISOString().split('T')[0] : 'Unknown'}`);
            console.log(`   🔍 Match Reasons: ${result.matchReasons.join(', ')}`);
            console.log(`   🔗 ID: ${conv.id}`);
            
            // Show a preview of content
            const preview = this.extractAllText(conv);
            if (preview.length > 100) {
                console.log(`   📄 Preview: ${preview.substring(0, 150)}...`);
            }
            
            console.log('   ─────────────────────────────────────────────────────');
        });
        
        if (this.results.length > limit) {
            console.log(`\n... and ${this.results.length - limit} more results`);
        }
    }
    
    // Create a retrospective summary
    createRetrospective() {
        if (this.results.length === 0) {
            console.log('❌ No conversations to create retrospective from');
            return;
        }
        
        console.log('📊 CONVERSATION RETROSPECTIVE\n');
        console.log('=' .repeat(50));
        
        // Group by account
        const byAccount = {};
        const byMonth = {};
        
        this.results.forEach(result => {
            const account = result.account;
            if (!byAccount[account]) byAccount[account] = [];
            byAccount[account].push(result);
            
            // Group by month
            const dates = this.extractDates(result.conversation);
            dates.forEach(dateStr => {
                try {
                    const date = new Date(dateStr);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (!byMonth[monthKey]) byMonth[monthKey] = [];
                    byMonth[monthKey].push(result);
                } catch {}
            });
        });
        
        console.log('📈 By Account:');
        Object.entries(byAccount).forEach(([account, results]) => {
            console.log(`   ${account}: ${results.length} conversations`);
        });
        
        console.log('\n📅 By Month:');
        Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([month, results]) => {
                console.log(`   ${month}: ${results.length} conversations`);
            });
        
        console.log('\n🏷️  Common Themes:');
        const themes = {};
        this.results.forEach(result => {
            const title = result.conversation.title || '';
            const words = title.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3) {
                    themes[word] = (themes[word] || 0) + 1;
                }
            });
        });
        
        Object.entries(themes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([theme, count]) => {
                console.log(`   ${theme}: ${count} occurrences`);
            });
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const searcher = new SimpleConversationSearcher();
    
    let searchTerms = [];
    let dateFilter = null;
    
    // Parse arguments
    if (args.includes('--spring-2024')) {
        dateFilter = { year: 2024, months: [2, 3, 4, 5] }; // Feb, Mar, Apr, May
        console.log('🌸 Searching for Spring 2024 conversations (Feb-May)...\n');
    } else if (args.includes('--early-2024')) {
        dateFilter = { year: 2024, months: [1, 2, 3, 4, 5, 6] }; // Jan-June
        console.log('🌱 Searching for early 2024 conversations (Jan-June)...\n');
    } else if (args.includes('--2024')) {
        dateFilter = { year: 2024 };
        console.log('📅 Searching for all 2024 conversations...\n');
    } else {
        // Use remaining args as search terms
        searchTerms = args.filter(arg => !arg.startsWith('--'));
        if (searchTerms.length > 0) {
            console.log(`🔍 Searching for: ${searchTerms.join(', ')}\n`);
        } else {
            console.log('📋 Listing all conversations...\n');
        }
    }
    
    try {
        await searcher.searchConversations(searchTerms, dateFilter);
        searcher.displayResults(30);
        
        if (dateFilter || searchTerms.length > 0) {
            console.log('\n');
            searcher.createRetrospective();
        }
        
    } catch (error) {
        console.error('❌ Search failed:', error);
        process.exit(1);
    }
}

// Handle command line execution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = SimpleConversationSearcher;