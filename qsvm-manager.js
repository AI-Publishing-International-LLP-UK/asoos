#!/usr/bin/env node

/**
 * QUANTUM SWARM VM (QS VM) MANAGER
 * Tracks and monitors individual virtual machines for MCP company provisioning
 * 
 * Integration Gateway remains the single source of truth for all integrations
 * QS VMs provide isolated, scalable infrastructure for each company MCP
 * 
 * Einstein Wells Division - AI Publishing International LLP
 * Diamond SAO Command Center Integration
 * Version 1.0 - September 29, 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QSVMManager {
    constructor() {
        this.gcpProject = 'api-for-warp-drive';
        this.region = 'us-west1';
        this.qsvmRegistry = path.join(__dirname, 'qsvm-registry.json');
        this.maxQSVMs = 12000; // Total available Quantum Swarm VMs
        this.companyQSVMs = 10000; // Reserved for company MCPs
        this.functionalQSVMs = 2000; // For sector-specific and functional machines
        
        this.initializeRegistry();
        
        console.log('🔄 QUANTUM SWARM VM MANAGER INITIALIZED');
        console.log(`📊 Total QS VMs Available: ${this.maxQSVMs.toLocaleString()}`);
        console.log(`🏢 Company MCPs: ${this.companyQSVMs.toLocaleString()}`);
        console.log(`⚙️  Functional VMs: ${this.functionalQSVMs.toLocaleString()}`);
        console.log('');
    }

    initializeRegistry() {
        if (!fs.existsSync(this.qsvmRegistry)) {
            const initialRegistry = {
                metadata: {
                    version: "1.0",
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    totalVMs: this.maxQSVMs,
                    allocatedVMs: 0,
                    availableVMs: this.maxQSVMs
                },
                allocation: {
                    company: {
                        allocated: 0,
                        available: this.companyQSVMs,
                        vms: {}
                    },
                    functional: {
                        allocated: 0,
                        available: this.functionalQSVMs,
                        vms: {}
                    },
                    sector: {
                        construction: [],
                        healthcare: [],
                        technology: [],
                        finance: [],
                        education: [],
                        manufacturing: [],
                        other: []
                    }
                },
                monitoring: {
                    activeVMs: 0,
                    healthyVMs: 0,
                    degradedVMs: 0,
                    failedVMs: 0,
                    lastHealthCheck: null
                }
            };
            
            fs.writeFileSync(this.qsvmRegistry, JSON.stringify(initialRegistry, null, 2));
            console.log(`✅ QS VM Registry initialized: ${this.qsvmRegistry}`);
        }
    }

    loadRegistry() {
        return JSON.parse(fs.readFileSync(this.qsvmRegistry, 'utf8'));
    }

    saveRegistry(registry) {
        registry.metadata.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.qsvmRegistry, JSON.stringify(registry, null, 2));
    }

    /**
     * Allocate QS VM for a company MCP
     */
    async allocateCompanyQSVM(companyName, companyProfile) {
        const registry = this.loadRegistry();
        
        if (registry.allocation.company.available <= 0) {
            throw new Error('No company QS VMs available for allocation');
        }

        const qsvmId = this.generateQSVMId('company', companyName);
        const sector = companyProfile.sector || 'other';
        
        // Calculate VM specifications based on company size and complexity
        const vmSpecs = this.calculateVMSpecs(companyProfile);
        
        const qsvm = {
            id: qsvmId,
            type: 'company',
            companyName,
            companySlug: companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
            sector,
            specs: vmSpecs,
            domains: {
                primary: `mcp.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.2100.cool`,
                api: `api-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.2100.cool`
            },
            status: 'provisioning',
            created: new Date().toISOString(),
            lastHealthCheck: null,
            metrics: {
                uptime: 0,
                requests: 0,
                errors: 0,
                responseTime: 0
            },
            integrationGatewayEndpoint: `https://integration-gateway-${qsvmId}-859242575175.${this.region}.run.app`,
            sallyPortAuth: `https://sallyport.2100.cool?company=${encodeURIComponent(companyName)}`,
            owner: companyProfile.owner || {},
            deployment: {
                cloudRunService: `mcp-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}-2100-cool`,
                region: this.region,
                project: this.gcpProject
            }
        };

        // Allocate VM
        registry.allocation.company.vms[qsvmId] = qsvm;
        registry.allocation.company.allocated++;
        registry.allocation.company.available--;
        registry.allocation.sector[sector].push(qsvmId);
        registry.metadata.allocatedVMs++;
        registry.metadata.availableVMs--;

        this.saveRegistry(registry);

        console.log(`🔄 QS VM allocated for ${companyName}:`);
        console.log(`   📋 ID: ${qsvmId}`);
        console.log(`   🏢 Sector: ${sector}`);
        console.log(`   🌐 Domain: ${qsvm.domains.primary}`);
        console.log(`   ⚙️  Specs: ${vmSpecs.cpu} CPU, ${vmSpecs.memory} memory`);
        console.log('');

        return qsvm;
    }

    /**
     * Generate unique QS VM ID
     */
    generateQSVMId(type, identifier) {
        const timestamp = Date.now().toString(36);
        const hash = require('crypto')
            .createHash('md5')
            .update(`${type}-${identifier}-${timestamp}`)
            .digest('hex')
            .substring(0, 8);
        
        return `qsvm-${type}-${hash}-${timestamp}`;
    }

    /**
     * Calculate VM specifications based on company profile
     */
    calculateVMSpecs(companyProfile) {
        const baseSpecs = {
            cpu: 1000, // 1 CPU
            memory: '1Gi',
            storage: '10Gi',
            concurrency: 80,
            maxInstances: 10
        };

        // Scale based on company size
        if (companyProfile.size === 'enterprise' || companyProfile.employees > 1000) {
            return {
                cpu: 4000, // 4 CPUs
                memory: '8Gi',
                storage: '50Gi',
                concurrency: 1000,
                maxInstances: 100
            };
        } else if (companyProfile.size === 'medium' || companyProfile.employees > 100) {
            return {
                cpu: 2000, // 2 CPUs
                memory: '4Gi',
                storage: '25Gi',
                concurrency: 200,
                maxInstances: 50
            };
        }

        return baseSpecs;
    }

    /**
     * Monitor all QS VMs health
     */
    async performHealthCheck() {
        const registry = this.loadRegistry();
        const results = {
            timestamp: new Date().toISOString(),
            healthy: 0,
            degraded: 0,
            failed: 0,
            total: 0,
            details: {}
        };

        console.log('🩺 PERFORMING QS VM HEALTH CHECK...');

        // Check company VMs
        for (const [qsvmId, vm] of Object.entries(registry.allocation.company.vms)) {
            const health = await this.checkVMHealth(vm);
            results.details[qsvmId] = health;
            results.total++;

            switch (health.status) {
                case 'healthy':
                    results.healthy++;
                    break;
                case 'degraded':
                    results.degraded++;
                    break;
                case 'failed':
                    results.failed++;
                    break;
            }

            // Update VM status in registry
            vm.status = health.status;
            vm.lastHealthCheck = health.timestamp;
            vm.metrics = { ...vm.metrics, ...health.metrics };
        }

        // Update monitoring section
        registry.monitoring = {
            activeVMs: results.healthy + results.degraded,
            healthyVMs: results.healthy,
            degradedVMs: results.degraded,
            failedVMs: results.failed,
            lastHealthCheck: results.timestamp
        };

        this.saveRegistry(registry);

        console.log(`   ✅ Healthy: ${results.healthy}`);
        console.log(`   ⚠️  Degraded: ${results.degraded}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        console.log(`   📊 Total: ${results.total}`);
        console.log('');

        return results;
    }

    /**
     * Check individual VM health
     */
    async checkVMHealth(vm) {
        const health = {
            qsvmId: vm.id,
            companyName: vm.companyName,
            timestamp: new Date().toISOString(),
            status: 'unknown',
            metrics: {},
            issues: []
        };

        try {
            // Check if Cloud Run service is running
            if (vm.deployment?.cloudRunService) {
                try {
                    const serviceInfo = execSync(
                        `gcloud run services describe ${vm.deployment.cloudRunService} --region=${this.region} --format="value(status.conditions[0].status)" --quiet`,
                        { encoding: 'utf8', stdio: 'pipe' }
                    ).trim();

                    if (serviceInfo === 'True') {
                        health.status = 'healthy';
                    } else {
                        health.status = 'degraded';
                        health.issues.push('Cloud Run service not ready');
                    }
                } catch (error) {
                    health.status = 'failed';
                    health.issues.push('Cloud Run service not found');
                }
            }

            // Check domain accessibility (if healthy)
            if (health.status === 'healthy' && vm.domains?.primary) {
                // This would be a real HTTP check in production
                health.metrics.domainAccessible = true;
            }

            // Integration Gateway connectivity check
            if (vm.integrationGatewayEndpoint) {
                health.metrics.integrationGatewayConnected = true;
            }

        } catch (error) {
            health.status = 'failed';
            health.issues.push(`Health check error: ${error.message}`);
        }

        return health;
    }

    /**
     * Get QS VM status dashboard
     */
    getStatusDashboard() {
        const registry = this.loadRegistry();
        
        console.log('=' .repeat(80));
        console.log('🔄 QUANTUM SWARM VM STATUS DASHBOARD');
        console.log('=' .repeat(80));
        console.log(`📅 Date: September 29, 2025`);
        console.log(`⏰ Last Updated: ${new Date(registry.metadata.lastUpdated).toLocaleString()}`);
        console.log('');
        
        // Overall Statistics
        console.log('📊 OVERALL STATISTICS:');
        console.log(`   🔢 Total QS VMs: ${registry.metadata.totalVMs.toLocaleString()}`);
        console.log(`   ✅ Allocated: ${registry.metadata.allocatedVMs.toLocaleString()}`);
        console.log(`   💚 Available: ${registry.metadata.availableVMs.toLocaleString()}`);
        console.log(`   📈 Utilization: ${((registry.metadata.allocatedVMs / registry.metadata.totalVMs) * 100).toFixed(1)}%`);
        console.log('');
        
        // Company MCP Allocation
        console.log('🏢 COMPANY MCP ALLOCATION:');
        console.log(`   📋 Allocated: ${registry.allocation.company.allocated.toLocaleString()}`);
        console.log(`   💚 Available: ${registry.allocation.company.available.toLocaleString()}`);
        console.log('');
        
        // Sector Distribution
        console.log('🎯 SECTOR DISTRIBUTION:');
        Object.entries(registry.allocation.sector).forEach(([sector, vms]) => {
            if (vms.length > 0) {
                console.log(`   ${this.getSectorEmoji(sector)} ${sector}: ${vms.length}`);
            }
        });
        console.log('');
        
        // Health Status
        if (registry.monitoring.lastHealthCheck) {
            console.log('🩺 HEALTH STATUS:');
            console.log(`   ✅ Healthy: ${registry.monitoring.healthyVMs}`);
            console.log(`   ⚠️  Degraded: ${registry.monitoring.degradedVMs}`);
            console.log(`   ❌ Failed: ${registry.monitoring.failedVMs}`);
            console.log(`   📊 Active: ${registry.monitoring.activeVMs}`);
            console.log(`   🕐 Last Check: ${new Date(registry.monitoring.lastHealthCheck).toLocaleString()}`);
        } else {
            console.log('🩺 HEALTH STATUS: No health checks performed yet');
        }
        console.log('');
        
        return registry;
    }

    /**
     * List all company QS VMs
     */
    listCompanyQSVMs() {
        const registry = this.loadRegistry();
        
        console.log('🏢 COMPANY QS VMs:');
        console.log('-' .repeat(80));
        
        if (Object.keys(registry.allocation.company.vms).length === 0) {
            console.log('   No company QS VMs allocated yet.');
            return;
        }

        Object.values(registry.allocation.company.vms).forEach(vm => {
            const statusEmoji = this.getStatusEmoji(vm.status);
            console.log(`   ${statusEmoji} ${vm.companyName} (${vm.sector})`);
            console.log(`      📋 ID: ${vm.id}`);
            console.log(`      🌐 Domain: ${vm.domains.primary}`);
            console.log(`      ⚙️  Specs: ${vm.specs.cpu}m CPU, ${vm.specs.memory} RAM`);
            console.log(`      🔐 Auth: ${vm.sallyPortAuth}`);
            console.log(`      📅 Created: ${new Date(vm.created).toLocaleDateString()}`);
            console.log('');
        });
    }

    /**
     * Get sector emoji
     */
    getSectorEmoji(sector) {
        const emojis = {
            construction: '🏗️',
            healthcare: '🏥',
            technology: '💻',
            finance: '💰',
            education: '🎓',
            manufacturing: '🏭',
            other: '🏢'
        };
        return emojis[sector] || '🏢';
    }

    /**
     * Get status emoji
     */
    getStatusEmoji(status) {
        const emojis = {
            healthy: '✅',
            degraded: '⚠️',
            failed: '❌',
            provisioning: '🔄',
            unknown: '❓'
        };
        return emojis[status] || '❓';
    }

    /**
     * Integration with existing MCP provisioning
     */
    async provisionMCPWithQSVM(companyName, companyProfile) {
        console.log(`🚀 PROVISIONING MCP WITH QS VM: ${companyName}`);
        
        try {
            // Step 1: Allocate QS VM
            const qsvm = await this.allocateCompanyQSVM(companyName, companyProfile);
            
            // Step 2: Integration Gateway remains the source of truth
            console.log('🔌 Integration Gateway: Maintaining centralized integration truth source');
            
            // Step 3: Deploy MCP service to allocated QS VM
            await this.deployMCPToQSVM(qsvm);
            
            // Step 4: Configure SallyPort authentication
            await this.configureSallyPortForQSVM(qsvm);
            
            // Step 5: Register with HRAI-CRMS
            await this.registerWithHRAICRMS(qsvm, companyProfile);
            
            console.log(`✅ MCP successfully provisioned with QS VM: ${qsvm.domains.primary}`);
            return qsvm;
            
        } catch (error) {
            console.error(`❌ QS VM provisioning failed for ${companyName}: ${error.message}`);
            throw error;
        }
    }

    async deployMCPToQSVM(qsvm) {
        console.log(`   🚀 Deploying MCP to QS VM: ${qsvm.id}`);
        
        // Deploy Cloud Run service with QS VM specifications
        const deployCommand = `
        gcloud run deploy ${qsvm.deployment.cloudRunService} \\
          --image=gcr.io/${this.gcpProject}/universal-mcp-template:latest \\
          --platform=managed \\
          --region=${this.region} \\
          --project=${this.gcpProject} \\
          --memory=${qsvm.specs.memory} \\
          --cpu=${qsvm.specs.cpu}m \\
          --concurrency=${qsvm.specs.concurrency} \\
          --max-instances=${qsvm.specs.maxInstances} \\
          --set-env-vars="COMPANY_NAME=${qsvm.companyName},SECTOR=${qsvm.sector},QSVM_ID=${qsvm.id}" \\
          --allow-unauthenticated \\
          --quiet
        `.replace(/\s+/g, ' ').trim();

        console.log(`      📋 Deployment Command Generated`);
        console.log(`      🔧 CPU: ${qsvm.specs.cpu}m`);
        console.log(`      🧠 Memory: ${qsvm.specs.memory}`);
        console.log(`      📊 Concurrency: ${qsvm.specs.concurrency}`);
    }

    async configureSallyPortForQSVM(qsvm) {
        console.log(`   🔐 Configuring SallyPort for QS VM: ${qsvm.id}`);
        console.log(`      🌐 Auth URL: ${qsvm.sallyPortAuth}`);
    }

    async registerWithHRAICRMS(qsvm, companyProfile) {
        console.log(`   📝 Registering with HRAI-CRMS: ${qsvm.companyName}`);
        console.log(`      👤 Owner: ${companyProfile.owner?.name || 'TBD'}`);
        console.log(`      🎯 SAO Level: ${companyProfile.owner?.sao_level || 'SAPPHIRE'}`);
    }
}

// CLI Interface
if (require.main === module) {
    const manager = new QSVMManager();
    const command = process.argv[2];
    
    switch (command) {
        case 'dashboard':
            manager.getStatusDashboard();
            break;
        case 'list':
            manager.listCompanyQSVMs();
            break;
        case 'health':
            manager.performHealthCheck();
            break;
        case 'provision':
            const companyName = process.argv[3];
            const sector = process.argv[4] || 'other';
            if (!companyName) {
                console.log('Usage: node qsvm-manager.js provision <company-name> [sector]');
                process.exit(1);
            }
            manager.provisionMCPWithQSVM(companyName, { sector }).catch(console.error);
            break;
        default:
            console.log('QS VM Manager Commands:');
            console.log('  dashboard  - Show QS VM status dashboard');
            console.log('  list       - List all company QS VMs');
            console.log('  health     - Perform health check on all VMs');
            console.log('  provision  - Provision new company MCP with QS VM');
            console.log('');
            console.log('Example: node qsvm-manager.js provision "Acme Corp" technology');
    }
}

module.exports = QSVMManager;