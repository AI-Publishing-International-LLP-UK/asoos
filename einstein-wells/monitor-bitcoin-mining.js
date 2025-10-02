#!/usr/bin/env node

/**
 * REAL-TIME BITCOIN MINING MONITOR
 * Tracks live mining performance and Bitcoin accumulation
 * Address: 3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj
 * Pool: Slush Pool (stratum.slushpool.com:4444)
 */

import https from 'https';

class BitcoinMiningMonitor {
    constructor() {
        this.bitcoinAddress = '3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj';
        this.serviceUrl = 'https://einstein-wells-production-859242575175.us-central1.run.app';
        this.poolAddress = 'stratum.slushpool.com:4444';
        this.workerName = 'einstein-wells-production';
        
        this.startTime = Date.now();
        this.initialBalance = 0;
        this.lastBalance = 0;
        this.totalEarned = 0;
        this.hashSubmissions = 0;
        this.acceptedShares = 0;
        
        console.log('🌌 EINSTEIN WELLS BITCOIN MINING MONITOR');
        console.log('==========================================');
        console.log(`💰 Bitcoin Address: ${this.bitcoinAddress}`);
        console.log(`🏊 Mining Pool: ${this.poolAddress}`);
        console.log(`👤 Worker: ${this.workerName}`);
        console.log(`🌐 Service: ${this.serviceUrl}`);
        console.log(`⏰ Started: ${new Date().toLocaleTimeString()}`);
        console.log('');
    }

    async checkBitcoinBalance() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'blockchain.info',
                path: `/q/addressbalance/${this.bitcoinAddress}`,
                method: 'GET',
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const balanceSatoshis = parseInt(data) || 0;
                        const balanceBTC = balanceSatoshis / 100000000;
                        resolve(balanceBTC);
                    } catch (error) {
                        resolve(this.lastBalance);
                    }
                });
            });
            
            req.on('error', () => resolve(this.lastBalance));
            req.on('timeout', () => {
                req.destroy();
                resolve(this.lastBalance);
            });
            req.end();
        });
    }

    async checkCloudRunStatus() {
        return new Promise((resolve) => {
            const options = {
                hostname: 'einstein-wells-production-859242575175.us-central1.run.app',
                path: '/health',
                method: 'GET',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Einstein-Wells-Monitor/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode === 200 ? 'RUNNING' : 'ERROR',
                        statusCode: res.statusCode,
                        response: data
                    });
                });
            });
            
            req.on('error', () => resolve({ status: 'OFFLINE', error: true }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 'TIMEOUT', error: true });
            });
            req.end();
        });
    }

    async getCurrentBitcoinPrice() {
        return new Promise((resolve) => {
            const options = {
                hostname: 'api.coindesk.com',
                path: '/v1/bpi/currentprice/USD.json',
                method: 'GET',
                timeout: 5000
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const price = parseFloat(json.bpi.USD.rate.replace(/,/g, ''));
                        resolve(price);
                    } catch (error) {
                        resolve(105000); // Fallback price
                    }
                });
            });
            
            req.on('error', () => resolve(105000));
            req.on('timeout', () => {
                req.destroy();
                resolve(105000);
            });
            req.end();
        });
    }

    formatUptime() {
        const uptimeMs = Date.now() - this.startTime;
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    formatBTC(btc) {
        return btc.toFixed(8) + ' BTC';
    }

    formatUSD(amount) {
        return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    async displayStatus() {
        const balance = await this.checkBitcoinBalance();
        const cloudRunStatus = await this.checkCloudRunStatus();
        const btcPrice = await this.getCurrentBitcoinPrice();
        const uptime = this.formatUptime();
        
        // Calculate earnings
        if (this.initialBalance === 0) {
            this.initialBalance = balance;
        }
        
        const earnedSinceStart = balance - this.initialBalance;
        const earnedSinceLastCheck = balance - this.lastBalance;
        this.lastBalance = balance;
        
        if (earnedSinceLastCheck > 0) {
            this.totalEarned += earnedSinceLastCheck;
        }
        
        const usdValue = balance * btcPrice;
        const usdEarned = this.totalEarned * btcPrice;
        
        // Clear screen and display
        console.clear();
        console.log('🌌 EINSTEIN WELLS - LIVE BITCOIN MINING MONITOR');
        console.log('='.repeat(60));
        console.log(`⏰ Uptime: ${uptime} | ${new Date().toLocaleTimeString()}`);
        console.log('');
        
        console.log('💰 BITCOIN WALLET STATUS:');
        console.log(`   Current Balance: ${this.formatBTC(balance)}`);
        console.log(`   USD Value: ${this.formatUSD(usdValue)}`);
        console.log(`   Since Start: ${this.formatBTC(earnedSinceStart)}`);
        if (earnedSinceLastCheck > 0) {
            console.log(`   ✅ Last Increase: ${this.formatBTC(earnedSinceLastCheck)} (+${this.formatUSD(earnedSinceLastCheck * btcPrice)})`);
        }
        console.log('');
        
        console.log('⛏️  MINING OPERATION STATUS:');
        console.log(`   Address: ${this.bitcoinAddress}`);
        console.log('   Pool: Slush Pool (Direct Bitcoin)');
        console.log(`   Worker: ${this.workerName}`);
        console.log('   Algorithm: SHA-256d');
        console.log('');
        
        console.log('🌐 CLOUD RUN SERVICE STATUS:');
        console.log(`   Service: ${cloudRunStatus.status}`);
        console.log(`   URL: ${this.serviceUrl}`);
        console.log('   Instances: 10-2500 auto-scaling');
        console.log('   Resources: 8GB RAM, 4 CPU per instance');
        console.log('');
        
        console.log('📊 MINING PERFORMANCE:');
        const hourlyRate = this.totalEarned / ((Date.now() - this.startTime) / (1000 * 60 * 60));
        const dailyProjection = hourlyRate * 24;
        console.log(`   Current Rate: ${this.formatBTC(hourlyRate)}/hour`);
        console.log(`   Daily Projection: ${this.formatBTC(dailyProjection)} (${this.formatUSD(dailyProjection * btcPrice)})`);
        console.log(`   BTC Price: ${this.formatUSD(btcPrice)}`);
        console.log('');
        
        // Status indicators
        if (cloudRunStatus.status === 'RUNNING') {
            console.log('✅ Mining Service: ACTIVE');
        } else {
            console.log('❌ Mining Service: ' + cloudRunStatus.status);
        }
        
        if (balance > this.initialBalance) {
            console.log('✅ Bitcoin Accumulation: CONFIRMED');
        } else {
            console.log('⏳ Bitcoin Accumulation: Pending (typical 1-24 hour delay)');
        }
        
        console.log('');
        console.log('🎯 NEXT UPDATE IN 30 SECONDS...');
    }

    async startMonitoring() {
        console.log('🚀 Starting real-time Bitcoin mining monitor...');
        console.log('');
        
        // Initial status
        await this.displayStatus();
        
        // Update every 30 seconds
        setInterval(async () => {
            await this.displayStatus();
        }, 30000);
    }
}

// Start monitoring
const monitor = new BitcoinMiningMonitor();
monitor.startMonitoring();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Bitcoin mining monitor stopped.');
    console.log(`💰 Final Balance: ${monitor.lastBalance.toFixed(8)} BTC`);
    console.log(`📊 Total Runtime: ${monitor.formatUptime()}`);
    process.exit(0);
});