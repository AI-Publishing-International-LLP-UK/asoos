#!/bin/bash

# 🧹 ASOOS System Cleanup Script for Pilots
# Safely deprecates redundant files and creates clean architecture

set -e  # Exit on any error

echo "🚀 ASOOS System Cleanup for Pilots - Starting..."
echo "📋 This will clean up 150+ files down to ~20 essential files"

# Create backup directory with timestamp
BACKUP_DIR="deprecated/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"

# Create clean directory structure
echo "🏗️  Creating clean directory structure..."
mkdir -p {tests,security,docs,scripts,config}

# Phase 1: Backup and remove redundant server files
echo "🚨 Phase 1: Cleaning redundant server files..."

# Keep ONLY /owner-interface/server.js, move others to backup
REDUNDANT_SERVERS=(
    "index.js"
    "server.js" 
    "oauth2-server.js"
    "quick-oauth2-server.js"
    "deploy-package/server.js"
)

for file in "${REDUNDANT_SERVERS[@]}"; do
    if [ -f "$file" ]; then
        echo "   📦 Backing up: $file"
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
    fi
done

# Phase 2: Clean up test and debug files from root
echo "🧪 Phase 2: Organizing test and debug files..."

# Move test files to /tests/
for file in test-*.js debug-*.js fix-*.js; do
    if [ -f "$file" ]; then
        echo "   🔄 Moving to tests/: $file"
        mv "$file" "tests/"
    fi
done

# Phase 3: Remove overwhelming security scan files
echo "🔒 Phase 3: Cleaning security scan files..."
SCAN_COUNT=$(ls scan-*.json 2>/dev/null | wc -l)
if [ "$SCAN_COUNT" -gt 0 ]; then
    echo "   📊 Found $SCAN_COUNT security scan files"
    
    # Create security summary
    echo "# Docker Security Scan Summary" > security/scan-summary.md
    echo "Generated: $(date)" >> security/scan-summary.md
    echo "Total scans: $SCAN_COUNT" >> security/scan-summary.md
    echo "All scans moved to: $BACKUP_DIR" >> security/scan-summary.md
    
    # Move all scan files to backup
    for file in scan-*.json; do
        if [ -f "$file" ]; then
            mv "$file" "$BACKUP_DIR/"
        fi
    done
fi

# Phase 4: Clean up legacy and backup files
echo "🗂️  Phase 4: Removing legacy files..."

LEGACY_PATTERNS=(
    "*-backup.js"
    "*-fixed.js"
    "worker-*.js"
    "asoos-2100-cool-*.js"
    "asoos-apps-*.js"
    "asoos-mobile-*.js"
    "asoos-premium-*.js"
    "asoos-production-*.js"
    "asoos-flyer.js"
    "asoos-worker.js"
)

for pattern in "${LEGACY_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "   🗑️  Removing legacy: $file"
            mv "$file" "$BACKUP_DIR/"
        fi
    done
done

# Phase 5: Clean up various utility scripts
echo "🛠️  Phase 5: Organizing utility scripts..."

UTILITY_SCRIPTS=(
    "cloudflare-*.js"
    "quantum-*.js" 
    "mcp-*.js"
    "diamond-*.js"
    "enhanced-*.js"
    "automated-*.js"
    "*-deployment.js"
    "*-provisioner.js"
    "*-orchestrator.js"
)

for pattern in "${UTILITY_SCRIPTS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [[ "$file" != "rapid-launch-deployment.js" ]]; then
            echo "   📁 Moving to scripts/: $file"
            mv "$file" "scripts/"
        fi
    done
done

# Phase 6: Organize configuration files
echo "⚙️  Phase 6: Organizing configuration files..."

CONFIG_FILES=(
    "*.json"
    "package*.json"
    "*.config.js"
    "eslint*"
)

for pattern in "${CONFIG_FILES[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [[ "$file" != "package.json" ]] && [[ "$file" != "package-lock.json" ]]; then
            # Keep essential configs in root, move others to config/
            case "$file" in
                "firestore.indexes.json"|"deployment*.json"|"*config*.json")
                    echo "   ⚙️  Moving to config/: $file"
                    mv "$file" "config/"
                    ;;
                "*.json")
                    echo "   📦 Moving large JSON to backup: $file"
                    mv "$file" "$BACKUP_DIR/"
                    ;;
            esac
        fi
    done
done

# Phase 7: Create production file summary
echo "📋 Phase 7: Creating production file summary..."

cat > PRODUCTION_FILES_SUMMARY.md << 'EOF'
# 🚀 ASOOS Production Files - Clean Architecture

## ✅ Core Server Files (Essential)
- `/owner-interface/server.js` - Main Express Server
- `/owner-interface/oauth2-middleware.js` - OAuth2 + SallyPort Integration  
- `/owner-interface/light.html` - Production Interface
- `/package.json` - Dependencies
- `/package-lock.json` - Dependency Lock

## 📁 Organized Structure
- `/tests/` - All test files
- `/security/` - Security summaries
- `/scripts/` - Utility scripts
- `/config/` - Configuration files
- `/launch-deployment/` - Production deployment assets
- `/deprecated/` - Backed up old files

## 🔢 File Count Summary
- **Before Cleanup**: 150+ confusing files
- **After Cleanup**: ~20 essential files
- **Backup Location**: `deprecated/YYYYMMDD_HHMMSS/`

## 🎯 Pilot Benefits
✅ Single server entry point
✅ Clear file organization  
✅ No redundant confusion
✅ Production-ready structure
✅ Easy maintenance
EOF

# Final summary
echo ""
echo "🎉 CLEANUP COMPLETE! Summary:"
echo "   📦 Files backed up to: $BACKUP_DIR"
echo "   🗂️  Test files moved to: tests/"
echo "   🔧 Scripts organized in: scripts/"  
echo "   ⚙️  Configs organized in: config/"
echo "   📋 See: PRODUCTION_FILES_SUMMARY.md"
echo ""
echo "✅ Your pilots now have a clean, production-ready architecture!"
echo "⚠️  Backup location: $BACKUP_DIR (safe to remove after testing)"
echo ""
echo "🚀 Next steps:"
echo "   1. Test the cleaned system"
echo "   2. Implement hardened OAuth2 SallyPort integration"  
echo "   3. Deploy to production"

# Count remaining files in root
REMAINING_FILES=$(find . -maxdepth 1 -name "*.js" -o -name "*.json" | wc -l)
echo "📊 Files remaining in root: $REMAINING_FILES (target: ~10-15)"