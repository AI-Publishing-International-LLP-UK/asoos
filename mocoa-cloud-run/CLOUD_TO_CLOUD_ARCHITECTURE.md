# Cloud-to-Cloud Architecture

## Important Notice for AI Agents 🤖

**This project operates on a CLOUD-TO-CLOUD architecture. All services, resources, and deployments exist in the cloud infrastructure, not on local machines.**

## Architecture Overview

### ⚠️ Important: Firebase Deprecation Notice
**Firebase is COMPLETELY DEPRECATED and removed from this project. Do not reference, suggest, or attempt to use any Firebase services. All Firebase functionality has been migrated to Cloudflare and GCP alternatives.**

### Current Cloud Infrastructure
- **Primary Platform**: Google Cloud Platform (GCP)
- **Project**: `api-for-warp-drive`
- **Region**: `us-west1`
- **Zone**: `us-west1-b`

### Cloud Services Stack
1. **Google Cloud Run** - Container deployment platform
2. **Google Cloud Build** - CI/CD pipeline
3. **Cloudflare** - Domain management, CDN, and hosting
4. **Google Cloud Secret Manager** - Environment variables and secrets
5. **Firestore (GCP)** - Document database
6. **Pinecone** - Vector database for AI operations
7. **MongoDB Atlas** - HR and AI-CRM systems

### Key Cloud Endpoints
- **MCP (Model Context Protocol)**: `mcp.aipub.2100.cool`
- **Main Domain**: `asoos.2100.cool` (Cloudflare Hosted)
- **DNS Zone**: `main-zone` managed via Cloudflare

### What This Means for Agents

#### ✅ Available Cloud Resources
- Cloud Run services and logs
- GCP project resources
- Deployed containers and images
- Cloud-based configuration files
- Remote Git repositories
- DNS records and domain management

#### ❌ NOT Available Locally
- Running application instances
- Local development servers
- Local database connections
- File system changes that affect live services
- Direct container execution

### Access Methods
- **GCP CLI**: `gcloud` commands for cloud resources
- **Kubectl**: For Kubernetes cluster management
- **Git**: For repository and version control
- **Cloud Logging**: For service monitoring and debugging

### Deployment Flow
```
Local Code → GitHub → Cloud Build → Cloud Run → Live Service
```

## For AI Agents Working on This Project

1. **Always assume cloud-deployed resources** when troubleshooting or making changes
2. **Use cloud CLI tools** (`gcloud`, `kubectl`) to inspect and manage services
3. **Check cloud logs** for debugging rather than local output
4. **Deploy changes through CI/CD** rather than running locally
5. **Reference cloud-based configurations** and environment variables

## Current Account Context
- **GCP Account**: `pr@coaching2100.com`
- **Node.js Version**: Upgrading to v22+ (currently deprecated v18)
- **Authentication**: SallyPort verification system

---

*This document serves as a reminder that all operational resources exist in the cloud infrastructure. Local development is primarily for code editing and testing before cloud deployment.*
