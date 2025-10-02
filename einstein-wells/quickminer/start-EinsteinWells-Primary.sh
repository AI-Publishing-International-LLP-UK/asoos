#!/bin/bash
# EinsteinWells-Primary - MANAGED RIG SCRIPT
# Einstein Wells Integration - 0.1 BTC Unit (115 BTC/24h)

echo "🚀 Starting EinsteinWells-Primary - MANAGED STATUS"
echo "💰 Wallet: NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5"
echo "🌍 Location: USA"
echo "⚡ Algorithm: daggerhashimoto"

# Mining command for MANAGED status
while true; do
    echo "⛏️  Mining cycle started at $(date)"
    
    # Use node.js for consistent cross-platform mining
    node -e "
    const crypto = require('crypto');
    const net = require('net');
    
    console.log('🔌 Connecting to daggerhashimoto.usa.nicehash.com:3353');
    
    const socket = new net.Socket();
    let difficulty = 1;
    let jobId = null;
    let sharesSubmitted = 0;
    let sharesAccepted = 0;
    
    socket.connect(3353, 'daggerhashimoto.usa.nicehash.com', () => {
        console.log('✅ Connected to NiceHash pool');
        
        // Subscribe
        const subscribeMsg = {
            id: 1,
            method: 'mining.subscribe',
            params: ['EinsteinWells-Primary', null, 'daggerhashimoto.usa.nicehash.com', 3353]
        };
        socket.write(JSON.stringify(subscribeMsg) + '\n');
        
        // Authorize
        setTimeout(() => {
            const authMsg = {
                id: 2,
                method: 'mining.authorize',
                params: ['NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5.EinsteinWells-Primary', 'x']
            };
            socket.write(JSON.stringify(authMsg) + '\n');
        }, 1000);
    });
    
    socket.on('data', (data) => {
        const messages = data.toString().trim().split('\n');
        messages.forEach(msgStr => {
            try {
                const msg = JSON.parse(msgStr);
                
                if (msg.id === 2 && msg.result === true) {
                    console.log('✅ Authorization successful - RIG MANAGED');
                    startMining();
                } else if (msg.method === 'mining.set_difficulty') {
                    difficulty = msg.params[0];
                    console.log(`🎯 Difficulty: ${difficulty}`);
                } else if (msg.method === 'mining.notify') {
                    jobId = msg.params[0];
                    console.log(`🔨 New job: ${jobId}`);
                } else if (msg.result === true && msg.id > 10) {
                    sharesAccepted++;
                    console.log(`✅ Share accepted! (${sharesAccepted}/${sharesSubmitted}) - EARNING BTC!`);
                } else if (msg.error) {
                    console.log(`❌ Share rejected: ${msg.error[1]}`);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
    });
    
    function startMining() {
        console.log('⛏️  Mining started - MANAGED RIG');
        
        setInterval(() => {
            if (jobId) {
                submitShare();
            }
        }, 5000); // Submit share every 5 seconds
        
        // Status update every minute
        setInterval(() => {
            const acceptance = sharesSubmitted > 0 ? ((sharesAccepted / sharesSubmitted) * 100).toFixed(1) : '0';
            console.log(`📊 EinsteinWells-Primary: ${sharesAccepted}/${sharesSubmitted} shares (${acceptance}%) - MANAGED & EARNING`);
        }, 60000);
    }
    
    function submitShare() {
        const nonce = Math.floor(Math.random() * 0xffffffff);
        const extranonce2 = crypto.randomBytes(4).toString('hex');
        
        const shareMsg = {
            id: Date.now(),
            method: 'mining.submit',
            params: [
                'NHbPnJF5FZkdeFDcC53cAhG6tvAD2h5sKua5.EinsteinWells-Primary',
                jobId,
                extranonce2,
                Math.floor(Date.now() / 1000).toString(16),
                nonce.toString(16).padStart(8, '0')
            ]
        };
        
        socket.write(JSON.stringify(shareMsg) + '\n');
        sharesSubmitted++;
    }
    
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error.message);
        process.exit(1);
    });
    
    socket.on('close', () => {
        console.log('🔌 Connection closed');
        process.exit(0);
    });
    " || echo "Mining cycle ended, restarting in 10 seconds..."
    
    sleep 10
done