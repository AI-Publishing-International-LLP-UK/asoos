#!/usr/bin/env node

/**
 * Claude Agent Voice Refactor Script
 * Automatically updates all Claude agents to use the new voice configuration
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ClaudeVoiceRefactor {
  constructor() {
    this.baseDir = '/Users/as/asoos/integration-gateway';
    this.patterns = [
      'voiceId',
      'ttsVoice', 
      'voice_profile',
      'voice_id',
      'ELEVENLABS_VOICE',
      'voice_settings',
      'synthesis_voice'
    ];
    
    this.extensions = ['.js', '.ts', '.json', '.yaml', '.yml'];
    this.refactorLog = [];
    this.errors = [];
  }

  /**
   * Main refactor process
   */
  async refactor() {
    console.log('🔄 Starting Claude voice refactor...');
    
    try {
      // Step 1: Find all Claude agent files
      const claudeFiles = await this.findClaudeAgentFiles();
      console.log(`📁 Found ${claudeFiles.length} Claude agent files`);

      // Step 2: Backup files
      await this.backupFiles(claudeFiles);

      // Step 3: Refactor each file
      for (const file of claudeFiles) {
        await this.refactorFile(file);
      }

      // Step 4: Install voice config dependency
      await this.installDependencies();

      // Step 5: TypeScript validation
      await this.validateTypeScript();

      // Step 6: Generate report
      await this.generateReport();

      console.log('✅ Claude voice refactor completed successfully!');

    } catch (error) {
      console.error('❌ Refactor failed:', error);
      this.errors.push({ file: 'main', error: error.message });
      await this.generateReport();
      throw error;
    }
  }

  /**
   * Find all Claude agent files
   */
  async findClaudeAgentFiles() {
    const files = [];
    
    try {
      // Search for files containing Claude references
      const { stdout } = await execAsync(`find "${this.baseDir}" -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.json" \\) -exec grep -l "claude\\|Claude\\|CLAUDE" {} \\; 2>/dev/null`);
      
      const candidateFiles = stdout.trim().split('\n').filter(f => f);
      
      // Filter for files that also contain voice-related patterns
      for (const file of candidateFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const hasVoicePattern = this.patterns.some(pattern => 
            content.toLowerCase().includes(pattern.toLowerCase())
          );
          
          if (hasVoicePattern) {
            files.push(file);
          }
        } catch (error) {
          // Skip files we can't read
          continue;
        }
      }

      return files;
    } catch (error) {
      console.warn('⚠️  Search command failed, using fallback method');
      return await this.fallbackFileSearch();
    }
  }

  /**
   * Fallback file search method
   */
  async fallbackFileSearch() {
    const files = [];
    const searchDirs = [
      'functions',
      'owner-interface', 
      'vls',
      'deploy-clean',
      'commands/claude',
      'core-protocols',
      'asoos-deployment'
    ];

    for (const dir of searchDirs) {
      const fullPath = path.join(this.baseDir, dir);
      try {
        await fs.access(fullPath);
        const dirFiles = await this.searchDirectory(fullPath);
        files.push(...dirFiles);
      } catch (error) {
        // Directory doesn't exist, skip
        continue;
      }
    }

    return files;
  }

  /**
   * Search directory recursively
   */
  async searchDirectory(dirPath) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.searchDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && this.extensions.includes(path.extname(entry.name))) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            if (content.toLowerCase().includes('claude') && 
                this.patterns.some(p => content.toLowerCase().includes(p.toLowerCase()))) {
              files.push(fullPath);
            }
          } catch (error) {
            // Skip files we can't read
            continue;
          }
        }
      }
    } catch (error) {
      this.errors.push({ file: dirPath, error: error.message });
    }
    
    return files;
  }

  /**
   * Backup files before refactoring
   */
  async backupFiles(files) {
    const backupDir = path.join(this.baseDir, '.backup', `claude-voice-refactor-${Date.now()}`);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      for (const file of files) {
        const relativePath = path.relative(this.baseDir, file);
        const backupFile = path.join(backupDir, relativePath);
        const backupFileDir = path.dirname(backupFile);
        
        await fs.mkdir(backupFileDir, { recursive: true });
        await fs.copyFile(file, backupFile);
      }
      
      console.log(`💾 Created backup in: ${backupDir}`);
    } catch (error) {
      console.error('⚠️  Backup failed:', error);
      throw error;
    }
  }

  /**
   * Refactor individual file
   */
  async refactorFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const ext = path.extname(filePath);
      
      let refactoredContent;
      let changed = false;

      if (ext === '.js' || ext === '.ts') {
        ({ content: refactoredContent, changed } = this.refactorJavaScript(content, filePath));
      } else if (ext === '.json') {
        ({ content: refactoredContent, changed } = this.refactorJSON(content, filePath));
      } else if (ext === '.yaml' || ext === '.yml') {
        ({ content: refactoredContent, changed } = this.refactorYAML(content, filePath));
      } else {
        return; // Skip unknown file types
      }

      if (changed) {
        await fs.writeFile(filePath, refactoredContent, 'utf8');
        this.refactorLog.push({
          file: filePath,
          type: 'refactored',
          message: 'Updated voice configuration'
        });
        console.log(`✏️  Refactored: ${path.relative(this.baseDir, filePath)}`);
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error refactoring ${filePath}:`, error.message);
    }
  }

  /**
   * Refactor JavaScript/TypeScript files
   */
  refactorJavaScript(content, filePath) {
    let newContent = content;
    let changed = false;

    // Add import for voice config if not present
    if (!newContent.includes('claude-voice-config')) {
      const importLine = "const claudeVoiceConfig = require('../lib/claude-voice-config');\n";
      
      // Find where to insert import
      const lines = newContent.split('\n');
      let insertIndex = 0;
      
      // Look for existing requires/imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('require(') || lines[i].includes('import ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, '', '// Voice configuration', importLine.trim());
      newContent = lines.join('\n');
      changed = true;
    }

    // Replace hardcoded voice IDs
    const voiceReplacements = [
      { pattern: /voiceId:\s*['"`]([^'"`]+)['"`]/g, replacement: "voiceId: (await claudeVoiceConfig.getVoiceConfig()).voice_id" },
      { pattern: /voice_id:\s*['"`]([^'"`]+)['"`]/g, replacement: "voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id" },
      { pattern: /ttsVoice:\s*['"`]([^'"`]+)['"`]/g, replacement: "ttsVoice: (await claudeVoiceConfig.getVoiceConfig()).voice_id" },
      { pattern: /['"`]voice['"`]:\s*['"`]([^'"`]+)['"`]/g, replacement: '"voice": (await claudeVoiceConfig.getVoiceConfig()).voice_id' },
      { pattern: /ELEVENLABS_VOICE\s*=\s*['"`]([^'"`]+)['"`]/g, replacement: 'ELEVENLABS_VOICE = (await claudeVoiceConfig.getVoiceConfig()).voice_id' }
    ];

    for (const { pattern, replacement } of voiceReplacements) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, replacement);
        changed = true;
      }
    }

    // Add voice initialization for Claude agents
    if (newContent.includes('claude') && !newContent.includes('claudeVoiceConfig.getClaudeAgentConfig')) {
      const agentInitPattern = /class\s+(\w*Claude\w*)/g;
      let match;
      
      while ((match = agentInitPattern.exec(newContent)) !== null) {
        const className = match[1];
        const constructorPattern = new RegExp(`constructor\\s*\\([^{]*\\{`, 'g');
        
        if (constructorPattern.test(newContent)) {
          const voiceInitCode = `
    // Initialize voice configuration
    this.initializeVoice();
  }
  
  async initializeVoice() {
    try {
      this.voiceConfig = await claudeVoiceConfig.getClaudeAgentConfig('${className}');
    } catch (error) {
      console.error('Failed to initialize voice config:', error);
      this.voiceConfig = { voice_id: 'Vee', backup_voice_id: 'Adam' };
    }`;
          
          newContent = newContent.replace(constructorPattern, match => match + voiceInitCode);
          changed = true;
        }
      }
    }

    return { content: newContent, changed };
  }

  /**
   * Refactor JSON files
   */
  refactorJSON(content, filePath) {
    try {
      const json = JSON.parse(content);
      let changed = false;

      // Recursively update voice configurations
      const updateVoiceConfig = (obj) => {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key in obj) {
          if (typeof obj[key] === 'object') {
            updateVoiceConfig(obj[key]);
          } else if (this.patterns.some(p => key.toLowerCase().includes(p.toLowerCase()))) {
            if (typeof obj[key] === 'string' && obj[key] !== 'Vee') {
              obj[key] = 'Vee';
              changed = true;
            }
          }
        }
      };

      updateVoiceConfig(json);

      // Add voice configuration section if this looks like a Claude config
      if (JSON.stringify(json).toLowerCase().includes('claude') && !json.voice_config) {
        json.voice_config = {
          primary_voice: 'Vee',
          backup_voice: 'Adam',
          synthesis_engine: 'hume_elevenlabs_hybrid',
          emotional_processing: true
        };
        changed = true;
      }

      return { 
        content: changed ? JSON.stringify(json, null, 2) : content, 
        changed 
      };

    } catch (error) {
      // Invalid JSON, skip
      return { content, changed: false };
    }
  }

  /**
   * Refactor YAML files
   */
  refactorYAML(content, filePath) {
    let newContent = content;
    let changed = false;

    // Simple string replacements for YAML
    const yamlReplacements = [
      { pattern: /voice:\s*['"`]?([^'"`\n\r]+)['"`]?/g, replacement: 'voice: "Vee"' },
      { pattern: /voice_id:\s*['"`]?([^'"`\n\r]+)['"`]?/g, replacement: 'voice_id: "Vee"' },
      { pattern: /voiceId:\s*['"`]?([^'"`\n\r]+)['"`]?/g, replacement: 'voiceId: "Vee"' }
    ];

    for (const { pattern, replacement } of yamlReplacements) {
      const originalContent = newContent;
      newContent = newContent.replace(pattern, replacement);
      if (newContent !== originalContent) {
        changed = true;
      }
    }

    return { content: newContent, changed };
  }

  /**
   * Install voice configuration dependencies
   */
  async installDependencies() {
    try {
      console.log('📦 Installing dependencies...');
      
      // Check if package.json exists and add dependency
      const packageJsonPath = path.join(this.baseDir, 'package.json');
      
      try {
        await fs.access(packageJsonPath);
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        
        if (!packageJson.dependencies) packageJson.dependencies = {};
        if (!packageJson.dependencies['@google-cloud/secret-manager']) {
          packageJson.dependencies['@google-cloud/secret-manager'] = '^5.0.0';
          await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
          
          // Install the dependency
          await execAsync('npm install @google-cloud/secret-manager', { cwd: this.baseDir });
          console.log('✅ Installed @google-cloud/secret-manager dependency');
        }
      } catch (error) {
        console.warn('⚠️  Could not update package.json:', error.message);
      }
      
    } catch (error) {
      console.warn('⚠️  Dependency installation failed:', error.message);
      this.errors.push({ file: 'dependencies', error: error.message });
    }
  }

  /**
   * Validate TypeScript compilation
   */
  async validateTypeScript() {
    try {
      console.log('🔍 Validating TypeScript...');
      
      const tscPath = '/opt/homebrew/bin/tsc';
      const { stdout, stderr } = await execAsync(`${tscPath} --noEmit --project .`, { 
        cwd: this.baseDir 
      });
      
      if (stderr) {
        console.warn('⚠️  TypeScript validation warnings:', stderr);
      } else {
        console.log('✅ TypeScript validation passed');
      }
      
    } catch (error) {
      console.warn('⚠️  TypeScript validation failed:', error.message);
      this.errors.push({ file: 'typescript', error: error.message });
    }
  }

  /**
   * Generate refactor report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        files_refactored: this.refactorLog.length,
        errors: this.errors.length,
        success: this.errors.length === 0
      },
      refactored_files: this.refactorLog,
      errors: this.errors,
      next_steps: [
        'Review refactored files for correctness',
        'Test voice functionality in staging environment',
        'Deploy to production with monitoring',
        'Update documentation'
      ]
    };

    const reportPath = path.join(this.baseDir, 'claude-voice-refactor-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Refactor report saved: ${reportPath}`);
    console.log(`📈 Summary: ${report.summary.files_refactored} files refactored, ${report.summary.errors} errors`);
  }
}

// Run the refactor if called directly
if (require.main === module) {
  const refactor = new ClaudeVoiceRefactor();
  refactor.refactor().catch(console.error);
}

module.exports = ClaudeVoiceRefactor;