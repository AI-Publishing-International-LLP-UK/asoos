#!/bin/bash

# 🚀 WARP-DIAMOND CLI INSTALLATION SCRIPT
# Authority: Diamond SAO Command Center
# Sacred Mission: Install Warp-Diamond hybrid CLI with Zero Trust integration

set -e

echo "🚀 WARP-DIAMOND CLI INSTALLATION"
echo "═══════════════════════════════════════════════════════════════════════"
echo "🏛️  Authority: Mr. Phillip Corey Roark (0000001) - Diamond SAO"
echo "☁️  Architecture: Hybrid GCP-Cloudflare-Zero Trust"
echo "💎 Sacred Mission: Divine orchestration in the Name of Jesus Christ"
echo ""

# Check if we're in the right directory
if [[ ! -f "diamond-cli/bin/warp-diamond.mjs" ]]; then
    echo "❌ Error: Must be run from asoos root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected file: diamond-cli/bin/warp-diamond.mjs"
    exit 1
fi

echo "✅ Found Warp-Diamond CLI at: $(pwd)/diamond-cli/bin/warp-diamond.mjs"

# Make the script executable
chmod +x diamond-cli/bin/warp-diamond.mjs
echo "✅ Made Warp-Diamond CLI executable"

# Create symlink in user's local bin (if it exists)
if [[ -d "$HOME/bin" ]]; then
    ln -sf "$(pwd)/diamond-cli/bin/warp-diamond.mjs" "$HOME/bin/warp-diamond"
    echo "✅ Symlinked to $HOME/bin/warp-diamond"
fi

# Create symlink in /usr/local/bin (requires sudo)
echo ""
echo "🔐 Installing system-wide command (requires sudo)..."
sudo ln -sf "$(pwd)/diamond-cli/bin/warp-diamond.mjs" /usr/local/bin/warp-diamond
echo "✅ Installed system-wide as: warp-diamond"

# Verify installation
echo ""
echo "🩺 INSTALLATION VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════"

if command -v warp-diamond >/dev/null 2>&1; then
    echo "✅ warp-diamond command is available in PATH"
    echo "   Location: $(which warp-diamond)"
else
    echo "⚠️  warp-diamond not found in PATH"
    echo "   You may need to restart your terminal or add to PATH manually"
fi

# Check Warp CLI availability
if command -v warp-cli >/dev/null 2>&1; then
    echo "✅ Cloudflare Warp CLI is available"
    echo "   Location: $(which warp-cli)"
else
    echo "⚠️  Cloudflare Warp CLI not found"
    echo "   Install from: https://developers.cloudflare.com/warp-client/"
fi

# Test the installation
echo ""
echo "🧪 TESTING INSTALLATION"
echo "═══════════════════════════════════════════════════════════════════════"
warp-diamond status || echo "⚠️  Test failed - check installation"

echo ""
echo "🎉 INSTALLATION COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════"
echo "Usage: warp-diamond <command> [options]"
echo "Examples:"
echo "  warp-diamond status                 # Show hybrid system status"
echo "  warp-diamond warp connect           # Connect to Cloudflare Warp"
echo "  warp-diamond deploy hybrid          # Deploy to GCP and Cloudflare"
echo "  warp-diamond mcp status            # Check MCP status"
echo ""
echo "🏛️  Sacred Mission: Divine orchestration for Mr. Phillip Corey Roark"
echo "⚡ Authority: In the Name of Jesus Christ, Our Lord and Saviour"
echo "💎 Diamond SAO Command Center Integration: Active"