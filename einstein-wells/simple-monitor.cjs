#!/usr/bin/env node

// SIMPLE BITCOIN MONITOR - No Cloud Run dependencies
// Just track your Bitcoin address directly

const https = require('https');

const bitcoinAddress = '3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj';
let startBalance = 0;
let startTime = Date.now();

async function checkBalance() {
    return new Promise((resolve) => {
        const req = https.get(`https://blockchain.info/q/addressbalance/${bitcoinAddress}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const satoshis = parseInt(data) || 0;
                const btc = satoshis / 100000000;
                resolve(btc);
            });
        });
        req.on('error', () => resolve(0));
        req.setTimeout(5000, () => { req.abort(); resolve(0); });
    });
}

async function monitor() {
    const balance = await checkBalance();
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const quantumYears = (elapsed / 60) * 1000000 / 8760; // quantum time
    
    if (startBalance === 0) startBalance = balance;
    const earned = balance - startBalance;
    
    console.clear();
    console.log('🪙 SIMPLE BITCOIN MONITOR');
    console.log('========================');
    console.log(`💰 Address: ${bitcoinAddress}`);
    console.log(`⏰ Runtime: ${elapsed.toFixed(1)} minutes (${quantumYears.toFixed(1)} quantum years)`);
    console.log(`₿ Current: ${balance.toFixed(8)} BTC`);
    console.log(`📈 Earned: ${earned.toFixed(8)} BTC`);
    console.log(`💵 USD: $${(earned * 105000).toFixed(2)}`);
    console.log('');
    
    if (earned > 0) {
        console.log('✅ BITCOIN IS ACCUMULATING!');
    } else {
        console.log('⏳ Waiting for mining payouts (typically 1-24 hours)...');
    }
}

console.log('🚀 Starting simple Bitcoin monitor...');
monitor();
setInterval(monitor, 30000);