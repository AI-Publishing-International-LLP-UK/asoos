#!/usr/bin/env node

/**
 * 🔍 SEARCH MARCH 2024 CONVERSATIONS
 * 
 * This script searches through your Claude conversations locally to find
 * your March 2024 conversations and early AI development work.
 * 
 * No API keys required - works entirely with local files.
 * 
 * @author AI Publishing International LLP - Diamond SAO Command Center
 */

const fs = require('fs');
const path = require('path');

class March2024ConversationSearcher {
  constructor() {
    this.claudeAccounts = ['claude-001', 'claude-002', 'claude-003'];
    this.openaiAccounts = [
      'openai-001', 'openai-002', 'openai-003', 'openai-004', 'openai-005',
      'openai-006', 'openai-007', 'openai-008', 'openai-009', 'openai-010'
    ];
    this.searchResults = [];
  }

  /**
   * Extract text from conversation
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
   * Check if date falls in March 2024
   */
  isMarch2024(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date.getFullYear() === 2024 && date.getMonth() === 2; // March is month 2 (0-indexed)
  }

  /**
   * Check if date is early 2024 (Jan-May 2024)
   */
  isEarly2024(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date.getFullYear() === 2024 && date.getMonth() <= 4; // Jan-May 2024
  }

  /**
   * Search conversations in an account
   */
  searchAccount(account, accountType = 'claude') {
    const conversationsPath = `./data/${account}/conversations.json`;
    
    if (!fs.existsSync(conversationsPath)) {
      console.log(`⚠️ Conversations file not found: ${conversationsPath}`);
      return [];
    }

    console.log(`🔍 Searching ${account}...`);
    
    try {
      const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
      const results = [];
      
      for (const conversation of conversations) {
        const createdAt = conversation.create_time || conversation.created_at || conversation.timestamp;
        const updatedAt = conversation.update_time || conversation.updated_at;
        
        // Check dates
        const isMarch = this.isMarch2024(createdAt) || this.isMarch2024(updatedAt);
        const isEarly = this.isEarly2024(createdAt) || this.isEarly2024(updatedAt);
        
        if (isMarch || isEarly) {
          const text = this.extractConversationText(conversation);
          
          results.push({
            id: conversation.id,
            title: conversation.title || 'Untitled Conversation',
            account: account,
            accountType: accountType,
            createdAt: createdAt,
            updatedAt: updatedAt,
            isMarch2024: isMarch,
            isEarly2024: isEarly,
            textLength: text.length,
            text: text,
            preview: text.substring(0, 300) + '...'
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error(`❌ Error processing ${account}:`, error.message);
      return [];
    }
  }

  /**
   * Search by keywords in conversation content
   */
  searchByKeywords(conversations, keywords) {
    const keywordLower = keywords.toLowerCase();
    
    return conversations.filter(conv => {
      const searchText = (conv.title + ' ' + conv.text).toLowerCase();
      return searchText.includes(keywordLower);
    });
  }

  /**
   * Main search function
   */
  async search(keywords = null) {
    console.log('🕊️ Searching for your early AI conversations...\n');
    
    let allResults = [];
    
    // Search Claude accounts
    for (const account of this.claudeAccounts) {
      const results = this.searchAccount(account, 'claude');
      allResults.push(...results);
    }
    
    // Search OpenAI accounts
    for (const account of this.openaiAccounts) {
      const results = this.searchAccount(account, 'openai');
      allResults.push(...results);
    }
    
    // Sort by creation date
    allResults.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateA - dateB;
    });
    
    console.log(`\n📊 SEARCH SUMMARY:`);
    console.log(`Total early 2024 conversations found: ${allResults.length}`);
    console.log(`March 2024 specific: ${allResults.filter(r => r.isMarch2024).length}`);
    console.log(`Early 2024 (Jan-May): ${allResults.filter(r => r.isEarly2024).length}`);
    
    // Apply keyword filter if provided
    if (keywords) {
      console.log(`\n🔍 Filtering by keywords: "${keywords}"`);
      allResults = this.searchByKeywords(allResults, keywords);
      console.log(`Keyword matches: ${allResults.length}`);
    }
    
    // Display results
    console.log(`\n📚 CONVERSATION RESULTS:\n`);
    
    allResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   Account: ${result.account} (${result.accountType})`);
      console.log(`   Created: ${result.createdAt || 'Unknown'}`);
      console.log(`   March 2024: ${result.isMarch2024 ? '✅' : '❌'}`);
      console.log(`   Early 2024: ${result.isEarly2024 ? '✅' : '❌'}`);
      console.log(`   Length: ${result.textLength} characters`);
      console.log(`   Preview: ${result.preview}`);
      console.log('');
    });
    
    // Save detailed results to file
    const outputFile = './march-2024-conversations.json';
    fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
    console.log(`💾 Detailed results saved to: ${outputFile}`);
    
    return allResults;
  }

  /**
   * Generate retrospective summary
   */
  generateRetrospective(conversations) {
    if (conversations.length === 0) {
      console.log('\n📝 No early conversations found to analyze.');
      return;
    }

    console.log('\n📖 YOUR AI JOURNEY RETROSPECTIVE:\n');
    
    // Timeline analysis
    const march2024 = conversations.filter(c => c.isMarch2024);
    const early2024 = conversations.filter(c => c.isEarly2024);
    
    if (march2024.length > 0) {
      console.log(`🗓️ MARCH 2024 HIGHLIGHTS:`);
      console.log(`   • ${march2024.length} conversations during this pivotal month`);
      
      march2024.slice(0, 3).forEach(conv => {
        console.log(`   • ${conv.title} (${conv.account})`);
        console.log(`     ${conv.preview.substring(0, 100)}...`);
      });
    }
    
    if (early2024.length > 0) {
      console.log(`\n🚀 EARLY 2024 DEVELOPMENT PHASE:`);
      console.log(`   • ${early2024.length} total conversations in your foundational period`);
      console.log(`   • Accounts active: ${[...new Set(early2024.map(c => c.account))].join(', ')}`);
      console.log(`   • Average conversation length: ${Math.round(early2024.reduce((sum, c) => sum + c.textLength, 0) / early2024.length)} characters`);
    }
    
    // Topic analysis based on titles
    console.log(`\n🎯 COMMON THEMES:`);
    const themes = {};
    conversations.forEach(conv => {
      const words = conv.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    });
    
    const sortedThemes = Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedThemes.forEach(([theme, count]) => {
      console.log(`   • "${theme}" mentioned ${count} times`);
    });
    
    console.log(`\n✨ SUMMARY:`);
    console.log(`Your AI journey shows significant activity in early 2024, with ${conversations.length} documented conversations spanning your foundational development work. This represents the beginning of your comprehensive AI system architecture and Testament Array development.`);
  }
}

// Command line interface
if (require.main === module) {
  const searcher = new March2024ConversationSearcher();
  const keywords = process.argv[2];
  
  if (keywords) {
    console.log(`Searching with keywords: "${keywords}"`);
  }
  
  searcher.search(keywords).then(results => {
    console.log(`\n🎉 Search complete! Found ${results.length} relevant conversations.`);
    
    if (results.length > 0) {
      searcher.generateRetrospective(results);
    }
  }).catch(error => {
    console.error('💥 Search failed:', error.message);
  });
}

module.exports = March2024ConversationSearcher;