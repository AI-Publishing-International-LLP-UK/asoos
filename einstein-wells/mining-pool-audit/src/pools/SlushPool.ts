/**
 * SlushPool Client - Internal OAuth2 Implementation
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * Secure internal access to SlushPool mining data
 * No external API sharing - OAuth2/OIDC enterprise security
 */

import { BasePool } from './BasePool';
import { OAuth2Config, MiningPoolBalance, PayoutRule } from '../types';
import { auditLogger } from '../logger';

export class SlushPoolClient extends BasePool {
  private baseUrl: string;

  constructor(oauth2Config: OAuth2Config) {
    super('slushpool', oauth2Config);
    this.baseUrl = 'https://slushpool.com/api/v2';
  }

  /**
   * Get unpaid balances from SlushPool
   */
  async getBalances(): Promise<MiningPoolBalance[]> {
    try {
      auditLogger.debug('Fetching SlushPool balances');
      
      // Get account information including balances
      const response = await this._request(`${this.baseUrl}/account`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch balances from SlushPool');
      }

      const balances: MiningPoolBalance[] = [];
      const account = response.data;

      // SlushPool primarily deals with Bitcoin
      if (account.balance !== undefined) {
        const balance: MiningPoolBalance = {
          poolName: 'slushpool',
          currency: 'BTC',
          unpaidBalance: parseFloat(account.balance?.unpaid || '0'),
          confirmedBalance: parseFloat(account.balance?.confirmed || '0'),
          unconfirmedBalance: parseFloat(account.balance?.unconfirmed || '0'),
          lastUpdated: new Date(),
        };

        balances.push(balance);
        auditLogger.balanceCheck('slushpool', 'BTC', balance.unpaidBalance);
      }

      // Check for additional currencies if supported
      if (account.currencies) {
        Object.entries(account.currencies).forEach(([currency, data]: [string, any]) => {
          if (data && currency !== 'BTC') { // Skip BTC as we already processed it
            const balance: MiningPoolBalance = {
              poolName: 'slushpool',
              currency: currency.toUpperCase(),
              unpaidBalance: parseFloat(data.unpaid || '0'),
              confirmedBalance: parseFloat(data.confirmed || '0'),
              unconfirmedBalance: parseFloat(data.unconfirmed || '0'),
              lastUpdated: new Date(),
            };

            balances.push(balance);
            auditLogger.balanceCheck('slushpool', currency, balance.unpaidBalance);
          }
        });
      }

      return balances;
    } catch (error) {
      auditLogger.error('Failed to fetch SlushPool balances', error);
      throw error;
    }
  }

  /**
   * Get payout rules and configurations from SlushPool
   */
  async getPayoutRules(): Promise<PayoutRule[]> {
    try {
      auditLogger.debug('Fetching SlushPool payout rules');
      
      // Get user settings including payout configuration
      const settingsResponse = await this._request(`${this.baseUrl}/user/settings`);
      const payoutResponse = await this._request(`${this.baseUrl}/user/payout`);
      
      if (!settingsResponse.success) {
        throw new Error('Failed to fetch settings from SlushPool');
      }

      const payoutRules: PayoutRule[] = [];
      const settings = settingsResponse.data;
      const payoutInfo = payoutResponse.success ? payoutResponse.data : {};

      // Process payout settings for Bitcoin (primary currency)
      if (settings.payout_address || payoutInfo.address) {
        const payoutRule: PayoutRule = {
          poolName: 'slushpool',
          currency: 'BTC',
          minimumPayout: parseFloat(settings.payout_threshold || payoutInfo.threshold || '0.001'),
          payoutFrequency: this.determinePayoutFrequency(settings.payout_interval),
          configuredPayoutAddress: settings.payout_address || payoutInfo.address || '',
          payoutFee: parseFloat(settings.payout_fee || '0'),
          payoutFeeType: 'fixed',
        };

        // Calculate next payout time based on frequency
        if (payoutRule.payoutFrequency === 'daily') {
          const nextPayout = new Date();
          nextPayout.setDate(nextPayout.getDate() + 1);
          nextPayout.setHours(12, 0, 0, 0); // SlushPool typically pays around noon UTC
          payoutRule.nextPayoutTime = nextPayout;
        } else if (payoutRule.payoutFrequency === 'weekly') {
          const nextPayout = new Date();
          const daysUntilSunday = (7 - nextPayout.getDay()) % 7;
          nextPayout.setDate(nextPayout.getDate() + (daysUntilSunday || 7));
          nextPayout.setHours(12, 0, 0, 0);
          payoutRule.nextPayoutTime = nextPayout;
        }

        payoutRules.push(payoutRule);
      }

      auditLogger.debug(`Retrieved ${payoutRules.length} payout rules from SlushPool`);
      return payoutRules;

    } catch (error) {
      auditLogger.error('Failed to fetch SlushPool payout rules', error);
      throw error;
    }
  }

  /**
   * Determine payout frequency from SlushPool settings
   */
  private determinePayoutFrequency(interval?: string): string {
    if (!interval) return 'threshold';
    
    switch (interval.toLowerCase()) {
      case '1': 
      case 'daily': 
        return 'daily';
      case '7':
      case 'weekly':
        return 'weekly';
      default:
        return 'threshold';
    }
  }

  /**
   * Get mining worker statistics
   */
  async getWorkerStats(): Promise<any> {
    try {
      const response = await this._request(`${this.baseUrl}/workers`);
      
      if (response.success && response.data) {
        const workers = Object.values(response.data) as any[];
        
        return {
          totalWorkers: workers.length,
          activeWorkers: workers.filter(w => w.state === 'active').length,
          totalHashRate: workers.reduce((sum, worker) => sum + (worker.hashrate || 0), 0),
          lastUpdate: new Date(),
          workers: workers.map(worker => ({
            name: worker.name,
            state: worker.state,
            hashrate: worker.hashrate,
            lastSeen: worker.last_share ? new Date(worker.last_share * 1000) : null,
          })),
        };
      }

      return null;
    } catch (error) {
      auditLogger.warn('Failed to fetch SlushPool worker stats', error);
      return null;
    }
  }

  /**
   * Get recent payout history for verification
   */
  async getPayoutHistory(days: number = 30): Promise<any[]> {
    try {
      const response = await this._request(`${this.baseUrl}/user/rewards`);
      
      if (response.success && response.data) {
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        const rewards = response.data.rewards || [];
        
        return rewards
          .filter((reward: any) => new Date(reward.timestamp * 1000) > cutoffDate)
          .map((reward: any) => ({
            timestamp: new Date(reward.timestamp * 1000),
            amount: parseFloat(reward.amount),
            currency: 'BTC',
            type: reward.type || 'mining',
            status: reward.status || 'confirmed',
          }));
      }

      return [];
    } catch (error) {
      auditLogger.warn('Failed to fetch SlushPool payout history', error);
      return [];
    }
  }

  /**
   * Get mining pool statistics
   */
  async getPoolStats(): Promise<any> {
    try {
      const response = await this._request(`${this.baseUrl}/stats`);
      
      if (response.success && response.data) {
        return {
          poolHashRate: response.data.pool_hashrate,
          networkHashRate: response.data.network_hashrate,
          difficulty: response.data.difficulty,
          blocksFound: response.data.blocks_found,
          lastUpdate: new Date(),
        };
      }

      return null;
    } catch (error) {
      auditLogger.warn('Failed to fetch SlushPool stats', error);
      return null;
    }
  }
}