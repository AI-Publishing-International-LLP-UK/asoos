#!/usr/bin/env node

/**
 * Node.js Version Self-Monitoring System
 * Prevents deprecation failures by automatically monitoring and alerting on Node.js versions
 * Part of infrastructure upgrade initiative
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class NodeVersionMonitor {
    constructor() {
        this.minRequiredVersion = '24.0.0';
        this.warningThreshold = 6; // months before deprecation
        this.projectRoot = process.cwd();
        this.logFile = path.join(this.projectRoot, 'logs', 'node-version-monitor.log');
    }

    async initialize() {
        console.log('🔍 Initializing Node.js Version Self-Monitoring System');
        await this.ensureLogDirectory();
        await this.checkCurrentVersion();
        await this.scanAllPackageFiles();
        await this.setupCronMonitoring();
        console.log('✅ Node.js monitoring system initialized');
    }

    async ensureLogDirectory() {
        const logsDir = path.dirname(this.logFile);
        try {
            await fs.access(logsDir);
        } catch {
            await fs.mkdir(logsDir, { recursive: true });
        }
    }

    async checkCurrentVersion() {
        const currentVersion = process.version;
        const [major, minor] = currentVersion.slice(1).split('.').map(Number);
        
        console.log(`📊 Current Node.js version: ${currentVersion}`);
        
        if (major < 24) {
            this.logAlert('CRITICAL', `Node.js ${currentVersion} is below minimum required v24.0.0`);
            console.error(`🚨 CRITICAL: Node.js ${currentVersion} is deprecated! Upgrade required.`);
            return false;
        } else if (major === 24 && minor < 6) {
            this.logAlert('WARNING', `Node.js ${currentVersion} approaching deprecation window`);
            console.warn(`⚠️  WARNING: Node.js ${currentVersion} will be deprecated soon. Plan upgrade.`);
        } else {
            this.logInfo('Node.js version is current and supported');
            console.log(`✅ Node.js ${currentVersion} is supported and current`);
        }
        
        return true;
    }

    async scanAllPackageFiles() {
        console.log('🔍 Scanning all package.json files for Node.js version requirements...');
        const packageFiles = await this.findPackageFiles();
        
        for (const filePath of packageFiles) {
            await this.updatePackageFile(filePath);
        }
        
        console.log(`✅ Updated ${packageFiles.length} package.json files`);
    }

    async findPackageFiles() {
        const packageFiles = [];
        
        async function scanDirectory(dir) {
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });
                
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    
                    if (item.name === 'node_modules' || item.name === '.git') {
                        continue;
                    }
                    
                    if (item.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (item.name === 'package.json') {
                        packageFiles.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't access
            }
        }
        
        await scanDirectory(this.projectRoot);
        return packageFiles;
    }

    async updatePackageFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const packageData = JSON.parse(content);
            
            // Update engines.node requirement
            if (packageData.engines && packageData.engines.node) {
                const oldVersion = packageData.engines.node;
                packageData.engines.node = `>=${this.minRequiredVersion}`;
                
                if (oldVersion !== packageData.engines.node) {
                    console.log(`📝 Updated ${filePath}: ${oldVersion} -> ${packageData.engines.node}`);
                    await fs.writeFile(filePath, JSON.stringify(packageData, null, 2) + '\n');
                    this.logInfo(`Updated package.json engines requirement: ${filePath}`);
                }
            } else if (packageData.engines) {
                // Add engines.node if engines exists but node doesn't
                packageData.engines.node = `>=${this.minRequiredVersion}`;
                await fs.writeFile(filePath, JSON.stringify(packageData, null, 2) + '\n');
                this.logInfo(`Added Node.js engine requirement to: ${filePath}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not update ${filePath}: ${error.message}`);
        }
    }

    async updateDockerfiles() {
        console.log('🐳 Updating Dockerfiles to use Node.js 24...');
        const dockerfiles = await this.findDockerfiles();
        
        for (const dockerfile of dockerfiles) {
            await this.updateDockerfile(dockerfile);
        }
        
        console.log(`✅ Updated ${dockerfiles.length} Dockerfiles`);
    }

    async findDockerfiles() {
        const dockerfiles = [];
        
        async function scanDirectory(dir) {
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });
                
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    
                    if (item.name === 'node_modules' || item.name === '.git') {
                        continue;
                    }
                    
                    if (item.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (item.name.startsWith('Dockerfile')) {
                        dockerfiles.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't access
            }
        }
        
        await scanDirectory(this.projectRoot);
        return dockerfiles;
    }

    async updateDockerfile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Replace old Node.js versions with 24
            const updatedContent = content
                .replace(/FROM node:18/g, 'FROM node:24-slim')
                .replace(/FROM node:20/g, 'FROM node:24-slim')
                .replace(/FROM node:22/g, 'FROM node:24-slim')
                .replace(/node:18-slim/g, 'node:24-slim')
                .replace(/node:20-slim/g, 'node:24-slim')
                .replace(/node:22-slim/g, 'node:24-slim');
            
            if (content !== updatedContent) {
                await fs.writeFile(filePath, updatedContent);
                console.log(`📝 Updated Dockerfile: ${filePath}`);
                this.logInfo(`Updated Dockerfile to use Node.js 24: ${filePath}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not update Dockerfile ${filePath}: ${error.message}`);
        }
    }

    async setupCronMonitoring() {
        const cronScript = `#!/bin/bash
# Node.js Version Monitoring Cron Job
# Runs daily to check Node.js version status
# Generated by Node.js Self-Monitoring System

cd "${this.projectRoot}"
node scripts/node-version-monitor.js --cron-mode

# Check exit code and send alerts if needed
if [ $? -ne 0 ]; then
    echo "Node.js version check failed - alerts sent" | logger -t node-version-monitor
fi
`;

        const cronScriptPath = path.join(this.projectRoot, 'scripts', 'node-version-cron.sh');
        await fs.writeFile(cronScriptPath, cronScript);
        await fs.chmod(cronScriptPath, '755');
        
        console.log('📅 Cron monitoring script created');
        console.log('📋 To enable daily monitoring, add this to your crontab:');
        console.log(`0 9 * * * ${cronScriptPath}`);
    }

    async generateSystemReport() {
        const report = {
            timestamp: new Date().toISOString(),
            currentNodeVersion: process.version,
            minRequiredVersion: this.minRequiredVersion,
            systemStatus: 'HEALTHY',
            recommendations: [],
            packageFilesUpdated: 0,
            dockerfilesUpdated: 0
        };

        const [major] = process.version.slice(1).split('.').map(Number);
        
        if (major < 24) {
            report.systemStatus = 'CRITICAL';
            report.recommendations.push('IMMEDIATE: Upgrade Node.js to version 24 or higher');
            report.recommendations.push('Update all deployment environments');
            report.recommendations.push('Test all services for compatibility');
        } else if (major === 24) {
            report.systemStatus = 'GOOD';
            report.recommendations.push('Monitor for Node.js 26 release and plan future upgrade');
        } else {
            report.systemStatus = 'EXCELLENT';
            report.recommendations.push('System is running latest Node.js version');
        }

        const reportPath = path.join(this.projectRoot, 'reports', 'node-version-status.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📋 System report generated: ${reportPath}`);
        return report;
    }

    async logAlert(level, message) {
        const logEntry = `${new Date().toISOString()} [${level}] ${message}\n`;
        await fs.appendFile(this.logFile, logEntry);
        
        // Send to system logger if available
        try {
            execSync(`logger -t node-version-monitor "[${level}] ${message}"`);
        } catch {
            // System logger not available, continue
        }
    }

    async logInfo(message) {
        await this.logAlert('INFO', message);
    }

    // Main execution method
    async run() {
        try {
            await this.initialize();
            await this.updateDockerfiles();
            const report = await this.generateSystemReport();
            
            console.log('\n🎯 NODE.JS UPGRADE SUMMARY:');
            console.log(`Status: ${report.systemStatus}`);
            console.log(`Current Version: ${report.currentNodeVersion}`);
            console.log(`Required Version: >=${this.minRequiredVersion}`);
            
            if (report.recommendations.length > 0) {
                console.log('\n📋 Recommendations:');
                report.recommendations.forEach(rec => console.log(`  • ${rec}`));
            }
            
            return report.systemStatus !== 'CRITICAL';
        } catch (error) {
            console.error('❌ Node.js monitoring system failed:', error);
            await this.logAlert('ERROR', `System failure: ${error.message}`);
            return false;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const monitor = new NodeVersionMonitor();
    const cronMode = process.argv.includes('--cron-mode');
    
    monitor.run().then(success => {
        if (cronMode && !success) {
            process.exit(1); // Alert cron system of failure
        }
        console.log('✅ Node.js version monitoring completed');
    }).catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = NodeVersionMonitor;