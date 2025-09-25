# 🚀 Integration Gateway - Automated Deployment Guide

## Overview

Your CI/CD CTTT pipeline is now fully configured for automated deployment with:

- **Node.js 24** across all environments
- **Zero-downtime canary deployments** (10% → 50% → 100%)
- **Self-monitoring & alerting** via Diamond SAO Command Center v34
- **Automated rollback** on health check failures
- **Multi-region deployment** (us-west1, us-central1)

## 🔧 Pre-Deployment Setup

### 1. Ensure GCP Authentication

```bash
# Authenticate with your pr@coaching2100.com account
gcloud auth login
gcloud config set project api-for-warp-drive
```

### 2. Deploy Monitoring Infrastructure

```bash
# Deploy the Node.js version monitoring system
cd monitoring
zip -r node-version-guard.zip node-version-guard/
gsutil cp node-version-guard.zip gs://api-for-warp-drive-functions/

gcloud deployment-manager deployments create node-version-monitoring \
  --config deploy-monitoring.yaml
```

## 🚀 Deployment Methods

### Method 1: Automated CI/CD (Recommended)

Simply push to the main branch - the pipeline will handle everything:

```bash
git add .
git commit -m "Deploy: Node.js 24 upgrade with enhanced monitoring"
git push origin main
```

The CI/CD CTTT pipeline will:
1. ✅ Run Newman API tests
2. 🏗️ Build Docker image with Node.js 24
3. 🔍 Security scan the container
4. 📦 Push to Container Registry
5. 🚀 Deploy with gradual traffic migration (10% → 50% → 100%)
6. 📊 Update Diamond SAO Command Center v34
7. 🧹 Clean up old images

### Method 2: Manual Deployment with Enhanced Script

Use the enhanced deployment script with built-in monitoring:

```bash
# Make sure you're in the integration-gateway directory
cd /Users/as/asoos/integration-gateway

# Run the deployment script
./scripts/deploy-with-monitoring.sh
```

This script provides:
- ✅ Pre-flight checks
- 🔍 Node.js version validation
- 📦 Container Registry push
- 🌍 Multi-region deployment
- ⚡ Zero-downtime traffic migration
- 🔄 Automated rollback on failure
- 📊 Diamond SAO notifications

## 📊 Monitoring & Alerts

### Service URLs
- **Primary (us-west1)**: https://integration-gateway-js-859242575175.us-west1.run.app
- **Secondary (us-central1)**: https://integration-gateway-js-859242575175.us-central1.run.app

### Health Check Endpoints
```bash
# Check service health
curl https://integration-gateway-js-859242575175.us-west1.run.app/health

# Get Node.js version info
curl https://integration-gateway-js-859242575175.us-west1.run.app/version
```

### Diamond SAO Command Center v34
- **Dashboard**: https://mocoa-owner-interface-859242575175.us-central1.run.app
- **Monitoring**: Real-time deployment status, health metrics, and alerts
- **Self-Healing**: Automated response to Node.js version violations

### Cloud Monitoring
The system automatically creates:
- 📊 Custom metrics for Node.js version compliance
- 🚨 Alert policies for version violations
- 📈 Uptime monitoring from staging (us-west1-b) and production (us-west1-a)

## 🛡️ Security Features

### SallyPort Authentication
- **Gateway Classes**: All 5 gateway implementations with SallyPort verification
- **Secret Management**: Automated via Google Cloud Secret Manager
- **OAuth2 Integration**: Hardened with quantum-grade security

### Node.js Version Guard
- **Daily Monitoring**: Automated checks at 9 AM UTC
- **Weekly Audits**: Comprehensive reporting every Monday at 6 AM UTC
- **Violation Alerts**: Immediate notifications to Diamond SAO

## 🔄 Rollback Procedures

### Automatic Rollback
The system automatically rolls back if:
- Health checks fail during traffic migration
- Error rate exceeds 2% for 5+ minutes
- Node.js version violations detected

### Manual Rollback
```bash
# Get current revision
CURRENT_REVISION=$(gcloud run revisions list \
  --service integration-gateway-js \
  --region us-west1 \
  --limit 1 \
  --format="value(metadata.name)")

# Get previous revision  
PREVIOUS_REVISION=$(gcloud run revisions list \
  --service integration-gateway-js \
  --region us-west1 \
  --limit 2 \
  --format="value(metadata.name)" | tail -1)

# Rollback to previous revision
gcloud run services update-traffic integration-gateway-js \
  --to-revisions $PREVIOUS_REVISION=100 \
  --region us-west1
```

## 📈 Performance Optimization

### Node.js 24 Benefits
- **Performance**: ~15% faster execution
- **Security**: Latest security patches
- **Memory**: Improved garbage collection
- **Compatibility**: Future-proof for 3+ years

### Container Optimization
- **Base Image**: `node:24-alpine` for minimal size
- **Multi-stage Build**: Optimized layers
- **Health Checks**: Built-in container health monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failure**
   ```bash
   gcloud auth list
   gcloud config set account pr@coaching2100.com
   ```

2. **Node.js Version Mismatch**
   - Check Dockerfile uses `node:24-alpine`
   - Verify CI/CD pipeline uses Node.js 24
   - Run deployment script to validate

3. **Health Check Failures**
   ```bash
   # Check service logs
   gcloud logs read --service integration-gateway-js --region us-west1 --limit 50
   ```

4. **Traffic Migration Issues**
   ```bash
   # Check current traffic split
   gcloud run services describe integration-gateway-js --region us-west1 --format="yaml(spec.traffic)"
   ```

### Getting Help
- **Diamond SAO Command Center**: Real-time support and monitoring
- **Cloud Logging**: Comprehensive error tracking
- **Deployment Notifications**: Automated status updates

## 🎯 Next Steps

1. **Monitor**: Watch Diamond SAO Command Center for 72 hours post-deployment
2. **Validate**: Ensure all SallyPort authentication flows work correctly
3. **Scale**: Review auto-scaling settings based on traffic patterns
4. **Optimize**: Use performance metrics to fine-tune configurations

---

## Summary

Your integration gateway is now equipped with:

✅ **Node.js 24** - Latest performance and security  
✅ **Automated CI/CD CTTT** - Push-to-deploy simplicity  
✅ **Zero-downtime deployments** - Gradual traffic migration  
✅ **Self-healing monitoring** - Prevents Node.js version drift  
✅ **Multi-region resilience** - us-west1 + us-central1  
✅ **Diamond SAO integration** - Real-time command center  
✅ **SallyPort security** - Quantum-grade authentication  

The system is production-ready and will automatically maintain Node.js 24+ compliance across all your Cloud Run services! 🎉