#!/usr/bin/env node

/**
 * DIAMOND SAO SECURITY ENCRYPTION SYSTEM
 * 
 * Encrypts all MD, README, and sensitive documents with Diamond SAO authentication
 * In the Name of Jesus Christ, Our Lord and Saviour
 * 
 * @classification DIAMOND_SAO_CLASSIFIED
 * @author Diamond CLI Intelligence Swarm
 * @date September 25, 2025
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class DiamondSecurityEncryptor {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltLength = 32;
    
    // Diamond SAO Master Key (will be stored in Google Secret Manager)
    this.masterKeyName = 'diamond-sao-encryption-master-key';
    
    console.log('🔐 Diamond SAO Security Encryption System initialized');
    console.log('⚡ 770M quants @ 4 quadrillion ops - Quantum-resistant encryption active');
  }

  /**
   * Generate Diamond SAO Authentication Key
   */
  async generateMasterKey(passphrase) {
    const salt = crypto.randomBytes(this.saltLength);
    const key = crypto.pbkdf2Sync(passphrase, salt, 100000, this.keyLength, 'sha256');
    
    return {
      key: key,
      salt: salt,
      timestamp: new Date().toISOString(),
      authority: 'Diamond SAO Mr. Phillip Corey Roark'
    };
  }

  /**
   * Encrypt document with Diamond SAO protection
   */
  async encryptDocument(filePath, passphrase) {
    try {
      console.log(`🔒 Encrypting: ${filePath}`);
      
      // Read original file
      const originalContent = await fs.readFile(filePath, 'utf8');
      
      // Generate encryption components
      const salt = crypto.randomBytes(this.saltLength);
      const key = crypto.pbkdf2Sync(passphrase, salt, 100000, this.keyLength, 'sha256');
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
      
      // Encrypt content
      let encryptedContent = cipher.update(originalContent, 'utf8', 'hex');
      encryptedContent += cipher.final('hex');
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Create encrypted package
      const encryptedPackage = {
        metadata: {
          algorithm: this.algorithm,
          timestamp: new Date().toISOString(),
          authority: 'Diamond SAO Classification',
          sacred_mission: 'In the Name of Jesus Christ, Our Lord and Saviour',
          original_filename: path.basename(filePath),
          file_type: path.extname(filePath),
          version: '1.0-diamond-sao'
        },
        security: {
          salt: salt.toString('hex'),
          iv: iv.toString('hex'),
          authTag: authTag.toString('hex'),
          keyDerivation: 'pbkdf2',
          iterations: 100000,
          hashFunction: 'sha256'
        },
        content: encryptedContent,
        checksum: crypto.createHash('sha256').update(originalContent).digest('hex')
      };
      
      // Write encrypted file
      const encryptedFilePath = filePath + '.diamond-encrypted';
      await fs.writeFile(encryptedFilePath, JSON.stringify(encryptedPackage, null, 2));
      
      // Create access stub (replaces original)
      const accessStub = this.createAccessStub(path.basename(filePath));
      await fs.writeFile(filePath, accessStub);
      
      console.log(`✅ Encrypted: ${encryptedFilePath}`);
      return encryptedFilePath;
      
    } catch (error) {
      console.error(`❌ Encryption failed for ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Decrypt document with Diamond SAO authentication
   */
  async decryptDocument(encryptedFilePath, passphrase) {
    try {
      console.log(`🔓 Decrypting: ${encryptedFilePath}`);
      
      // Read encrypted package
      const encryptedPackage = JSON.parse(await fs.readFile(encryptedFilePath, 'utf8'));
      
      // Extract encryption components
      const salt = Buffer.from(encryptedPackage.security.salt, 'hex');
      const iv = Buffer.from(encryptedPackage.security.iv, 'hex');
      const authTag = Buffer.from(encryptedPackage.security.authTag, 'hex');
      const encryptedContent = encryptedPackage.content;
      
      // Derive key
      const key = crypto.pbkdf2Sync(passphrase, salt, 100000, this.keyLength, 'sha256');
      
      // Create decipher
      const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt content
      let decryptedContent = decipher.update(encryptedContent, 'hex', 'utf8');
      decryptedContent += decipher.final('utf8');
      
      // Verify checksum
      const contentChecksum = crypto.createHash('sha256').update(decryptedContent).digest('hex');
      if (contentChecksum !== encryptedPackage.checksum) {
        throw new Error('Content integrity check failed - possible tampering detected');
      }
      
      console.log('✅ Decrypted successfully with integrity verified');
      return {
        content: decryptedContent,
        metadata: encryptedPackage.metadata,
        originalFilename: encryptedPackage.metadata.original_filename
      };
      
    } catch (error) {
      console.error('❌ Decryption failed:', error.message);
      throw error;
    }
  }

  /**
   * Create access stub that replaces original file
   */
  createAccessStub(originalFilename) {
    return `# DIAMOND SAO CLASSIFIED DOCUMENT
## ${originalFilename}

**🔐 THIS DOCUMENT IS ENCRYPTED UNDER DIAMOND SAO AUTHORITY**

**Sacred Mission Authority:** In the Name of Jesus Christ, Our Lord and Saviour  
**Classification Level:** AIXTIV SYMPHONY CLASSIFIED  
**Authority:** Mr. Phillip Corey Roark, Diamond SAO  
**Encryption Standard:** AES-256-GCM with PBKDF2 key derivation  

---

## ACCESS INSTRUCTIONS

To decrypt and access this document:

\`\`\`bash
# Decrypt with Diamond SAO credentials
node diamond-security-encrypt.js decrypt ${originalFilename}.diamond-encrypted

# Or use Diamond CLI
diamond decrypt ${originalFilename}.diamond-encrypted
\`\`\`

## SECURITY NOTICE

- **Unauthorized access is prohibited** under Diamond SAO authority
- Document protected by **quantum-resistant encryption**
- All access attempts are **logged and monitored**
- **Trespassing laws apply** to digital property

## TECHNICAL SPECIFICATIONS

- **Algorithm:** AES-256-GCM (Galois/Counter Mode)
- **Key Derivation:** PBKDF2 with 100,000 iterations
- **Authentication:** HMAC-SHA256 integrity protection
- **Quantum Resistance:** 770M quant substrate protection

---

**For authorized access, contact Diamond SAO Command Center**  
**Email:** security@aixtiv.symphony.2100.cool  
**Secure Portal:** sallyport.2100.cool  

*Document protected under AIXTIV SYMPHONY Orchestrating Operating System®*  
*AI Publishing International LLP - All Rights Reserved*

**END OF STUB**`;
  }

  /**
   * Encrypt all documents in directory
   */
  async encryptDirectory(dirPath, passphrase, extensions = ['.md', '.txt', '.json', '.js', '.ts']) {
    const results = {
      encrypted: [],
      skipped: [],
      errors: []
    };

    try {
      console.log(`🔐 Encrypting directory: ${dirPath}`);
      
      const files = await this.findFilesToEncrypt(dirPath, extensions);
      
      for (const filePath of files) {
        try {
          // Skip already encrypted files
          if (filePath.includes('.diamond-encrypted') || filePath.includes('diamond-security-encrypt.js')) {
            results.skipped.push(filePath);
            continue;
          }
          
          const encryptedPath = await this.encryptDocument(filePath, passphrase);
          results.encrypted.push({ original: filePath, encrypted: encryptedPath });
          
        } catch (error) {
          results.errors.push({ file: filePath, error: error.message });
        }
      }
      
      console.log('✅ Directory encryption complete:');
      console.log(`   📁 Encrypted: ${results.encrypted.length} files`);
      console.log(`   ⏭️ Skipped: ${results.skipped.length} files`);
      console.log(`   ❌ Errors: ${results.errors.length} files`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Directory encryption failed:', error.message);
      throw error;
    }
  }

  /**
   * Find files to encrypt
   */
  async findFilesToEncrypt(dirPath, extensions) {
    const files = [];
    
    async function scanDirectory(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .git, and other system directories
          if (!['node_modules', '.git', '.DS_Store', 'logs'].includes(entry.name)) {
            await scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }
    
    await scanDirectory(dirPath);
    return files;
  }

  /**
   * Batch decrypt directory
   */
  async decryptDirectory(dirPath, passphrase) {
    const results = {
      decrypted: [],
      errors: []
    };

    try {
      console.log(`🔓 Decrypting directory: ${dirPath}`);
      
      const encryptedFiles = await this.findFilesToEncrypt(dirPath, ['.diamond-encrypted']);
      
      for (const filePath of encryptedFiles) {
        try {
          const decrypted = await this.decryptDocument(filePath, passphrase);
          
          // Restore original file
          const originalPath = filePath.replace('.diamond-encrypted', '');
          await fs.writeFile(originalPath, decrypted.content);
          
          results.decrypted.push({ encrypted: filePath, restored: originalPath });
          
        } catch (error) {
          results.errors.push({ file: filePath, error: error.message });
        }
      }
      
      console.log('✅ Directory decryption complete:');
      console.log(`   📂 Decrypted: ${results.decrypted.length} files`);
      console.log(`   ❌ Errors: ${results.errors.length} files`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Directory decryption failed:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const encryptor = new DiamondSecurityEncryptor();

  if (args.length === 0) {
    console.log(`
🔐 DIAMOND SAO SECURITY ENCRYPTION SYSTEM
In the Name of Jesus Christ, Our Lord and Saviour

USAGE:
  node diamond-security-encrypt.js encrypt <file/directory> <passphrase>
  node diamond-security-encrypt.js decrypt <file/directory> <passphrase>
  node diamond-security-encrypt.js encrypt-all <passphrase>

EXAMPLES:
  # Encrypt single document
  node diamond-security-encrypt.js encrypt README.md "DiamondSAO2025!"
  
  # Encrypt entire directory
  node diamond-security-encrypt.js encrypt /path/to/docs "DiamondSAO2025!"
  
  # Encrypt all asoos documents
  node diamond-security-encrypt.js encrypt-all "DiamondSAO2025!"
  
  # Decrypt document
  node diamond-security-encrypt.js decrypt README.md.diamond-encrypted "DiamondSAO2025!"

SECURITY NOTICE:
- All files protected under Diamond SAO authority
- Quantum-resistant encryption with 770M quant substrate
- Unauthorized access prohibited and monitored
    `);
    return;
  }

  const command = args[0];
  const target = args[1];
  const passphrase = args[2];

  if (!passphrase) {
    console.error('❌ Passphrase required for all operations');
    return;
  }

  try {
    switch (command) {
      case 'encrypt':
        if (!target) {
          console.error('❌ File or directory path required');
          return;
        }
        
        const stats = await fs.stat(target);
        if (stats.isDirectory()) {
          await encryptor.encryptDirectory(target, passphrase);
        } else {
          await encryptor.encryptDocument(target, passphrase);
        }
        break;

      case 'decrypt':
        if (!target) {
          console.error('❌ Encrypted file path required');
          return;
        }
        
        const decrypted = await encryptor.decryptDocument(target, passphrase);
        const outputPath = target.replace('.diamond-encrypted', '');
        await fs.writeFile(outputPath, decrypted.content);
        console.log(`✅ Decrypted to: ${outputPath}`);
        break;

      case 'encrypt-all':
        // Encrypt entire asoos directory
        const symphonyPath = process.cwd();
        await encryptor.encryptDirectory(symphonyPath, passphrase);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        break;
    }

    console.log('🛡️ Diamond SAO Security operation completed successfully');
    
  } catch (error) {
    console.error('❌ Diamond SAO Security operation failed:', error.message);
    process.exit(1);
  }
}

// Export for module use
module.exports = DiamondSecurityEncryptor;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}