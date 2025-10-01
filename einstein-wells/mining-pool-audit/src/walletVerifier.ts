/**
 * Wallet Address Verification System
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * Internal wallet address verification for mining pool configurations
 * OAuth2 secured with Google Secret Manager integration
 */

import { auditLogger } from './logger';
import { WalletVerification, PayoutRule } from './types';
import { getWalletAddress } from './env';

export class WalletVerifier {
  private expectedAddresses: Map<string, string> = new Map();
  
  constructor() {
    // Cache will be populated on first use
  }

  /**
   * Initialize expected wallet addresses from Secret Manager
   */
  private async initializeExpectedAddresses(): Promise<void> {
    if (this.expectedAddresses.size === 0) {
      try {
        const btcAddress = await getWalletAddress('btc');
        const xmrAddress = await getWalletAddress('xmr');
        
        this.expectedAddresses.set('BTC', btcAddress);
        this.expectedAddresses.set('XMR', xmrAddress);
        
        auditLogger.debug('Initialized expected wallet addresses from Secret Manager', {
          currencies: Array.from(this.expectedAddresses.keys())
        });
      } catch (error) {
        auditLogger.error('Failed to initialize expected wallet addresses', error);
        throw error;
      }
    }
  }

  /**
   * Verify wallet addresses against expected addresses
   */
  async verifyWalletAddresses(payoutRules: PayoutRule[]): Promise<WalletVerification[]> {
    await this.initializeExpectedAddresses();
    
    const verifications: WalletVerification[] = [];

    for (const rule of payoutRules) {
      const expectedAddress = this.expectedAddresses.get(rule.currency);
      
      if (!expectedAddress) {
        auditLogger.warn(`No expected address configured for currency: ${rule.currency}`, {
          poolName: rule.poolName,
          currency: rule.currency
        });
        continue;
      }

      const verification: WalletVerification = {
        expectedAddress,
        configuredAddress: rule.configuredPayoutAddress,
        isMatch: this.compareAddresses(expectedAddress, rule.configuredPayoutAddress),
        currency: rule.currency,
        poolName: rule.poolName,
      };

      verifications.push(verification);

      auditLogger.walletVerification(
        rule.poolName, 
        rule.currency, 
        verification.isMatch, 
        {
          expectedAddress: this.maskAddress(expectedAddress),
          configuredAddress: this.maskAddress(rule.configuredPayoutAddress),
        }
      );
    }

    return verifications;
  }

  /**
   * Compare two wallet addresses (handles different formats)
   */
  private compareAddresses(expected: string, configured: string): boolean {
    if (!expected || !configured) {
      return false;
    }

    // Direct comparison
    if (expected === configured) {
      return true;
    }

    // Normalize addresses by removing common prefixes/suffixes and comparing
    const normalizedExpected = this.normalizeAddress(expected);
    const normalizedConfigured = this.normalizeAddress(configured);

    return normalizedExpected === normalizedConfigured;
  }

  /**
   * Normalize wallet address for comparison
   */
  private normalizeAddress(address: string): string {
    if (!address) return '';

    // Remove whitespace and convert to lowercase for comparison
    let normalized = address.trim().toLowerCase();

    // Handle Bitcoin address formats (Legacy, SegWit, Bech32)
    if (normalized.startsWith('bitcoin:')) {
      normalized = normalized.replace('bitcoin:', '');
    }

    // Remove query parameters from BIP21 URIs
    const questionIndex = normalized.indexOf('?');
    if (questionIndex > 0) {
      normalized = normalized.substring(0, questionIndex);
    }

    return normalized;
  }

  /**
   * Mask wallet address for logging (show first 6 and last 4 characters)
   */
  private maskAddress(address: string): string {
    if (!address || address.length < 11) {
      return '***masked***';
    }

    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * Validate wallet address format
   */
  validateAddressFormat(address: string, currency: string): boolean {
    if (!address) return false;

    switch (currency.toUpperCase()) {
      case 'BTC':
        return this.validateBitcoinAddress(address);
      case 'XMR':
        return this.validateMoneroAddress(address);
      default:
        auditLogger.warn(`Unknown currency for address validation: ${currency}`);
        return true; // Allow unknown currencies to pass
    }
  }

  /**
   * Validate Bitcoin address format
   */
  private validateBitcoinAddress(address: string): boolean {
    const btcRegex = /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/;
    return btcRegex.test(address);
  }

  /**
   * Validate Monero address format
   */
  private validateMoneroAddress(address: string): boolean {
    const xmrRegex = /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/;
    return xmrRegex.test(address);
  }

  /**
   * Get summary of wallet verification results
   */
  getVerificationSummary(verifications: WalletVerification[]): {
    totalChecked: number;
    matchingAddresses: number;
    mismatchedAddresses: number;
    mismatches: WalletVerification[];
  } {
    const mismatches = verifications.filter(v => !v.isMatch);

    return {
      totalChecked: verifications.length,
      matchingAddresses: verifications.length - mismatches.length,
      mismatchedAddresses: mismatches.length,
      mismatches,
    };
  }

  /**
   * Add or update expected address for a currency
   */
  async updateExpectedAddress(currency: string, address: string): Promise<void> {
    if (!this.validateAddressFormat(address, currency)) {
      throw new Error(`Invalid address format for ${currency}: ${address}`);
    }

    this.expectedAddresses.set(currency.toUpperCase(), address);
    
    auditLogger.info(`Updated expected address for ${currency}`, {
      currency: currency.toUpperCase(),
      address: this.maskAddress(address),
    });
  }

  /**
   * Clear cached addresses (useful for testing)
   */
  clearCache(): void {
    this.expectedAddresses.clear();
  }
}

// Singleton instance for internal use
export const walletVerifier = new WalletVerifier();