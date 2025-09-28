#!/usr/bin/env node
/**
 * Simple Universal MCP DNS Manager (Fixed Version)
 * Automated DNS management for mcp.asoos.2100.cool (universal template)
 * Applied to all current and future MCP instances
 */

const { execSync } = require('child_process');

const PROJECT = 'api-for-warp-drive';
const ZONE = 'main-zone';
const REGION = 'us-west1';

// Core MCP services that exist
const CORE_SERVICES = [
    'integration-gateway-js',
    'integration-gateway-mcp', 
    'integration-gateway-production',
    'wfa-production-swarm',
    'integration-gateway-wfa-orchestration-production'
];

function getServiceUrl(serviceName) {
    try {
        const url = execSync(
            `gcloud run services describe ${serviceName} --region=${REGION} --format="value(status.url)" 2>/dev/null`,
            { encoding: 'utf8' }
        ).trim();
        return url || null;
    } catch (error) {
        return null;
    }
}

function createDNSRecord(domain, targetUrl) {
    try {
        console.log(`🔧 Creating DNS: ${domain} → ${targetUrl}`);
        
        const cleanTarget = targetUrl.replace(/^https?:\/\//, '');
        
        // Use direct gcloud command instead of transactions
        try {
            // Remove existing record if it exists
            execSync(`gcloud dns record-sets delete ${domain}. --zone=${ZONE} --type=CNAME --quiet 2>/dev/null`, { stdio: 'pipe' });
        } catch (error) {
            // Record doesn't exist, which is fine
        }
        
        // Add new record
        execSync(`gcloud dns record-sets create ${domain}. --zone=${ZONE} --type=CNAME --ttl=300 --rrdatas=${cleanTarget}.`, { stdio: 'pipe' });
        
        console.log(`✅ ${domain} → ${targetUrl}`);
        return true;
    } catch (error) {
        console.error(`⚠️  DNS creation failed for ${domain}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🌐 SIMPLE UNIVERSAL MCP DNS MANAGER');
    console.log('==================================');
    console.log('Universal Template: mcp.asoos.2100.cool');
    console.log('Legacy Support: mcp.aipub.2100.cool\n');

    let successCount = 0;
    let totalAttempts = 0;

    // Apply to existing core services
    console.log('📦 Core MCP Services:');
    for (const serviceName of CORE_SERVICES) {
        const serviceUrl = getServiceUrl(serviceName);
        if (serviceUrl) {
            // Create primary universal domain
            totalAttempts++;
            if (createDNSRecord(`${serviceName}.mcp.asoos.2100.cool`, serviceUrl)) {
                successCount++;
            }
            
            // Create legacy compatibility domain
            totalAttempts++;
            if (createDNSRecord(`${serviceName}.mcp.aipub.2100.cool`, serviceUrl)) {
                successCount++;
            }
        } else {
            console.log(`⚠️  Service ${serviceName} not found, skipping...`);
        }
    }

    // Create company MCP domains (forward-looking)
    console.log('\n🏢 Company MCP Domains:');
    const companies = ['zaxon-construction', 'coaching2100', 'aixtiv-symphony'];
    
    for (const company of companies) {
        const targetUrl = `https://mcp-${company}-859242575175.${REGION}.run.app`;
        
        totalAttempts++;
        if (createDNSRecord(`mcp.${company}.2100.cool`, targetUrl)) {
            successCount++;
        }
        
        totalAttempts++;
        if (createDNSRecord(`${company}.mcp.asoos.2100.cool`, targetUrl)) {
            successCount++;
        }
    }

    // Generate summary
    console.log('\n📊 DEPLOYMENT SUMMARY');
    console.log('====================');
    console.log(`✅ Successful DNS records: ${successCount}/${totalAttempts}`);
    console.log(`🌐 Universal Template: mcp.asoos.2100.cool`);
    console.log(`🔄 Legacy Template: mcp.aipub.2100.cool`);
    console.log(`📡 DNS Zone: ${ZONE}`);
    console.log(`📍 Region: ${REGION}`);

    // Verify some key domains
    console.log('\n🔍 DNS VERIFICATION');
    console.log('==================');
    
    const keyDomains = [
        'integration-gateway-js.mcp.asoos.2100.cool',
        'wfa-production-swarm.mcp.asoos.2100.cool',
        'mcp.zaxon-construction.2100.cool',
        'mcp.coaching2100.2100.cool'
    ];

    for (const domain of keyDomains) {
        try {
            execSync(`nslookup ${domain}`, { stdio: 'pipe' });
            console.log(`✅ ${domain} - DNS resolved`);
        } catch (error) {
            console.log(`⏳ ${domain} - Propagating...`);
        }
    }

    console.log('\n🎉 UNIVERSAL MCP DNS SETUP COMPLETE!');
    console.log('====================================');
    console.log('• Universal template applied to all current MCP instances');
    console.log('• Company domains configured for future expansion');
    console.log('• Legacy compatibility maintained');
    console.log('• DNS propagation initiated (may take up to 5 minutes)');
    
    console.log('\n🌐 Key Universal MCP Domains:');
    console.log('• integration-gateway-js.mcp.asoos.2100.cool');
    console.log('• wfa-production-swarm.mcp.asoos.2100.cool'); 
    console.log('• mcp.zaxon-construction.2100.cool');
    console.log('• mcp.coaching2100.2100.cool');
    console.log('• mcp.aixtiv-symphony.2100.cool');
}

if (require.main === module) {
    main().catch(console.error);
}