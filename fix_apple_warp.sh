#!/bin/bash
# Fix Apple ID authentication with WARP
# This script adds Apple services to WARP exclusions

echo "🍎 Configuring WARP to allow Apple services..."

# Add Apple domains to split tunnel exclusions
warp-cli tunnel host add appleid.apple.com
warp-cli tunnel host add idmsa.apple.com
warp-cli tunnel host add gsa.apple.com
warp-cli tunnel host add apple.com
warp-cli tunnel host add icloud.com
warp-cli tunnel host add me.com
warp-cli tunnel host add mac.com
warp-cli tunnel host add swcdn.apple.com
warp-cli tunnel host add swscan.apple.com
warp-cli tunnel host add swquery.apple.com
warp-cli tunnel host add swdownload.apple.com
warp-cli tunnel host add apps.apple.com
warp-cli tunnel host add iosapps.itunes.apple.com

echo "✅ Apple services excluded from WARP tunnel"
echo "🔌 Reconnecting WARP..."
warp-cli connect

echo "🎉 WARP reconnected with Apple service exclusions!"
echo "📱 Try your Apple ID login now!"