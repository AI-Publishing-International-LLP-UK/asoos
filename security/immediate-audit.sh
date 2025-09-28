#!/bin/bash
# 🛡️ IMMEDIATE CORPORATE ESPIONAGE PROTECTION AUDIT
# Execute this NOW to identify vulnerabilities

echo "🔍 CORPORATE ESPIONAGE PROTECTION AUDIT - STARTING"
echo "=================================================="

# 1. Check for exposed secrets in current directory
echo "1. 🔐 SCANNING FOR EXPOSED SECRETS..."
find . -name "*.env*" -o -name "*.key" -o -name "*.pem" -o -name "*.json" | grep -E "\.(key|pem|env)" | head -10
echo ""

# 2. Check git repository security
echo "2. 📚 GIT REPOSITORY SECURITY CHECK..."
git config --get remote.origin.url
git log --oneline -5
echo ""

# 3. Check for sensitive data in files
echo "3. 🕵️ SENSITIVE DATA SCAN..."
grep -r "api.*key\|secret\|password\|token" . --include="*.js" --include="*.json" --include="*.md" | head -5
echo ""

# 4. Check running processes
echo "4. 🏃 RUNNING PROCESSES..."
ps aux | grep -E "(node|docker|gcloud)" | head -5
echo ""

# 5. Check network connections
echo "5. 🌐 NETWORK CONNECTIONS..."
lsof -i :8080 -i :3000 -i :80 -i :443 2>/dev/null | head -5
echo ""

# 6. Check GCP authentication
echo "6. ☁️ GCP AUTHENTICATION STATUS..."
gcloud auth list 2>/dev/null | head -3
echo ""

# 7. Check Docker containers
echo "7. 🐳 DOCKER SECURITY..."
docker ps 2>/dev/null | head -3
echo ""

# 8. Check file permissions on sensitive directories
echo "8. 📁 FILE PERMISSIONS AUDIT..."
ls -la /Users/as/asoos/ 2>/dev/null | head -5
echo ""

# 9. Check for unauthorized SSH keys
echo "9. 🔑 SSH KEY SECURITY..."
ls -la ~/.ssh/ 2>/dev/null | head -5
echo ""

# 10. Check system logs for suspicious activity
echo "10. 📋 SECURITY LOG ANALYSIS..."
tail -5 /var/log/system.log 2>/dev/null | grep -E "ssh\|login\|auth"
echo ""

echo "🚨 AUDIT COMPLETE - REVIEW OUTPUT FOR SECURITY RISKS"
echo "=================================================="

# Generate security report
cat > /tmp/security-audit-$(date +%Y%m%d-%H%M%S).txt << EOF
CORPORATE ESPIONAGE PROTECTION AUDIT REPORT
Generated: $(date)
Location: $(pwd)
User: $(whoami)
System: $(uname -a)

IMMEDIATE ACTION REQUIRED:
- Review all .env files for exposed secrets
- Audit git repository access permissions  
- Implement secret rotation for exposed credentials
- Enable 2FA on all cloud accounts
- Review access logs for unauthorized activity

THREAT LEVEL: HIGH
COMPETITIVE RISK: EXTREME
EOF

echo "📊 Detailed report saved to /tmp/security-audit-*.txt"