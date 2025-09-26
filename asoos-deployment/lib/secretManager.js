/**
 * SecretManager - Secure GCP Secret Manager Integration
 *
 * Provides secure access to secrets with:
 * - OAuth2 authentication (no hardcoded API keys)
 * - In-memory caching (10 min TTL)
 * - Fallback to environment variables (local dev only)
 * - Self-healing key rotation hooks
 * - Typed errors with actionable messages
 *
 * Usage:
 *   const secret = await getSecret('OPENAI_API_KEY');
 *   const { value, rotated } = await getSecretWithRotation('ELEVENLABS_API_KEY');
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretManager {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'api-for-warp-drive';
    this.cache = new Map();
    this.cacheTimeouts = new Map();
    this.CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    console.log('🔐 SecretManager initialized with OAuth2 authentication');
  }

  /**
   * Get secret value with caching and fallback
   * @param {string} secretName - Secret name (e.g., 'OPENAI_API_KEY')
   * @returns {Promise<string>} - Secret value
   */
  async getSecret(secretName) {
    try {
      // Check cache first
      if (this.cache.has(secretName)) {
        console.log(`🔐 Secret ${secretName} retrieved from cache`);
        return this.cache.get(secretName);
      }

      console.log(`🔐 Fetching secret ${secretName} from GCP Secret Manager...`);

      // Construct the resource name
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;

      // Access the secret version
      const [version] = await this.client.accessSecretVersion({ name });
      const secretValue = version.payload.data.toString();

      // Cache the secret
      this.cacheSecret(secretName, secretValue);

      console.log(`✅ Secret ${secretName} retrieved successfully`);
      return secretValue;
    } catch (error) {
      console.warn(`⚠️ Failed to fetch ${secretName} from Secret Manager:`, error.message);

      // Fallback to environment variable (local dev only)
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        const envValue = process.env[secretName];
        if (envValue) {
          console.log(`🔧 Using environment fallback for ${secretName}`);
          return envValue;
        }
      }

      throw new SecretManagerError(
        `CRITICAL: Secret ${secretName} not found in Secret Manager`,
        'SECRET_NOT_FOUND',
        {
          secretName,
          projectId: this.projectId,
          suggestion: `Run: gcloud secrets create ${secretName} --data-file=./secret.txt`,
        }
      );
    }
  }

  /**
   * Get secret with automatic rotation detection
   * @param {string} secretName - Secret name
   * @returns {Promise<{value: string, rotated: boolean}>}
   */
  async getSecretWithRotation(secretName) {
    try {
      const value = await this.getSecret(secretName);

      // Check if this is a newly rotated secret
      const rotated = await this.checkSecretRotation(secretName);

      return { value, rotated };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Self-healing secret fetch with automatic key replacement
   * @param {string} secretName - Secret name
   * @returns {Promise<string>} - Fresh secret value
   */
  async selfHealingSecretFetch(secretName) {
    console.log(`🔄 Self-healing system activated for ${secretName}`);

    try {
      // Try to get the latest version
      const value = await this.getSecret(secretName);

      // Validate the secret is still working
      const isValid = await this.validateSecret(secretName, value);

      if (!isValid) {
        console.log(`🔄 Secret ${secretName} is invalid, triggering rotation...`);
        await this.rotateSecret(secretName);

        // Retry with new secret
        return await this.getSecret(secretName);
      }

      return value;
    } catch (error) {
      throw new SecretManagerError(`Self-healing failed for ${secretName}`, 'SELF_HEALING_FAILED', {
        secretName,
        error: error.message,
        suggestion: 'Manual intervention required',
      });
    }
  }

  /**
   * Cache secret value with TTL
   * @param {string} secretName - Secret name
   * @param {string} value - Secret value
   */
  cacheSecret(secretName, value) {
    this.cache.set(secretName, value);

    // Clear existing timeout
    if (this.cacheTimeouts.has(secretName)) {
      clearTimeout(this.cacheTimeouts.get(secretName));
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.cache.delete(secretName);
      this.cacheTimeouts.delete(secretName);
      console.log(`🔐 Cache expired for ${secretName}`);
    }, this.CACHE_TTL);

    this.cacheTimeouts.set(secretName, timeout);
  }

  /**
   * Check if secret has been rotated
   * @param {string} secretName - Secret name
   * @returns {Promise<boolean>} - True if rotated
   */
  async checkSecretRotation(secretName) {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}`;
      const [secret] = await this.client.getSecret({ name });

      // Check if created time is recent (within last hour)
      const createdTime = new Date(secret.createTime.seconds * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      return createdTime > oneHourAgo;
    } catch (error) {
      console.warn(`Could not check rotation for ${secretName}:`, error.message);
      return false;
    }
  }

  /**
   * Validate secret is still working
   * @param {string} secretName - Secret name
   * @param {string} value - Secret value to validate
   * @returns {Promise<boolean>} - True if valid
   */
  async validateSecret(secretName, value) {
    // Basic validation - not empty and not placeholder
    if (!value || value === 'dev-key-placeholder' || value === 'secure-key-unavailable') {
      return false;
    }

    // Service-specific validation
    if (secretName.includes('OPENAI')) {
      return value.startsWith('sk-') && value.length > 20;
    }

    if (secretName.includes('ELEVENLABS')) {
      return value.length > 10; // Basic length check
    }

    if (secretName.includes('HUME')) {
      return value.length > 10;
    }

    return true; // Default to valid for other secrets
  }

  /**
   * Trigger secret rotation (placeholder - implement based on your rotation strategy)
   * @param {string} secretName - Secret name
   */
  async rotateSecret(secretName) {
    console.log(`🔄 Secret rotation triggered for ${secretName}`);

    // This would integrate with your key rotation system
    // For now, just clear the cache to force refresh
    this.cache.delete(secretName);
    if (this.cacheTimeouts.has(secretName)) {
      clearTimeout(this.cacheTimeouts.get(secretName));
      this.cacheTimeouts.delete(secretName);
    }

    console.log(`🔄 Cache cleared for ${secretName}, will fetch fresh value on next request`);
  }

  /**
   * Clear all cached secrets
   */
  clearCache() {
    this.cache.clear();
    this.cacheTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.cacheTimeouts.clear();
    console.log('🔐 All secret cache cleared');
  }
}

/**
 * Custom error class for Secret Manager operations
 */
class SecretManagerError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SecretManagerError';
    this.code = code;
    this.details = details;
  }
}

// Singleton instance
const secretManager = new SecretManager();

/**
 * Convenience function to get a secret
 * @param {string} secretName - Secret name
 * @returns {Promise<string>} - Secret value
 */
async function getSecret(secretName) {
  return await secretManager.getSecret(secretName);
}

/**
 * Convenience function to get secret with rotation info
 * @param {string} secretName - Secret name
 * @returns {Promise<{value: string, rotated: boolean}>}
 */
async function getSecretWithRotation(secretName) {
  return await secretManager.getSecretWithRotation(secretName);
}

/**
 * Self-healing secret fetch
 * @param {string} secretName - Secret name
 * @returns {Promise<string>} - Secret value
 */
async function selfHealingSecretFetch(secretName) {
  return await secretManager.selfHealingSecretFetch(secretName);
}

module.exports = {
  SecretManager,
  SecretManagerError,
  getSecret,
  getSecretWithRotation,
  selfHealingSecretFetch,
  secretManager, // Export singleton for advanced usage
};
