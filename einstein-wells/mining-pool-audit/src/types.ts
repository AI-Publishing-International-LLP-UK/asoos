/**
 * Internal Mining Pool Audit System - Data Models
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * OAuth2/OIDC secured internal system - no external API sharing
 */

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scope: string[];
}

export interface MiningPoolBalance {
  poolName: string;
  currency: string;
  unpaidBalance: number;
  confirmedBalance: number;
  unconfirmedBalance: number;
  lastUpdated: Date;
}

export interface PayoutRule {
  poolName: string;
  currency: string;
  minimumPayout: number;
  payoutFrequency: string; // 'daily', 'weekly', 'threshold'
  nextPayoutTime?: Date;
  configuredPayoutAddress: string;
  payoutFee: number;
  payoutFeeType: 'fixed' | 'percentage';
}

export interface ComputationalCycle {
  cycleNumber: number;
  startTime: Date;
  endTime: Date;
  blockHeight?: number;
  expectedDuration: number; // seconds
}

export interface OnChainDeposit {
  txHash: string;
  blockHeight: number;
  timestamp: Date;
  amount: number;
  currency: string;
  fromAddress: string;
  toAddress: string;
  confirmations: number;
}

export interface WalletVerification {
  expectedAddress: string;
  configuredAddress: string;
  isMatch: boolean;
  currency: string;
  poolName: string;
}

export interface AuditReport {
  timestamp: Date;
  auditId: string;
  pools: PoolAuditResult[];
  walletVerifications: WalletVerification[];
  chainVerification: ChainVerificationResult;
  summary: AuditSummary;
  errors: string[];
}

export interface PoolAuditResult {
  poolName: string;
  status: 'success' | 'error' | 'warning';
  balances: MiningPoolBalance[];
  payoutRules: PayoutRule[];
  lastSyncTime: Date;
  errors?: string[];
}

export interface ChainVerificationResult {
  startCycle: number;
  endCycle: number;
  totalCycles: number;
  onChainDeposits: OnChainDeposit[];
  totalOnChainAmount: number;
  totalPoolReportedPayouts: number;
  discrepancy: number;
  discrepancyPercentage: number;
  isWithinTolerance: boolean;
  tolerance: number; // percentage
}

export interface AuditSummary {
  totalPools: number;
  successfulPools: number;
  failedPools: number;
  totalUnpaidBalance: Record<string, number>; // currency -> amount
  addressMismatches: number;
  chainDiscrepancies: number;
  criticalIssues: number;
  overallStatus: 'healthy' | 'warning' | 'critical';
}

export interface InternalConfig {
  oauth2: {
    [poolName: string]: OAuth2Config;
  };
  wallets: {
    [currency: string]: string; // Expected wallet addresses
  };
  chainConfig: {
    tolerance: number;
    cycleDefinition: {
      durationSeconds: number;
      startTimestamp: number;
    };
    rpcEndpoints: {
      [currency: string]: string;
    };
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    alertThresholds: {
      balanceThreshold: number;
      discrepancyThreshold: number;
      addressMismatchAlert: boolean;
    };
  };
}