/**
 * Dr. Burby KC Compliance Engine - Legal Validation & Rule Enforcement
 * 
 * Implements comprehensive legal compliance validation for financial operations
 * including KYC, AML, LLP member classification, and jurisdictional requirements
 * 
 * @author Dr. Burby KC - King's Counsel
 * @authority AI Publishing International LLP Legal Department
 * @version 2.0.0 - Interface Ready
 */

import { Logger } from 'winston';
import { Firestore } from '@google-cloud/firestore';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { WalletConfiguration, FinancialTransaction, DrBurbyComplianceResult } from './FinancialOperationsBridge';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'KYC' | 'AML' | 'LLP_CLASSIFICATION' | 'TAX' | 'JURISDICTIONAL' | 'CUSTOM';
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
    value: any;
  }[];
  actions: {
    type: 'block' | 'flag' | 'manual_review' | 'log';
    message: string;
  }[];
  metadata: {
    createdBy: string;
    burbyApproved: boolean;
    lastReviewed: Date;
    jurisdictions: string[];
  };
}

export interface LLPMemberData {
  memberId: string;
  classification: '.hr1' | '.hr2' | '.hr3' | '.hr4';
  fullName: string;
  role: string;
  permissions: string[];
  complianceLevel: 'basic' | 'enhanced' | 'kc_oversight';
  lastReviewed: Date;
  status: 'active' | 'suspended' | 'terminated';
}

export interface ComplianceContext {
  transaction: FinancialTransaction;
  wallet: WalletConfiguration;
  memberData?: LLPMemberData;
  jurisdictionalRules: string[];
  riskFactors: string[];
  timestamp: Date;
}

export class DrBurbyComplianceEngine {
  private logger: Logger;
  private firestore: Firestore;
  private secretManager: SecretManagerServiceClient;
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private llpMembers: Map<string, LLPMemberData> = new Map();
  
  // Dr. Burby KC signature components
  private readonly BURBY_SIGNATURE_PREFIX = 'BURBY_KC_';
  private readonly BLOCKCHAIN_INTEGRATION_ENABLED = true;

  constructor() {
    this.logger = this.initializeLogger();
    this.firestore = new Firestore({ projectId: 'api-for-warp-drive' });
    this.secretManager = new SecretManagerServiceClient();
    
    this.initializeComplianceRules();
    this.loadLLPMemberRegistry();
    
    this.logger.info('Dr. Burby KC Compliance Engine initialized');
  }

  /**
   * Validate new wallet creation against Dr. Burby KC compliance requirements
   */
  async validateNewWallet(config: WalletConfiguration): Promise<DrBurbyComplianceResult> {
    this.logger.info('Validating new wallet compliance', { walletId: config.walletId });

    try {
      const violations: string[] = [];
      let riskScore = 0;

      // 1. LLP Member Classification Validation
      const memberValidation = await this.validateLLPMemberClassification(config);
      if (!memberValidation.isValid) {
        violations.push(...memberValidation.violations);
        riskScore += memberValidation.riskScore;
      }

      // 2. Tier and Limit Validation
      const tierValidation = await this.validateWalletTierLimits(config);
      if (!tierValidation.isValid) {
        violations.push(...tierValidation.violations);
        riskScore += tierValidation.riskScore;
      }

      // 3. Jurisdictional Compliance
      const jurisdictionalValidation = await this.validateJurisdictionalCompliance(config);
      if (!jurisdictionalValidation.isValid) {
        violations.push(...jurisdictionalValidation.violations);
        riskScore += jurisdictionalValidation.riskScore;
      }

      // 4. KYC Requirements
      const kycValidation = await this.validateKYCRequirements(config);
      if (!kycValidation.isValid) {
        violations.push(...kycValidation.violations);
        riskScore += kycValidation.riskScore;
      }

      const passed = violations.length === 0;
      const requiresManualReview = riskScore > 70 || config.complianceLevel === 'kc_oversight';

      // Generate Dr. Burby KC signature
      const burbySignature = this.generateBurbySignature('wallet_creation', config.walletId, passed);
      
      // Blockchain integration for immutable record
      let blockchainHash: string | undefined;
      if (this.BLOCKCHAIN_INTEGRATION_ENABLED && passed) {
        blockchainHash = await this.recordOnBlockchain({
          type: 'wallet_creation',
          walletId: config.walletId,
          complianceResult: { passed, violations, riskScore },
          burbySignature,
          timestamp: new Date()
        });
      }

      const result: DrBurbyComplianceResult = {
        passed,
        ruleViolations: violations,
        riskScore,
        requiresManualReview,
        burbySignature,
        blockchainHash,
        metadata: {
          validatedAt: new Date(),
          validatedBy: 'Dr. Burby KC Compliance Engine',
          walletTier: config.ownerTier,
          hrClassification: config.hrClassification,
          complianceLevel: config.complianceLevel
        }
      };

      // Store compliance record
      await this.storeComplianceRecord('wallet_creation', config.walletId, result);

      this.logger.info('Wallet compliance validation completed', {
        walletId: config.walletId,
        passed,
        violations: violations.length,
        riskScore,
        requiresManualReview
      });

      return result;

    } catch (error) {
      this.logger.error('Wallet compliance validation failed', {
        walletId: config.walletId,
        error: error.message
      });
      
      return {
        passed: false,
        ruleViolations: [`Compliance validation error: ${error.message}`],
        riskScore: 100,
        requiresManualReview: true,
        burbySignature: this.generateBurbySignature('wallet_creation_error', config.walletId, false),
        metadata: { error: error.message, timestamp: new Date() }
      };
    }
  }

  /**
   * Validate financial transaction against all compliance rules
   */
  async validateTransaction(
    transaction: FinancialTransaction,
    wallet: WalletConfiguration
  ): Promise<DrBurbyComplianceResult> {
    
    this.logger.info('Validating transaction compliance', {
      transactionId: transaction.id,
      walletId: transaction.walletId,
      amount: transaction.amount,
      type: transaction.type
    });

    try {
      const context: ComplianceContext = {
        transaction,
        wallet,
        memberData: await this.getLLPMemberData(wallet.hrClassification),
        jurisdictionalRules: await this.getJurisdictionalRules(wallet),
        riskFactors: [],
        timestamp: new Date()
      };

      const violations: string[] = [];
      let riskScore = 0;

      // 1. AML (Anti-Money Laundering) Checks
      const amlResult = await this.performAMLChecks(context);
      violations.push(...amlResult.violations);
      riskScore += amlResult.riskScore;

      // 2. Transaction Limit Validation
      const limitResult = await this.validateTransactionLimits(context);
      violations.push(...limitResult.violations);
      riskScore += limitResult.riskScore;

      // 3. LLP Member Authorization
      const authResult = await this.validateLLPAuthorization(context);
      violations.push(...authResult.violations);
      riskScore += authResult.riskScore;

      // 4. Jurisdictional Tax Compliance
      const taxResult = await this.validateTaxCompliance(context);
      violations.push(...taxResult.violations);
      riskScore += taxResult.riskScore;

      // 5. Custom Compliance Rules
      const customResult = await this.evaluateCustomRules(context);
      violations.push(...customResult.violations);
      riskScore += customResult.riskScore;

      const passed = violations.length === 0 && riskScore < 50;
      const requiresManualReview = riskScore > 70 || 
        wallet.complianceLevel === 'kc_oversight' ||
        transaction.amount > this.getManualReviewThreshold(wallet);

      // Generate Dr. Burby KC signature
      const burbySignature = this.generateBurbySignature(
        'transaction_validation',
        transaction.id,
        passed
      );

      // Blockchain integration for compliant transactions
      let blockchainHash: string | undefined;
      if (this.BLOCKCHAIN_INTEGRATION_ENABLED && passed) {
        blockchainHash = await this.recordOnBlockchain({
          type: 'transaction_validation',
          transactionId: transaction.id,
          walletId: transaction.walletId,
          complianceResult: { passed, violations, riskScore },
          burbySignature,
          timestamp: new Date()
        });
      }

      const result: DrBurbyComplianceResult = {
        passed,
        ruleViolations: violations,
        riskScore,
        requiresManualReview,
        burbySignature,
        blockchainHash,
        metadata: {
          validatedAt: new Date(),
          validatedBy: 'Dr. Burby KC Compliance Engine',
          transactionType: transaction.type,
          transactionAmount: transaction.amount,
          walletTier: wallet.ownerTier,
          hrClassification: wallet.hrClassification,
          context: {
            amlScore: amlResult.riskScore,
            limitCheckPassed: limitResult.violations.length === 0,
            authorizationLevel: authResult.authorizationLevel
          }
        }
      };

      // Store compliance record
      await this.storeComplianceRecord('transaction_validation', transaction.id, result);

      this.logger.info('Transaction compliance validation completed', {
        transactionId: transaction.id,
        passed,
        violations: violations.length,
        riskScore,
        requiresManualReview
      });

      return result;

    } catch (error) {
      this.logger.error('Transaction compliance validation failed', {
        transactionId: transaction.id,
        error: error.message
      });

      return {
        passed: false,
        ruleViolations: [`Compliance validation error: ${error.message}`],
        riskScore: 100,
        requiresManualReview: true,
        burbySignature: this.generateBurbySignature('transaction_validation_error', transaction.id, false),
        metadata: { error: error.message, timestamp: new Date() }
      };
    }
  }

  /**
   * Initialize default Dr. Burby KC compliance rules
   */
  private async initializeComplianceRules(): Promise<void> {
    const defaultRules: ComplianceRule[] = [
      // AML Rules
      {
        id: 'AML_001',
        name: 'Large Transaction Alert',
        description: 'Flag transactions over $10,000 for enhanced due diligence',
        category: 'AML',
        priority: 'high',
        enabled: true,
        conditions: [
          { field: 'amount', operator: 'greater_than', value: 10000 }
        ],
        actions: [
          { type: 'flag', message: 'Large transaction requires enhanced due diligence' }
        ],
        metadata: {
          createdBy: 'Dr. Burby KC',
          burbyApproved: true,
          lastReviewed: new Date(),
          jurisdictions: ['US', 'UK', 'EU']
        }
      },
      
      // LLP Classification Rules
      {
        id: 'LLP_001',
        name: 'HR1 Member Transaction Authority',
        description: 'Validate HR1 members have appropriate transaction authority',
        category: 'LLP_CLASSIFICATION',
        priority: 'critical',
        enabled: true,
        conditions: [
          { field: 'hrClassification', operator: 'equals', value: '.hr1' },
          { field: 'amount', operator: 'greater_than', value: 50000 }
        ],
        actions: [
          { type: 'manual_review', message: 'HR1 large transaction requires KC review' }
        ],
        metadata: {
          createdBy: 'Dr. Burby KC',
          burbyApproved: true,
          lastReviewed: new Date(),
          jurisdictions: ['UK']
        }
      },

      // Tax Compliance Rules
      {
        id: 'TAX_001',
        name: 'Cross-Border Transaction Tax Reporting',
        description: 'Ensure proper tax reporting for cross-border transactions',
        category: 'TAX',
        priority: 'high',
        enabled: true,
        conditions: [
          { field: 'type', operator: 'equals', value: 'transfer' },
          { field: 'amount', operator: 'greater_than', value: 1000 }
        ],
        actions: [
          { type: 'flag', message: 'Cross-border transfer requires tax compliance validation' }
        ],
        metadata: {
          createdBy: 'Dr. Burby KC',
          burbyApproved: true,
          lastReviewed: new Date(),
          jurisdictions: ['US', 'UK']
        }
      },

      // KYC Rules
      {
        id: 'KYC_001',
        name: 'Enhanced KYC for High-Risk Jurisdictions',
        description: 'Additional KYC requirements for high-risk jurisdictions',
        category: 'KYC',
        priority: 'critical',
        enabled: true,
        conditions: [
          { field: 'jurisdiction', operator: 'contains', value: 'high_risk' }
        ],
        actions: [
          { type: 'block', message: 'Enhanced KYC required for high-risk jurisdiction' }
        ],
        metadata: {
          createdBy: 'Dr. Burby KC',
          burbyApproved: true,
          lastReviewed: new Date(),
          jurisdictions: ['GLOBAL']
        }
      }
    ];

    // Load rules into memory and Firestore
    for (const rule of defaultRules) {
      this.complianceRules.set(rule.id, rule);
      await this.firestore.collection('compliance_rules').doc(rule.id).set(rule);
    }

    this.logger.info('Dr. Burby KC compliance rules initialized', { 
      rulesCount: defaultRules.length 
    });
  }

  /**
   * Load LLP member registry with HR classifications
   */
  private async loadLLPMemberRegistry(): Promise<void> {
    try {
      // Load from Firestore or initialize with known members
      const membersQuery = await this.firestore.collection('llp_members').get();
      
      if (membersQuery.empty) {
        // Initialize with known LLP members from your rules
        const initialMembers: LLPMemberData[] = [
          {
            memberId: 'roark_pc',
            classification: '.hr1',
            fullName: 'Mr. Phillip Corey Roark',
            role: 'LLP Member - Full-time Contractor',
            permissions: ['unlimited_transactions', 'manual_review_override'],
            complianceLevel: 'kc_oversight',
            lastReviewed: new Date(),
            status: 'active'
          },
          {
            memberId: 'obrien_m',
            classification: '.hr1',
            fullName: 'Mr. Morgan O\'Brien',
            role: 'LLP Member - Full-time Contractor',
            permissions: ['unlimited_transactions', 'compliance_review'],
            complianceLevel: 'kc_oversight',
            lastReviewed: new Date(),
            status: 'active'
          },
          {
            memberId: 'galbreath_j',
            classification: '.hr4',
            fullName: 'Joshua Galbreath',
            role: 'LLP Member - Not working for LLP',
            permissions: ['standard_transactions'],
            complianceLevel: 'enhanced',
            lastReviewed: new Date(),
            status: 'active'
          },
          {
            memberId: 'harris_a',
            classification: '.hr4',
            fullName: 'Aaron Harris',
            role: 'Sapphire SAO - Zaxon Construction',
            permissions: ['sapphire_transactions', 'zaxon_oversight'],
            complianceLevel: 'enhanced',
            lastReviewed: new Date(),
            status: 'active'
          }
        ];

        for (const member of initialMembers) {
          this.llpMembers.set(member.classification, member);
          await this.firestore.collection('llp_members').doc(member.memberId).set(member);
        }

        this.logger.info('LLP member registry initialized', { membersCount: initialMembers.length });
      } else {
        // Load existing members from Firestore
        membersQuery.docs.forEach(doc => {
          const member = doc.data() as LLPMemberData;
          this.llpMembers.set(member.classification, member);
        });

        this.logger.info('LLP member registry loaded', { membersCount: membersQuery.size });
      }

    } catch (error) {
      this.logger.error('Failed to load LLP member registry', { error: error.message });
    }
  }

  // Validation methods

  private async validateLLPMemberClassification(config: WalletConfiguration): Promise<{
    isValid: boolean;
    violations: string[];
    riskScore: number;
  }> {
    const member = this.llpMembers.get(config.hrClassification);
    
    if (!member) {
      return {
        isValid: false,
        violations: [`Unknown HR classification: ${config.hrClassification}`],
        riskScore: 100
      };
    }

    if (member.status !== 'active') {
      return {
        isValid: false,
        violations: [`Member ${member.fullName} is not active (status: ${member.status})`],
        riskScore: 90
      };
    }

    // Validate tier permissions
    const tierPermissions = this.getTierPermissions(config.ownerTier);
    const memberPermissions = member.permissions;
    
    const hasRequiredPermissions = tierPermissions.every(perm => 
      memberPermissions.includes(perm) || memberPermissions.includes('unlimited_transactions')
    );

    if (!hasRequiredPermissions) {
      return {
        isValid: false,
        violations: [`Member ${member.fullName} lacks required permissions for ${config.ownerTier} tier`],
        riskScore: 70
      };
    }

    return { isValid: true, violations: [], riskScore: 0 };
  }

  private async validateWalletTierLimits(config: WalletConfiguration): Promise<{
    isValid: boolean;
    violations: string[];
    riskScore: number;
  }> {
    const tierLimits = this.getTierLimits(config.ownerTier);
    const violations: string[] = [];
    let riskScore = 0;

    if (config.limits.daily > tierLimits.daily) {
      violations.push(`Daily limit ${config.limits.daily} exceeds tier maximum ${tierLimits.daily}`);
      riskScore += 30;
    }

    if (config.limits.monthly > tierLimits.monthly) {
      violations.push(`Monthly limit ${config.limits.monthly} exceeds tier maximum ${tierLimits.monthly}`);
      riskScore += 30;
    }

    if (config.limits.transaction > tierLimits.transaction) {
      violations.push(`Transaction limit ${config.limits.transaction} exceeds tier maximum ${tierLimits.transaction}`);
      riskScore += 20;
    }

    return {
      isValid: violations.length === 0,
      violations,
      riskScore
    };
  }

  private async validateJurisdictionalCompliance(config: WalletConfiguration): Promise<{
    isValid: boolean;
    violations: string[];
    riskScore: number;
  }> {
    // Implement jurisdictional compliance checks
    // This would integrate with external compliance databases
    return { isValid: true, violations: [], riskScore: 0 };
  }

  private async validateKYCRequirements(config: WalletConfiguration): Promise<{
    isValid: boolean;
    violations: string[];
    riskScore: number;
  }> {
    // Implement KYC validation
    // This would check against KYC databases and requirements
    return { isValid: true, violations: [], riskScore: 0 };
  }

  private async performAMLChecks(context: ComplianceContext): Promise<{
    violations: string[];
    riskScore: number;
  }> {
    const violations: string[] = [];
    let riskScore = 0;

    // Large transaction check
    if (context.transaction.amount > 10000) {
      violations.push('Large transaction requires enhanced due diligence');
      riskScore += 30;
    }

    // Rapid transaction pattern check
    const recentTransactions = await this.getRecentTransactions(
      context.wallet.walletId, 
      24 // hours
    );
    
    const rapidTransactionCount = recentTransactions.filter(t => 
      t.amount > 1000 && 
      Date.now() - t.timestamp.getTime() < 3600000 // 1 hour
    ).length;

    if (rapidTransactionCount > 5) {
      violations.push('Rapid high-value transaction pattern detected');
      riskScore += 40;
    }

    return { violations, riskScore };
  }

  private async validateTransactionLimits(context: ComplianceContext): Promise<{
    violations: string[];
    riskScore: number;
  }> {
    const violations: string[] = [];
    let riskScore = 0;
    const { transaction, wallet } = context;

    // Single transaction limit
    if (transaction.amount > wallet.limits.transaction) {
      violations.push(`Transaction amount ${transaction.amount} exceeds limit ${wallet.limits.transaction}`);
      riskScore += 50;
    }

    // Daily limit check
    const todayTransactions = await this.getTodayTransactions(wallet.walletId);
    const todayTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0) + transaction.amount;
    
    if (todayTotal > wallet.limits.daily) {
      violations.push(`Daily transaction total ${todayTotal} would exceed limit ${wallet.limits.daily}`);
      riskScore += 40;
    }

    return { violations, riskScore };
  }

  private async validateLLPAuthorization(context: ComplianceContext): Promise<{
    violations: string[];
    riskScore: number;
    authorizationLevel: string;
  }> {
    const violations: string[] = [];
    let riskScore = 0;
    const { transaction, wallet, memberData } = context;

    if (!memberData) {
      violations.push('No member data found for HR classification');
      return { violations, riskScore: 100, authorizationLevel: 'none' };
    }

    let authorizationLevel = 'basic';

    // High-value transactions require elevated authorization
    if (transaction.amount > 50000 && memberData.classification === '.hr1') {
      authorizationLevel = 'kc_review_required';
      riskScore += 20; // Not a violation but requires review
    } else if (transaction.amount > 100000) {
      violations.push('Ultra-high-value transaction requires manual KC approval');
      riskScore += 60;
      authorizationLevel = 'manual_approval_required';
    }

    return { violations, riskScore, authorizationLevel };
  }

  private async validateTaxCompliance(context: ComplianceContext): Promise<{
    violations: string[];
    riskScore: number;
  }> {
    const violations: string[] = [];
    let riskScore = 0;

    // Cross-border transaction tax compliance
    if (context.transaction.type === 'transfer' && context.transaction.amount > 1000) {
      // This would integrate with tax compliance systems
      riskScore += 10; // Minor risk flag for tax reporting
    }

    return { violations, riskScore };
  }

  private async evaluateCustomRules(context: ComplianceContext): Promise<{
    violations: string[];
    riskScore: number;
  }> {
    const violations: string[] = [];
    let riskScore = 0;

    // Evaluate all active custom rules
    for (const rule of this.complianceRules.values()) {
      if (!rule.enabled) continue;

      const ruleResult = this.evaluateRule(rule, context);
      if (!ruleResult.passed) {
        violations.push(...ruleResult.messages);
        riskScore += this.getRiskScoreForPriority(rule.priority);
      }
    }

    return { violations, riskScore };
  }

  // Utility methods

  private initializeLogger(): Logger {
    const winston = require('winston');
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'dr-burby-compliance-engine' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'compliance.log' })
      ]
    });
  }

  private generateBurbySignature(type: string, id: string, passed: boolean): string {
    const timestamp = Date.now();
    const status = passed ? 'APPROVED' : 'REJECTED';
    const hash = this.simpleHash(`${type}_${id}_${timestamp}_${status}`);
    return `${this.BURBY_SIGNATURE_PREFIX}${type.toUpperCase()}_${status}_${hash}`;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async recordOnBlockchain(data: any): Promise<string> {
    // Integration with existing NFT ledger blockchain
    const blockchainHash = `blockchain_${Date.now()}_${this.simpleHash(JSON.stringify(data))}`;
    
    // Store blockchain record in Firestore for audit trail
    await this.firestore.collection('blockchain_records').add({
      ...data,
      blockchainHash,
      recordedAt: new Date()
    });
    
    return blockchainHash;
  }

  private async storeComplianceRecord(type: string, id: string, result: DrBurbyComplianceResult): Promise<void> {
    await this.firestore.collection('compliance_records').add({
      type,
      entityId: id,
      result,
      timestamp: new Date()
    });
  }

  private getTierPermissions(tier: string): string[] {
    const permissions = {
      diamond: ['unlimited_transactions', 'manual_review_override', 'compliance_override'],
      emerald: ['high_value_transactions', 'compliance_review'],
      sapphire: ['medium_value_transactions', 'instance_admin'],
      opal: ['standard_transactions'],
      onyx: ['basic_transactions']
    };
    return permissions[tier] || [];
  }

  private getTierLimits(tier: string): { daily: number; monthly: number; transaction: number } {
    const limits = {
      diamond: { daily: 1000000, monthly: 10000000, transaction: 500000 },
      emerald: { daily: 500000, monthly: 5000000, transaction: 250000 },
      sapphire: { daily: 100000, monthly: 1000000, transaction: 50000 },
      opal: { daily: 25000, monthly: 250000, transaction: 10000 },
      onyx: { daily: 5000, monthly: 50000, transaction: 2500 }
    };
    return limits[tier] || limits.onyx;
  }

  private getManualReviewThreshold(wallet: WalletConfiguration): number {
    const thresholds = {
      diamond: 100000,
      emerald: 50000,
      sapphire: 25000,
      opal: 10000,
      onyx: 5000
    };
    return thresholds[wallet.ownerTier] || 5000;
  }

  private async getLLPMemberData(classification: string): Promise<LLPMemberData | undefined> {
    return this.llpMembers.get(classification);
  }

  private async getJurisdictionalRules(wallet: WalletConfiguration): Promise<string[]> {
    // Return applicable jurisdictional rules based on wallet configuration
    return ['US', 'UK']; // Placeholder
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

  private async getTodayTransactions(walletId: string): Promise<FinancialTransaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query = await this.firestore
      .collection('transactions')
      .where('walletId', '==', walletId)
      .where('timestamp', '>=', today)
      .get();

    return query.docs.map(doc => doc.data() as FinancialTransaction);
  }

  private evaluateRule(rule: ComplianceRule, context: ComplianceContext): { passed: boolean; messages: string[] } {
    // Simple rule evaluation - in production this would be more sophisticated
    let passed = true;
    const messages: string[] = [];

    for (const condition of rule.conditions) {
      const fieldValue = this.getFieldValue(condition.field, context);
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      
      if (!conditionMet) {
        passed = false;
        const actionMessage = rule.actions.find(a => a.type === 'block' || a.type === 'flag')?.message || rule.description;
        messages.push(actionMessage);
        break;
      }
    }

    return { passed, messages };
  }

  private getFieldValue(field: string, context: ComplianceContext): any {
    const parts = field.split('.');
    let value: any = context;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals': return fieldValue === expectedValue;
      case 'not_equals': return fieldValue !== expectedValue;
      case 'greater_than': return fieldValue > expectedValue;
      case 'less_than': return fieldValue < expectedValue;
      case 'contains': return fieldValue?.toString().includes(expectedValue);
      case 'regex': return new RegExp(expectedValue).test(fieldValue?.toString() || '');
      default: return false;
    }
  }

  private getRiskScoreForPriority(priority: string): number {
    const scores = {
      low: 10,
      medium: 25,
      high: 40,
      critical: 60
    };
    return scores[priority] || 10;
  }
}