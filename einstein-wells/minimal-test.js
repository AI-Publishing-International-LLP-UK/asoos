#!/usr/bin/env node

/**
 * MINIMAL NICEHASH TEST
 * Simplest possible approach to get accepted shares
 */

import express from 'express';
import net from 'net';
import crypto from 'crypto';

class MinimalNiceHashTest {
  constructor() {
    this.config = {
      host: 'sha256.usa-east.nicehash.com',
      port: 9200,
      username: 'NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5',
      workerId: 'TEST-MINIMAL-001',
      rigName: 'minimal-test-rig'
    };
    
    this.connection = null;
    this.isConnected = false;
    this.isAuthorized = false;
    this.sharesSent = 0;
    this.sharesAccepted = 0;
    
    console.log('🧪 MINIMAL NICEHASH TEST CLIENT');
    console.log(`🔗 Pool: ${this.config.host}:${this.config.port}`);
    console.log(`👤 Worker: ${this.config.workerId}`);
    console.log('🎯 Goal: Get ANY accepted share');
  }

  connect() {
    console.log('\n🔌 Connecting to NiceHash...');
    
    this.connection = net.createConnection({
      host: this.config.host,
      port: this.config.port,
      timeout: 30000
    });

    this.connection.setKeepAlive(true, 30000);

    this.connection.on('connect', () => {
      console.log('✅ Connected');
      this.isConnected = true;
      this.subscribe();
    });

    this.connection.on('data', (data) => {
      this.handleData(data);
    });

    this.connection.on('error', (error) => {
      console.error('❌ Error:', error.message);
      this.reconnect();
    });

    this.connection.on('close', () => {
      console.log('🔌 Closed');
      this.isConnected = false;
      this.isAuthorized = false;
      this.reconnect();
    });
  }

  reconnect() {
    if (this.connection) {
      this.connection.destroy();
    }
    setTimeout(() => this.connect(), 10000);
  }

  handleData(data) {
    const messages = data.toString().split('\n').filter(msg => msg.trim());
    
    messages.forEach(message => {
      if (message.trim()) {
        try {
          const msg = JSON.parse(message);
          this.processMessage(msg);
        } catch (error) {
          console.log(`📬 Raw: ${message.substring(0, 100)}...`);
        }
      }
    });
  }

  processMessage(msg) {
    if (msg.method === 'mining.notify') {
      console.log('📋 New job received');
      // Don't start mining immediately - just acknowledge
    } else if (msg.method === 'mining.set_difficulty') {
      console.log(`🎯 Difficulty: ${msg.params[0]}`);
    } else if (msg.id === 1) {
      this.handleSubscribe(msg);
    } else if (msg.id === 2) {
      this.handleAuth(msg);
    } else if (msg.id >= 100) {
      this.handleSubmit(msg);
    }
  }

  subscribe() {
    this.sendMessage({
      id: 1,
      method: 'mining.subscribe',
      params: []
    });
    console.log('📡 Subscribe sent');
  }

  handleSubscribe(msg) {
    if (msg.error) {
      console.error('❌ Subscribe error:', msg.error);
      return;
    }
    console.log('✅ Subscribed');
    this.authorize();
  }

  authorize() {
    this.sendMessage({
      id: 2,
      method: 'mining.authorize',
      params: [`${this.config.username}.${this.config.workerId}`, 'x']
    });
    console.log('🔐 Auth sent');
  }

  handleAuth(msg) {
    if (msg.error) {
      console.error('❌ Auth error:', msg.error);
      return;
    }
    
    if (msg.result) {
      this.isAuthorized = true;
      console.log('✅ AUTHORIZED');
      console.log('⏳ Waiting 60 seconds before testing share submission...');
      
      // Wait 60 seconds, then submit ONE test share
      setTimeout(() => {
        this.submitTestShare();
      }, 60000);
    }
  }

  submitTestShare() {
    console.log('🧪 Submitting minimal test share...');
    
    const message = {
      id: 100,
      method: 'mining.submit',
      params: [
        `${this.config.username}.${this.config.workerId}`,
        '00000001', // Simple job ID
        '00000000', // Simple extranonce2
        Math.floor(Date.now() / 1000).toString(16), // Current time
        '00000001'  // Simple nonce
      ]
    };

    this.sendMessage(message);
    this.sharesSent = 1;
    console.log('📤 Test share submitted');
  }

  handleSubmit(msg) {
    if (msg.error) {
      console.log(`❌ Share rejected: ${msg.error[1]}`);
      console.log('🧪 This is expected - we\'re just testing the connection');
    } else {
      this.sharesAccepted = 1;
      console.log('🎉 SHARE ACCEPTED! Connection working perfectly!');
    }
  }

  sendMessage(message) {
    if (this.isConnected && this.connection) {
      this.connection.write(JSON.stringify(message) + '\n');
    }
  }

  start() {
    console.log('🚀 Starting minimal test...');
    this.connect();
    
    // Status every 30 seconds
    setInterval(() => {
      console.log(`📊 Status: Connected:${this.isConnected} Auth:${this.isAuthorized} Shares:${this.sharesAccepted}/${this.sharesSent}`);
    }, 30000);
  }
}

// Express app
const app = express();
app.use(express.json());

let testClient = null;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'minimal-nicehash-test',
    client: testClient ? {
      connected: testClient.isConnected,
      authorized: testClient.isAuthorized,
      shares: `${testClient.sharesAccepted}/${testClient.sharesSent}`
    } : null
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🧪 MINIMAL TEST SERVER on port ${PORT}`);
  
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      testClient = new MinimalNiceHashTest();
      testClient.start();
    }, 5000);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Test complete');
  if (testClient && testClient.connection) {
    testClient.connection.destroy();
  }
  process.exit(0);
});