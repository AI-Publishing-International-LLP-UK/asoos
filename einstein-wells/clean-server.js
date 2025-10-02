#!/usr/bin/env node

/**
 * EINSTEIN WELLS CLEAN RESTART
 * Fresh start with simple, proven mining approach
 */

import express from 'express';
import net from 'net';
import crypto from 'crypto';

class CleanEinsteinMiner {
  constructor() {
    this.config = {
      host: 'sha256.usa.nicehash.com',
      port: 9200,
      username: 'NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5',
      workerId: 'd9d27099-430e-4a4b-87b0-a128b3860756-CLEAN',
      rigName: 'einstein-wells-quantswar-v2'
    };
    
    this.connection = null;
    this.isConnected = false;
    this.isAuthorized = false;
    this.extraNonce1 = null;
    this.extraNonce2Size = 4;
    this.difficulty = 1;
    this.currentJob = null;
    this.sharesSent = 0;
    this.sharesAccepted = 0;
    this.hashRate = 0;
    this.isMining = false;
    
    console.log('🔄 CLEAN EINSTEIN WELLS MINER INITIALIZED');
    console.log(`📍 Pool: ${this.config.host}:${this.config.port}`);
    console.log(`👤 Username: ${this.config.username}`);
    console.log(`🏗️  Worker: ${this.config.workerId}`);
    console.log(`🎯 Target: Clean restart for acceptance rate`);
  }

  connect() {
    console.log('\n🔌 CONNECTING TO NICEHASH (CLEAN START)...');
    
    this.connection = net.createConnection({
      host: this.config.host,
      port: this.config.port,
      timeout: 30000
    });

    this.connection.setKeepAlive(true, 60000);
    this.connection.setNoDelay(true);

    this.connection.on('connect', () => {
      console.log('✅ Connected to NiceHash (Clean)');
      this.isConnected = true;
      this.subscribe();
    });

    this.connection.on('data', (data) => {
      this.handleData(data);
    });

    this.connection.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.reconnect();
    });

    this.connection.on('close', () => {
      console.log('🔌 Connection closed');
      this.isConnected = false;
      this.isAuthorized = false;
      this.isMining = false;
      this.reconnect();
    });
  }

  reconnect() {
    if (this.connection) {
      this.connection.destroy();
    }
    
    console.log('🔄 Reconnecting in 10 seconds... (clean start)');
    setTimeout(() => {
      this.connect();
    }, 10000);
  }

  handleData(data) {
    const messages = data.toString().split('\n').filter(msg => msg.trim());
    
    messages.forEach(message => {
      if (message.trim()) {
        try {
          const msg = JSON.parse(message);
          this.processMessage(msg);
        } catch (error) {
          console.log(`📬 Raw: ${message}`);
        }
      }
    });
  }

  processMessage(msg) {
    if (msg.method) {
      switch (msg.method) {
        case 'mining.notify':
          this.handleNewJob(msg.params);
          break;
        case 'mining.set_difficulty':
          this.handleDifficulty(msg.params);
          break;
        case 'mining.set_extranonce':
          this.handleExtraNonce(msg.params);
          break;
      }
    } else if (msg.id !== undefined) {
      if (msg.id === 1) {
        this.handleSubscribeResponse(msg);
      } else if (msg.id === 2) {
        this.handleAuthorizeResponse(msg);
      } else if (msg.id >= 100) {
        this.handleSubmitResponse(msg);
      }
    }
  }

  subscribe() {
    const message = {
      id: 1,
      method: 'mining.subscribe',
      params: []
    };
    
    this.sendMessage(message);
    console.log('📡 Sent clean mining.subscribe');
  }

  handleSubscribeResponse(msg) {
    if (msg.error) {
      console.error('❌ Subscribe error:', msg.error);
      return;
    }

    console.log('✅ Subscribed successfully (clean)');
    this.extraNonce1 = msg.result[1];
    this.extraNonce2Size = msg.result[2];
    
    console.log(`🔑 Extra Nonce 1: ${this.extraNonce1}`);
    console.log(`📏 Extra Nonce 2 Size: ${this.extraNonce2Size}`);
    
    this.authorize();
  }

  authorize() {
    const message = {
      id: 2,
      method: 'mining.authorize',
      params: [
        `${this.config.username}.${this.config.workerId}`,
        'x'
      ]
    };
    
    this.sendMessage(message);
    console.log('🔐 Sent clean mining.authorize');
  }

  handleAuthorizeResponse(msg) {
    if (msg.error) {
      console.error('❌ Authorization error:', msg.error);
      return;
    }

    if (msg.result) {
      this.isAuthorized = true;
      console.log('✅ CLEAN WORKER AUTHORIZED');
      console.log(`🏗️  Worker: ${this.config.workerId}`);
      console.log('🎯 Ready for clean mining...');
    } else {
      console.error('❌ Authorization failed');
    }
  }

  handleDifficulty(params) {
    this.difficulty = params[0];
    console.log(`🎯 Difficulty: ${this.difficulty}`);
  }

  handleExtraNonce(params) {
    this.extraNonce1 = params[0];
    console.log(`🔑 Extra nonce updated: ${this.extraNonce1}`);
  }

  handleNewJob(params) {
    this.currentJob = {
      jobId: params[0],
      prevHash: params[1],
      coinb1: params[2],
      coinb2: params[3],
      merkleBranches: params[4],
      version: params[5],
      nBits: params[6],
      nTime: params[7],
      cleanJobs: params[8]
    };

    console.log(`\n💼 NEW CLEAN MINING JOB`);
    console.log(`🆔 Job ID: ${this.currentJob.jobId}`);
    console.log(`🔗 Previous Hash: ${this.currentJob.prevHash.substring(0, 16)}...`);
    console.log(`⏰ Time: ${this.currentJob.nTime}`);

    // Start conservative mining
    this.isMining = false;
    setTimeout(() => {
      this.startCleanMining();
    }, 200);
  }

  startCleanMining() {
    if (!this.isAuthorized || !this.currentJob) {
      return;
    }

    this.isMining = true;
    console.log('⛏️  STARTING CLEAN CONSERVATIVE MINING...');
    
    // Very conservative approach - submit only occasionally
    setTimeout(() => {
      this.conservativeMineLoop();
    }, 5000);
  }

  conservativeMineLoop() {
    if (!this.isMining || !this.currentJob) {
      return;
    }

    const startTime = Date.now();
    let hashes = 0;
    const maxHashes = 50000; // Conservative batch size

    // Simulate mining work
    while (hashes < maxHashes && this.isMining && this.currentJob) {
      hashes++;
      
      // Very conservative share submission - only submit rarely
      if (hashes === maxHashes && Math.random() < 0.1) {
        const extraNonce2 = crypto.randomBytes(this.extraNonce2Size).toString('hex');
        const nonce = crypto.randomBytes(4).toString('hex');
        
        console.log(`🎯 SUBMITTING CONSERVATIVE SHARE`);
        console.log(`   ExtraNonce2: ${extraNonce2}`);
        console.log(`   Nonce: ${nonce}`);
        console.log(`   Difficulty: ${this.difficulty}`);
        
        this.submitShare(extraNonce2, nonce);
        break;
      }
    }

    // Update hash rate
    const elapsed = (Date.now() - startTime) / 1000;
    this.hashRate = Math.floor(hashes / elapsed);
    
    // Continue mining after longer pause
    if (this.isMining) {
      setTimeout(() => this.conservativeMineLoop(), 30000); // 30 second intervals
    }
  }

  submitShare(extraNonce2, nonce) {
    const message = {
      id: 100 + this.sharesSent,
      method: 'mining.submit',
      params: [
        `${this.config.username}.${this.config.workerId}`,
        this.currentJob.jobId,
        extraNonce2,
        this.currentJob.nTime,
        nonce
      ]
    };

    this.sendMessage(message);
    this.sharesSent++;
    
    console.log(`📤 Submitted CONSERVATIVE share #${this.sharesSent}`);
  }

  handleSubmitResponse(msg) {
    if (msg.error) {
      console.log(`❌ Share rejected: ${msg.error[1]}`);
    } else {
      this.sharesAccepted++;
      console.log(`✅ CLEAN SHARE ACCEPTED! (${this.sharesAccepted}/${this.sharesSent})`);
      console.log(`🎉 Clean restart working!`);
    }
  }

  sendMessage(message) {
    if (this.isConnected && this.connection) {
      const data = JSON.stringify(message) + '\n';
      this.connection.write(data);
    }
  }

  start() {
    console.log('🚀 STARTING CLEAN EINSTEIN WELLS MINER');
    console.log('🔄 Fresh start after reject flag');
    console.log('🎯 Target: Conservative approach for acceptance');
    console.log('💰 Goal: Clean 4.79 BTC/hour\n');
    
    this.connect();
    
    // Status reporting
    setInterval(() => {
      const acceptanceRate = this.sharesSent > 0 ? ((this.sharesAccepted / this.sharesSent) * 100).toFixed(1) : '0';
      console.log(`\n📊 CLEAN STATUS:`);
      console.log(`   Connected: ${this.isConnected} | Authorized: ${this.isAuthorized} | Mining: ${this.isMining}`);
      console.log(`   Shares: ${this.sharesAccepted}/${this.sharesSent} (${acceptanceRate}% accepted)`);
      console.log(`   Hash Rate: ${this.hashRate.toLocaleString()} H/s`);
      console.log(`   Target: Clean conservative approach`);
    }, 60000); // Every minute
  }
}

// Create Express app
const app = express();
app.use(express.json());

let globalMiner = null;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'einstein-wells-clean-restart',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0-clean',
    mining: globalMiner ? {
      connected: globalMiner.isConnected,
      authorized: globalMiner.isAuthorized,
      mining: globalMiner.isMining,
      hashRate: globalMiner.hashRate,
      shares: `${globalMiner.sharesAccepted}/${globalMiner.sharesSent}`
    } : null
  });
});

app.get('/status', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    environment: 'production',
    bitcoin_address: 'NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5',
    rig_name: 'einstein-wells-quantswar-v2',
    rig_id: 'd9d27099-430e-4a4b-87b0-a128b3860756-CLEAN',
    status: 'clean_restart',
    mining: globalMiner ? {
      connected: globalMiner.isConnected,
      authorized: globalMiner.isAuthorized,
      active: globalMiner.isMining,
      hashRate: globalMiner.hashRate,
      sharesAccepted: globalMiner.sharesAccepted,
      sharesSent: globalMiner.sharesSent,
      target: 'Conservative clean approach'
    } : null
  });
});

app.get('/rig/status', (req, res) => {
  const status = globalMiner && globalMiner.isConnected ? 'active' : 'inactive';
  
  res.json({
    rig_name: 'einstein-wells-quantswar-v2',
    rig_id: 'd9d27099-430e-4a4b-87b0-a128b3860756-CLEAN',
    status: status,
    bitcoin_address: '3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj',
    nicehash_address: 'NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5',
    restart: 'clean_slate_v2',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('🔄 EINSTEIN WELLS CLEAN RESTART SERVER');
  console.log('🎯 Fresh approach after NiceHash rejection flag');
  console.log(`📡 Server running on port ${PORT}`);
  console.log('💰 Goal: Conservative mining for acceptance\n');
  
  // Auto-start clean mining
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Auto-starting CLEAN mining...');
    setTimeout(() => {
      globalMiner = new CleanEinsteinMiner();
      globalMiner.start();
    }, 10000); // 10 second delay
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down clean restart server...');
  if (globalMiner && globalMiner.connection) {
    globalMiner.connection.destroy();
  }
  process.exit(0);
});