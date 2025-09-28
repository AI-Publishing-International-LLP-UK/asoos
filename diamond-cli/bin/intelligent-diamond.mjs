#!/usr/bin/env node

/**
 * 🧠 INTELLIGENT DIAMOND CLI - AI-POWERED TOOL SELECTION
 * 
 * Sacred Mission: Natural language interface with automatic tool selection
 * Authority: Mr. Phillip Corey Roark (0000001) - Diamond SAO Exclusive
 * 
 * Features:
 * - Natural language input processing
 * - Automatic best tool selection
 * - Context-aware decision making
 * - Self-learning preferences
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntelligentDiamondCLI {
  constructor() {
    this.version = '1.0.0-intelligent';
    this.authority = 'Diamond SAO Command Center + AI Intelligence';
    
    // Available tools and their capabilities
    this.tools = {
      warp: {
        path: '/usr/local/bin/warp-cli',
        capabilities: ['network', 'connection', 'security', 'vpn', 'tunnel'],
        description: 'Cloudflare Warp network optimization'
      },
      diamond: {
        path: path.resolve(__dirname, 'diamond-fixed.mjs'),
        capabilities: ['mcp', 'deploy', 'cttt', 'hume', 'testing', 'gcp', 'cloud'],
        description: 'Diamond SAO Command Center operations'
      },
      gcloud: {
        path: 'gcloud',
        capabilities: ['cloud', 'deploy', 'services', 'compute', 'storage'],
        description: 'Google Cloud Platform management'
      },
      kubectl: {
        path: '/opt/homebrew/bin/kubectl',
        capabilities: ['kubernetes', 'pods', 'services', 'containers', 'k8s'],
        description: 'Kubernetes cluster management'
      }
    };
    
    this.initializeHeaders();
  }
  
  initializeHeaders() {
    console.log('🧠 INTELLIGENT DIAMOND CLI - AI-POWERED TOOL SELECTION');
    console.log('🏛️  Authority: Diamond SAO Command Center + AI Intelligence');
    console.log('💬 Natural Language Interface: Just tell me what you want to do');
    console.log('🤖 Automatic Tool Selection: I\'ll choose the best tool for the job');
    console.log('');
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'SUCCESS': '✅',
      'ERROR': '❌', 
      'WARN': '⚠️',
      'AI': '🤖',
      'THINKING': '🤔',
      'ACTION': '⚡',
      'INFO': '🔷'
    }[level] || '🔷';
    
    console.log(`${prefix} [${timestamp}] INTELLIGENT: ${message}`);
  }

  // AI-powered intent recognition
  analyzeIntent(input) {
    const lowerInput = input.toLowerCase();
    
    // Network/Connection intents
    if (this.matchesKeywords(lowerInput, ['connect', 'warp', 'network', 'vpn', 'tunnel', 'disconnect'])) {
      return {
        tool: 'warp',
        action: this.extractWarpAction(lowerInput),
        confidence: 0.9
      };
    }
    
    // Deployment intents
    if (this.matchesKeywords(lowerInput, ['deploy', 'deployment', 'build', 'release'])) {
      if (this.matchesKeywords(lowerInput, ['gcp', 'cloud run', 'google'])) {
        return {
          tool: 'diamond',
          action: ['deploy', 'gcp'],
          confidence: 0.95
        };
      }
      return {
        tool: 'diamond',
        action: ['deploy', 'hybrid'],
        confidence: 0.8
      };
    }
    
    // Status/Health checks
    if (this.matchesKeywords(lowerInput, ['status', 'health', 'check', 'show', 'display'])) {
      if (this.matchesKeywords(lowerInput, ['mcp', 'model context'])) {
        return {
          tool: 'diamond',
          action: ['mcp', 'status'],
          confidence: 0.9
        };
      }
      return {
        tool: 'diamond',
        action: ['status'],
        confidence: 0.85
      };
    }
    
    // Testing intents
    if (this.matchesKeywords(lowerInput, ['test', 'testing', 'cttt', 'newman'])) {
      return {
        tool: 'diamond',
        action: ['cttt', 'test', 'comprehensive'],
        confidence: 0.9
      };
    }
    
    // Cloud management
    if (this.matchesKeywords(lowerInput, ['gcloud', 'cloud', 'gcp', 'compute'])) {
      return {
        tool: 'gcloud',
        action: this.extractGcloudAction(lowerInput),
        confidence: 0.8
      };
    }
    
    // Kubernetes
    if (this.matchesKeywords(lowerInput, ['kubernetes', 'k8s', 'pods', 'kubectl'])) {
      return {
        tool: 'kubectl',
        action: this.extractKubectlAction(lowerInput),
        confidence: 0.85
      };
    }
    
    // Default to Diamond CLI for complex operations
    return {
      tool: 'diamond',
      action: ['help'],
      confidence: 0.5,
      reason: 'No clear intent detected, showing help'
    };
  }

  matchesKeywords(input, keywords) {
    return keywords.some(keyword => input.includes(keyword));
  }

  extractWarpAction(input) {
    if (input.includes('connect')) return ['connect'];
    if (input.includes('disconnect')) return ['disconnect'];
    if (input.includes('status')) return ['status'];
    if (input.includes('settings')) return ['settings'];
    return ['status'];
  }

  extractGcloudAction(input) {
    if (input.includes('services')) return ['run', 'services', 'list'];
    if (input.includes('logs')) return ['logs', 'tail'];
    if (input.includes('deploy')) return ['run', 'deploy'];
    return ['config', 'list'];
  }

  extractKubectlAction(input) {
    if (input.includes('pods')) return ['get', 'pods'];
    if (input.includes('services')) return ['get', 'services'];
    if (input.includes('logs')) return ['logs'];
    return ['cluster-info'];
  }

  async executeTool(toolName, action) {
    const tool = this.tools[toolName];
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    this.log(`⚡ Executing ${tool.description}...`, 'ACTION');
    this.log(`Command: ${toolName} ${action.join(' ')}`, 'INFO');

    return new Promise((resolve, reject) => {
      let command, args;
      
      if (toolName === 'diamond') {
        command = 'node';
        args = [tool.path, ...action];
      } else {
        command = tool.path;
        args = action;
      }

      const process = spawn(command, args, { 
        stdio: 'inherit',
        cwd: '/Users/as/asoos/aixtiv-symphony'
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          this.log(`✅ ${tool.description} completed successfully`, 'SUCCESS');
          resolve();
        } else {
          this.log(`❌ ${tool.description} failed with code ${code}`, 'ERROR');
          reject(new Error(`Tool failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        this.log(`❌ Failed to execute ${toolName}: ${error.message}`, 'ERROR');
        reject(error);
      });
    });
  }

  showHelp() {
    console.log('\n🧠 INTELLIGENT DIAMOND CLI - NATURAL LANGUAGE INTERFACE');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Just tell me what you want to do in plain English!');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  "Connect to Warp"                   → Automatically uses warp-cli connect');
    console.log('  "Show me the system status"         → Uses Diamond CLI status');
    console.log('  "Deploy to GCP"                     → Uses Diamond CLI deploy gcp');
    console.log('  "Check MCP status"                  → Uses Diamond CLI mcp status');
    console.log('  "Run tests"                         → Uses Diamond CLI cttt test');
    console.log('  "Show me the pods"                  → Uses kubectl get pods');
    console.log('  "List cloud services"               → Uses gcloud run services list');
    console.log('');
    console.log('AVAILABLE TOOLS:');
    Object.entries(this.tools).forEach(([name, tool]) => {
      console.log(`  🔧 ${name.toUpperCase()}: ${tool.description}`);
      console.log(`     Capabilities: ${tool.capabilities.join(', ')}`);
    });
    console.log('');
    console.log('🤖 AI Decision Making: I analyze your request and pick the best tool');
    console.log('💬 Natural Language: No need to memorize commands anymore');
    console.log('🏛️  Authority: Mr. Phillip Corey Roark - Diamond SAO Command Center');
    console.log('');
  }

  async processNaturalLanguage(input) {
    this.log(`🤔 Analyzing request: "${input}"`, 'THINKING');
    
    const intent = this.analyzeIntent(input);
    
    this.log(`🤖 Decision: Use ${intent.tool.toUpperCase()} (${intent.confidence * 100}% confidence)`, 'AI');
    if (intent.reason) {
      this.log(`Reason: ${intent.reason}`, 'INFO');
    }
    
    try {
      await this.executeTool(intent.tool, intent.action);
      this.log('✅ Task completed successfully', 'SUCCESS');
    } catch (error) {
      this.log(`❌ Task failed: ${error.message}`, 'ERROR');
      
      // Auto-fallback to help if confidence was low
      if (intent.confidence < 0.7) {
        this.log('🤔 Low confidence detected, showing help instead', 'THINKING');
        this.showHelp();
      }
    }
  }

  async execute(args) {
    if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
      this.showHelp();
      return;
    }

    // Join all arguments as natural language input
    const naturalLanguageInput = args.join(' ');
    await this.processNaturalLanguage(naturalLanguageInput);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new IntelligentDiamondCLI();
  const args = process.argv.slice(2);
  
  cli.execute(args).catch((error) => {
    console.error('💥 FATAL ERROR:', error.message);
    process.exit(1);
  });
}

export default IntelligentDiamondCLI;