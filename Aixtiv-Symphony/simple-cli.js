#!/usr/bin/env node

/**
 * 💎 SIMPLE DIAMOND CLI - Clean Natural Language Interface
 * 
 * Purpose: Single, clean entry point for all operations
 * No clutter, no overlapping interfaces - just talk naturally
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '💎 What would you like to do? '
});

console.log('\n💎 Diamond SAO Command Center - Simple Interface');
console.log('═══════════════════════════════════════════════');
console.log('Just tell me what you want to do in natural language\n');

rl.prompt();

rl.on('line', async (input) => {
  const command = input.trim();
  
  if (!command) {
    rl.prompt();
    return;
  }
  
  if (command.toLowerCase() === 'exit' || command.toLowerCase() === 'quit') {
    console.log('👋 Goodbye!');
    process.exit(0);
  }
  
  // Route to Diamond CLI
  console.log(`\n🔄 Processing: ${command}\n`);
  
  const diamond = spawn('diamond', [command], {
    stdio: 'inherit',
    shell: true
  });
  
  diamond.on('close', (code) => {
    console.log('\n');
    rl.prompt();
  });
  
  diamond.on('error', (err) => {
    console.error(`❌ Error: ${err.message}\n`);
    rl.prompt();
  });
});

rl.on('close', () => {
  console.log('\n👋 Diamond SAO session ended');
  process.exit(0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Diamond SAO session ended');
  process.exit(0);
});