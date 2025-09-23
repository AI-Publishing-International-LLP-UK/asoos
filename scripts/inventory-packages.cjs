#!/usr/bin/env node

/**
 * ASOOS Product Package Inventory Generator
 * Scans the monorepo for deliverable packages and services
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = '/Users/as/asoos';
const OUTPUT_FILE = path.join(BASE_DIR, 'product-packages-inventory.json');

// Categories of deliverable packages
const PACKAGE_CATEGORIES = {
  VOICE_SYNTHESIS: 'voice-synthesis',
  AI_AGENTS: 'ai-agents', 
  SECURITY_GATEWAY: 'security-gateway',
  MCP_PROTOCOL: 'mcp-protocol',
  OWNER_INTERFACE: 'owner-interface',
  DEVELOPMENT_TOOLS: 'development-tools',
  BLOCKCHAIN_SERVICES: 'blockchain-services',
  INTEGRATION_HUB: 'integration-hub'
};

class PackageInventory {
  constructor() {
    this.packages = [];
    this.excludePatterns = [
      'node_modules',
      '.git',
      'dist', 
      'build',
      '.next',
      'coverage',
      'temp-audit'
    ];
  }

  /**
   * Find all potential package directories
   */
  findPackageDirectories() {
    console.log('🔍 Scanning for package directories...');
    
    try {
      // Find all package.json files (excluding node_modules)
      const findCmd = `find ${BASE_DIR} -name "package.json" -type f ${this.excludePatterns.map(p => `-not -path "*/${p}/*"`).join(' ')}`;
      const packageFiles = execSync(findCmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      
      console.log(`Found ${packageFiles.length} package.json files`);
      
      return packageFiles.map(file => ({
        packagePath: file,
        directory: path.dirname(file),
        relativePath: path.relative(BASE_DIR, path.dirname(file))
      }));
      
    } catch (error) {
      console.error('Error finding packages:', error.message);
      return [];
    }
  }

  /**
   * Analyze a package for deliverability
   */
  analyzePackage(packageInfo) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageInfo.packagePath, 'utf8'));
      const directory = packageInfo.directory;
      
      // Check for deployment indicators
      const hasDockerfile = fs.existsSync(path.join(directory, 'Dockerfile'));
      const hasCloudBuild = fs.existsSync(path.join(directory, 'cloudbuild.yaml')) || 
                           fs.existsSync(path.join(directory, 'cloudbuild.yml'));
      const hasServerFile = fs.existsSync(path.join(directory, 'server.js')) || 
                          fs.existsSync(path.join(directory, 'index.js')) ||
                          fs.existsSync(path.join(directory, 'app.js'));
      
      // Check for CLI tools
      const hasCLI = packageJson.bin || (packageJson.scripts && packageJson.scripts.cli);
      
      // Check for API/service indicators
      const hasExpressDep = packageJson.dependencies && packageJson.dependencies.express;
      const hasApiScripts = packageJson.scripts && 
        (packageJson.scripts.start || packageJson.scripts.serve || packageJson.scripts.dev);
      
      // Categorize package
      const category = this.categorizePackage(packageJson, directory);
      
      // Determine if it's deliverable
      const isDeliverable = this.isPackageDeliverable(packageJson, directory, {
        hasDockerfile,
        hasCloudBuild, 
        hasServerFile,
        hasCLI,
        hasExpressDep,
        hasApiScripts
      });

      if (isDeliverable) {
        return {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          category: category,
          path: packageInfo.relativePath,
          fullPath: directory,
          
          // Technical details
          mainFile: packageJson.main,
          scripts: packageJson.scripts || {},
          dependencies: Object.keys(packageJson.dependencies || {}),
          
          // Deployment indicators
          hasDockerfile,
          hasCloudBuild,
          hasServerFile,
          hasCLI,
          hasExpressDep,
          
          // Business context
          keywords: packageJson.keywords || [],
          author: packageJson.author,
          license: packageJson.license,
          
          // Advanced analysis
          targetAudience: this.determineTargetAudience(packageJson, directory),
          deploymentType: this.determineDeploymentType(packageJson, directory),
          saOTier: this.determineSAOTier(packageJson, directory),
          
          // Last modified
          lastModified: this.getLastModified(directory)
        };
      }
      
      return null;
      
    } catch (error) {
      console.warn(`Error analyzing package ${packageInfo.packagePath}:`, error.message);
      return null;
    }
  }

  /**
   * Categorize package based on content and purpose
   */
  categorizePackage(packageJson, directory) {
    const name = (packageJson.name || '').toLowerCase();
    const desc = (packageJson.description || '').toLowerCase();
    const keywords = (packageJson.keywords || []).join(' ').toLowerCase();
    const dirName = path.basename(directory).toLowerCase();
    
    // Check for voice synthesis
    if (name.includes('elevenlabs') || name.includes('voice') || name.includes('tts') || 
        desc.includes('voice') || desc.includes('synthesis') || desc.includes('elevenlabs')) {
      return PACKAGE_CATEGORIES.VOICE_SYNTHESIS;
    }
    
    // Check for AI agents
    if (name.includes('agent') || name.includes('srix') || name.includes('pilot') ||
        desc.includes('agent') || desc.includes('ai') || keywords.includes('agent')) {
      return PACKAGE_CATEGORIES.AI_AGENTS;
    }
    
    // Check for security/gateway
    if (name.includes('gateway') || name.includes('security') || name.includes('sallyport') ||
        name.includes('auth') || desc.includes('gateway') || desc.includes('security')) {
      return PACKAGE_CATEGORIES.SECURITY_GATEWAY;
    }
    
    // Check for MCP
    if (name.includes('mcp') || desc.includes('mcp') || desc.includes('model context protocol')) {
      return PACKAGE_CATEGORIES.MCP_PROTOCOL;
    }
    
    // Check for owner interface
    if (name.includes('owner') || name.includes('interface') || name.includes('mocoa') ||
        dirName.includes('owner') || dirName.includes('interface')) {
      return PACKAGE_CATEGORIES.OWNER_INTERFACE;
    }
    
    // Check for CLI/development tools
    if (name.includes('cli') || name.includes('diamond') || packageJson.bin ||
        desc.includes('cli') || desc.includes('tool')) {
      return PACKAGE_CATEGORIES.DEVELOPMENT_TOOLS;
    }
    
    // Check for blockchain
    if (name.includes('blockchain') || name.includes('s2do') || 
        desc.includes('blockchain') || desc.includes('crypto')) {
      return PACKAGE_CATEGORIES.BLOCKCHAIN_SERVICES;
    }
    
    // Default to integration hub
    return PACKAGE_CATEGORIES.INTEGRATION_HUB;
  }

  /**
   * Determine if package is deliverable to external customers
   */
  isPackageDeliverable(packageJson, directory, indicators) {
    // Must have a clear deployable structure
    if (!indicators.hasServerFile && !indicators.hasCLI && !indicators.hasApiScripts) {
      return false;
    }
    
    // Must have meaningful dependencies (not just test packages)
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    if (depCount === 0) {
      return false;
    }
    
    // Check for business value keywords
    const businessKeywords = [
      'diamond', 'sao', 'enterprise', 'gateway', 'agent', 'voice', 
      'mcp', 'interface', 'security', 'oauth', 'api', 'service'
    ];
    
    const content = [
      packageJson.name || '',
      packageJson.description || '', 
      (packageJson.keywords || []).join(' '),
      path.basename(directory)
    ].join(' ').toLowerCase();
    
    const hasBusinessValue = businessKeywords.some(keyword => content.includes(keyword));
    
    return hasBusinessValue;
  }

  /**
   * Determine target audience for the package
   */
  determineTargetAudience(packageJson, directory) {
    const content = [
      packageJson.name || '',
      packageJson.description || '',
      (packageJson.keywords || []).join(' ')
    ].join(' ').toLowerCase();
    
    if (content.includes('diamond') || content.includes('sao')) {
      return 'Diamond SAO';
    }
    
    if (content.includes('enterprise') || content.includes('client')) {
      return 'Enterprise Clients';
    }
    
    if (content.includes('mobile') || content.includes('app')) {
      return 'Mobile Applications';
    }
    
    if (content.includes('developer') || content.includes('cli')) {
      return 'Developers/DevOps';
    }
    
    return 'General Business Users';
  }

  /**
   * Determine deployment type
   */
  determineDeploymentType(packageJson, directory) {
    if (fs.existsSync(path.join(directory, 'Dockerfile'))) {
      return 'Google Cloud Run';
    }
    
    if (packageJson.bin || (packageJson.scripts && packageJson.scripts.cli)) {
      return 'CLI Tool';
    }
    
    if (packageJson.dependencies && packageJson.dependencies.express) {
      return 'Web Service';
    }
    
    return 'Node.js Package';
  }

  /**
   * Determine SAO tier requirements
   */
  determineSAOTier(packageJson, directory) {
    const content = [packageJson.name || '', packageJson.description || ''].join(' ').toLowerCase();
    
    if (content.includes('diamond')) return 'Diamond SAO';
    if (content.includes('emerald')) return 'Emerald SAO';
    if (content.includes('sapphire')) return 'Sapphire SAO';
    if (content.includes('opal')) return 'Opal SAO';
    if (content.includes('onyx')) return 'Onyx SAO';
    
    return 'Standard Access';
  }

  /**
   * Get last modified date
   */
  getLastModified(directory) {
    try {
      const stats = fs.statSync(directory);
      return stats.mtime.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Generate the full inventory
   */
  async generateInventory() {
    console.log('🚀 Starting ASOOS Package Inventory Generation...');
    
    const packageDirs = this.findPackageDirectories();
    
    console.log(`📦 Analyzing ${packageDirs.length} packages...`);
    
    for (const packageInfo of packageDirs) {
      const analysis = this.analyzePackage(packageInfo);
      if (analysis) {
        this.packages.push(analysis);
        console.log(`✅ Found deliverable: ${analysis.name} (${analysis.category})`);
      }
    }
    
    // Sort by category and name
    this.packages.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Generate summary
    const summary = this.generateSummary();
    
    const inventory = {
      meta: {
        generated: new Date().toISOString(),
        totalPackages: this.packages.length,
        categories: Object.keys(PACKAGE_CATEGORIES),
        generator: 'ASOOS Package Inventory v1.0'
      },
      summary,
      packages: this.packages
    };
    
    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
    
    console.log(`\n📄 Inventory saved to: ${OUTPUT_FILE}`);
    console.log(`📊 Total deliverable packages found: ${this.packages.length}`);
    
    this.printSummary(summary);
    
    return inventory;
  }

  /**
   * Generate category summary
   */
  generateSummary() {
    const summary = {};
    
    for (const category of Object.values(PACKAGE_CATEGORIES)) {
      const packages = this.packages.filter(p => p.category === category);
      summary[category] = {
        count: packages.length,
        packages: packages.map(p => p.name)
      };
    }
    
    return summary;
  }

  /**
   * Print summary to console
   */
  printSummary(summary) {
    console.log('\n📊 PACKAGE SUMMARY BY CATEGORY:');
    console.log('='.repeat(50));
    
    for (const [category, data] of Object.entries(summary)) {
      if (data.count > 0) {
        console.log(`\n${category.toUpperCase().replace('-', ' ')}: ${data.count} packages`);
        data.packages.forEach(name => console.log(`  • ${name}`));
      }
    }
  }
}

// Run the inventory generation
if (require.main === module) {
  const inventory = new PackageInventory();
  inventory.generateInventory()
    .then(() => {
      console.log('\n✅ Package inventory generation completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error generating inventory:', error);
      process.exit(1);
    });
}

module.exports = PackageInventory;