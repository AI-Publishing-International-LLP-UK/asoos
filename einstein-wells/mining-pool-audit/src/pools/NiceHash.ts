/**
 * NiceHash Pool Client - Internal OAuth2 Implementation
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * Secure internal access to NiceHash mining pool data
 * No external API sharing - OAuth2/OIDC enterprise security
 */

import { BasePool } from './BasePool';
import { OAuth2Config, MiningPoolBalance, PayoutRule } from '../types';
import { auditLogger } from '../logger';

export class NiceHashPool extends BasePool {
  private baseUrl: string;

  constructor(oauth2Config: OAuth2Config) {
    super('nicehash', oauth2Config);
    this.baseUrl = 'https://api2.nicehash.com';
  }

  /**
   * Get unpaid balances from NiceHash
   */
  async getBalances(): Promise<MiningPoolBalance[]> {
    try {
      auditLogger.debug('Fetching NiceHash balances');
      
      const response = await this._request(`${this.baseUrl}/main/api/v2/accounting/accounts2`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch balances from NiceHash');
      }

      const balances: MiningPoolBalance[] = [];
      const currencies = response.data.currencies || {};

      Object.entries(currencies).forEach(([currency, data]: [string, any]) => {
        if (data && typeof data === 'object') {
          const balance: MiningPoolBalance = {
            poolName: 'nicehash',
            currency: currency.toUpperCase(),
            unpaidBalance: parseFloat(data.unpaid || '0'),
            confirmedBalance: parseFloat(data.available || '0'),
            unconfirmedBalance: parseFloat(data.pending || '0'),
            lastUpdated: new Date(),
          };

          balances.push(balance);
          auditLogger.balanceCheck('nicehash', currency, balance.unpaidBalance);
        }
      });

      return balances;
    } catch (error) {
      auditLogger.error('Failed to fetch NiceHash balances', error);
      throw error;
    }
  }

  /**
   * Get payout rules and configurations from NiceHash
   */
  async getPayoutRules(): Promise<PayoutRule[]> {
    try {
      auditLogger.debug('Fetching NiceHash payout rules');
      
      // Get mining addresses (payout addresses)
      const addressResponse = await this._request(`${this.baseUrl}/main/api/v2/mining/addresses`);
      
      if (!addressResponse.success || !addressResponse.data) {
        throw new Error('Failed to fetch mining addresses from NiceHash');
      }

      // Get payout settings
      const payoutResponse = await this._request(`${this.baseUrl}/main/api/v2/accounting/withdrawal/addresses`);

      const payoutRules: PayoutRule[] = [];
      const miningAddresses = addressResponse.data.list || [];
      const withdrawalAddresses = payoutResponse.success ? (payoutResponse.data.list || []) : [];

      // Process mining addresses to extract payout information
      miningAddresses.forEach((address: any) => {
        if (address && address.currency) {
          const withdrawalInfo = withdrawalAddresses.find((wa: any) => 
            wa.currency === address.currency
          );

          const payoutRule: PayoutRule = {
            poolName: 'nicehash',
            currency: address.currency.toUpperCase(),
            minimumPayout: parseFloat(withdrawalInfo?.withdrawalMin || address.threshold || '0'),
            payoutFrequency: 'threshold', // NiceHash typically uses threshold-based payouts
            configuredPayoutAddress: address.address || '',
            payoutFee: parseFloat(withdrawalInfo?.withdrawalFee || '0'),
            payoutFeeType: 'fixed',
          };

          // Estimate next payout time based on current balance and threshold
          if (payoutRule.minimumPayout > 0) {
            // This is an approximation - actual timing depends on mining rate
            const hoursToThreshold = 24; // Default estimate
            payoutRule.nextPayoutTime = new Date(Date.now() + (hoursToThreshold * 60 * 60 * 1000));
          }

          payoutRules.push(payoutRule);
        }
      });

      auditLogger.debug(`Retrieved ${payoutRules.length} payout rules from NiceHash`);
      return payoutRules;

    } catch (error) {
      auditLogger.error('Failed to fetch NiceHash payout rules', error);
      throw error;
    }
  }

  /**
   * Get mining statistics for additional context
   */
  async getMiningStats(): Promise<any> {
    try {
      const response = await this._request(`${this.baseUrl}/main/api/v2/mining/rigs2`);
      
      if (response.success) {
        const rigs = response.data.miningRigs || [];
        const totalHashRate = rigs.reduce((sum: number, rig: any) => {
          return sum + (rig.stats?.reduce((rigSum: number, stat: any) => 
            rigSum + parseFloat(stat.speedAccepted || '0'), 0) || 0);
        }, 0);

        return {
          totalRigs: rigs.length,
          activeRigs: rigs.filter((rig: any) => rig.minerStatus === 'MINING').length,
          totalHashRate,
          lastUpdate: new Date(),
        };
      }

      return null;
    } catch (error) {
      auditLogger.warn('Failed to fetch NiceHash mining stats', error);
      return null;
    }
  }

  /**
   * Get recent payout history for verification
   */
  async getPayoutHistory(days: number = 30): Promise<any[]> {
    try {
      const response = await this._request(
        `${this.baseUrl}/main/api/v2/accounting/withdrawals?size=100`
      );
      
      if (response.success && response.data.list) {
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        
        return response.data.list
          .filter((withdrawal: any) => new Date(withdrawal.time) > cutoffDate)
          .map((withdrawal: any) => ({
            id: withdrawal.id,
            amount: parseFloat(withdrawal.amount),
            currency: withdrawal.currency,
            address: withdrawal.address,
            timestamp: new Date(withdrawal.time),
            status: withdrawal.status,
            txHash: withdrawal.txid || null,
          }));
      }

      return [];
    } catch (error) {
      auditLogger.warn('Failed to fetch NiceHash payout history', error);
      return [];
    }
  }
}