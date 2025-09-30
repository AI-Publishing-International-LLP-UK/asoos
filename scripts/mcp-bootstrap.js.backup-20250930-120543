#!/usr/bin/env node
/**
 * MCP Bootstrap Script - Secure Secret Loading
 * Fetches ANTHROPIC_API_KEY from Google Secret Manager and launches MCP server
 * This prevents secrets from being stored in Claude Desktop config files
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PROJECT_ID = process.env.GCP_PROJECT || 'api-for-warp-drive';
const SECRET_NAME = process.env.ANTHROPIC_SECRET_NAME || 'ANTHROPIC_API_KEY';

async function fetchSecret(secretName) {
  try {
    const client = new SecretManagerServiceClient();
    const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
    const [accessResponse] = await client.accessSecretVersion({ name });
    const payload = accessResponse.payload?.data?.toString('utf8')?.trim();
    
    if (!payload) {
      throw new Error(`Secret ${secretName} is empty`);
    }
    
    return payload;
  } catch (error) {
    console.error(`❌ Failed to fetch secret ${secretName}:`, error.message);
    console.error('Ensure:');
    console.error('1. Google Application Default Credentials are set up');
    console.error('2. Secret exists in project:', PROJECT_ID);
    console.error('3. Service account has secretmanager.versions.access permission');
    throw error;
  }
}

async function launchWithSecrets() {
  try {
    console.log('🔐 Fetching secrets from Google Secret Manager...');
    
    // Fetch ANTHROPIC_API_KEY
    const anthropicKey = await fetchSecret(SECRET_NAME);
    console.log('✅ Successfully fetched ANTHROPIC_API_KEY');

    // Determine which server to launch based on arguments
    const serverScript = process.argv[2] || 'server.js';
    const serverPath = path.resolve(__dirname, '..', serverScript);
    
    // Set up environment with secrets
    const env = {
      ...process.env,
      ANTHROPIC_API_KEY: anthropicKey,
      NODE_ENV: process.env.NODE_ENV || 'development',
      GCP_PROJECT: PROJECT_ID,
      MCP_DEBUG: 'true'
    };

    console.log(`🚀 Launching server: ${serverPath}`);
    
    // Launch the server with secrets in environment
    const serverProcess = spawn('node', [serverPath], {
      env,
      stdio: 'inherit',
      cwd: path.dirname(serverPath)
    });

    // Handle process events
    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      process.exit(1);
    });

    serverProcess.on('exit', (code) => {
      console.log(`📊 Server exited with code: ${code}`);
      process.exit(code);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      serverProcess.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      serverProcess.kill('SIGINT');
    });

  } catch (error) {
    console.error('💥 Bootstrap failed:', error.message);
    process.exit(1);
  }
}

// Launch if called directly
if (require.main === module) {
  launchWithSecrets();
}

module.exports = { launchWithSecrets, fetchSecret };