/**
 * ASOOS Cryptographic Security Module
 * A KMS-backed encrypt/decrypt service
 * AES-256-GCM (envelope encryption).
 * A middleware to enforce TLS and set strict crypto headers.
 * A policy doc and a key-rotation script.
 * Enterprise-grade AES-256-GCM encryption for sensitive data
 * Integrates with OAuth2 + GCP Secret Manager architecture
 */

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

class ASOOSCrypto {
  constructor() {
    this.keyDerivationRounds = 100000; // PBKDF2 iterations
    this.saltLength = 32; // 256-bit salt
    this.keyLength = 32; // 256-bit key for AES-256
    this.ivLength = 12; // 96-bit nonce for GCM
    this.tagLength = 16; // 128-bit auth tag
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   * @param {string} plaintext - Data to encrypt
   * @param {Buffer} key32 - 256-bit encryption key
   * @param {Buffer} aad - Additional authenticated data (optional)
   * @returns {Object} { iv, ciphertext, tag }
   */
  encryptAesGcm256(plaintext, key32, aad = Buffer.alloc(0)) {
    if (!Buffer.isBuffer(key32) || key32.length !== 32) {
      throw new Error('Key must be a 32-byte Buffer for AES-256');
    }

    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv('aes-256-gcm', key32, iv, { authTagLength: this.tagLength });

    if (aad.length) {
      cipher.setAAD(aad, { plaintextLength: Buffer.byteLength(plaintext) });
    }

    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return { iv, ciphertext, tag };
  }

  /**
   * Decrypt ciphertext using AES-256-GCM
   * @param {Object} encryptedData - { iv, ciphertext, tag }
   * @param {Buffer} key32 - 256-bit decryption key
   * @param {Buffer} aad - Additional authenticated data (optional)
   * @returns {string} Decrypted plaintext
   */
  decryptAesGcm256({ iv, ciphertext, tag }, key32, aad = Buffer.alloc(0)) {
    if (!Buffer.isBuffer(key32) || key32.length !== 32) {
      throw new Error('Key must be a 32-byte Buffer for AES-256');
    }

    const decipher = createDecipheriv('aes-256-gcm', key32, iv, { authTagLength: this.tagLength });

    if (aad.length) {
      decipher.setAAD(aad, { plaintextLength: ciphertext.length });
    }

    decipher.setAuthTag(tag);

    try {
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return plaintext.toString('utf8');
    } catch (error) {
      throw new Error('Decryption failed: Invalid key, corrupted data, or authentication failure');
    }
  }

  /**
   * Derive encryption key from password using PBKDF2
   * @param {string} password - Password for key derivation
   * @param {Buffer} salt - Cryptographic salt (32 bytes)
   * @returns {Buffer} 256-bit derived key
   */
  deriveKeyPBKDF2(password, salt) {
    if (!Buffer.isBuffer(salt) || salt.length !== this.saltLength) {
      throw new Error('Salt must be a 32-byte Buffer');
    }

    return pbkdf2Sync(password, salt, this.keyDerivationRounds, this.keyLength, 'sha256');
  }

  /**
   * Derive encryption key from password using scrypt (async)
   * @param {string} password - Password for key derivation
   * @param {Buffer} salt - Cryptographic salt (32 bytes)
   * @returns {Promise<Buffer>} 256-bit derived key
   */
  async deriveKeyScrypt(password, salt) {
    if (!Buffer.isBuffer(salt) || salt.length !== this.saltLength) {
      throw new Error('Salt must be a 32-byte Buffer');
    }

    return await scryptAsync(password, salt, this.keyLength);
  }

  /**
   * Generate cryptographically secure salt
   * @returns {Buffer} 256-bit random salt
   */
  generateSalt() {
    return randomBytes(this.saltLength);
  }

  /**
   * Generate cryptographically secure key
   * @returns {Buffer} 256-bit random key
   */
  generateKey() {
    return randomBytes(this.keyLength);
  }

  /**
   * Encrypt sensitive data with password-based encryption
   * @param {string} plaintext - Data to encrypt
   * @param {string} password - Password for encryption
   * @param {string} contextInfo - Additional context for AAD
   * @returns {Object} Complete encrypted package
   */
  async encryptWithPassword(plaintext, password, contextInfo = '') {
    const salt = this.generateSalt();
    const key = await this.deriveKeyScrypt(password, salt);
    const aad = Buffer.from(contextInfo, 'utf8');

    const encrypted = this.encryptAesGcm256(plaintext, key, aad);

    return {
      salt: salt.toString('base64'),
      iv: encrypted.iv.toString('base64'),
      ciphertext: encrypted.ciphertext.toString('base64'),
      tag: encrypted.tag.toString('base64'),
      contextInfo,
      algorithm: 'aes-256-gcm',
      keyDerivation: 'scrypt',
    };
  }

  /**
   * Decrypt sensitive data with password-based encryption
   * @param {Object} encryptedPackage - Complete encrypted package
   * @param {string} password - Password for decryption
   * @returns {string} Decrypted plaintext
   */
  async decryptWithPassword(encryptedPackage, password) {
    const {
      salt: saltB64,
      iv: ivB64,
      ciphertext: ciphertextB64,
      tag: tagB64,
      contextInfo,
    } = encryptedPackage;

    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const ciphertext = Buffer.from(ciphertextB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const aad = Buffer.from(contextInfo || '', 'utf8');

    const key = await this.deriveKeyScrypt(password, salt);

    return this.decryptAesGcm256({ iv, ciphertext, tag }, key, aad);
  }

  /**
   * Encrypt OAuth2 tokens securely
   * @param {Object} tokenData - OAuth2 token data
   * @param {string} masterPassword - Master password for token encryption
   * @returns {Object} Encrypted token package
   */
  async encryptOAuth2Token(tokenData, masterPassword) {
    const tokenJson = JSON.stringify(tokenData);
    const contextInfo = `oauth2_token_${Date.now()}`;

    return await this.encryptWithPassword(tokenJson, masterPassword, contextInfo);
  }

  /**
   * Decrypt OAuth2 tokens securely
   * @param {Object} encryptedPackage - Encrypted token package
   * @param {string} masterPassword - Master password for token decryption
   * @returns {Object} Decrypted token data
   */
  async decryptOAuth2Token(encryptedPackage, masterPassword) {
    const tokenJson = await this.decryptWithPassword(encryptedPackage, masterPassword);
    return JSON.parse(tokenJson);
  }
}

// Export functions for backward compatibility with your existing code
export function encryptAesGcm256(plaintext, key32, aad = Buffer.alloc(0)) {
  const crypto = new ASOOSCrypto();
  return crypto.encryptAesGcm256(plaintext, key32, aad);
}

export function decryptAesGcm256({ iv, ciphertext, tag }, key32, aad = Buffer.alloc(0)) {
  const crypto = new ASOOSCrypto();
  return crypto.decryptAesGcm256({ iv, ciphertext, tag }, key32, aad);
}

// Export the enhanced crypto class
export { ASOOSCrypto };

// Export utility functions
export const CryptoUtils = {
  /**
   * Secure comparison to prevent timing attacks
   */
  constantTimeEquals(a, b) {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  },

  /**
   * Generate secure random string for session IDs, nonces, etc.
   */
  generateSecureToken(length = 32) {
    return randomBytes(length).toString('base64url');
  },

  /**
   * Hash data with salt (for password verification, etc.)
   */
  async hashWithSalt(data, salt) {
    const key = await scryptAsync(data, salt, 32);
    return key.toString('base64');
  },
};
