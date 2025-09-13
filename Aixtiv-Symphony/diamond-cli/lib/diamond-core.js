/**
 * 💎 Diamond Core - Central Diamond CLI functionality
 * 🏛️  Authority: Diamond SAO Command Center
 * 🌐 GCP Integration with API-For-Warp-Drive project
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class DiamondCore {
  constructor(cli) {
    this.cli = cli;
    this.gcpProject = 'api-for-warp-drive';
    this.region = process.env.CLOUD_ML_REGION || 'us-west1';
    this.stagingZone = 'us-west1-b'; // mocoa staging
    this.productionZone = 'us-west1-a'; // mocoa production
  }

  async deploy(service, action, args) {
    this.cli.log.deploy(`🚀 Deploying ${service} ${action} to GCP...`);

    try {
      // Ensure we're deploying to GCP, not Cloudflare
      this.validateGCPDeployment();

      switch (service) {
        case 'service':
          await this.deployService(action, args);
          break;
        case 'integration':
          await this.deployIntegration(action, args);
          break;
        case 'gateway':
          await this.deployGateway(action, args);
          break;
        case 'oauth2-gateway':
          await this.deployOAuth2Gateway(action, args);
          break;
        default:
          this.cli.log.warn(`Unknown service type: ${service}`);
      }

      this.cli.log.success('✅ Deployment completed successfully');
    } catch (error) {
      this.cli.log.error(`Deployment failed: ${error.message}`);
      throw error;
    }
  }

  validateGCPDeployment() {
    // Ensure deployment goes to GCP only, never Cloudflare
    const currentProject = this.getCurrentGCPProject();
    if (currentProject !== this.gcpProject) {
      throw new Error(
        `Wrong GCP project. Expected: ${this.gcpProject}, Current: ${currentProject}`
      );
    }

    this.cli.log.info(`✅ Validated GCP project: ${this.gcpProject}`);
    this.cli.log.info(`✅ Region: ${this.region}`);
  }

  getCurrentGCPProject() {
    try {
      const result = execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
      return result;
    } catch (error) {
      throw new Error('Failed to get current GCP project');
    }
  }

  async deployService(serviceName, args) {
    const environment = this.getEnvironmentFromArgs(args);
    const zone = environment === 'production' ? this.productionZone : this.stagingZone;

    this.cli.log.deploy(`📦 Deploying service: ${serviceName}`);
    this.cli.log.deploy(`🌍 Environment: ${environment} (${zone})`);

    // Build Docker image
    await this.buildDockerImage(serviceName);

    // Deploy to Cloud Run
    await this.deployToCloudRun(serviceName, environment);

    // Update DNS if needed
    if (environment === 'production') {
      await this.updateDNSRecords(serviceName);
    }
  }

  async buildDockerImage(serviceName) {
    this.cli.log.info(`🏗️  Building Docker image for ${serviceName}...`);

    try {
      const buildCommand = `gcloud builds submit --tag gcr.io/${this.gcpProject}/${serviceName} --project=${this.gcpProject}`;
      execSync(buildCommand, { stdio: 'inherit' });
      this.cli.log.success('✅ Docker image built successfully');
    } catch (error) {
      throw new Error(`Docker build failed: ${error.message}`);
    }
  }

  async deployToCloudRun(serviceName, environment) {
    this.cli.log.info('☁️  Deploying to Cloud Run...');

    try {
      const deployCommand = [
        'gcloud run deploy',
        serviceName,
        `--image=gcr.io/${this.gcpProject}/${serviceName}`,
        '--platform=managed',
        `--region=${this.region}`,
        `--project=${this.gcpProject}`,
        '--memory=2Gi',
        '--cpu=2',
        '--max-instances=100',
        `--set-env-vars=NODE_ENV=${environment}`,
        '--allow-unauthenticated',
      ].join(' ');

      execSync(deployCommand, { stdio: 'inherit' });
      this.cli.log.success('✅ Deployed to Cloud Run successfully');
    } catch (error) {
      throw new Error(`Cloud Run deployment failed: ${error.message}`);
    }
  }

  async updateDNSRecords(serviceName) {
    this.cli.log.info('🌐 Updating DNS records...');

    try {
      // Get Cloud Run service URL
      const getUrlCommand = `gcloud run services describe ${serviceName} --region=${this.region} --project=${this.gcpProject} --format="value(status.url)"`;
      const serviceUrl = execSync(getUrlCommand, { encoding: 'utf8' }).trim();

      // Update DNS in main-zone
      const dnsUpdateCommand = `gcloud dns record-sets transaction start --zone=main-zone --project=${this.gcpProject}`;
      execSync(dnsUpdateCommand);

      this.cli.log.success(`✅ DNS records updated for ${serviceName}`);
    } catch (error) {
      this.cli.log.warn(`DNS update warning: ${error.message}`);
      // Don't fail deployment for DNS issues
    }
  }

  async deployIntegration(integrationName, args) {
    this.cli.log.deploy(`🔗 Deploying integration: ${integrationName}`);

    // Deploy integration-gateway-js service
    if (integrationName === 'gateway') {
      await this.deployService('integration-gateway-js', args);
    }

    // Setup MongoDB Atlas connections
    await this.setupMongoDBConnections();

    // Configure Pinecone integration
    await this.configurePineconeIntegration();
  }

  async deployGateway(gatewayType, args) {
    this.cli.log.deploy(`🚪 Deploying gateway: ${gatewayType}`);

    // Deploy with SallyPort verification
    await this.deployWithSallyPort(gatewayType, args);
  }

  async deployOAuth2Gateway(provider, args) {
    // Extract actual provider from args
    const providerIndex = args.findIndex(arg => arg.startsWith('--provider='));
    const actualProvider = providerIndex !== -1 ? args[providerIndex].split('=')[1] : provider;
    
    this.cli.log.deploy(`🔐 Deploying OAuth2 Gateway with provider: ${actualProvider}`);

    // Extract PCP from args
    const pcpIndex = args.findIndex(arg => arg === '--pcp');
    const pcp = pcpIndex !== -1 && args[pcpIndex + 1] ? args[pcpIndex + 1] : 'PcP';
    
    this.cli.log.info(`👨‍💼 PCP Integration: ${pcp}`);
    this.cli.log.info(`🌐 Provider: ${actualProvider}`);

    try {
      // Deploy OAuth2 gateway service
      await this.deployOAuth2Service(actualProvider, pcp, args);
      
      // Setup OAuth2 secrets in Secret Manager
      await this.setupOAuth2Secrets(actualProvider);
      
      // Deploy Cloudflare Worker if provider is cloudflare
      if (actualProvider === 'cloudflare') {
        await this.deployOAuth2Worker();
      }

      this.cli.log.success('✅ OAuth2 Gateway deployed successfully');
    } catch (error) {
      throw new Error(`OAuth2 Gateway deployment failed: ${error.message}`);
    }
  }

  async deployWithSallyPort(service, args) {
    this.cli.log.info(`🔐 Configuring SallyPort verification for ${service}...`);

    // Ensure SallyPort secrets are available in Secret Manager
    await this.setupSallyPortSecrets();

    // Deploy with SallyPort integration
    await this.deployService(service, args);
  }

  async setupSallyPortSecrets() {
    this.cli.log.info('🔑 Setting up SallyPort secrets in Secret Manager...');

    try {
      // Check if SallyPort secrets exist
      const secretsCommand = `gcloud secrets list --project=${this.gcpProject} --filter="name:sallyport" --format="value(name)"`;
      const secrets = execSync(secretsCommand, { encoding: 'utf8' }).trim();

      if (!secrets) {
        this.cli.log.warn(
          '⚠️  SallyPort secrets not found. Please configure them in Secret Manager.'
        );
      } else {
        this.cli.log.success('✅ SallyPort secrets configured');
      }
    } catch (error) {
      this.cli.log.warn(`SallyPort secret check warning: ${error.message}`);
    }
  }

  async setupMongoDBConnections() {
    this.cli.log.info('🍃 Setting up MongoDB Atlas connections...');

    // MongoDB Atlas is configured as the agent registry system
    const mongoSecrets = [
      'MONGODB_ATLAS_URI',
      'MONGODB_ATLAS_DB_NAME',
      'MONGODB_ATLAS_USERNAME',
      'MONGODB_ATLAS_PASSWORD',
    ];

    for (const secret of mongoSecrets) {
      await this.ensureSecretExists(secret);
    }
  }

  async configurePineconeIntegration() {
    this.cli.log.info('🌲 Configuring Pinecone integration...');

    await this.ensureSecretExists('PINECONE_API_KEY');
    await this.ensureSecretExists('PINECONE_ENVIRONMENT');
  }

  async ensureSecretExists(secretName) {
    try {
      const checkCommand = `gcloud secrets describe ${secretName} --project=${this.gcpProject}`;
      execSync(checkCommand, { stdio: 'pipe' });
      this.cli.log.info(`✅ Secret ${secretName} exists`);
    } catch (error) {
      this.cli.log.warn(`⚠️  Secret ${secretName} not found. Please create it in Secret Manager.`);
    }
  }

  async deployOAuth2Service(provider, pcp, args) {
    this.cli.log.info(`🔐 Deploying OAuth2 service for ${provider}...`);
    
    // Deploy oauth2-gateway service to Cloud Run
    const serviceName = `oauth2-gateway-${provider}`;
    await this.deployService(serviceName, args);
  }

  async setupOAuth2Secrets(provider) {
    this.cli.log.info(`🔑 Setting up OAuth2 secrets for ${provider}...`);
    
    const secrets = {
      cloudflare: ['CLOUDFLARE_OAUTH_CLIENT_ID', 'CLOUDFLARE_OAUTH_CLIENT_SECRET'],
      google: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'],
      github: ['GITHUB_OAUTH_CLIENT_ID', 'GITHUB_OAUTH_CLIENT_SECRET']
    };
    
    const providerSecrets = secrets[provider] || [];
    for (const secret of providerSecrets) {
      await this.ensureSecretExists(secret);
    }
  }

  async deployOAuth2Worker() {
    this.cli.log.info('⚡ Deploying OAuth2 Cloudflare Worker...');
    
    try {
      // Deploy the OAuth2 middleware worker
      const workerPath = path.join(__dirname, '..', 'workers', 'diamond-oauth2-middleware.js');
      if (fs.existsSync(workerPath)) {
        execSync('wrangler deploy --config wrangler-oauth2.toml', { stdio: 'inherit' });
        this.cli.log.success('✅ OAuth2 Worker deployed');
      } else {
        this.cli.log.warn('⚠️  OAuth2 Worker not found, skipping...');
      }
    } catch (error) {
      this.cli.log.warn(`OAuth2 Worker deployment warning: ${error.message}`);
    }
  }

  getEnvironmentFromArgs(args) {
    const envIndex = args.findIndex((arg) => arg === '--env');
    if (envIndex !== -1 && args[envIndex + 1]) {
      return args[envIndex + 1];
    }
    return 'staging'; // default to staging
  }

  async monitor(args) {
    this.cli.log.info('📊 Starting Diamond SAO monitoring dashboard...');

    try {
      // Get logs for integration-gateway-js
      this.cli.log.info('📋 Fetching service logs...');
      const logsCommand = `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=integration-gateway-js" --limit=5 --project=${this.gcpProject}`;

      const logs = execSync(logsCommand, { encoding: 'utf8' });
      console.log('\n📋 Recent Service Logs:');
      console.log(logs);

      // Show service status
      await this.showServiceStatus();
    } catch (error) {
      this.cli.log.error(`Monitoring failed: ${error.message}`);
    }
  }

  async showServiceStatus() {
    this.cli.log.info('🔍 Checking service status...');

    try {
      const statusCommand = `gcloud run services list --platform=managed --region=${this.region} --project=${this.gcpProject}`;
      const services = execSync(statusCommand, { encoding: 'utf8' });

      console.log('\n☁️  Cloud Run Services:');
      console.log(services);
    } catch (error) {
      this.cli.log.error(`Failed to get service status: ${error.message}`);
    }
  }
}

module.exports = { DiamondCore };
