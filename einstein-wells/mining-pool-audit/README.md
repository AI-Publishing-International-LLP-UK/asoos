# Mining Pool Audit System

**Einstein Wells Division - AI Publishing International LLP**

Internal OAuth2/OIDC secured mining pool balance and payout audit system with on-chain verification.

🔐 **Enterprise Security**: No external API sharing - OAuth2/OIDC authentication only  
📍 **Deployment**: Google Cloud Platform (us-west1)  
🏢 **Organization**: AI Publishing International LLP  

## Features

- **OAuth2/OIDC Authentication**: Enterprise-grade security with no API key exposure
- **Multi-Pool Support**: NiceHash, SlushPool, and extensible architecture
- **Wallet Verification**: Automated payout address verification against expected addresses
- **On-Chain Verification**: Cross-check pool-reported payouts with blockchain deposits
- **Computational Cycles**: Support for "17 computational cycles" timing analysis
- **Google Cloud Integration**: Secret Manager for secure credential storage
- **Comprehensive Logging**: Winston-based structured logging with Cloud Run compatibility
- **Internal Systems Only**: No external API sharing or third-party access

## Quick Start

```bash
# Clone and setup
cd mining-pool-audit
./startup-demo.sh

# Install dependencies
npm install

# Run basic audit
npm run audit:pools

# Run full audit with chain verification  
npm run audit:full -- --verbose --json
```

## System Architecture

```
mining-pool-audit/
├─ src/
│   ├─ cli.ts                 # Main orchestrator
│   ├─ env.ts                 # OAuth2/Secret Manager integration
│   ├─ logger.ts              # Winston logging system
│   ├─ types.ts               # TypeScript interfaces
│   ├─ walletVerifier.ts      # Address verification system
│   ├─ chainChecker.ts        # On-chain deposit verification
│   └─ pools/
│       ├─ BasePool.ts        # Abstract OAuth2 pool client
│       ├─ NiceHash.ts        # NiceHash OAuth2 implementation
│       └─ SlushPool.ts       # SlushPool OAuth2 implementation
├─ test/                      # Jest unit tests
├─ logs/                      # Application logs
└─ config/                    # Configuration files
```

## OAuth2 Configuration

### Google Cloud Secret Manager Setup

Required secrets in Secret Manager:

```bash
# OAuth2 credentials for mining pools
gcloud secrets create mining-pool-oauth2-nicehash-client-id --data-file=-
gcloud secrets create mining-pool-oauth2-nicehash-client-secret --data-file=-
gcloud secrets create mining-pool-oauth2-nicehash-auth-url --data-file=-
gcloud secrets create mining-pool-oauth2-nicehash-token-url --data-file=-
gcloud secrets create mining-pool-oauth2-nicehash-redirect-uri --data-file=-
gcloud secrets create mining-pool-oauth2-nicehash-scope --data-file=-

# Repeat for SlushPool and other pools...

# Expected wallet addresses for verification
gcloud secrets create mining-wallet-btc-address --data-file=-
gcloud secrets create mining-wallet-xmr-address --data-file=-

# Configuration parameters
gcloud secrets create chain-verification-tolerance --data-file=-
gcloud secrets create computational-cycle-duration --data-file=-
```

### Local Development (.env)

For development, create `.env` file:

```env
# GCP Configuration
GCP_PROJECT_ID=api-for-warp-drive
CLOUD_ML_REGION=us-west1

# OAuth2 Configuration (NiceHash)
MINING_POOL_OAUTH2_NICEHASH_CLIENT_ID=your_client_id
MINING_POOL_OAUTH2_NICEHASH_CLIENT_SECRET=your_client_secret
MINING_POOL_OAUTH2_NICEHASH_AUTH_URL=https://nicehash.com/oauth/authorize
MINING_POOL_OAUTH2_NICEHASH_TOKEN_URL=https://nicehash.com/oauth/token
MINING_POOL_OAUTH2_NICEHASH_REDIRECT_URI=https://your-internal-system/callback
MINING_POOL_OAUTH2_NICEHASH_SCOPE=mining:read,account:read

# Expected Wallet Addresses
MINING_WALLET_BTC_ADDRESS=3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj
MINING_WALLET_XMR_ADDRESS=your_monero_address

# System Configuration
CHAIN_VERIFICATION_TOLERANCE=5.0
COMPUTATIONAL_CYCLE_DURATION=3600
AUDIT_LOG_LEVEL=info
```

## Usage Examples

### Basic Pool Audit

```bash
npm run audit:pools
```

### Full Audit with Chain Verification

```bash
npm run audit:full -- --pools nicehash,slushpool --verbose
```

### JSON Output for Integration

```bash
npm run dev -- --json --output audit-report.json
```

### Custom Computational Cycles

```bash
npm run dev -- --cycles 17 --cycle-duration 3600 --chain-check
```

## API Output Format

```typescript
interface AuditReport {
  timestamp: Date;
  auditId: string;
  pools: PoolAuditResult[];
  walletVerifications: WalletVerification[];
  chainVerification: ChainVerificationResult;
  summary: AuditSummary;
  errors: string[];
}

interface PoolAuditResult {
  poolName: string;
  status: 'success' | 'error' | 'warning';
  balances: MiningPoolBalance[];
  payoutRules: PayoutRule[];
  lastSyncTime: Date;
  errors?: string[];
}

interface WalletVerification {
  expectedAddress: string;
  configuredAddress: string;
  isMatch: boolean;
  currency: string;
  poolName: string;
}
```

## Computational Cycles

The system supports "17 computational cycles" analysis:

- **Cycle Duration**: Configurable (default: 1 hour)
- **Start Timestamp**: Configurable via Secret Manager
- **Chain Verification**: Compare pool payouts vs on-chain deposits over cycle periods
- **Tolerance**: Configurable discrepancy tolerance (default: 5%)

## Security Features

- **OAuth2/OIDC Only**: No API keys in configuration or logs
- **Google Secret Manager**: All sensitive data encrypted at rest
- **Workload Identity**: Cloud Run authentication without service account keys
- **Internal Systems Only**: No external API exposure
- **Audit Logging**: Comprehensive security event logging
- **Address Masking**: Wallet addresses masked in logs for security

## Deployment

### Google Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/api-for-warp-drive/mining-audit', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/api-for-warp-drive/mining-audit']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'mining-audit'
      - '--image'
      - 'gcr.io/api-for-warp-drive/mining-audit'
      - '--region'
      - 'us-west1'
      - '--platform'
      - 'managed'
      - '--memory'
      - '1Gi'
      - '--cpu'
      - '1'
      - '--max-instances'
      - '3'
      - '--set-env-vars'
      - 'NODE_ENV=production,GCP_PROJECT_ID=api-for-warp-drive'
```

### Docker Configuration

```dockerfile
FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 8080
CMD ["node", "dist/cli.js"]
```

## Monitoring & Alerts

- **Winston Logging**: Structured JSON logs for Cloud Logging
- **Diamond SAO Command Center**: Centralized monitoring dashboard
- **Alert Thresholds**: Configurable balance and discrepancy alerts
- **Health Checks**: OAuth2 token validation and pool connectivity

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Testing

```bash
# Unit tests
npm test

# Test with mocked responses
npm run test:mock

# Integration tests (requires valid OAuth2 config)
npm run test:integration
```

## Support

For internal support and configuration:

- **Division**: Einstein Wells
- **Organization**: AI Publishing International LLP
- **System**: OAuth2/OIDC Enterprise Security
- **Region**: us-west1 (Google Cloud Platform)
- **Project**: api-for-warp-drive

---

*Internal system - no external API sharing*  
*AI Publishing International LLP Diamond SAO & Emerald SAO Exclusive*