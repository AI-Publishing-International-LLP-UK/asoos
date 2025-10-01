/**
 * Internal Logging System
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * Winston-based logging with structured output for internal audit operations
 */

import winston from 'winston';

// Custom log format for internal operations
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr ? '\n' + metaStr : ''}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.AUDIT_LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'mining-pool-audit',
    division: 'einstein-wells',
    organization: 'ai-publishing-international-llp'
  },
  transports: [
    // Console output for development and Cloud Run
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // File output for persistent logging
    new winston.transports.File({
      filename: 'logs/audit-error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/audit-combined.log',
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json()
      ),
    }),
  ],
});

// Add Cloud Run structured logging if in production
if (process.env.NODE_ENV === 'production' || process.env.K_SERVICE) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }));
}

// Utility functions for structured logging
export const auditLogger = {
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  error: (message: string, error?: Error | any, meta?: any) => {
    const errorMeta = error instanceof Error 
      ? { error: error.message, stack: error.stack, ...meta }
      : { error, ...meta };
    logger.error(message, errorMeta);
  },

  // Specialized audit logging methods
  poolOperation: (pool: string, operation: string, success: boolean, meta?: any) => {
    logger.info(`Pool Operation: ${pool}`, {
      operation,
      success,
      pool,
      ...meta,
    });
  },

  balanceCheck: (pool: string, currency: string, balance: number, meta?: any) => {
    logger.info(`Balance Check: ${pool}`, {
      pool,
      currency,
      balance,
      ...meta,
    });
  },

  walletVerification: (pool: string, currency: string, isMatch: boolean, meta?: any) => {
    const level = isMatch ? 'info' : 'warn';
    logger.log(level, `Wallet Verification: ${pool}`, {
      pool,
      currency,
      isMatch,
      ...meta,
    });
  },

  chainDiscrepancy: (currency: string, onChainAmount: number, poolAmount: number, discrepancy: number, meta?: any) => {
    logger.warn('Chain Discrepancy Detected', {
      currency,
      onChainAmount,
      poolAmount,
      discrepancy,
      discrepancyPercentage: ((discrepancy / poolAmount) * 100).toFixed(2) + '%',
      ...meta,
    });
  },

  oauth2Flow: (pool: string, step: string, success: boolean, meta?: any) => {
    const level = success ? 'debug' : 'error';
    logger.log(level, `OAuth2 Flow: ${pool}`, {
      pool,
      step,
      success,
      ...meta,
    });
  },

  auditSummary: (summary: any) => {
    logger.info('Audit Summary', summary);
  },
};

// Set log level dynamically
export const setLogLevel = (level: string): void => {
  logger.level = level;
};

// Export default logger for compatibility
export default logger;