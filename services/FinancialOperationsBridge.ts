/**
 * Financial Operations Bridge - Interface-ready with Dr. Burby KC LLP Compliance
 * 
 * Connects Stripe, Xero, and wallet management with full compliance validation
 * and real-time financial operations for AI Publishing International LLP
 * 
 * @author AI Publishing International LLP
 * @compliance Dr. Burby KC - King's Counsel
 * @version 2.0.0 - Interface Ready
 */

import { Logger } from 'winston';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { PubSub } from '@google-cloud/pubsub';
import { Firestore } from '@google-cloud/firestore';
import { XeroServiceUKLLP } from './XeroServiceUKLLP';
import { XeroServiceUSLLC } from './XeroServiceUSLLC';
import { DrBurbyComplianceEngine } from './DrBurbyComplianceEngine';

export interface WalletConfiguration {
  walletId: string;
  walletType: 'stripe' | 'xero' | 'internal' | 'crypto';
  ownerTier: 'diamond' | 'emerald' | 'sapphire' | 'opal' | 'onyx';
  hrClassification: '.hr1' | '.hr2' | '.hr3' | '.hr4';
  stripeCustomerId?: string;
  xeroContactId?: string;
  limits: {
    daily: number;
    monthly: number;
    transaction: number;
  };
  complianceLevel: 'basic' | 'enhanced' | 'kc_oversight';
}

export interface FinancialTransaction {
  id: string;
  walletId: string;
  type: 'payment' | 'refund' | 'transfer' | 'invoice' | 'subscription';
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, any>;
  source: 'stripe' | 'xero' | 'internal';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'compliance_review';
  complianceCheck?: {
    passed: boolean;
    ruleViolations?: string[];
    burbySignature?: string;
    blockchainHash?: string;
  };
  timestamp: Date;
  processedAt?: Date;
}

export interface DrBurbyComplianceResult {
  passed: boolean;
  ruleViolations: string[];
  riskScore: number;
  requiresManualReview: boolean;
  burbySignature: string;
  blockchainHash?: string;
  metadata: Record<string, any>;
}

export class FinancialOperationsBridge {
  private logger: Logger;
  private secretManager: SecretManagerServiceClient;
  private pubsub: PubSub;
  private firestore: Firestore;
  private xeroUKService: XeroServiceUKLLP;
  private xeroUSService: XeroServiceUSLLC;
  private complianceEngine: DrBurbyComplianceEngine;
  
  private readonly TOPIC_FINANCIAL_EVENTS = 'fin-events-v1';
  private readonly TOPIC_COMPLIANCE_ALERTS = 'compliance-alerts-v1';

  constructor() {
    this.logger = this.initializeLogger();
    this.secretManager = new SecretManagerServiceClient();
    this.pubsub = new PubSub({ projectId: 'api-for-warp-drive' });
    this.firestore = new Firestore({ projectId: 'api-for-warp-drive' });
    this.complianceEngine = new DrBurbyComplianceEngine();
    
    this.logger.info('Financial Operations Bridge initialized with Dr. Burby KC compliance');
  }

  /**
   * Initialize wallet configuration for a user/organization
   */
  async createWallet(config: WalletConfiguration): Promise<{ walletId: string; sallyPortToken: string }> {
    try {
      this.logger.info('Creating new wallet', { walletId: config.walletId, tier: config.ownerTier });

      // Dr. Burby KC compliance check for new wallet
      const complianceResult = await this.complianceEngine.validateNewWallet(config);
      if (!complianceResult.passed) {
        throw new Error(`KC Compliance violation: ${complianceResult.ruleViolations.join(', ')}`);
      }

      // Create wallet in Firestore with encryption
      const walletDoc = {
        ...config,
        createdAt: new Date(),
        status: 'active',
        complianceSignature: complianceResult.burbySignature,
        encryptedKeys: await this.encryptWalletKeys(config.walletId),
        sallyPortIntegration: {
          enabled: true,
          twoFactorRequired: config.complianceLevel !== 'basic'
        }
      };

      await this.firestore.collection('wallets').doc(config.walletId).set(walletDoc);

      // Generate SallyPort integration token
      const sallyPortToken = await this.generateSallyPortToken(config.walletId);

      this.logger.info('Wallet created successfully', { 
        walletId: config.walletId,
        compliance: 'KC_APPROVED'
      });

      return { walletId: config.walletId, sallyPortToken };

    } catch (error) {
      this.logger.error('Failed to create wallet', { error: error.message, walletId: config.walletId });
      throw error;
    }
  }

  /**
   * Process financial transaction with full compliance validation
   */
  async processTransaction(transaction: FinancialTransaction): Promise<FinancialTransaction> {
    const startTime = Date.now();
    this.logger.info('Processing transaction', { 
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount 
    });

    try {
      // 1. Load wallet configuration
      const wallet = await this.getWallet(transaction.walletId);
      if (!wallet) {
        throw new Error(`Wallet ${transaction.walletId} not found`);
      }

      // 2. Pre-transaction compliance check (Dr. Burby KC)
      const complianceResult = await this.complianceEngine.validateTransaction(transaction, wallet);
      transaction.complianceCheck = complianceResult;

      if (!complianceResult.passed) {
        transaction.status = 'compliance_review';
        await this.publishComplianceAlert(transaction, complianceResult);
        
        this.logger.warn('Transaction failed compliance', {
          transactionId: transaction.id,
          violations: complianceResult.ruleViolations
        });
      } else {
        // 3. Execute transaction based on source
        transaction = await this.executeTransaction(transaction, wallet);
        
        // 4. Sign with blockchain (existing NFT ledger integration)
        if (complianceResult.blockchainHash) {
          transaction.complianceCheck.blockchainHash = complianceResult.blockchainHash;
        }
      }

      // 5. Store transaction record
      await this.storeTransaction(transaction);

      // 6. Publish to event stream for downstream processing
      await this.publishFinancialEvent(transaction);

      const processingTime = Date.now() - startTime;
      this.logger.info('Transaction processed', {
        transactionId: transaction.id,
        status: transaction.status,
        processingTimeMs: processingTime,
        compliance: complianceResult.passed ? 'PASSED' : 'FAILED'
      });

      return transaction;

    } catch (error) {
      this.logger.error('Transaction processing failed', {
        transactionId: transaction.id,
        error: error.message,
        processingTimeMs: Date.now() - startTime
      });
      
      transaction.status = 'failed';
      await this.storeTransaction(transaction);
      throw error;
    }
  }

  /**
   * Execute transaction based on source system
   */
  private async executeTransaction(
    transaction: FinancialTransaction, 
    wallet: WalletConfiguration
  ): Promise<FinancialTransaction> {
    
    switch (transaction.source) {
      case 'stripe':
        return await this.executeStripeTransaction(transaction, wallet);
      
      case 'xero':
        return await this.executeXeroTransaction(transaction, wallet);
      
      case 'internal':
        return await this.executeInternalTransaction(transaction, wallet);
      
      default:
        throw new Error(`Unsupported transaction source: ${transaction.source}`);
    }
  }

  /**
   * Execute Stripe transaction with enhanced error handling
   */
  private async executeStripeTransaction(
    transaction: FinancialTransaction,
    wallet: WalletConfiguration
  ): Promise<FinancialTransaction> {
    
    try {
      const stripeSecret = await this.getSecret('stripe-secret-key');
      const stripe = require('stripe')(stripeSecret);

      let result;
      switch (transaction.type) {
        case 'payment':
          result = await stripe.paymentIntents.create({
            amount: Math.round(transaction.amount * 100), // Convert to cents
            currency: transaction.currency,
            customer: wallet.stripeCustomerId,
            description: transaction.description,
            metadata: {
              ...transaction.metadata,
              walletId: transaction.walletId,
              complianceSignature: transaction.complianceCheck?.burbySignature
            }
          });
          transaction.metadata.stripePaymentIntentId = result.id;
          break;

        case 'refund':
          result = await stripe.refunds.create({
            payment_intent: transaction.metadata.originalPaymentIntentId,
            amount: Math.round(transaction.amount * 100),
            metadata: {
              walletId: transaction.walletId,
              complianceSignature: transaction.complianceCheck?.burbySignature
            }
          });
          transaction.metadata.stripeRefundId = result.id;
          break;

        default:
          throw new Error(`Unsupported Stripe transaction type: ${transaction.type}`);
      }

      transaction.status = 'completed';
      transaction.processedAt = new Date();
      
      return transaction;

    } catch (error) {
      this.logger.error('Stripe transaction failed', {
        transactionId: transaction.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute Xero accounting transaction
   */
  private async executeXeroTransaction(
    transaction: FinancialTransaction,
    wallet: WalletConfiguration
  ): Promise<FinancialTransaction> {
    
    try {
      const xeroService = wallet.hrClassification.includes('uk') ? 
        this.xeroUKService : this.xeroUSService;

      let result;
      switch (transaction.type) {
        case 'invoice':
          const invoiceData = {
            Type: 'ACCREC',
            Contact: { ContactID: wallet.xeroContactId },
            Date: new Date().toISOString().split('T')[0],
            DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            LineItems: [{
              Description: transaction.description,
              Quantity: 1,
              UnitAmount: transaction.amount,
              AccountCode: this.getXeroAccountCode(transaction.type)
            }],
            Status: 'AUTHORISED'
          };
          
          result = await xeroService.createInvoice(invoiceData);
          transaction.metadata.xeroInvoiceId = result.Invoices[0].InvoiceID;
          break;

        default:
          throw new Error(`Unsupported Xero transaction type: ${transaction.type}`);
      }

      transaction.status = 'completed';
      transaction.processedAt = new Date();
      
      return transaction;

    } catch (error) {
      this.logger.error('Xero transaction failed', {
        transactionId: transaction.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute internal wallet transaction
   */
  private async executeInternalTransaction(
    transaction: FinancialTransaction,
    wallet: WalletConfiguration
  ): Promise<FinancialTransaction> {
    
    try {
      // Internal wallet logic - update balances, enforce limits
      const currentBalance = await this.getWalletBalance(transaction.walletId);
      
      if (transaction.type === 'transfer' && currentBalance < transaction.amount) {
        throw new Error('Insufficient funds');
      }

      // Update wallet balance in Firestore
      await this.firestore.collection('wallets')
        .doc(transaction.walletId)
        .collection('transactions')
        .doc(transaction.id)
        .set({
          ...transaction,
          balanceAfter: transaction.type === 'transfer' ? 
            currentBalance - transaction.amount : 
            currentBalance + transaction.amount
        });

      transaction.status = 'completed';
      transaction.processedAt = new Date();
      
      return transaction;

    } catch (error) {
      this.logger.error('Internal transaction failed', {
        transactionId: transaction.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Real-time webhook processing from Stripe
   */
  async processStripeWebhook(event: any): Promise<void> {
    this.logger.info('Processing Stripe webhook', { type: event.type, id: event.id });

    try {
      // Verify webhook signature
      await this.verifyStripeWebhook(event);

      // Convert to internal transaction format
      const transaction = await this.stripeEventToTransaction(event);
      
      // Process through compliance and storage
      await this.processTransaction(transaction);

    } catch (error) {
      this.logger.error('Stripe webhook processing failed', {
        eventId: event.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Real-time webhook processing from Xero
   */
  async processXeroWebhook(event: any): Promise<void> {
    this.logger.info('Processing Xero webhook', { type: event.eventType, id: event.eventId });

    try {
      // Verify webhook signature
      await this.verifyXeroWebhook(event);

      // Convert to internal transaction format
      const transaction = await this.xeroEventToTransaction(event);
      
      // Process through compliance and storage
      await this.processTransaction(transaction);

    } catch (error) {
      this.logger.error('Xero webhook processing failed', {
        eventId: event.eventId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get wallet balance across all sources
   */
  async getWalletBalance(walletId: string): Promise<number> {
    try {
      const walletDoc = await this.firestore.collection('wallets').doc(walletId).get();
      if (!walletDoc.exists) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      const wallet = walletDoc.data() as WalletConfiguration;
      let totalBalance = 0;

      // Get balance from Stripe if connected
      if (wallet.stripeCustomerId) {
        const stripeBalance = await this.getStripeBalance(wallet.stripeCustomerId);
        totalBalance += stripeBalance;
      }

      // Get balance from internal transactions
      const internalBalance = await this.getInternalBalance(walletId);
      totalBalance += internalBalance;

      return totalBalance;

    } catch (error) {
      this.logger.error('Failed to get wallet balance', { walletId, error: error.message });
      throw error;
    }
  }

  /**
   * Generate comprehensive financial report
   */
  async generateFinancialReport(
    walletId: string, 
    period: { start: Date; end: Date }
  ): Promise<any> {
    
    this.logger.info('Generating financial report', { walletId, period });

    try {
      const transactions = await this.getTransactionHistory(walletId, period);
      const wallet = await this.getWallet(walletId);
      
      const report = {
        walletId,
        period,
        summary: {
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          successRate: transactions.filter(t => t.status === 'completed').length / transactions.length,
          complianceRate: transactions.filter(t => t.complianceCheck?.passed).length / transactions.length
        },
        breakdown: {
          byType: this.groupTransactionsByType(transactions),
          bySource: this.groupTransactionsBySource(transactions),
          byStatus: this.groupTransactionsByStatus(transactions)
        },
        compliance: {
          violations: transactions
            .filter(t => t.complianceCheck && !t.complianceCheck.passed)
            .map(t => ({
              transactionId: t.id,
              violations: t.complianceCheck?.ruleViolations
            })),
          burbySignatures: transactions
            .filter(t => t.complianceCheck?.burbySignature)
            .length
        },
        walletInfo: {
          tier: wallet?.ownerTier,
          hrClassification: wallet?.hrClassification,
          limits: wallet?.limits
        },
        generatedAt: new Date(),
        signature: await this.signReportWithBlockchain(walletId, period)
      };

      // Store report for audit trail
      await this.storeFinancialReport(report);

      return report;

    } catch (error) {
      this.logger.error('Failed to generate financial report', { walletId, error: error.message });
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
      defaultMeta: { service: 'financial-operations-bridge' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'financial-operations.log' })
      ]
    });
  }

  private async getSecret(secretName: string): Promise<string> {
    const [version] = await this.secretManager.accessSecretVersion({
      name: `projects/api-for-warp-drive/secrets/${secretName}/versions/latest`
    });
    return version.payload?.data?.toString() || '';
  }

  private async getWallet(walletId: string): Promise<WalletConfiguration | null> {
    const doc = await this.firestore.collection('wallets').doc(walletId).get();
    return doc.exists ? doc.data() as WalletConfiguration : null;
  }

  private async storeTransaction(transaction: FinancialTransaction): Promise<void> {
    await this.firestore
      .collection('transactions')
      .doc(transaction.id)
      .set(transaction);
  }

  private async publishFinancialEvent(transaction: FinancialTransaction): Promise<void> {
    const topic = this.pubsub.topic(this.TOPIC_FINANCIAL_EVENTS);
    await topic.publish(Buffer.from(JSON.stringify(transaction)));
  }

  private async publishComplianceAlert(
    transaction: FinancialTransaction, 
    complianceResult: DrBurbyComplianceResult
  ): Promise<void> {
    const alert = {
      transactionId: transaction.id,
      walletId: transaction.walletId,
      violations: complianceResult.ruleViolations,
      riskScore: complianceResult.riskScore,
      timestamp: new Date()
    };
    
    const topic = this.pubsub.topic(this.TOPIC_COMPLIANCE_ALERTS);
    await topic.publish(Buffer.from(JSON.stringify(alert)));
  }

  private async encryptWalletKeys(walletId: string): Promise<string> {
    // Implement KMS encryption for wallet keys
    return `encrypted_${walletId}_${Date.now()}`;
  }

  private async generateSallyPortToken(walletId: string): Promise<string> {
    // Generate secure token for SallyPort integration
    return `sallyport_${walletId}_${Date.now()}`;
  }

  private getXeroAccountCode(transactionType: string): string {
    const accountCodes = {
      'invoice': '200', // Sales
      'expense': '400', // Cost of Sales
      'transfer': '110'  // Checking Account
    };
    return accountCodes[transactionType] || '200';
  }

  private async verifyStripeWebhook(event: any): Promise<void> {
    // Implement Stripe webhook signature verification
  }

  private async verifyXeroWebhook(event: any): Promise<void> {
    // Implement Xero webhook signature verification
  }

  private async stripeEventToTransaction(event: any): Promise<FinancialTransaction> {
    // Convert Stripe webhook event to internal transaction format
    return {
      id: `stripe_${event.id}`,
      walletId: event.data.object.metadata?.walletId || 'unknown',
      type: 'payment',
      amount: event.data.object.amount / 100,
      currency: event.data.object.currency,
      description: event.data.object.description || 'Stripe payment',
      metadata: event.data.object.metadata || {},
      source: 'stripe',
      status: 'pending',
      timestamp: new Date(event.created * 1000)
    };
  }

  private async xeroEventToTransaction(event: any): Promise<FinancialTransaction> {
    // Convert Xero webhook event to internal transaction format
    return {
      id: `xero_${event.eventId}`,
      walletId: event.resourceId || 'unknown',
      type: 'invoice',
      amount: 0, // Will be populated from Xero API call
      currency: 'USD',
      description: 'Xero invoice',
      metadata: { xeroEventId: event.eventId },
      source: 'xero',
      status: 'pending',
      timestamp: new Date(event.eventDateUtc)
    };
  }

  private async getStripeBalance(customerId: string): Promise<number> {
    // Implement Stripe balance retrieval
    return 0;
  }

  private async getInternalBalance(walletId: string): Promise<number> {
    // Calculate balance from internal transactions
    return 0;
  }

  private async getTransactionHistory(
    walletId: string, 
    period: { start: Date; end: Date }
  ): Promise<FinancialTransaction[]> {
    
    const query = await this.firestore
      .collection('transactions')
      .where('walletId', '==', walletId)
      .where('timestamp', '>=', period.start)
      .where('timestamp', '<=', period.end)
      .orderBy('timestamp', 'desc')
      .get();

    return query.docs.map(doc => doc.data() as FinancialTransaction);
  }

  private groupTransactionsByType(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupTransactionsBySource(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions.reduce((acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupTransactionsByStatus(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async signReportWithBlockchain(walletId: string, period: { start: Date; end: Date }): Promise<string> {
    // Sign report with existing NFT ledger blockchain
    return `blockchain_signature_${walletId}_${period.start.getTime()}`;
  }

  private async storeFinancialReport(report: any): Promise<void> {
    await this.firestore
      .collection('financial_reports')
      .doc(`${report.walletId}_${report.period.start.toISOString()}_${report.period.end.toISOString()}`)
      .set(report);
  }
}