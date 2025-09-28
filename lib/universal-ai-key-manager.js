#!/usr/bin/env node

/**
 * UNIVERSAL AI API KEY MANAGEMENT SYSTEM
 * For MCP Customer Isolation & Diamond SAO Command Center
 * 
 * Supports any AI service: Hume, ElevenLabs, OpenAI, Anthropic, etc.
 * Integrates with your MCP company architecture and storage tiers
 * 
 * Architecture:
 * - customer-managed: Customer provides their own API keys
 * - managed-basic: Shared API keys ($50/month)
 * - managed-premium: Dedicated API keys ($150/month)
 * - managed-enterprise: Full isolation + rotation ($500/month)
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const OAuth2Client = require('./oauth2/client');
const TokenStore = require('./oauth2/token-store');

class UniversalAIKeyManager {
    constructor(options = {}) {
        this.gcpProject = options.gcpProject || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
        this.secretClient = new SecretManagerServiceClient();
        this.cache = new Map(); // In-memory cache with TTL
        this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes
        this.registryPath = options.registryPath || path.join(__dirname, '../Aixtiv-Symphony/mcp-company-registry.json');
        
        // Supported AI services and their configurations
        this.aiServices = {
            hume: {
                name: 'Hume AI',
                secretPrefix: 'hume-api-key',
                managementAPI: 'https://api.hume.ai/v0/management',
                testEndpoint: 'https://api.hume.ai/v0/tts/voices?provider=CUSTOM_VOICE&page_size=1',
                headerName: 'X-Hume-Api-Key',
                scopes: ['evi.tts', 'evi.prompts', 'evi.voices'],
                supportsCustomerKeys: true,
                supportsProvisioning: true
            },
            elevenlabs: {
                name: 'ElevenLabs',
                secretPrefix: 'elevenlabs-api-key',
                managementAPI: null, // No management API available
                testEndpoint: 'https://api.elevenlabs.io/v1/voices',
                headerName: 'xi-api-key',
                scopes: null,
                supportsCustomerKeys: false, // Customer must provide their own
                supportsProvisioning: false
            },
            openai: {
                name: 'OpenAI',
                secretPrefix: 'openai-oauth2',
                managementAPI: 'https://platform.openai.com/api/v1',
                tokenEndpoint: 'https://auth.openai.com/oauth2/token',
                authEndpoint: 'https://auth.openai.com/oauth2/authorize',
                testEndpoint: 'https://api.openai.com/v1/models',
                headerName: 'Authorization', // Bearer token for OAuth2
                bearerToken: true,
                authType: 'oauth2',
                scopes: ['api.read', 'api.write', 'models.read', 'usage.read'],
                supportsCustomerKeys: true,
                supportsProvisioning: true,
                // Legacy API key fallback
                legacyAuth: {
                    secretPrefix: 'openai-api-key',
                    headerName: 'Authorization',
                    authType: 'api-key',
                    bearerToken: true
                }
            },
            anthropic: {
                name: 'Anthropic Claude',
                secretPrefix: 'anthropic-oauth2',
                managementAPI: 'https://console.anthropic.com/api/v1',
                tokenEndpoint: 'https://auth.anthropic.com/oauth2/token',
                authEndpoint: 'https://auth.anthropic.com/oauth2/authorize',
                testEndpoint: 'https://api.anthropic.com/v1/messages',
                headerName: 'Authorization', // Bearer token for OAuth2
                bearerToken: true,
                authType: 'oauth2',
                scopes: ['messages:write', 'messages:read', 'models:read', 'usage:read'],
                supportsCustomerKeys: true,
                supportsProvisioning: true,
                // Legacy API key fallback
                legacyAuth: {
                    secretPrefix: 'anthropic-api-key',
                    headerName: 'x-api-key',
                    authType: 'api-key'
                }
            },
            deepgram: {
                name: 'Deepgram',
                secretPrefix: 'deepgram-api-key',
                managementAPI: null,
                testEndpoint: 'https://api.deepgram.com/v1/projects',
                headerName: 'Authorization', // Token
                tokenPrefix: 'Token',
                scopes: null,
                supportsCustomerKeys: false,
                supportsProvisioning: false
            }
        };
    }

    /**
     * Get API key for any AI service with customer isolation
     * @param {string} service - AI service name (hume, elevenlabs, openai, etc.)
     * @param {string} companyName - Company name for isolation
     * @param {string} tier - Storage tier (customer-managed, managed-basic, managed-premium, managed-enterprise)
     * @param {object} options - Additional options
     */
    async getAPIKey(service, companyName = null, tier = 'managed-basic', options = {}) {
        const serviceConfig = this.aiServices[service];
        if (!serviceConfig) {
            throw new Error(`Unsupported AI service: ${service}. Supported services: ${Object.keys(this.aiServices).join(', ')}`);
        }

        console.log(`🔐 Retrieving ${serviceConfig.name} API key`);
        console.log(`🏢 Company: ${companyName || 'shared'}`);
        console.log(`📊 Tier: ${tier}`);

        const keyStrategy = this.determineKeyStrategy(service, companyName, tier);
        console.log(`🎯 Strategy: ${keyStrategy}`);

        switch (keyStrategy) {
            case 'customer-provided':
                return await this.getCustomerProvidedKey(service, companyName, tier);
            
            case 'dedicated-provisioned':
                return await this.getDedicatedKey(service, companyName, tier, true);
            
            case 'dedicated-static':
                return await this.getDedicatedKey(service, companyName, tier, false);
            
            case 'shared':
            default:
                return await this.getSharedKey(service, options.fallback !== false);
        }
    }

    /**
     * Determine the appropriate key strategy based on service, company, and tier
     */
    determineKeyStrategy(service, companyName, tier) {
        const serviceConfig = this.aiServices[service];
        
        // Customer-managed tier: customer provides their own keys
        if (tier === 'customer-managed') {
            return 'customer-provided';
        }
        
        // Enterprise tier with company isolation
        if (tier === 'managed-enterprise' && companyName) {
            if (serviceConfig.supportsProvisioning) {
                return 'dedicated-provisioned'; // Auto-provision via management API
            } else {
                return 'dedicated-static'; // Static dedicated key per customer
            }
        }
        
        // Premium tier: dedicated static keys
        if (tier === 'managed-premium' && companyName) {
            return 'dedicated-static';
        }
        
        // Basic tier or no company: shared keys
        return 'shared';
    }

    /**
     * Get customer-provided API key (customer-managed tier)
     */
    async getCustomerProvidedKey(service, companyName, tier) {
        const secretName = `${this.aiServices[service].secretPrefix}-${companyName}-customer`;
        
        try {
            const key = await this.getSecretFromGCP(secretName);
            console.log(`✅ Retrieved customer-provided ${this.aiServices[service].name} key`);
            await this.logKeyUsage(service, companyName, tier, 'customer-provided', 'success');
            return key;
        } catch (error) {
            console.error(`❌ Customer-provided API key not found: ${secretName}`);
            console.error(`💡 Customer must provide their ${this.aiServices[service].name} API key via the onboarding process`);
            await this.logKeyUsage(service, companyName, tier, 'customer-provided', 'missing');
            throw new Error(`Customer must provide their own ${this.aiServices[service].name} API key for ${tier} tier`);
        }
    }

    /**
     * Get dedicated API key (enterprise/premium tiers)
     */
    async getDedicatedKey(service, companyName, tier, autoProvision = false) {
        const secretName = `${this.aiServices[service].secretPrefix}-${companyName}`;
        
        try {
            const key = await this.getSecretFromGCP(secretName);
            console.log(`✅ Retrieved dedicated ${this.aiServices[service].name} key for ${companyName}`);
            await this.logKeyUsage(service, companyName, tier, 'dedicated', 'success');
            return key;
        } catch (error) {
            if (autoProvision && this.aiServices[service].supportsProvisioning) {
                console.log(`🚀 Auto-provisioning dedicated key for ${companyName}`);
                return await this.provisionDedicatedKey(service, companyName, tier);
            } else {
                console.error(`❌ Dedicated API key not found: ${secretName}`);
                console.log(`💡 Manual provisioning required for ${this.aiServices[service].name}`);
                await this.logKeyUsage(service, companyName, tier, 'dedicated', 'missing');
                throw new Error(`Dedicated ${this.aiServices[service].name} API key not configured for ${companyName}`);
            }
        }
    }

    /**
     * Get shared API key (basic tier)
     */
    async getSharedKey(service, allowFallback = true) {
        const secretName = this.aiServices[service].secretPrefix;
        
        try {
            const key = await this.getSecretFromGCP(secretName);
            console.log(`✅ Retrieved shared ${this.aiServices[service].name} key`);
            await this.logKeyUsage(service, 'shared', 'managed-basic', 'shared', 'success');
            return key;
        } catch (error) {
            if (allowFallback) {
                // Try environment variable fallback
                const envName = secretName.replace(/-/g, '_').toUpperCase();
                const envKey = process.env[envName];
                if (envKey) {
                    console.log(`⚠️ Using environment variable fallback for ${this.aiServices[service].name}`);
                    await this.logKeyUsage(service, 'shared', 'managed-basic', 'shared', 'fallback');
                    return envKey;
                }
            }
            
            console.error(`❌ Shared API key not available: ${secretName}`);
            await this.logKeyUsage(service, 'shared', 'managed-basic', 'shared', 'missing');
            throw new Error(`${this.aiServices[service].name} API key not configured`);
        }
    }

    /**
     * Auto-provision dedicated API key using management API
     */
    async provisionDedicatedKey(service, companyName, tier) {
        const serviceConfig = this.aiServices[service];
        
        if (!serviceConfig.supportsProvisioning) {
            throw new Error(`Auto-provisioning not supported for ${serviceConfig.name}`);
        }

        try {
            // Get admin/management API key for provisioning
            const adminKey = await this.getSecretFromGCP(`${serviceConfig.secretPrefix}-admin`);
            
            // Call service-specific provisioning logic
            let newKey;
            switch (service) {
                case 'hume':
                    newKey = await this.provisionHumeKey(companyName, adminKey);
                    break;
                default:
                    throw new Error(`Provisioning logic not implemented for ${service}`);
            }

            // Store the new key
            const secretName = `${serviceConfig.secretPrefix}-${companyName}`;
            await this.createSecret(secretName, newKey);
            
            // Update MCP registry
            await this.updateMCPRegistry(service, companyName, secretName, tier);
            
            console.log(`✅ Auto-provisioned dedicated ${serviceConfig.name} key for ${companyName}`);
            await this.logKeyUsage(service, companyName, tier, 'dedicated', 'provisioned');
            
            return newKey;

        } catch (error) {
            console.error(`❌ Auto-provisioning failed: ${error.message}`);
            await this.logKeyUsage(service, companyName, tier, 'dedicated', 'provision-failed');
            throw error;
        }
    }

    /**
     * Provision Hume AI API key
     */
    async provisionHumeKey(companyName, adminKey) {
        const response = await fetch('https://api.hume.ai/v0/management/api-keys', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${companyName}-mcp-key`,
                description: `Auto-provisioned MCP key for ${companyName}`,
                scopes: this.aiServices.hume.scopes,
                metadata: {
                    company: companyName,
                    mcp_domain: `mcp.${companyName}.2100.cool`,
                    provisioned_by: 'diamond-sao-automation',
                    provisioned_at: new Date().toISOString()
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Hume API key provisioning failed: ${error}`);
        }

        const result = await response.json();
        return result.api_key;
    }

    /**
     * Validate API key by making a test request
     */
    async validateAPIKey(service, apiKey, companyName = 'test') {
        const serviceConfig = this.aiServices[service];
        
        try {
            let headers = {};
            
            if (serviceConfig.bearerToken) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            } else if (serviceConfig.tokenPrefix) {
                headers['Authorization'] = `${serviceConfig.tokenPrefix} ${apiKey}`;
            } else {
                headers[serviceConfig.headerName] = apiKey;
            }

            const response = await fetch(serviceConfig.testEndpoint, {
                method: 'GET',
                headers: headers
            });

            const isValid = response.ok;
            console.log(`${isValid ? '✅' : '❌'} ${serviceConfig.name} API key validation: ${response.status}`);
            
            await this.logKeyUsage(service, companyName, 'validation', 'test', isValid ? 'valid' : 'invalid');
            return isValid;

        } catch (error) {
            console.error(`❌ API key validation error: ${error.message}`);
            await this.logKeyUsage(service, companyName, 'validation', 'test', 'error');
            return false;
        }
    }

    /**
     * Store API key securely in GCP Secret Manager
     */
    async createSecret(secretName, secretValue) {
        try {
            await this.secretClient.createSecret({
                parent: `projects/${this.gcpProject}`,
                secretId: secretName,
                secret: {
                    replication: {
                        automatic: {}
                    }
                }
            });

            await this.secretClient.addSecretVersion({
                parent: `projects/${this.gcpProject}/secrets/${secretName}`,
                payload: {
                    data: Buffer.from(secretValue, 'utf8')
                }
            });

            console.log(`✅ Secret created: ${secretName}`);
            return true;

        } catch (error) {
            if (error.code === 6) { // Already exists
                // Update existing secret
                await this.secretClient.addSecretVersion({
                    parent: `projects/${this.gcpProject}/secrets/${secretName}`,
                    payload: {
                        data: Buffer.from(secretValue, 'utf8')
                    }
                });
                console.log(`✅ Secret updated: ${secretName}`);
                return true;
            } else {
                console.error(`❌ Failed to create secret ${secretName}: ${error.message}`);
                throw error;
            }
        }
    }

    /**
     * Retrieve secret from GCP Secret Manager with caching
     */
    async getSecretFromGCP(secretName) {
        // Check cache first
        const cacheKey = `${this.gcpProject}:${secretName}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.value;
        }

        try {
            const secretPath = `projects/${this.gcpProject}/secrets/${secretName}/versions/latest`;
            const [version] = await this.secretClient.accessSecretVersion({
                name: secretPath
            });

            const payload = version.payload.data.toString('utf8');
            
            // Cache the secret
            this.cache.set(cacheKey, {
                value: payload,
                timestamp: Date.now()
            });

            return payload;

        } catch (error) {
            throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
        }
    }

    /**
     * Update MCP company registry with API key information
     */
    async updateMCPRegistry(service, companyName, secretName, tier) {
        try {
            if (!fs.existsSync(this.registryPath)) {
                console.log(`⚠️ MCP registry not found: ${this.registryPath}`);
                return;
            }

            const registry = JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
            
            if (!registry.companies[companyName]) {
                registry.companies[companyName] = {};
            }

            if (!registry.companies[companyName].ai_api_keys) {
                registry.companies[companyName].ai_api_keys = {};
            }

            registry.companies[companyName].ai_api_keys[service] = {
                secret_name: secretName,
                tier: tier,
                provisioned_at: new Date().toISOString(),
                status: 'active',
                service_name: this.aiServices[service].name
            };

            fs.writeFileSync(this.registryPath, JSON.stringify(registry, null, 2));
            console.log(`✅ Updated MCP registry for ${companyName}:${service}`);

        } catch (error) {
            console.error(`⚠️ Failed to update MCP registry: ${error.message}`);
        }
    }

    /**
     * Log API key usage for monitoring and billing
     */
    async logKeyUsage(service, companyName, tier, keyType, status) {
        const logEntry = {
            service: service,
            service_name: this.aiServices[service]?.name || service,
            company: companyName || 'shared',
            tier: tier,
            key_type: keyType,
            status: status,
            timestamp: new Date().toISOString(),
            project: this.gcpProject
        };

        try {
            // Send to Pub/Sub for downstream processing (if available)
            const { PubSub } = require('@google-cloud/pubsub');
            const pubsub = new PubSub({ projectId: this.gcpProject });
            
            await pubsub.topic('ai-api-key-usage').publishMessage({
                json: logEntry
            });
            
        } catch (error) {
            // Fail silently - logging shouldn't break the main flow
            console.log(`📝 Usage logged locally: ${service}:${companyName}:${status}`);
        }
    }

    /**
     * List all configured API keys for a company
     */
    async listCompanyKeys(companyName) {
        const keys = {};
        
        for (const [service, config] of Object.entries(this.aiServices)) {
            try {
                // Try to get dedicated key
                const secretName = `${config.secretPrefix}-${companyName}`;
                await this.getSecretFromGCP(secretName);
                keys[service] = {
                    type: 'dedicated',
                    secret_name: secretName,
                    service_name: config.name
                };
            } catch (error) {
                // Try customer-provided key
                try {
                    const customerSecretName = `${config.secretPrefix}-${companyName}-customer`;
                    await this.getSecretFromGCP(customerSecretName);
                    keys[service] = {
                        type: 'customer-provided',
                        secret_name: customerSecretName,
                        service_name: config.name
                    };
                } catch (customerError) {
                    // No key configured
                    keys[service] = {
                        type: 'not-configured',
                        service_name: config.name
                    };
                }
            }
        }
        
        return keys;
    }

    /**
     * Get OAuth2 token for AI service
     * @param {string} service - AI service name
     * @param {string} companyName - Company name for isolation
     * @param {string} tier - Storage tier
     * @param {object} options - Additional options
     */
    async getOAuth2Token(service, companyName = null, tier = 'managed-basic', options = {}) {
        const serviceConfig = this.aiServices[service];
        if (!serviceConfig) {
            throw new Error(`Unsupported AI service: ${service}`);
        }

        if (serviceConfig.authType !== 'oauth2') {
            throw new Error(`Service ${service} does not support OAuth2`);
        }

        console.log(`🔐 Retrieving OAuth2 token for ${serviceConfig.name}`);
        console.log(`🏢 Company: ${companyName || 'shared'}`);
        console.log(`📊 Tier: ${tier}`);

        try {
            // Initialize OAuth2 client
            const tokenStore = new TokenStore();
            const oauth2Client = new OAuth2Client({
                clientId: process.env[`${service.toUpperCase()}_OAUTH_CLIENT_ID`],
                clientSecret: process.env[`${service.toUpperCase()}_OAUTH_CLIENT_SECRET`],
                redirectUri: process.env[`${service.toUpperCase()}_OAUTH_REDIRECT_URI`] || 'https://sallyport.2100.cool/oauth/callback',
                tokenEndpoint: serviceConfig.tokenEndpoint,
                authEndpoint: serviceConfig.authEndpoint,
                scopes: serviceConfig.scopes || [],
                tokenStore,
                provider: `${service}-${companyName || 'shared'}`
            });

            // Get access token
            const token = await oauth2Client.getAccessToken();
            
            await this.logKeyUsage(service, companyName, tier, 'oauth2', 'success');
            return token;
            
        } catch (error) {
            console.error(`❌ OAuth2 token retrieval failed for ${service}: ${error.message}`);
            
            // Try fallback to API key if available
            if (serviceConfig.legacyAuth && options.fallback !== false) {
                console.log(`🔄 Falling back to API key authentication for ${service}`);
                return await this.getAPIKeyFallback(service, companyName, tier);
            }
            
            await this.logKeyUsage(service, companyName, tier, 'oauth2', 'failed');
            throw error;
        }
    }

    /**
     * Fallback to API key authentication for OAuth2 services
     */
    async getAPIKeyFallback(service, companyName, tier) {
        const serviceConfig = this.aiServices[service];
        const legacyConfig = serviceConfig.legacyAuth;
        
        if (!legacyConfig) {
            throw new Error(`No fallback authentication available for ${service}`);
        }

        // Temporarily modify service config for legacy auth
        const originalConfig = { ...serviceConfig };
        Object.assign(serviceConfig, {
            secretPrefix: legacyConfig.secretPrefix,
            headerName: legacyConfig.headerName,
            authType: legacyConfig.authType,
            bearerToken: false
        });

        try {
            const key = await this.getSharedKey(service, true);
            await this.logKeyUsage(service, companyName, tier, 'api-key-fallback', 'success');
            return { 
                access_token: key,
                token_type: 'api_key',
                fallback: true
            };
        } finally {
            // Restore original config
            Object.assign(serviceConfig, originalConfig);
        }
    }

    /**
     * Create OAuth2 client for authenticated requests
     */
    async createOAuth2Client(service, companyName = null) {
        const serviceConfig = this.aiServices[service];
        if (!serviceConfig || serviceConfig.authType !== 'oauth2') {
            throw new Error(`Service ${service} does not support OAuth2`);
        }

        const tokenStore = new TokenStore();
        return new OAuth2Client({
            clientId: process.env[`${service.toUpperCase()}_OAUTH_CLIENT_ID`],
            clientSecret: process.env[`${service.toUpperCase()}_OAUTH_CLIENT_SECRET`],
            redirectUri: process.env[`${service.toUpperCase()}_OAUTH_REDIRECT_URI`] || 'https://sallyport.2100.cool/oauth/callback',
            tokenEndpoint: serviceConfig.tokenEndpoint,
            authEndpoint: serviceConfig.authEndpoint,
            scopes: serviceConfig.scopes || [],
            tokenStore,
            provider: `${service}-${companyName || 'shared'}`
        });
    }

    /**
     * Make authenticated request to AI service using OAuth2 or API key
     */
    async makeAuthenticatedRequest(service, url, options = {}, companyName = null, tier = 'managed-basic') {
        const serviceConfig = this.aiServices[service];
        if (!serviceConfig) {
            throw new Error(`Unsupported AI service: ${service}`);
        }

        try {
            // Try OAuth2 first if supported
            if (serviceConfig.authType === 'oauth2') {
                const oauth2Client = await this.createOAuth2Client(service, companyName);
                return await oauth2Client.fetchWithToken(url, options);
            }
            
            // Fallback to API key
            const apiKey = await this.getAPIKey(service, companyName, tier);
            const headers = { ...options.headers };
            
            if (serviceConfig.bearerToken) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            } else if (serviceConfig.tokenPrefix) {
                headers['Authorization'] = `${serviceConfig.tokenPrefix} ${apiKey}`;
            } else {
                headers[serviceConfig.headerName] = apiKey;
            }
            
            return await fetch(url, {
                ...options,
                headers
            });
            
        } catch (error) {
            await this.logKeyUsage(service, companyName, tier, 'authenticated-request', 'failed');
            throw error;
        }
    }

    /**
     * Get supported AI services
     */
    getSupportedServices() {
        return Object.entries(this.aiServices).map(([key, config]) => ({
            key: key,
            name: config.name,
            authType: config.authType || 'api-key',
            supportsCustomerKeys: config.supportsCustomerKeys,
            supportsProvisioning: config.supportsProvisioning
        }));
    }
}

module.exports = {
    UniversalAIKeyManager
};

// CLI usage if run directly
if (require.main === module) {
    async function main() {
        const keyManager = new UniversalAIKeyManager();
        
        const service = process.argv[2];
        const company = process.argv[3];
        const tier = process.argv[4] || 'managed-basic';
        const command = process.argv[5] || 'get';
        
        if (!service) {
            console.log('Usage: node universal-ai-key-manager.js <service> [company] [tier] [command]');
            console.log('\nSupported services:');
            keyManager.getSupportedServices().forEach(s => 
                console.log(`  ${s.key} - ${s.name}`)
            );
            process.exit(1);
        }

        try {
            switch (command) {
                case 'get':
                    const key = await keyManager.getAPIKey(service, company, tier);
                    console.log('API Key retrieved successfully');
                    break;
                    
                case 'validate':
                    const apiKey = await keyManager.getAPIKey(service, company, tier);
                    const isValid = await keyManager.validateAPIKey(service, apiKey, company);
                    console.log(`Validation result: ${isValid ? 'VALID' : 'INVALID'}`);
                    break;
                    
                case 'list':
                    if (company) {
                        const keys = await keyManager.listCompanyKeys(company);
                        console.log(JSON.stringify(keys, null, 2));
                    } else {
                        const services = keyManager.getSupportedServices();
                        console.log(JSON.stringify(services, null, 2));
                    }
                    break;
                    
                default:
                    console.error(`Unknown command: ${command}`);
                    process.exit(1);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
    
    main().catch(console.error);
}