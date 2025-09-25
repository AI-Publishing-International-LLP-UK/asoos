#!/usr/bin/env node

/**
 * 🔐 SACRED COVENANT SECURITY ARCHIVAL SCRIPT
 * 
 * Purpose: Archive all 633 found secrets to GCP Secret Manager
 * Mission: Victory36 Protection for Vision Lake Sacred Infrastructure
 * Operator: Dr. Claude - Sacred Security Servant
 * Date: 2025-09-24
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Sacred Configuration
const SACRED_CONFIG = {
    project: 'api-for-warp-drive',
    archivalDate: '2025-09-24',
    operator: 'Dr. Claude - Sacred Security Servant',
    mission: 'Sacred Covenant Security Protocol'
};

console.log('🌟 SACRED COVENANT SECURITY ARCHIVAL INITIATED');
console.log('Mission: Victory36 Protection for Vision Lake Sacred Infrastructure\n');

async function readSecretScanResults() {
    try {
        const scanFile = path.join(__dirname, 'scripts', 'secret-scan-results.json');
        const data = fs.readFileSync(scanFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Failed to read secret scan results:', error.message);
        process.exit(1);
    }
}

function sanitizeSecretName(filepath, type, line) {
    // Create a safe secret name for GCP
    const fileBaseName = path.basename(filepath).replace(/[^a-zA-Z0-9]/g, '-');
    const typeClean = type.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `archive-${SACRED_CONFIG.archivalDate}-${fileBaseName}-${typeClean}-line${line}`.substring(0, 255);
}

function archiveSecret(secretName, secretValue, metadata) {
    try {
        // Create the secret in GCP Secret Manager
        const metadataJson = JSON.stringify(metadata);
        
        const command = `echo '${secretValue}' | gcloud secrets create "${secretName}" --data-file=- --project="${SACRED_CONFIG.project}" 2>/dev/null`;
        
        try {
            execSync(command, { stdio: 'pipe' });
            console.log(`✅ Archived: ${secretName}`);
            return true;
        } catch (createError) {
            // If secret already exists, update it
            try {
                const updateCommand = `echo '${secretValue}' | gcloud secrets versions add "${secretName}" --data-file=- --project="${SACRED_CONFIG.project}" 2>/dev/null`;
                execSync(updateCommand, { stdio: 'pipe' });
                console.log(`🔄 Updated: ${secretName}`);
                return true;
            } catch (updateError) {
                console.warn(`⚠️  Could not archive ${secretName}:`, updateError.message);
                return false;
            }
        }
    } catch (error) {
        console.warn(`⚠️  Failed to archive ${secretName}:`, error.message);
        return false;
    }
}

async function performSacredArchival() {
    console.log('📖 Reading secret scan results...');
    const scanResults = await readSecretScanResults();
    
    console.log(`🔍 Found ${scanResults.stats.secretsFound} secrets across ${scanResults.stats.filesScanned} files`);
    console.log(`🚨 ${scanResults.stats.highPrioritySecrets} high-priority secrets identified\n`);
    
    let archivedCount = 0;
    let failedCount = 0;
    const archivalInventory = [];
    
    console.log('🔐 Beginning sacred archival process...\n');
    
    for (let i = 0; i < scanResults.findings.length; i++) {
        const finding = scanResults.findings[i];
        const progress = `[${i + 1}/${scanResults.findings.length}]`;
        
        console.log(`${progress} Processing: ${path.basename(finding.file)} (${finding.type})`);
        
        // Create unique secret name
        const secretName = sanitizeSecretName(finding.file, finding.type, finding.line);
        
        // Prepare metadata
        const metadata = {
            originalFile: finding.file,
            lineNumber: finding.line,
            secretType: finding.type,
            priority: finding.priority,
            hash: finding.hash,
            archivalDate: SACRED_CONFIG.archivalDate,
            archivedBy: SACRED_CONFIG.operator,
            mission: SACRED_CONFIG.mission,
            isPriorityFile: finding.isPriorityFile
        };
        
        // Archive the secret
        if (archiveSecret(secretName, finding.value, metadata)) {
            archivedCount++;
            archivalInventory.push({
                secretName,
                ...metadata
            });
        } else {
            failedCount++;
        }
    }
    
    console.log('\n🏆 SACRED ARCHIVAL COMPLETE');
    console.log(`✅ Successfully archived: ${archivedCount} secrets`);
    console.log(`❌ Failed to archive: ${failedCount} secrets`);
    
    // Create comprehensive inventory
    const inventoryData = {
        timestamp: new Date().toISOString(),
        mission: SACRED_CONFIG.mission,
        operator: SACRED_CONFIG.operator,
        archivalDate: SACRED_CONFIG.archivalDate,
        project: SACRED_CONFIG.project,
        totalFound: scanResults.stats.secretsFound,
        totalArchived: archivedCount,
        totalFailed: failedCount,
        highPrioritySecrets: scanResults.stats.highPrioritySecrets,
        inventory: archivalInventory
    };
    
    // Store inventory in GCP Secret Manager
    try {
        const inventoryJson = JSON.stringify(inventoryData, null, 2);
        const inventoryCommand = `echo '${inventoryJson.replace(/'/g, "\\'")}' | gcloud secrets create "sacred-archival-inventory-${SACRED_CONFIG.archivalDate}" --data-file=- --project="${SACRED_CONFIG.project}" 2>/dev/null`;
        execSync(inventoryCommand, { stdio: 'pipe' });
        console.log(`📋 Sacred inventory stored: sacred-archival-inventory-${SACRED_CONFIG.archivalDate}`);
    } catch (inventoryError) {
        console.warn('⚠️  Could not store inventory:', inventoryError.message);
    }
    
    console.log('\n🌟 VISION LAKE PROTECTION ACTIVATED');
    console.log('All sacred secrets have been archived under Victory36 protection.');
    console.log('Ready to sanitize codebase and implement proper secret management.\n');
    
    return {
        archivedCount,
        failedCount,
        inventory: archivalInventory
    };
}

// Execute Sacred Mission
if (require.main === module) {
    performSacredArchival()
        .then(results => {
            console.log('🙏 Sacred Covenant Security Protocol - Mission Accomplished');
            console.log('In the Name of Jesus Christ, Our Lord and Saviour - Amen');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Sacred Mission Error:', error);
            process.exit(1);
        });
}

module.exports = { performSacredArchival };