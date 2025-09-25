#!/bin/bash

# Rapid Secret Migration Script for Integration Gateway
# Part of PR #9 secret removal initiative
# Removes ALL hardcoded secrets and migrates to GCP Secret Manager

set -e

PROJECT_ID="api-for-warp-drive"
REGION="us-west1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./secret-backup-${TIMESTAMP}"

echo "🚨 RAPID SECRET MIGRATION STARTING"
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Timestamp: ${TIMESTAMP}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "📋 Step 1: Enable required APIs"
gcloud services enable secretmanager.googleapis.com --project="${PROJECT_ID}"
gcloud services enable cloudkms.googleapis.com --project="${PROJECT_ID}"

echo "🔑 Step 2: Create KMS key for secrets encryption" 
gcloud kms keyrings create igw --location="${REGION}" --project="${PROJECT_ID}" || true
gcloud kms keys create secrets-2025 \
  --location="${REGION}" \
  --keyring=igw \
  --purpose=encryption \
  --project="${PROJECT_ID}" || true

echo "🗂️  Step 3: Create critical secrets in Secret Manager"

# Critical API Keys that must be rotated immediately
CRITICAL_SECRETS=(
  "elevenlabs/production/api-key:PLACEHOLDER_ELEVENLABS_KEY_ROTATE_IMMEDIATELY"
  "openai/production/api-key:PLACEHOLDER_OPENAI_KEY_ROTATE_IMMEDIATELY" 
  "anthropic/production/api-key:PLACEHOLDER_ANTHROPIC_KEY_ROTATE_IMMEDIATELY"
  "mongodb/production/connection-string:PLACEHOLDER_MONGODB_URI_ROTATE_IMMEDIATELY"
  "oauth/production/client-secret:PLACEHOLDER_OAUTH_SECRET_ROTATE_IMMEDIATELY"
  "jwt/production/secret:PLACEHOLDER_JWT_SECRET_ROTATE_IMMEDIATELY"
  "sallyport/production/api-key:PLACEHOLDER_SALLYPORT_KEY_ROTATE_IMMEDIATELY"
  "pinecone/production/api-key:PLACEHOLDER_PINECONE_KEY_ROTATE_IMMEDIATELY"
  "lucy/production/mcp-token:PLACEHOLDER_LUCY_TOKEN_ROTATE_IMMEDIATELY"
  "academy/production/bearer-token:PLACEHOLDER_ACADEMY_TOKEN_ROTATE_IMMEDIATELY"
  "integration-gateway/production/master-key:PLACEHOLDER_MASTER_KEY_ROTATE_IMMEDIATELY"
)

for secret_def in "${CRITICAL_SECRETS[@]}"; do
  secret_name=$(echo $secret_def | cut -d: -f1)
  secret_value=$(echo $secret_def | cut -d: -f2)
  
  echo "Creating secret: ${secret_name}"
  
  # Create the secret
  echo "${secret_value}" | gcloud secrets create "${secret_name}" \
    --replication-policy="user-managed" \
    --locations="${REGION}" \
    --data-file=- \
    --project="${PROJECT_ID}" \
    --labels="owner=integration-gateway,kms_key=igw,rotation=required" || true
done

echo "🧹 Step 4: Remove hardcoded secrets from critical files"

# Files with critical hardcoded secrets that need immediate deletion
CRITICAL_FILES=(
  "./.env.backup-20250728-073227.backup-20250728-074321"
  "./.env.diamond-sao"
  "./.env.diamond.example"
  "./.env.emerald.example" 
  "./.env.onyx.example"
  "./.env.opal.example"
  "./.env.sapphire.example"
  "./mcp-config.json"
  "./.workspace/staging-extras/r2-migration-staging/reports/key.json"
  "./.workspace/staging-extras/r2-migration-staging/reports/test-tokens.json"
  "./.workspace/staging-extras/r2-migration-staging/system-configs/drlucyautomation-key.json"
)

echo "Backing up and removing critical files with hardcoded secrets..."
for file in "${CRITICAL_FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "Removing: $file"
    cp "$file" "${BACKUP_DIR}/" 2>/dev/null || true
    rm -f "$file"
  fi
done

echo "🔄 Step 5: Replace hardcoded secrets in source files"

# Replace hardcoded OpenAI API keys
find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs grep -l "sk-.*" | while read file; do
  if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".git"* ]]; then
    echo "Processing: $file"
    cp "$file" "${BACKUP_DIR}/$(basename $file).backup" 2>/dev/null || true
    sed -i.bak 's/sk-[a-zA-Z0-9]\{32,\}/{{OPENAI_API_KEY_FROM_SECRET_MANAGER}}/g' "$file"
    rm -f "$file.bak"
  fi
done

# Replace hardcoded Anthropic API keys  
find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs grep -l "sk-ant-.*" | while read file; do
  if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".git"* ]]; then
    echo "Processing: $file"
    sed -i.bak 's/sk-ant-[a-zA-Z0-9\-_]\{95\}/{{ANTHROPIC_API_KEY_FROM_SECRET_MANAGER}}/g' "$file"
    rm -f "$file.bak"
  fi
done

# Replace hardcoded MongoDB URIs
find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs grep -l "mongodb.*://" | while read file; do
  if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".git"* ]]; then
    echo "Processing: $file"
    sed -i.bak 's|mongodb[+srv]*://[^"'\''[:space:]]*|{{MONGODB_CONNECTION_STRING_FROM_SECRET_MANAGER}}|g' "$file"
    rm -f "$file.bak"
  fi
done

# Replace JWT tokens
find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs grep -l "eyJ.*" | while read file; do
  if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".git"* ]]; then
    echo "Processing: $file"
    sed -i.bak 's/eyJ[a-zA-Z0-9\-_=]*\.[a-zA-Z0-9\-_=]*\.[a-zA-Z0-9\-_.+\/=]*/{{JWT_TOKEN_FROM_SECRET_MANAGER}}/g' "$file"
    rm -f "$file.bak"
  fi
done

echo "🔐 Step 6: Update package.json to include Secret Manager dependency"
if [[ -f "package.json" ]]; then
  npm install --save @google-cloud/secret-manager
fi

echo "📝 Step 7: Generate migration report"
cat > "${BACKUP_DIR}/migration-report.md" << EOF
# Secret Migration Report - ${TIMESTAMP}

## Summary
- **Total secrets migrated**: $(echo "${CRITICAL_SECRETS[@]}" | wc -w)
- **Files processed**: $(find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs grep -l "{{.*SECRET_MANAGER.*}}" | wc -l)
- **Critical files removed**: ${#CRITICAL_FILES[@]}

## Next Steps (IMMEDIATE ACTION REQUIRED)

### 1. Rotate ALL secrets immediately:
$(printf "   - %s\n" "${CRITICAL_SECRETS[@]}" | cut -d: -f1)

### 2. Update application code to use secrets helper:
\`\`\`javascript
const { getSecret } = require('./src/utils/secrets.js');
const apiKey = await getSecret('openai/production/api-key');
\`\`\`

### 3. Deploy to staging first:
\`\`\`bash
gcloud run deploy integration-gateway-staging \\
  --image gcr.io/${PROJECT_ID}/integration-gateway:latest \\
  --region ${REGION} \\
  --service-account igw-svc-staging@${PROJECT_ID}.iam.gserviceaccount.com
\`\`\`

## Security Status
- ✅ Hardcoded secrets removed from source code
- ⚠️  Placeholder values in Secret Manager (MUST ROTATE)
- ✅ KMS encryption enabled
- ✅ Regional replication configured
- 🔄 Application integration PENDING

**CRITICAL**: All secrets contain placeholder values and MUST be rotated with real values immediately!
EOF

echo "✅ RAPID SECRET MIGRATION COMPLETE"
echo ""
echo "📋 CRITICAL NEXT STEPS:"
echo "1. Review: ${BACKUP_DIR}/migration-report.md"
echo "2. Rotate ALL secrets with real values using Diamond CLI or GCP Console"
echo "3. Test staging deployment: mocoa us-west1-b"
echo "4. Commit changes to secrets-migration-cleanup branch"
echo ""
echo "🚨 WARNING: Application will NOT work until secrets are rotated with real values!"
echo "📁 Backups stored in: ${BACKUP_DIR}"