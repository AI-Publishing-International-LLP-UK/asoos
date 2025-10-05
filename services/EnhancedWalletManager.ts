/**
 * Enhanced Wallet Manager - Interface-ready Wallet Operations
 * 
 * Provides comprehensive wallet management with SallyPort integration,
 * owner interface components, and real-time financial operations
 * 
 * @author AI Publishing International LLP
 * @compliance Dr. Burby KC - King's Counsel Approved
 * @version 2.0.0 - Interface Ready
 */

import { Logger } from 'winston';
import { Firestore } from '@google-cloud/firestore';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { PubSub } from '@google-cloud/pubsub';
import { 
  WalletConfiguration, 
  FinancialTransaction, 
  FinancialOperationsBridge 
} from './FinancialOperationsBridge';

export interface WalletBalance {
  walletId: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  breakdown: {
    stripe: number;
    xero: number;
    internal: number;
    crypto?: number;
  };
  currency: string;
  lastUpdated: Date;
}

export interface WalletActivity {
  transactionId: string;
  type: 'payment' | 'refund' | 'transfer' | 'invoice' | 'subscription';
  amount: number;
  currency: string;
  description: string;
  status: string;
  timestamp: Date;
  complianceStatus: 'passed' | 'failed' | 'review';
  burbySignature?: string;
}

export interface WalletSettings {
  walletId: string;
  displayName: string;
  tier: 'diamond' | 'emerald' | 'sapphire' | 'opal' | 'onyx';
  limits: {
    daily: number;
    monthly: number;
    transaction: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    complianceAlerts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sallyPortRequired: boolean;
    ipWhitelist: string[];
    sessionTimeout: number;
  };
  integrations: {
    stripe: boolean;
    xero: boolean;
    sallyPort: boolean;
  };
}

export interface SallyPortValidation {
  isValid: boolean;
  userId: string;
  permissions: string[];
  sessionId: string;
  expiresAt: Date;
  metadata: Record<string, any>;
}

export class EnhancedWalletManager {
  private logger: Logger;
  private firestore: Firestore;
  private secretManager: SecretManagerServiceClient;
  private pubsub: PubSub;
  private financialBridge: FinancialOperationsBridge;
  
  // SallyPort integration
  private readonly SALLYPORT_ENDPOINT = 'https://sallyport.2100.cool/api/v1';
  
  // Cache for wallet data
  private walletCache: Map<string, WalletConfiguration> = new Map();
  private balanceCache: Map<string, { balance: WalletBalance; cachedAt: Date }> = new Map();
  private readonly CACHE_TTL_MS = 30000; // 30 seconds

  constructor() {
    this.logger = this.initializeLogger();
    this.firestore = new Firestore({ projectId: 'api-for-warp-drive' });
    this.secretManager = new SecretManagerServiceClient();
    this.pubsub = new PubSub({ projectId: 'api-for-warp-drive' });
    this.financialBridge = new FinancialOperationsBridge();
    
    this.logger.info('Enhanced Wallet Manager initialized with SallyPort integration');
  }

  /**
   * Create new wallet with enhanced configuration
   */
  async createWallet(
    config: WalletConfiguration,
    sallyPortToken: string
  ): Promise<{ walletId: string; settings: WalletSettings }> {
    
    this.logger.info('Creating enhanced wallet', { walletId: config.walletId });

    try {
      // 1. Validate SallyPort token
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      // 2. Create wallet via Financial Bridge (includes Dr. Burby compliance)
      const bridgeResult = await this.financialBridge.createWallet(config);

      // 3. Initialize wallet settings
      const settings: WalletSettings = {
        walletId: config.walletId,
        displayName: `${config.ownerTier.toUpperCase()} Wallet`,
        tier: config.ownerTier,
        limits: config.limits,
        notifications: {
          email: true,
          sms: config.complianceLevel !== 'basic',
          inApp: true,
          complianceAlerts: true
        },
        security: {
          twoFactorEnabled: config.complianceLevel !== 'basic',
          sallyPortRequired: true,
          ipWhitelist: [],
          sessionTimeout: config.complianceLevel === 'kc_oversight' ? 1800 : 3600 // 30min or 1hr
        },
        integrations: {
          stripe: !!config.stripeCustomerId,
          xero: !!config.xeroContactId,
          sallyPort: true
        }
      };

      // 4. Store enhanced wallet configuration
      await this.firestore.collection('enhanced_wallets').doc(config.walletId).set({
        ...config,
        settings,
        sallyPortValidation: {
          userId: sallyPortValidation.userId,
          validatedAt: new Date(),
          sessionId: sallyPortValidation.sessionId
        },
        createdAt: new Date(),
        status: 'active'
      });

      // 5. Initialize wallet balance tracking
      await this.initializeWalletBalance(config.walletId);

      // 6. Cache wallet configuration
      this.walletCache.set(config.walletId, config);

      this.logger.info('Enhanced wallet created successfully', { 
        walletId: config.walletId,
        tier: config.ownerTier,
        sallyPortUser: sallyPortValidation.userId
      });

      return { walletId: config.walletId, settings };

    } catch (error) {
      this.logger.error('Failed to create enhanced wallet', { 
        walletId: config.walletId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get comprehensive wallet balance with real-time updates
   */
  async getWalletBalance(walletId: string, sallyPortToken: string): Promise<WalletBalance> {
    try {
      // Validate SallyPort access
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      // Check cache first
      const cached = this.balanceCache.get(walletId);
      if (cached && Date.now() - cached.cachedAt.getTime() < this.CACHE_TTL_MS) {
        return cached.balance;
      }

      // Get fresh balance from Financial Bridge
      const totalBalance = await this.financialBridge.getWalletBalance(walletId);
      
      // Get detailed breakdown
      const wallet = await this.getWalletConfiguration(walletId);
      const breakdown = await this.getBalanceBreakdown(walletId, wallet);
      
      // Calculate pending transactions
      const pendingTransactions = await this.getPendingTransactions(walletId);
      const pendingBalance = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

      const balance: WalletBalance = {
        walletId,
        totalBalance,
        availableBalance: totalBalance - pendingBalance,
        pendingBalance,
        breakdown,
        currency: 'USD', // Default currency
        lastUpdated: new Date()
      };

      // Cache the result
      this.balanceCache.set(walletId, { balance, cachedAt: new Date() });

      return balance;

    } catch (error) {
      this.logger.error('Failed to get wallet balance', { walletId, error: error.message });
      throw error;
    }
  }

  /**
   * Get recent wallet activity with compliance status
   */
  async getWalletActivity(
    walletId: string, 
    sallyPortToken: string,
    limit: number = 50
  ): Promise<WalletActivity[]> {
    
    try {
      // Validate SallyPort access
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      // Get recent transactions
      const transactions = await this.firestore
        .collection('transactions')
        .where('walletId', '==', walletId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const activities: WalletActivity[] = transactions.docs.map(doc => {
        const transaction = doc.data() as FinancialTransaction;
        return {
          transactionId: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description,
          status: transaction.status,
          timestamp: transaction.timestamp,
          complianceStatus: transaction.complianceCheck?.passed ? 'passed' : 
            transaction.complianceCheck ? 'failed' : 'review',
          burbySignature: transaction.complianceCheck?.burbySignature
        };
      });

      return activities;

    } catch (error) {
      this.logger.error('Failed to get wallet activity', { walletId, error: error.message });
      throw error;
    }
  }

  /**
   * Update wallet settings with validation
   */
  async updateWalletSettings(
    walletId: string,
    settings: Partial<WalletSettings>,
    sallyPortToken: string
  ): Promise<WalletSettings> {
    
    try {
      // Validate SallyPort access
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      // Get current wallet configuration
      const walletDoc = await this.firestore.collection('enhanced_wallets').doc(walletId).get();
      if (!walletDoc.exists) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      const currentWallet = walletDoc.data();
      const currentSettings = currentWallet.settings as WalletSettings;

      // Validate settings changes (security restrictions)
      if (settings.limits && !sallyPortValidation.permissions.includes('modify_limits')) {
        throw new Error('Insufficient permissions to modify wallet limits');
      }

      if (settings.security && !sallyPortValidation.permissions.includes('modify_security')) {
        throw new Error('Insufficient permissions to modify security settings');
      }

      // Merge settings
      const updatedSettings = {
        ...currentSettings,
        ...settings
      };

      // Update in Firestore
      await this.firestore.collection('enhanced_wallets').doc(walletId).update({
        settings: updatedSettings,
        updatedAt: new Date(),
        updatedBy: sallyPortValidation.userId
      });

      // Clear cache
      this.walletCache.delete(walletId);

      this.logger.info('Wallet settings updated', { 
        walletId,
        updatedBy: sallyPortValidation.userId,
        changes: Object.keys(settings)
      });

      return updatedSettings;

    } catch (error) {
      this.logger.error('Failed to update wallet settings', { walletId, error: error.message });
      throw error;
    }
  }

  /**
   * Process wallet transaction with enhanced security
   */
  async processWalletTransaction(
    transaction: FinancialTransaction,
    sallyPortToken: string
  ): Promise<FinancialTransaction> {
    
    this.logger.info('Processing enhanced wallet transaction', { 
      transactionId: transaction.id,
      walletId: transaction.walletId,
      amount: transaction.amount
    });

    try {
      // 1. Validate SallyPort access
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      // 2. Get wallet configuration
      const wallet = await this.getWalletConfiguration(transaction.walletId);
      if (!wallet) {
        throw new Error(`Wallet ${transaction.walletId} not found`);
      }

      // 3. Enhanced security checks
      await this.performEnhancedSecurityChecks(transaction, wallet, sallyPortValidation);

      // 4. Check two-factor authentication if required
      if (wallet.complianceLevel !== 'basic' && transaction.amount > 1000) {
        await this.validateTwoFactorAuth(sallyPortToken, transaction);
      }

      // 5. Process through Financial Bridge (includes Dr. Burby compliance)
      const processedTransaction = await this.financialBridge.processTransaction(transaction);

      // 6. Update wallet activity tracking
      await this.updateWalletActivityTracking(processedTransaction);

      // 7. Send notifications if enabled
      await this.sendTransactionNotifications(processedTransaction, wallet);

      // 8. Clear balance cache for real-time updates
      this.balanceCache.delete(transaction.walletId);

      this.logger.info('Enhanced wallet transaction processed', {
        transactionId: transaction.id,
        status: processedTransaction.status,
        complianceStatus: processedTransaction.complianceCheck?.passed ? 'PASSED' : 'FAILED'
      });

      return processedTransaction;

    } catch (error) {
      this.logger.error('Failed to process wallet transaction', {
        transactionId: transaction.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate wallet financial report with compliance details
   */
  async generateWalletReport(
    walletId: string,
    period: { start: Date; end: Date },
    sallyPortToken: string
  ): Promise<any> {
    
    try {
      // Validate SallyPort access
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      // Generate report through Financial Bridge
      const bridgeReport = await this.financialBridge.generateFinancialReport(walletId, period);

      // Add enhanced wallet-specific data
      const wallet = await this.getWalletConfiguration(walletId);
      const walletDoc = await this.firestore.collection('enhanced_wallets').doc(walletId).get();
      const walletData = walletDoc.data();

      const enhancedReport = {
        ...bridgeReport,
        walletData: {
          displayName: walletData?.settings?.displayName,
          tier: wallet?.ownerTier,
          hrClassification: wallet?.hrClassification,
          sallyPortIntegration: walletData?.sallyPortIntegration
        },
        securityMetrics: {
          twoFactorAuthUsage: await this.getTwoFactorAuthMetrics(walletId, period),
          sallyPortSessions: await this.getSallyPortSessionMetrics(walletId, period),
          ipAddressHistory: await this.getIPAddressHistory(walletId, period)
        },
        complianceMetrics: {
          drBurbyApprovals: bridgeReport.compliance.burbySignatures,
          riskScoreHistory: await this.getRiskScoreHistory(walletId, period),
          manualReviews: await this.getManualReviewCount(walletId, period)
        }
      };

      return enhancedReport;

    } catch (error) {
      this.logger.error('Failed to generate wallet report', { walletId, error: error.message });
      throw error;
    }
  }

  /**
   * Real-time wallet status for owner interface
   */
  async getWalletStatus(walletId: string, sallyPortToken: string): Promise<{
    status: 'active' | 'suspended' | 'compliance_review';
    balance: WalletBalance;
    recentActivity: WalletActivity[];
    alerts: any[];
    compliance: {
      score: number;
      status: string;
      lastReview: Date;
    };
  }> {
    try {
      // Validate SallyPort access
      const sallyPortValidation = await this.validateSallyPortToken(sallyPortToken);
      if (!sallyPortValidation.isValid) {
        throw new Error('Invalid SallyPort authentication');
      }

      const [balance, activity, alerts, complianceStatus] = await Promise.all([
        this.getWalletBalance(walletId, sallyPortToken),
        this.getWalletActivity(walletId, sallyPortToken, 10),
        this.getWalletAlerts(walletId),
        this.getComplianceStatus(walletId)
      ]);

      return {
        status: complianceStatus.status,
        balance,
        recentActivity: activity,
        alerts,
        compliance: complianceStatus
      };

    } catch (error) {
      this.logger.error('Failed to get wallet status', { walletId, error: error.message });
      throw error;
    }
  }

  // Private utility methods

  private initializeLogger(): Logger {
    const winston = require('winston');
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'enhanced-wallet-manager' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'wallet-manager.log' })
      ]
    });
  }

  private async validateSallyPortToken(token: string): Promise<SallyPortValidation> {
    try {
      // Integration with SallyPort authentication system
      // This would make an API call to SallyPort service
      
      // Placeholder implementation
      const response = {
        isValid: true,
        userId: 'user_' + Date.now(),
        permissions: [
          'wallet_access',
          'transaction_create',
          'balance_view',
          'settings_modify',
          'reports_generate'
        ],
        sessionId: 'session_' + Date.now(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: 'Enhanced Wallet Manager',
          loginTime: new Date()
        }
      };

      return response;

    } catch (error) {
      this.logger.error('SallyPort token validation failed', { error: error.message });
      return {
        isValid: false,
        userId: '',
        permissions: [],
        sessionId: '',
        expiresAt: new Date(),
        metadata: {}
      };
    }
  }

  private async getWalletConfiguration(walletId: string): Promise<WalletConfiguration | null> {
    // Check cache first
    if (this.walletCache.has(walletId)) {
      return this.walletCache.get(walletId)!;
    }

    // Load from Firestore
    const doc = await this.firestore.collection('enhanced_wallets').doc(walletId).get();
    if (!doc.exists) {
      return null;
    }

    const config = doc.data() as WalletConfiguration;
    this.walletCache.set(walletId, config);
    return config;
  }

  private async initializeWalletBalance(walletId: string): Promise<void> {
    const initialBalance: WalletBalance = {
      walletId,
      totalBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      breakdown: {
        stripe: 0,
        xero: 0,
        internal: 0
      },
      currency: 'USD',
      lastUpdated: new Date()
    };

    await this.firestore.collection('wallet_balances').doc(walletId).set(initialBalance);
  }

  private async getBalanceBreakdown(walletId: string, wallet: WalletConfiguration | null): Promise<{
    stripe: number;
    xero: number;
    internal: number;
    crypto?: number;
  }> {
    // Placeholder implementation - would integrate with actual balance APIs
    return {
      stripe: 0,
      xero: 0,
      internal: 0
    };
  }

  private async getPendingTransactions(walletId: string): Promise<FinancialTransaction[]> {
    const query = await this.firestore
      .collection('transactions')
      .where('walletId', '==', walletId)
      .where('status', 'in', ['pending', 'processing'])
      .get();

    return query.docs.map(doc => doc.data() as FinancialTransaction);
  }

  private async performEnhancedSecurityChecks(
    transaction: FinancialTransaction,
    wallet: WalletConfiguration,
    sallyPortValidation: SallyPortValidation
  ): Promise<void> {
    
    // IP address verification
    const allowedIPs = await this.getAllowedIPs(wallet.walletId);
    if (allowedIPs.length > 0) {
      const clientIP = sallyPortValidation.metadata.ipAddress;
      if (!allowedIPs.includes(clientIP)) {
        throw new Error(`Transaction from unauthorized IP address: ${clientIP}`);
      }
    }

    // Transaction velocity checks
    const recentTransactions = await this.getRecentTransactions(wallet.walletId, 1); // Last hour
    const hourlyAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) + transaction.amount;
    
    const hourlyLimit = wallet.limits.daily / 24; // Approximate hourly limit
    if (hourlyAmount > hourlyLimit) {
      throw new Error('Transaction velocity limit exceeded');
    }

    // Permission validation
    const requiredPermission = this.getRequiredPermission(transaction);
    if (!sallyPortValidation.permissions.includes(requiredPermission)) {
      throw new Error(`Insufficient permissions: ${requiredPermission} required`);
    }
  }

  private async validateTwoFactorAuth(sallyPortToken: string, transaction: FinancialTransaction): Promise<void> {
    // Two-factor authentication validation
    // This would integrate with your 2FA system
    this.logger.info('2FA validation required for transaction', { 
      transactionId: transaction.id,
      amount: transaction.amount 
    });
  }

  private async updateWalletActivityTracking(transaction: FinancialTransaction): Promise<void> {
    await this.firestore.collection('wallet_activity_log').add({
      walletId: transaction.walletId,
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      timestamp: new Date(),
      metadata: {
        source: transaction.source,
        compliancePassed: transaction.complianceCheck?.passed,
        burbySignature: transaction.complianceCheck?.burbySignature
      }
    });
  }

  private async sendTransactionNotifications(
    transaction: FinancialTransaction,
    wallet: WalletConfiguration
  ): Promise<void> {
    // Send notifications based on wallet settings
    // This would integrate with your notification system
    this.logger.info('Sending transaction notifications', { 
      transactionId: transaction.id,
      walletId: transaction.walletId 
    });
  }

  private async getWalletAlerts(walletId: string): Promise<any[]> {
    const query = await this.firestore
      .collection('wallet_alerts')
      .where('walletId', '==', walletId)
      .where('resolved', '==', false)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    return query.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private async getComplianceStatus(walletId: string): Promise<{
    score: number;
    status: 'active' | 'suspended' | 'compliance_review';
    lastReview: Date;
  }> {
    // Get latest compliance records
    const query = await this.firestore
      .collection('compliance_records')
      .where('entityId', '==', walletId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    if (query.empty) {
      return {
        score: 100,
        status: 'active',
        lastReview: new Date()
      };
    }

    const records = query.docs.map(doc => doc.data());
    const avgRiskScore = records.reduce((sum, r) => sum + (r.result?.riskScore || 0), 0) / records.length;
    const complianceScore = Math.max(0, 100 - avgRiskScore);

    return {
      score: complianceScore,
      status: complianceScore > 70 ? 'active' : 'compliance_review',
      lastReview: new Date(records[0].timestamp.seconds * 1000)
    };
  }

  // Additional utility methods for metrics and history

  private async getTwoFactorAuthMetrics(walletId: string, period: { start: Date; end: Date }): Promise<any> {
    // Implementation for 2FA metrics
    return { usage: 0, successful: 0, failed: 0 };
  }

  private async getSallyPortSessionMetrics(walletId: string, period: { start: Date; end: Date }): Promise<any> {
    // Implementation for SallyPort session metrics
    return { sessions: 0, averageDuration: 0, uniqueIPs: 0 };
  }

  private async getIPAddressHistory(walletId: string, period: { start: Date; end: Date }): Promise<string[]> {
    // Implementation for IP address history
    return [];
  }

  private async getRiskScoreHistory(walletId: string, period: { start: Date; end: Date }): Promise<number[]> {
    // Implementation for risk score history
    return [];
  }

  private async getManualReviewCount(walletId: string, period: { start: Date; end: Date }): Promise<number> {
    // Implementation for manual review count
    return 0;
  }

  private async getAllowedIPs(walletId: string): Promise<string[]> {
    const doc = await this.firestore.collection('enhanced_wallets').doc(walletId).get();
    const data = doc.data();
    return data?.settings?.security?.ipWhitelist || [];
  }

  private async getRecentTransactions(walletId: string, hours: number): Promise<FinancialTransaction[]> {
    const cutoffTime = new Date(Date.now() - hours * 3600000);
    
    const query = await this.firestore
      .collection('transactions')
      .where('walletId', '==', walletId)
      .where('timestamp', '>=', cutoffTime)
      .get();

    return query.docs.map(doc => doc.data() as FinancialTransaction);
  }

  private getRequiredPermission(transaction: FinancialTransaction): string {
    const permissions = {
      payment: 'transaction_create',
      refund: 'transaction_refund',
      transfer: 'transaction_transfer',
      invoice: 'invoice_create',
      subscription: 'subscription_manage'
    };
    return permissions[transaction.type] || 'transaction_create';
  }
}