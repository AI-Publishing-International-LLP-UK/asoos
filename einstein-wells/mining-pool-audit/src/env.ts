/**
 * Internal OAuth2/OIDC Environment Management
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * Secure credential management using Google Cloud Secret Manager
 * No external API sharing - internal systems only
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { config } from 'dotenv';
import { InternalConfig, OAuth2Config } from './types';

// Load local development environment if available
config();

interface SecretCache {
  [key: string]: string;
  lastUpdated: number;
}

class InternalEnvironmentManager {
  private secretManager: SecretManagerServiceClient;
  private cache: SecretCache = { lastUpdated: 0 };
  private cacheTimeout = 300000; // 5 minutes
  private projectId: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.secretManager = new SecretManagerServiceClient();
  }

  /**
   * Get OAuth2 configuration for internal mining pool access
   */
  async getOAuth2Config(poolName: string): Promise<OAuth2Config> {
    const config: OAuth2Config = {
      clientId: await this.getSecret(`mining-pool-oauth2-${poolName}-client-id`),
      clientSecret: await this.getSecret(`mining-pool-oauth2-${poolName}-client-secret`),
      authorizationUrl: await this.getSecret(`mining-pool-oauth2-${poolName}-auth-url`),
      tokenUrl: await this.getSecret(`mining-pool-oauth2-${poolName}-token-url`),
      redirectUri: await this.getSecret(`mining-pool-oauth2-${poolName}-redirect-uri`),
      scope: (await this.getSecret(`mining-pool-oauth2-${poolName}-scope`)).split(','),
    };

    return config;
  }

  /**
   * Get expected wallet address for verification
   */
  async getWalletAddress(currency: string): Promise<string> {
    return await this.getSecret(`mining-wallet-${currency.toLowerCase()}-address`);
  }

  /**
   * Get internal system configuration
   */
  async getInternalConfig(): Promise<InternalConfig> {
    const config: InternalConfig = {
      oauth2: {
        nicehash: await this.getOAuth2Config('nicehash'),
        slushpool: await this.getOAuth2Config('slushpool'),
      },
      wallets: {
        btc: await this.getWalletAddress('btc'),
        xmr: await this.getWalletAddress('xmr'),
      },
      chainConfig: {
        tolerance: parseFloat(await this.getSecret('chain-verification-tolerance') || '5.0'),
        cycleDefinition: {
          durationSeconds: parseInt(await this.getSecret('computational-cycle-duration') || '3600'),
          startTimestamp: parseInt(await this.getSecret('computational-cycle-start-timestamp') || '0'),
        },
        rpcEndpoints: {
          btc: await this.getSecret('btc-rpc-endpoint') || 'https://blockstream.info/api',
          xmr: await this.getSecret('xmr-rpc-endpoint') || 'https://xmrchain.net/api',
        },
      },
      monitoring: {
        logLevel: (await this.getSecret('audit-log-level') || 'info') as 'debug' | 'info' | 'warn' | 'error',
        alertThresholds: {
          balanceThreshold: parseFloat(await this.getSecret('balance-alert-threshold') || '0.01'),
          discrepancyThreshold: parseFloat(await this.getSecret('discrepancy-alert-threshold') || '2.0'),
          addressMismatchAlert: (await this.getSecret('address-mismatch-alert') || 'true') === 'true',
        },
      },
    };

    return config;
  }

  /**
   * Securely retrieve secret from Google Cloud Secret Manager
   */
  private async getSecret(secretName: string): Promise<string> {
    const cacheKey = `secret_${secretName}`;
    const now = Date.now();

    // Check cache first
    if (this.cache[cacheKey] && (now - this.cache.lastUpdated) < this.cacheTimeout) {
      return this.cache[cacheKey];
    }

    try {
      // Try Google Cloud Secret Manager first
      const secretPath = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({
        name: secretPath,
      });

      const secret = version.payload?.data?.toString();
      if (!secret) {
        throw new Error(`Secret ${secretName} is empty or undefined`);
      }

      // Cache the secret
      this.cache[cacheKey] = secret;
      this.cache.lastUpdated = now;

      return secret;
    } catch (error) {
      // Fallback to environment variables for local development
      const envValue = process.env[secretName.toUpperCase().replace(/-/g, '_')];
      if (envValue) {
        console.warn(`Using environment variable for ${secretName} (development mode)`);
        return envValue;
      }

      throw new Error(`Failed to retrieve secret ${secretName}: ${error}`);
    }
  }

  /**
   * Validate that all required secrets are accessible
   */
  async validateSecrets(): Promise<void> {
    const requiredSecrets = [
      'mining-pool-oauth2-nicehash-client-id',
      'mining-pool-oauth2-nicehash-client-secret',
      'mining-pool-oauth2-slushpool-client-id',
      'mining-pool-oauth2-slushpool-client-secret',
      'mining-wallet-btc-address',
    ];

    const errors: string[] = [];

    for (const secretName of requiredSecrets) {
      try {
        await this.getSecret(secretName);
      } catch (error) {
        errors.push(`Missing required secret: ${secretName}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Secret validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Clear cached secrets (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache = { lastUpdated: 0 };
  }
}

// Singleton instance for internal use only
export const environmentManager = new InternalEnvironmentManager();

// Utility functions for easy access
export const getOAuth2Config = (poolName: string): Promise<OAuth2Config> => 
  environmentManager.getOAuth2Config(poolName);

export const getWalletAddress = (currency: string): Promise<string> => 
  environmentManager.getWalletAddress(currency);

export const getInternalConfig = (): Promise<InternalConfig> => 
  environmentManager.getInternalConfig();

export const validateEnvironment = (): Promise<void> => 
  environmentManager.validateSecrets();