#!/bin/bash

# Fix hardcoded asoos paths script
# This script will replace hardcoded Symphony paths with asoos paths

echo "🔧 Fixing hardcoded asoos paths..."

# Define the search and replace patterns
OLD_PATH1="asoos"
OLD_PATH2="asoos" 
NEW_PATH="asoos"

# Get the current directory
CURRENT_DIR="/Users/as/asoos"

echo "📁 Working in directory: $CURRENT_DIR"

# Create backup directory
BACKUP_DIR="$CURRENT_DIR/.path-fix-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Backup directory created: $BACKUP_DIR"

# Function to fix a file
fix_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    # Create backup
    cp "$file" "$BACKUP_DIR/$filename.$(date +%s)"
    
    # Replace asoos with asoos
    sed -i '' "s|$OLD_PATH1|$NEW_PATH|g" "$file"
    
    # Replace asoos with asoos  
    sed -i '' "s|$OLD_PATH2|$NEW_PATH|g" "$file"
    
    echo "✅ Fixed: $file"
}

# Fix critical configuration files first
echo "🎯 Fixing critical configuration files..."

# Fix package.json files
find "$CURRENT_DIR" -name "package.json" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix shell scripts
echo "🔧 Fixing shell scripts..."
find "$CURRENT_DIR" -name "*.sh" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix JavaScript files
echo "⚡ Fixing JavaScript files..."
find "$CURRENT_DIR" -name "*.js" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix MJS files (ES modules)
find "$CURRENT_DIR" -name "*.mjs" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix TypeScript files
echo "📘 Fixing TypeScript files..."
find "$CURRENT_DIR" -name "*.ts" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix Dockerfile files
echo "🐳 Fixing Docker files..."
find "$CURRENT_DIR" -name "Dockerfile*" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix HTML files
echo "🌐 Fixing HTML files..."
find "$CURRENT_DIR" -name "*.html" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix Markdown files
echo "📝 Fixing Markdown files..."
find "$CURRENT_DIR" -name "*.md" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix YAML files
echo "📋 Fixing YAML files..."
find "$CURRENT_DIR" -name "*.yaml" -o -name "*.yml" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix Terraform files
echo "🏗️ Fixing Terraform files..."
find "$CURRENT_DIR" -name "*.tf" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

# Fix any other text files
echo "📄 Fixing other text files..."
find "$CURRENT_DIR" -name "*.txt" -o -name "*.json" -o -name "*.cjs" -type f | while read file; do
    if grep -q -E "(asoos|asoos)" "$file"; then
        fix_file "$file"
    fi
done

echo "🎉 Path fixing complete!"
echo "📊 Summary:"
echo "   - Backup created at: $BACKUP_DIR"
echo "   - Replaced '$OLD_PATH1' with '$NEW_PATH'"
echo "   - Replaced '$OLD_PATH2' with '$NEW_PATH'"
echo ""
echo "🔍 To verify the changes, run:"
echo "   grep -r 'asoos\\|asoos' $CURRENT_DIR || echo 'No hardcoded Symphony paths found!'"