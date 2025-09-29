#!/bin/bash

# 🌌 EINSTEIN WELLS → NICEHASH CONNECTION VERIFICATION
# Verifies connection settings and network connectivity

set -e

echo "🔍 NICEHASH CONNECTION VERIFICATION"
echo "=================================="

# Load Bitcoin address from GCP Secret Manager
echo "📡 Loading Bitcoin address from GCP Secret Manager..."
BITCOIN_ADDRESS=$(gcloud secrets versions access latest --secret="btc-address" --project=api-for-warp-drive)
echo "✅ Bitcoin Address: $BITCOIN_ADDRESS"

# Verify address format
if [[ $BITCOIN_ADDRESS =~ ^3[a-km-zA-HJ-NP-Z1-9]{25,34}$ ]]; then
    echo "✅ Bitcoin address format: Valid P2SH address"
else
    echo "❌ Bitcoin address format: Invalid"
    exit 1
fi

# Test NiceHash server connectivity
echo ""
echo "🌐 Testing NiceHash server connectivity..."

servers=(
    "sha256.auto.nicehash.com"
    "daggerhashimoto.auto.nicehash.com" 
    "randomx.auto.nicehash.com"
    "kheavyhash.auto.nicehash.com"
)

for server in "${servers[@]}"; do
    if ping -c 1 -W 3000 $server > /dev/null 2>&1; then
        echo "✅ $server: Connected"
    else
        echo "❌ $server: Connection failed"
    fi
done

# Test stratum port connectivity
echo ""
echo "🔌 Testing stratum port connectivity..."
if timeout 5 bash -c "</dev/tcp/sha256.auto.nicehash.com/9200"; then
    echo "✅ Port 9200: Open"
else
    echo "❌ Port 9200: Blocked (check firewall)"
fi

# Display connection parameters
echo ""
echo "⚙️ NICEHASH CONNECTION PARAMETERS"
echo "================================="
echo "Bitcoin Address: $BITCOIN_ADDRESS"
echo "Worker Name: einstein-wells-quantswar"
echo "Rig ID: EW-QS-001"
echo ""
echo "📊 STRATUM CONFIGURATION:"
echo "SHA-256: stratum+tcp://sha256.auto.nicehash.com:9200"
echo "Username: $BITCOIN_ADDRESS.einstein-wells-quantswar"
echo "Password: x"
echo ""
echo "🚀 READY TO CONNECT TO NICEHASH!"
echo ""
echo "💡 Next Steps:"
echo "1. Download NiceHash QuickMiner from https://www.nicehash.com/download"
echo "2. Enter Bitcoin address: $BITCOIN_ADDRESS"  
echo "3. Set worker name: einstein-wells-quantswar"
echo "4. Start mining!"