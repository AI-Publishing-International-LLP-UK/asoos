# ASO OS (AIXTIV Symphony Operating System) - Consolidation Plan

## Current Architecture Analysis

### Core ASO OS Components (Keep Active)
1. **Main ASO OS** (`/Users/as/asoos/`) - `aixtiv-symphony-mcp` - Primary system
2. **Diamond CLI** (`diamond-cli/`) - Core command line interface  
3. **MCP Universal Template** (`mcp-universal-template/`) - Master MCP server for 10k customers
4. **Electron App** (`electron-app/`) - Desktop application with Gothic Entanglement Ribbon Maker

### Active Services (Opus 1 Components)
5. **MOCOA Cloud Run** (`mocoa-cloud-run/`) - Enterprise interface with Dr. Claude
6. **Owner Interface** (`owner-interface/`) - MOCOA Owner Interface with GCP Secret Manager
7. **Functions** (`functions/`) - DIAMOND CLI Owner-Subscriber V2 Google Cloud Functions

### Support Tools (Keep as Utilities)
8. **OAuth2 CLI** (`oauth2-cli/`) - OAuth2 CLI tool for Google service accounts
9. **Deploy Package** (`deploy-package/`) - Latest ASOOS Owner Interface deployment

### Legacy/Duplicate Directories (Archive or Consolidate)
10. **Integration Gateway** (`integration-gateway/`) - **DUPLICATE** - Consolidate into main
11. **ASOOS CLI Works** (`asoos-cli-works/`) - **LEGACY** - Archive
12. **ASOOS Deployment** (`asoos-deployment/`) - **DUPLICATE** - May have useful configs
13. **Functions Backup** (`functions.backup/`) - **BACKUP** - Archive after verification
14. **Deploy Clean** (`deploy-clean/`) - **DUPLICATE** - Archive
15. **AIXTIV Symphony GitBook** (`aixtiv-symphony-gitbook/`) - **DOCUMENTATION** - Keep separate

## Consolidation Strategy

### Phase 1: Immediate (This Session)
- [x] Consolidate integration-gateway dependencies into main ASO OS
- [ ] Archive obvious duplicates (asoos-cli-works, deploy-clean)
- [ ] Move unique files from integration-gateway to main project
- [ ] Remove integration-gateway directory completely

### Phase 2: System-Wide Dependency Audit
- [ ] Compare all 15 package.json files for dependency conflicts
- [ ] Create master dependency matrix
- [ ] Eliminate version conflicts across the system
- [ ] Standardize Node.js and npm versions

### Phase 3: Opus Architecture Definition  
- [ ] Define Opus 1 scope clearly
- [ ] Plan future Opus projects structure
- [ ] Establish proper Git workflow (monorepo vs multi-repo)
- [ ] Create proper workspace management

### Phase 4: Build System Optimization
- [ ] Update CI/CD for consolidated structure
- [ ] Fix ASO OS build failures
- [ ] Optimize deployment pipelines
- [ ] Test all Opus 1 functionality

## Directory Decisions

### KEEP AS CORE OPUS 1:
- `/Users/as/asoos/` (Main ASO OS)
- `diamond-cli/`
- `mcp-universal-template/`
- `electron-app/`
- `mocoa-cloud-run/`
- `owner-interface/`
- `functions/`

### KEEP AS UTILITIES:
- `oauth2-cli/`
- `deploy-package/`
- `aixtiv-symphony-gitbook/`

### ARCHIVE IMMEDIATELY:
- `integration-gateway/` (consolidate first, then remove)
- `asoos-cli-works/` (legacy project template)
- `functions.backup/` (verify then archive)
- `deploy-clean/` (duplicate functionality)

### EVALUATE:
- `asoos-deployment/` (may have unique deployment configs)

This consolidation will eliminate confusion, reduce build failures, and create a clean Opus 1 foundation for the ASO OS.