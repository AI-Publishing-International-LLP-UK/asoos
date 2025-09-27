#!/bin/bash

# AMBASSADOR REFERRAL SYSTEM LAUNCHER
# High-speed automated upward communication system
#
# @author AI Publishing International LLP
# @version 1.0.0 - Professional Edition

echo ""
echo "🚀 STARTING AMBASSADOR REFERRAL SYSTEM"
echo "==============================================="
echo ""

# Set working directory
cd "$(dirname "$0")"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js to run the Ambassador System."
    exit 1
fi

# Check if required dependencies exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install express
    npm install crypto
fi

echo "🔧 CONFIGURATION:"
echo "   • Service: Ambassador Referral System"
echo "   • Port: 8084"
echo "   • Features: One-click executive referrals"
echo "   • QMM NFT: Ambassador edition"
echo "   • Integration: PandaDoc/DocuSign contracts"
echo ""

echo "👔 AMBASSADOR CAPABILITIES:"
echo "   ✓ Senior executive referrals"
echo "   ✓ Legal department packages"
echo "   ✓ Pre-written professional communications"
echo "   ✓ Automated contract generation"
echo "   ✓ Company-specific customization"
echo "   ✓ QMM NFT membership benefits"
echo ""

# Start the Ambassador Referral System
echo "🌐 Starting Ambassador Referral System..."
echo ""

# Run the ambassador referral system
node services/ambassador-referral-system.js

# If the service exits, show message
echo ""
echo "🛑 Ambassador Referral System has stopped."
echo "   To restart: ./start-ambassador-system.sh"
echo ""