#!/usr/bin/env node

/**
 * Secret Inventory Audit Script
 * Part of PR #9 - Complete Secret Management Migration
 * 
 * This script audits the entire integration-gateway codebase to find:
 * 1. Hardcoded API keys, tokens, passwords
 * 2. process.env.* references
 * 3. Generates a CSV inventory for Secret Manager migration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SECRET_PATTERNS = [
    // API Keys and Tokens
    { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{48}/g, type: 'API_KEY' },
    { name: 'Anthropic API Key', pattern: /sk-ant-[a-zA-Z0-9-]{95,}/g, type: 'API_KEY' },
    { name: 'ElevenLabs API Key', pattern: /[a-f0-9]{32}/g, type: 'API_KEY' },
    { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/g, type: 'TOKEN' },
    { name: 'Generic API Key', pattern: /[A-Za-z0-9]{32,}/g, type: 'GENERIC_KEY' },
    
    // Connection Strings
    { name: 'MongoDB URI', pattern: /mongodb:\/\/[^\s"']+/g, type: 'CONNECTION_STRING' },
    { name: 'PostgreSQL URI', pattern: /postgresql:\/\/[^\s"']+/g, type: 'CONNECTION_STRING' },
    { name: 'Redis URI', pattern: /redis:\/\/[^\s"']+/g, type: 'CONNECTION_STRING' },
    
    // Environment Variable References
    { name: 'Process Env', pattern: /process\.env\.[A-Z_][A-Z0-9_]*/g, type: 'ENV_VAR' },
    
    // Specific patterns from previous findings
    { name: 'Cloudflare Token', pattern: /[a-f0-9]{40}/g, type: 'TOKEN' },
    { name: 'JWT Secret', pattern: /(jwt|secret|key)[\s]*[:=][\s]*['"][^'"]{20,}['"]/gi, type: 'SECRET' },
];

const EXCLUDE_DIRS = [
    'node_modules', 
    'dist', 
    '.git', 
    'logs', 
    'backup',
    '.wrangler',
    'archives',
    'docs'
];

const EXCLUDE_EXTENSIONS = [
    '.log', 
    '.png', 
    '.jpg', 
    '.jpeg', 
    '.gif', 
    '.svg', 
    '.pdf', 
    '.zip', 
    '.tar.gz',
    '.min.js',
    '.min.css'
];

class SecretInventory {
    constructor() {
        this.findings = [];
        this.stats = {
            filesScanned: 0,
            secretsFound: 0,
            envVarsFound: 0
        };
    }

    shouldSkipFile(filePath) {
        // Skip excluded directories
        if (EXCLUDE_DIRS.some(dir => filePath.includes(`/${dir}/`) || filePath.endsWith(`/${dir}`))) {
            return true;
        }
        
        // Skip excluded extensions
        if (EXCLUDE_EXTENSIONS.some(ext => filePath.endsWith(ext))) {
            return true;
        }
        
        return false;
    }

    scanFile(filePath) {
        if (this.shouldSkipFile(filePath)) {
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            this.stats.filesScanned++;

            SECRET_PATTERNS.forEach(pattern => {
                lines.forEach((line, lineNumber) => {
                    const matches = line.match(pattern.pattern);
                    if (matches) {
                        matches.forEach(match => {
                            // Filter out common false positives
                            if (this.isValidSecret(match, pattern.type, line)) {
                                this.findings.push({
                                    file: filePath,
                                    line: lineNumber + 1,
                                    type: pattern.type,
                                    pattern: pattern.name,
                                    value: this.maskSecret(match),
                                    context: line.trim(),
                                    purpose: this.guessPurpose(line, filePath),
                                    secretName: this.generateSecretName(match, pattern.name, filePath)
                                });
                                
                                if (pattern.type === 'ENV_VAR') {
                                    this.stats.envVarsFound++;
                                } else {
                                    this.stats.secretsFound++;
                                }
                            }
                        });
                    }
                });
            });
        } catch (error) {
            console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
        }
    }

    isValidSecret(match, type, line) {
        // Filter out obvious false positives
        const falsePositives = [
            'example', 'placeholder', 'your-api-key', 'your_secret_here',
            'TODO', 'FIXME', 'localhost', '127.0.0.1', 'test', 'demo',
            'sk-example', 'sk-test', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
        ];
        
        if (falsePositives.some(fp => match.toLowerCase().includes(fp.toLowerCase()))) {
            return false;
        }
        
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('*')) {
            return false;
        }
        
        // Skip obvious documentation
        if (line.includes('README') || line.includes('documentation') || line.includes('.md')) {
            return false;
        }
        
        return true;
    }

    maskSecret(secret) {
        if (secret.length <= 8) return secret;
        return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
    }

    guessPurpose(line, filePath) {
        const lineUpper = line.toUpperCase();
        
        if (lineUpper.includes('OPENAI')) return 'OpenAI API Access';
        if (lineUpper.includes('ANTHROPIC')) return 'Anthropic Claude API Access';
        if (lineUpper.includes('ELEVENLABS')) return 'ElevenLabs Voice Synthesis';
        if (lineUpper.includes('GITHUB')) return 'GitHub API Access';
        if (lineUpper.includes('MONGODB')) return 'MongoDB Database Connection';
        if (lineUpper.includes('DATABASE')) return 'Database Connection';
        if (lineUpper.includes('JWT')) return 'JWT Token Signing';
        if (lineUpper.includes('SESSION')) return 'Session Management';
        if (lineUpper.includes('CLOUDFLARE')) return 'Cloudflare API Access';
        if (lineUpper.includes('OAUTH')) return 'OAuth Authentication';
        
        // Guess from filename
        const fileName = path.basename(filePath).toLowerCase();
        if (fileName.includes('auth')) return 'Authentication';
        if (fileName.includes('config')) return 'Configuration';
        if (fileName.includes('deploy')) return 'Deployment Configuration';
        if (fileName.includes('test')) return 'Testing Configuration';
        
        return 'Unknown - Requires Manual Review';
    }

    generateSecretName(value, patternName, filePath) {
        const fileName = path.basename(filePath, path.extname(filePath));
        const purpose = this.guessPurpose(value, filePath);
        
        let baseName = 'int-gw/';
        
        if (purpose.includes('OpenAI')) {
            baseName += 'openai-api-key';
        } else if (purpose.includes('Anthropic')) {
            baseName += 'anthropic-api-key';
        } else if (purpose.includes('ElevenLabs')) {
            baseName += 'elevenlabs-api-key';
        } else if (purpose.includes('GitHub')) {
            baseName += 'github-token';
        } else if (purpose.includes('MongoDB')) {
            baseName += 'mongodb-uri';
        } else if (purpose.includes('JWT')) {
            baseName += 'jwt-secret';
        } else if (purpose.includes('Session')) {
            baseName += 'session-secret';
        } else if (purpose.includes('Cloudflare')) {
            baseName += 'cloudflare-token';
        } else {
            baseName += fileName.toLowerCase() + '-secret';
        }
        
        return baseName;
    }

    scanDirectory(dirPath) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        entries.forEach(entry => {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                if (!this.shouldSkipFile(fullPath)) {
                    this.scanDirectory(fullPath);
                }
            } else if (entry.isFile()) {
                this.scanFile(fullPath);
            }
        });
    }

    generateCSVReport() {
        const csvHeader = 'File,Line,Type,Pattern,Value,Context,Purpose,Suggested Secret Name\n';
        const csvRows = this.findings.map(finding => 
            `"${finding.file}","${finding.line}","${finding.type}","${finding.pattern}","${finding.value}","${finding.context.replace(/"/g, '""')}","${finding.purpose}","${finding.secretName}"`
        ).join('\n');
        
        return csvHeader + csvRows;
    }

    generateSummaryReport() {
        const summary = {
            totalFindings: this.findings.length,
            stats: this.stats,
            byType: {},
            byFile: {},
            topSecrets: []
        };

        // Group by type
        this.findings.forEach(finding => {
            summary.byType[finding.type] = (summary.byType[finding.type] || 0) + 1;
            summary.byFile[finding.file] = (summary.byFile[finding.file] || 0) + 1;
        });

        // Find files with most secrets
        summary.topFiles = Object.entries(summary.byFile)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return summary;
    }

    async run() {
        console.log('🔍 Starting Secret Inventory Audit...');
        console.log('📂 Scanning directory:', process.cwd());
        
        const startTime = Date.now();
        this.scanDirectory(process.cwd());
        const endTime = Date.now();
        
        console.log(`\n📊 Audit Complete in ${endTime - startTime}ms`);
        console.log(`📄 Files scanned: ${this.stats.filesScanned}`);
        console.log(`🔑 Secrets found: ${this.stats.secretsFound}`);
        console.log(`🌍 Environment variables found: ${this.stats.envVarsFound}`);
        console.log(`📍 Total findings: ${this.findings.length}`);

        // Generate reports
        const csvReport = this.generateCSVReport();
        const summaryReport = this.generateSummaryReport();

        // Save reports
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const csvPath = `./scripts/secret-audit-${timestamp}.csv`;
        const summaryPath = `./scripts/secret-audit-summary-${timestamp}.json`;

        fs.writeFileSync(csvPath, csvReport);
        fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));

        console.log(`\n📝 CSV Report saved: ${csvPath}`);
        console.log(`📊 Summary Report saved: ${summaryPath}`);

        // Display top findings
        console.log('\n🔥 Top Files with Secrets:');
        summaryReport.topFiles.forEach(([file, count]) => {
            console.log(`   ${count.toString().padStart(3)} secrets: ${file}`);
        });

        console.log('\n🏷️  Findings by Type:');
        Object.entries(summaryReport.byType).forEach(([type, count]) => {
            console.log(`   ${count.toString().padStart(3)} ${type}`);
        });

        return {
            findings: this.findings,
            summary: summaryReport,
            csvPath,
            summaryPath
        };
    }
}

// Run the audit if called directly
if (require.main === module) {
    const audit = new SecretInventory();
    audit.run().catch(console.error);
}

module.exports = SecretInventory;