#!/usr/bin/env node

/**
 * Efficient Secret Scanner for Integration Gateway
 * Handles large volumes of files and produces actionable results
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EfficientSecretScanner {
    constructor() {
        // High-confidence secret patterns that are likely real secrets
        this.secretPatterns = [
            // API Keys
            { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{32,}/g, priority: 'HIGH' },
            { name: 'Anthropic API Key', pattern: /sk-ant-[a-zA-Z0-9\-_]{95}/g, priority: 'HIGH' },
            { name: 'Google API Key', pattern: /AIza[0-9A-Za-z\-_]{35}/g, priority: 'HIGH' },
            { name: 'ElevenLabs API Key', pattern: /[a-f0-9]{32}/g, priority: 'MEDIUM' },
            
            // Database URLs
            { name: 'MongoDB URI', pattern: /mongodb(\+srv)?:\/\/[^\s"']+/g, priority: 'HIGH' },
            { name: 'PostgreSQL URI', pattern: /postgresql:\/\/[^\s"']+/g, priority: 'HIGH' },
            { name: 'Redis URI', pattern: /redis:\/\/[^\s"']+/g, priority: 'MEDIUM' },
            
            // OAuth & Tokens
            { name: 'OAuth Token', pattern: /oauth[_-]?token[_-]?[a-zA-Z0-9]{20,}/gi, priority: 'HIGH' },
            { name: 'Bearer Token', pattern: /bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi, priority: 'HIGH' },
            { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9\-_=]+\.[a-zA-Z0-9\-_=]+\.[a-zA-Z0-9\-_.+\/=]*/g, priority: 'HIGH' },
            
            // Cloud Provider Keys
            { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g, priority: 'HIGH' },
            { name: 'GCP Service Account Key', pattern: /"private_key":\s*"[^"]+"/g, priority: 'HIGH' },
            
            // Common environment variables that may contain secrets
            { name: 'Secret Env Var', pattern: /(api_key|secret_key|private_key|password|token)\s*[=:]\s*["']?[a-zA-Z0-9\-_\.\+\/=]{12,}["']?/gi, priority: 'MEDIUM' }
        ];

        // Files to always skip
        this.skipPatterns = [
            /node_modules/,
            /\.git/,
            /\.DS_Store/,
            /\.log$/,
            /\.lock$/,
            /package-lock\.json$/,
            /\.png$/,
            /\.jpg$/,
            /\.jpeg$/,
            /\.gif$/,
            /\.svg$/,
            /\.ico$/,
            /\.woff/,
            /\.ttf$/,
            /\.eot$/
        ];

        // Files that are likely to contain configuration or secrets
        this.priorityFiles = [
            /\.env/,
            /config\.(js|ts|json|yaml|yml)$/,
            /secrets\.(js|ts|json|yaml|yml)$/,
            /\.config\.(js|ts)$/,
            /app\.(js|ts)$/,
            /server\.(js|ts)$/,
            /index\.(js|ts)$/
        ];

        this.findings = [];
        this.stats = {
            filesScanned: 0,
            secretsFound: 0,
            highPrioritySecrets: 0,
            uniqueSecrets: new Set()
        };
    }

    shouldSkipFile(filePath) {
        return this.skipPatterns.some(pattern => pattern.test(filePath));
    }

    isPriorityFile(filePath) {
        return this.priorityFiles.some(pattern => pattern.test(path.basename(filePath)));
    }

    scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const findings = [];

            for (const pattern of this.secretPatterns) {
                const matches = content.match(pattern.pattern);
                if (matches) {
                    for (const match of matches) {
                        // Create a hash for deduplication
                        const hash = crypto.createHash('md5').update(match).digest('hex');
                        
                        if (!this.stats.uniqueSecrets.has(hash)) {
                            this.stats.uniqueSecrets.add(hash);
                            
                            findings.push({
                                file: filePath,
                                line: this.getLineNumber(content, match),
                                type: pattern.name,
                                priority: pattern.priority,
                                value: match.length > 50 ? match.substring(0, 47) + '...' : match,
                                hash: hash,
                                isPriorityFile: this.isPriorityFile(filePath)
                            });

                            this.stats.secretsFound++;
                            if (pattern.priority === 'HIGH') {
                                this.stats.highPrioritySecrets++;
                            }
                        }
                    }
                }
            }

            return findings;
        } catch (error) {
            console.warn(`Warning: Could not scan ${filePath}: ${error.message}`);
            return [];
        }
    }

    getLineNumber(content, searchText) {
        const lines = content.substring(0, content.indexOf(searchText)).split('\n');
        return lines.length;
    }

    scanDirectory(dirPath, maxDepth = 5, currentDepth = 0) {
        if (currentDepth > maxDepth) return;

        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (this.shouldSkipFile(fullPath)) continue;

                if (entry.isDirectory()) {
                    this.scanDirectory(fullPath, maxDepth, currentDepth + 1);
                } else if (entry.isFile()) {
                    const findings = this.scanFile(fullPath);
                    this.findings.push(...findings);
                    this.stats.filesScanned++;
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
        }
    }

    generateReport() {
        // Sort findings by priority and file priority
        this.findings.sort((a, b) => {
            if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
            if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
            if (a.isPriorityFile && !b.isPriorityFile) return -1;
            if (b.isPriorityFile && !a.isPriorityFile) return 1;
            return a.file.localeCompare(b.file);
        });

        console.log('\n🔍 INTEGRATION GATEWAY SECRET SCAN RESULTS');
        console.log('=' .repeat(60));
        console.log(`📊 Statistics:`);
        console.log(`   Files Scanned: ${this.stats.filesScanned}`);
        console.log(`   Unique Secrets Found: ${this.stats.uniqueSecrets.size}`);
        console.log(`   High Priority Secrets: ${this.stats.highPrioritySecrets}`);
        console.log(`   Total Findings: ${this.findings.length}`);

        // Group findings by file for easier remediation
        const fileGroups = {};
        this.findings.forEach(finding => {
            if (!fileGroups[finding.file]) {
                fileGroups[finding.file] = [];
            }
            fileGroups[finding.file].push(finding);
        });

        console.log(`\n🔥 FILES REQUIRING IMMEDIATE ATTENTION (${Object.keys(fileGroups).length} files):`);
        console.log('=' .repeat(60));

        Object.entries(fileGroups).forEach(([file, secrets]) => {
            const highPriorityCount = secrets.filter(s => s.priority === 'HIGH').length;
            const priorityIndicator = highPriorityCount > 0 ? '🚨 HIGH' : '⚠️  MEDIUM';
            
            console.log(`\n${priorityIndicator} ${file.replace(process.cwd(), '.')}`);
            console.log(`   Secrets: ${secrets.length} (${highPriorityCount} high priority)`);
            
            // Show first few secrets as examples
            secrets.slice(0, 3).forEach(secret => {
                console.log(`   Line ${secret.line}: ${secret.type} - ${secret.value}`);
            });
            
            if (secrets.length > 3) {
                console.log(`   ... and ${secrets.length - 3} more`);
            }
        });

        // Generate action plan
        console.log(`\n🎯 RECOMMENDED ACTION PLAN:`);
        console.log('=' .repeat(60));

        const highPriorityFiles = Object.entries(fileGroups)
            .filter(([file, secrets]) => secrets.some(s => s.priority === 'HIGH'))
            .map(([file]) => file);

        console.log(`1. IMMEDIATE: Address ${highPriorityFiles.length} files with HIGH priority secrets`);
        console.log(`2. Move secrets to Google Secret Manager using your automated KMS system`);
        console.log(`3. Update code to use getSecret() calls instead of hardcoded values`);
        console.log(`4. Rotate all exposed secrets in your KMS system`);
        console.log(`5. Test deployment in staging environment (mocoa us-west1-b)`);

        // Create files for automated processing
        this.generateJSONReport();
        this.generateCleanupScript();
    }

    generateJSONReport() {
        const report = {
            timestamp: new Date().toISOString(),
            stats: {
                ...this.stats,
                uniqueSecrets: this.stats.uniqueSecrets.size
            },
            findings: this.findings
        };

        fs.writeFileSync('./scripts/secret-scan-results.json', JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed results saved to: scripts/secret-scan-results.json`);
    }

    generateCleanupScript() {
        const highPriorityFiles = [...new Set(
            this.findings
                .filter(f => f.priority === 'HIGH')
                .map(f => f.file.replace(process.cwd(), '.'))
        )];

        const script = `#!/bin/bash
# Auto-generated cleanup script for Integration Gateway secrets
# Generated: ${new Date().toISOString()}

echo "🚨 HIGH PRIORITY FILES REQUIRING IMMEDIATE ATTENTION:"
echo "Files: ${highPriorityFiles.length}"

${highPriorityFiles.map(file => `echo "   ${file}"`).join('\n')}

echo ""
echo "Next steps:"
echo "1. Review each file manually"
echo "2. Move secrets to Google Secret Manager"
echo "3. Update code to use getSecret() helper"
echo "4. Rotate secrets in KMS system"
echo "5. Test in staging environment"
`;

        fs.writeFileSync('./scripts/cleanup-secrets.sh', script);
        fs.chmodSync('./scripts/cleanup-secrets.sh', '755');
        console.log(`📋 Cleanup script saved to: scripts/cleanup-secrets.sh`);
    }

    async run() {
        console.log('🔍 Starting efficient secret scan...');
        console.log(`📂 Scanning directory: ${process.cwd()}`);
        
        const startTime = Date.now();
        this.scanDirectory(process.cwd());
        const endTime = Date.now();

        console.log(`⏱️  Scan completed in ${endTime - startTime}ms`);
        this.generateReport();
    }
}

// Run the scanner
if (require.main === module) {
    const scanner = new EfficientSecretScanner();
    scanner.run().catch(console.error);
}

module.exports = EfficientSecretScanner;