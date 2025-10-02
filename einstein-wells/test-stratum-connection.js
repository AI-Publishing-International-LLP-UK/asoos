#!/usr/bin/env node

/**
 * SIMPLE STRATUM CONNECTION TEST
 * Debug the quick disconnect issue
 */

import net from 'net';

console.log('🔍 TESTING STRATUM CONNECTION...');
console.log('================================');

const client = net.createConnection({
  host: 'sha256.auto.nicehash.com',
  port: 9200,
  timeout: 30000
});

client.setKeepAlive(true, 30000);

client.on('connect', () => {
  console.log('✅ Connected to NiceHash stratum server');
  console.log(`📡 Local: ${client.localAddress}:${client.localPort}`);
  console.log(`🌐 Remote: ${client.remoteAddress}:${client.remotePort}`);
  
  // Send minimal subscription
  const msg = {
    id: 1,
    method: 'mining.subscribe',
    params: []
  };
  
  console.log('📤 Sending:', JSON.stringify(msg));
  client.write(JSON.stringify(msg) + '\n');
});

client.on('data', (data) => {
  console.log('📥 Received:', data.toString());
});

client.on('error', (error) => {
  console.error('❌ Error:', error.code, error.message);
});

client.on('close', (hadError) => {
  console.log(`🔌 Connection closed ${hadError ? 'due to error' : 'normally'}`);
});

client.on('timeout', () => {
  console.log('⏰ Connection timeout');
  client.destroy();
});

// Keep alive for 30 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - closing connection');
  client.end();
  process.exit(0);
}, 30000);

console.log('🎯 Testing connection for 30 seconds...');
console.log('Press Ctrl+C to stop');