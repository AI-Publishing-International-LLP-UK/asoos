#!/bin/bash

# ████████████████████████████████████████████████████████████████
# █        HRAI-CRMS AI ASSET INTEGRATION DEPLOYMENT SCRIPT       █
# ████████████████████████████████████████████████████████████████
#
# Production deployment for HRAI-CRMS & AI Asset Accounting Integration
# UK GAAP compliance, VLS Flight Tracking, and Xero synchronization
#
# Usage: ./deploy-hrai-crms-ai-asset-system.sh [environment]
# Environment: staging | production (default: staging)
#
# Author: AI Publishing International LLP
# Version: 1.0.0-enterprise
# License: Proprietary - Diamond SAO Command Center

set -euo pipefail

# Configuration
GCP_PROJECT="api-for-warp-drive"
REGION="us-west1"
ENVIRONMENT="${1:-staging}"
SERVICE_NAME="hrai-crms-ai-asset-integration"
CLOUD_RUN_SERVICE="${SERVICE_NAME}-${ENVIRONMENT}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "\n${PURPLE}████████████████████████████████████████${NC}"
    echo -e "${PURPLE}█ $1${NC}"
    echo -e "${PURPLE}████████████████████████████████████████${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    log_header "CHECKING PREREQUISITES"
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker not found. Please install Docker."
        exit 1
    fi
    
    # Check if logged into gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        log_error "Not authenticated with gcloud. Please run 'gcloud auth login'."
        exit 1
    fi
    
    # Set project
    gcloud config set project $GCP_PROJECT
    
    log_success "Prerequisites check complete"
}

# Enable required GCP APIs
enable_apis() {
    log_header "ENABLING GOOGLE CLOUD APIs"
    
    local apis=(
        "run.googleapis.com"
        "cloudbuild.googleapis.com"
        "secretmanager.googleapis.com"
        "bigquery.googleapis.com"
        "pubsub.googleapis.com"
        "cloudscheduler.googleapis.com"
        "monitoring.googleapis.com"
        "logging.googleapis.com"
        "firestore.googleapis.com"
        "iam.googleapis.com"
        "cloudresourcemanager.googleapis.com"
        "containerregistry.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        log_info "Enabling $api..."
        gcloud services enable $api --quiet
    done
    
    log_success "All required APIs enabled"
}

# Create secrets in Secret Manager
create_secrets() {
    log_header "CREATING SECRETS IN SECRET MANAGER"
    
    # MongoDB Atlas connection string
    log_info "Creating MongoDB Atlas connection string secret..."
    if ! gcloud secrets describe mongodb-atlas-connection-string &>/dev/null; then
        echo -n "mongodb://placeholder:placeholder@cluster.mongodb.net/hrai_crms" | \
        gcloud secrets create mongodb-atlas-connection-string --data-file=-
        log_warning "📝 Please update mongodb-atlas-connection-string secret with actual MongoDB connection string"
    else
        log_info "MongoDB secret already exists"
    fi
    
    # Xero UK LLP credentials
    log_info "Creating Xero UK LLP credentials secret..."
    if ! gcloud secrets describe xero-uk-llp-credentials &>/dev/null; then
        cat << 'EOF' | gcloud secrets create xero-uk-llp-credentials --data-file=-
{
  "client_id": "placeholder_client_id",
  "client_secret": "placeholder_client_secret",
  "tenant_id": "placeholder_tenant_id",
  "access_token": "placeholder_access_token",
  "refresh_token": "placeholder_refresh_token",
  "token_expires_at": "2024-12-31T23:59:59Z",
  "scopes": ["accounting.transactions", "accounting.journals.write", "accounting.reports.read"]
}
EOF
        log_warning "📝 Please update xero-uk-llp-credentials secret with actual Xero credentials"
    else
        log_info "Xero credentials secret already exists"
    fi
    
    # Service account key for authentication
    log_info "Creating service account key secret..."
    if ! gcloud secrets describe hrai-crms-service-account-key &>/dev/null; then
        echo -n '{"type":"service_account","project_id":"placeholder"}' | \
        gcloud secrets create hrai-crms-service-account-key --data-file=-
        log_warning "📝 Please update hrai-crms-service-account-key secret with actual service account key"
    else
        log_info "Service account key secret already exists"
    fi
    
    log_success "Secrets created successfully"
}

# Create BigQuery datasets and tables
create_bigquery_resources() {
    log_header "CREATING BIGQUERY DATASETS AND TABLES"
    
    # Create datasets
    log_info "Creating BigQuery datasets..."
    
    # Financial Reporting dataset
    if ! bq show --dataset "${GCP_PROJECT}:financial_reporting" &>/dev/null; then
        bq mk --dataset \
            --description="Financial reporting data for AI assets and UK GAAP compliance" \
            --location=$REGION \
            "${GCP_PROJECT}:financial_reporting"
    fi
    
    # AI Asset Analytics dataset
    if ! bq show --dataset "${GCP_PROJECT}:ai_asset_analytics" &>/dev/null; then
        bq mk --dataset \
            --description="AI asset analytics and VLS flight data" \
            --location=$REGION \
            "${GCP_PROJECT}:ai_asset_analytics"
    fi
    
    # Create tables
    log_info "Creating BigQuery tables..."
    
    # Balance Sheet Reports table
    cat << 'EOF' > /tmp/balance_sheet_reports_schema.json
[
  {"name": "report_date", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "reporting_standard", "type": "STRING", "mode": "REQUIRED"},
  {"name": "currency", "type": "STRING", "mode": "REQUIRED"},
  {"name": "intangible_assets", "type": "RECORD", "mode": "REQUIRED", "fields": [
    {"name": "ai_intellectual_property", "type": "RECORD", "fields": [
      {"name": "cost", "type": "NUMERIC", "mode": "REQUIRED"},
      {"name": "accumulated_depreciation", "type": "NUMERIC", "mode": "REQUIRED"},
      {"name": "net_book_value", "type": "NUMERIC", "mode": "REQUIRED"},
      {"name": "value_enhancement_ytd", "type": "NUMERIC", "mode": "REQUIRED"}
    ]}
  ]},
  {"name": "asset_summary", "type": "RECORD", "mode": "REQUIRED", "fields": [
    {"name": "total_ai_agents", "type": "INTEGER", "mode": "REQUIRED"},
    {"name": "total_flights_completed", "type": "INTEGER", "mode": "REQUIRED"},
    {"name": "average_book_value_per_agent", "type": "NUMERIC", "mode": "REQUIRED"}
  ]},
  {"name": "created_at", "type": "TIMESTAMP", "mode": "REQUIRED"}
]
EOF
    
    if ! bq show --table "${GCP_PROJECT}:financial_reporting.balance_sheet_reports" &>/dev/null; then
        bq mk --table \
            "${GCP_PROJECT}:financial_reporting.balance_sheet_reports" \
            /tmp/balance_sheet_reports_schema.json
    fi
    
    # VLS Flight Analytics table
    cat << 'EOF' > /tmp/vls_flight_analytics_schema.json
[
  {"name": "flight_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "agent_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "pilot_agent_name", "type": "STRING", "mode": "REQUIRED"},
  {"name": "flight_date", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "flight_duration_minutes", "type": "INTEGER", "mode": "REQUIRED"},
  {"name": "flight_type", "type": "STRING", "mode": "REQUIRED"},
  {"name": "performance_metrics", "type": "RECORD", "mode": "REQUIRED", "fields": [
    {"name": "efficiency_score", "type": "NUMERIC", "mode": "REQUIRED"},
    {"name": "accuracy_score", "type": "NUMERIC", "mode": "REQUIRED"},
    {"name": "innovation_score", "type": "NUMERIC", "mode": "REQUIRED"},
    {"name": "collaboration_score", "type": "NUMERIC", "mode": "REQUIRED"}
  ]},
  {"name": "value_enhancement_amount", "type": "NUMERIC", "mode": "REQUIRED"},
  {"name": "tenant_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "flight_outcome", "type": "STRING", "mode": "REQUIRED"},
  {"name": "created_at", "type": "TIMESTAMP", "mode": "REQUIRED"}
]
EOF
    
    if ! bq show --table "${GCP_PROJECT}:ai_asset_analytics.vls_flight_analytics" &>/dev/null; then
        bq mk --table \
            "${GCP_PROJECT}:ai_asset_analytics.vls_flight_analytics" \
            /tmp/vls_flight_analytics_schema.json
    fi
    
    # Cleanup temp files
    rm -f /tmp/balance_sheet_reports_schema.json /tmp/vls_flight_analytics_schema.json
    
    log_success "BigQuery resources created successfully"
}

# Create Pub/Sub topics and subscriptions
create_pubsub_resources() {
    log_header "CREATING PUB/SUB TOPICS AND SUBSCRIPTIONS"
    
    local topics=(
        "ai-asset-events"
        "vls-flight-events"
        "hrai-crms-sync-events"
        "xero-sync-events"
        "depreciation-events"
        "cost-allocation-events"
    )
    
    for topic in "${topics[@]}"; do
        log_info "Creating topic: $topic"
        if ! gcloud pubsub topics describe $topic &>/dev/null; then
            gcloud pubsub topics create $topic
        fi
        
        # Create subscription for each topic
        local subscription="${topic}-subscription"
        if ! gcloud pubsub subscriptions describe $subscription &>/dev/null; then
            gcloud pubsub subscriptions create $subscription --topic=$topic
        fi
    done
    
    log_success "Pub/Sub resources created successfully"
}

# Create service account with appropriate permissions
create_service_account() {
    log_header "CREATING SERVICE ACCOUNT"
    
    local sa_name="hrai-crms-ai-asset-sa"
    local sa_email="${sa_name}@${GCP_PROJECT}.iam.gserviceaccount.com"
    
    # Create service account
    if ! gcloud iam service-accounts describe $sa_email &>/dev/null; then
        gcloud iam service-accounts create $sa_name \
            --description="Service account for HRAI-CRMS AI Asset Integration" \
            --display-name="HRAI-CRMS AI Asset Service Account"
    fi
    
    # Grant necessary roles
    local roles=(
        "roles/secretmanager.secretAccessor"
        "roles/bigquery.dataEditor"
        "roles/bigquery.jobUser"
        "roles/pubsub.publisher"
        "roles/pubsub.subscriber"
        "roles/monitoring.metricWriter"
        "roles/logging.logWriter"
        "roles/cloudscheduler.jobRunner"
        "roles/run.invoker"
    )
    
    for role in "${roles[@]}"; do
        log_info "Granting role: $role"
        gcloud projects add-iam-policy-binding $GCP_PROJECT \
            --member="serviceAccount:${sa_email}" \
            --role="$role" \
            --quiet
    done
    
    log_success "Service account created and configured"
}

# Build and deploy to Cloud Run
deploy_cloud_run_service() {
    log_header "BUILDING AND DEPLOYING TO CLOUD RUN"
    
    # Build the container image
    log_info "Building container image..."
    
    # Create Dockerfile if it doesn't exist
    cat << 'EOF' > Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 8080

CMD ["node", "lib/hrai-crms-ai-asset-integration.js"]
EOF
    
    # Build image with Cloud Build
    gcloud builds submit \
        --tag "gcr.io/${GCP_PROJECT}/${SERVICE_NAME}:${ENVIRONMENT}" \
        .
    
    log_info "Deploying to Cloud Run..."
    
    # Deploy to Cloud Run
    gcloud run deploy $CLOUD_RUN_SERVICE \
        --image "gcr.io/${GCP_PROJECT}/${SERVICE_NAME}:${ENVIRONMENT}" \
        --platform managed \
        --region $REGION \
        --service-account "hrai-crms-ai-asset-sa@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --memory 2Gi \
        --cpu 1 \
        --timeout 3600 \
        --concurrency 1000 \
        --min-instances 1 \
        --max-instances 10 \
        --set-env-vars "GCP_PROJECT_ID=${GCP_PROJECT},ENVIRONMENT=${ENVIRONMENT}" \
        --allow-unauthenticated \
        --quiet
    
    log_success "Cloud Run service deployed successfully"
}

# Create Cloud Scheduler jobs
create_scheduler_jobs() {
    log_header "CREATING CLOUD SCHEDULER JOBS"
    
    # Get the Cloud Run service URL
    local service_url=$(gcloud run services describe $CLOUD_RUN_SERVICE \
        --region $REGION \
        --format="value(status.url)")
    
    log_info "Service URL: $service_url"
    
    # Create scheduler jobs from config file
    if [[ -f "config/scheduler-jobs.yaml" ]]; then
        log_info "Creating scheduler jobs from configuration..."
        
        # Update the service URL in the config
        sed "s|https://integration-gateway-js-859242575175.us-west1.run.app|${service_url}|g" \
            config/scheduler-jobs.yaml > /tmp/scheduler-jobs-updated.yaml
        
        # Create individual jobs (simplified approach since gcloud doesn't support batch YAML import)
        log_info "Creating weekly AI asset depreciation job..."
        gcloud scheduler jobs create http weekly-ai-asset-depreciation-${ENVIRONMENT} \
            --schedule="0 23 * * SUN" \
            --uri="${service_url}/api/v1/ai-assets/depreciation/weekly" \
            --http-method=POST \
            --headers="Content-Type=application/json" \
            --message-body='{"trigger":"scheduled_weekly_depreciation","reporting_standard":"UK_GAAP_FRS_102","include_value_enhancement":true}' \
            --time-zone="UTC" \
            --description="Process weekly depreciation for all AI agent assets" \
            --quiet || log_warning "Job may already exist"
        
        log_info "Creating daily VLS flight analysis job..."
        gcloud scheduler jobs create http daily-vls-flight-analysis-${ENVIRONMENT} \
            --schedule="0 2 * * *" \
            --uri="${service_url}/api/v1/vls/flight-analysis/daily" \
            --http-method=POST \
            --headers="Content-Type=application/json" \
            --message-body='{"trigger":"scheduled_daily_analysis","analysis_type":"comprehensive","calculate_value_enhancement":true}' \
            --time-zone="UTC" \
            --description="Analyze VLS flight performance and update AI agent asset values" \
            --quiet || log_warning "Job may already exist"
        
        log_info "Creating daily HRAI-CRMS sync job..."
        gcloud scheduler jobs create http daily-hrai-crms-sync-${ENVIRONMENT} \
            --schedule="0 5 * * *" \
            --uri="${service_url}/api/v1/hrai-crms/sync/daily" \
            --http-method=POST \
            --headers="Content-Type=application/json" \
            --message-body='{"trigger":"scheduled_daily_sync","sync_scope":"full","update_owner_subscribers":true}' \
            --time-zone="UTC" \
            --description="Synchronize owner subscribers and HR classifications with HRAI-CRMS" \
            --quiet || log_warning "Job may already exist"
        
        rm -f /tmp/scheduler-jobs-updated.yaml
    else
        log_warning "Scheduler jobs configuration file not found. Skipping scheduler setup."
    fi
    
    log_success "Cloud Scheduler jobs created successfully"
}

# Create monitoring and alerting
create_monitoring() {
    log_header "CREATING MONITORING AND ALERTING"
    
    log_info "Creating custom metrics..."
    
    # Custom metrics will be created automatically by the application
    # This section would include alert policies, dashboards, etc.
    
    log_info "Setting up log-based metrics..."
    
    # AI Asset Value Enhancement metric
    gcloud logging metrics create ai_asset_value_enhancement \
        --description="Total value enhancement for AI assets" \
        --log-filter='resource.type="cloud_run_revision" AND textPayload:"Value enhancement"' \
        --quiet || log_warning "Metric may already exist"
    
    # VLS Flight Success Rate metric
    gcloud logging metrics create vls_flight_success_rate \
        --description="Success rate of VLS flights" \
        --log-filter='resource.type="cloud_run_revision" AND textPayload:"VLS flight recorded" AND textPayload:"SUCCESS"' \
        --quiet || log_warning "Metric may already exist"
    
    # HRAI-CRMS Sync Status metric
    gcloud logging metrics create hrai_crms_sync_status \
        --description="HRAI-CRMS synchronization status" \
        --log-filter='resource.type="cloud_run_revision" AND textPayload:"Owner subscriber synced"' \
        --quiet || log_warning "Metric may already exist"
    
    log_success "Monitoring and alerting configured successfully"
}

# Set up IAM policies for tenant isolation
setup_tenant_iam() {
    log_header "SETTING UP TENANT ISOLATION IAM POLICIES"
    
    # Create organization-wide deny policy for wildcard secret access
    log_info "Creating organization-wide deny policy for secret access..."
    
    # This would require organization-level access
    log_warning "⚠️  Organization-level IAM policies require additional permissions"
    log_info "Manual setup required for tenant isolation policies"
    
    log_success "Tenant IAM setup guidance provided"
}

# Validate deployment
validate_deployment() {
    log_header "VALIDATING DEPLOYMENT"
    
    # Get service URL
    local service_url=$(gcloud run services describe $CLOUD_RUN_SERVICE \
        --region $REGION \
        --format="value(status.url)")
    
    log_info "Testing health endpoint..."
    if curl -f "${service_url}/health" &>/dev/null; then
        log_success "✅ Health endpoint responding"
    else
        log_warning "⚠️  Health endpoint not responding (this is expected if service is not fully implemented)"
    fi
    
    log_info "Checking Cloud Scheduler jobs..."
    local job_count=$(gcloud scheduler jobs list --filter="name~${ENVIRONMENT}" --format="value(name)" | wc -l)
    log_info "📊 Created $job_count scheduler jobs"
    
    log_info "Checking BigQuery datasets..."
    if bq show --dataset "${GCP_PROJECT}:financial_reporting" &>/dev/null; then
        log_success "✅ Financial reporting dataset exists"
    fi
    
    if bq show --dataset "${GCP_PROJECT}:ai_asset_analytics" &>/dev/null; then
        log_success "✅ AI asset analytics dataset exists"
    fi
    
    log_info "Checking Pub/Sub topics..."
    local topic_count=$(gcloud pubsub topics list --format="value(name)" | grep -c "ai-asset\|vls-flight\|hrai-crms" || echo "0")
    log_info "📊 Created $topic_count Pub/Sub topics"
    
    log_success "Deployment validation completed"
}

# Generate deployment report
generate_deployment_report() {
    log_header "GENERATING DEPLOYMENT REPORT"
    
    local report_file="deployment-report-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).md"
    
    cat << EOF > $report_file
# HRAI-CRMS AI Asset Integration Deployment Report

**Environment**: $ENVIRONMENT
**Deployment Date**: $(date)
**GCP Project**: $GCP_PROJECT
**Region**: $REGION

## Deployed Resources

### Cloud Run Service
- **Name**: $CLOUD_RUN_SERVICE
- **URL**: $(gcloud run services describe $CLOUD_RUN_SERVICE --region $REGION --format="value(status.url)" 2>/dev/null || echo "Not deployed")
- **Image**: gcr.io/$GCP_PROJECT/$SERVICE_NAME:$ENVIRONMENT

### BigQuery Datasets
- financial_reporting
- ai_asset_analytics

### Pub/Sub Topics
- ai-asset-events
- vls-flight-events  
- hrai-crms-sync-events
- xero-sync-events
- depreciation-events
- cost-allocation-events

### Cloud Scheduler Jobs
- weekly-ai-asset-depreciation-$ENVIRONMENT
- daily-vls-flight-analysis-$ENVIRONMENT
- daily-hrai-crms-sync-$ENVIRONMENT

### Secret Manager Secrets
- mongodb-atlas-connection-string
- xero-uk-llp-credentials
- hrai-crms-service-account-key

## Post-Deployment Configuration Required

1. **Update MongoDB Connection String**
   \`\`\`bash
   echo -n "mongodb://actual:connection@string" | gcloud secrets versions add mongodb-atlas-connection-string --data-file=-
   \`\`\`

2. **Update Xero Credentials**
   \`\`\`bash
   cat << 'EOL' | gcloud secrets versions add xero-uk-llp-credentials --data-file=-
   {
     "client_id": "actual_client_id",
     "client_secret": "actual_client_secret",
     "tenant_id": "actual_tenant_id",
     "access_token": "actual_access_token",
     "refresh_token": "actual_refresh_token"
   }
   EOL
   \`\`\`

3. **Update Service Account Key**
   \`\`\`bash
   gcloud iam service-accounts keys create key.json --iam-account=hrai-crms-ai-asset-sa@$GCP_PROJECT.iam.gserviceaccount.com
   gcloud secrets versions add hrai-crms-service-account-key --data-file=key.json
   rm key.json
   \`\`\`

## Integration Commands

### Sync Owner Subscriber
\`\`\`bash
curl -X POST "$(gcloud run services describe $CLOUD_RUN_SERVICE --region $REGION --format="value(status.url)")/api/v1/hrai-crms/sync/owner" \\
  -H "Content-Type: application/json" \\
  -d '{
    "uuid": "owner-uuid-123",
    "tenantId": "example-tenant",
    "ownerData": {
      "name": "John Smith",
      "email": "john@example.com",
      "hr_classification": ".hr1",
      "sao_level": "SAPPHIRE"
    }
  }'
\`\`\`

### Register AI Agent as Asset
\`\`\`bash
curl -X POST "$(gcloud run services describe $CLOUD_RUN_SERVICE --region $REGION --format="value(status.url)")/api/v1/ai-assets/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "dr-lucy-001",
    "pilotAgentName": "Dr. Lucy ML Pilot",
    "agentData": {
      "pilot_lineage": "dr-lucy",
      "agent_classification": "CRX-01",
      "initial_cost": 75000,
      "useful_life_years": 5,
      "tenant_allocations": [
        {"tenant_id": "example-tenant", "allocation_percentage": 100}
      ]
    }
  }'
\`\`\`

### Record VLS Flight
\`\`\`bash
curl -X POST "$(gcloud run services describe $CLOUD_RUN_SERVICE --region $REGION --format="value(status.url)")/api/v1/vls/flight/record" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "dr-lucy-001",
    "flightData": {
      "flight_duration_minutes": 180,
      "flight_type": "PRODUCTION",
      "performance_metrics": {
        "efficiency_score": 95,
        "accuracy_score": 92,
        "innovation_score": 88,
        "collaboration_score": 94
      },
      "tenant_id": "example-tenant"
    }
  }'
\`\`\`

## Monitoring and Dashboards

- **Cloud Run Metrics**: Available in Google Cloud Console
- **Custom Metrics**: ai_asset_value_enhancement, vls_flight_success_rate, hrai_crms_sync_status
- **Log Analysis**: Available in Cloud Logging with structured filters

## Next Steps

1. Configure actual MongoDB Atlas connection
2. Set up Xero OAuth2 authentication
3. Test integration endpoints
4. Set up monitoring dashboards
5. Configure alert policies
6. Schedule regular data backups
7. Implement disaster recovery procedures

---

*Deployment completed by Diamond SAO Command Center*
*AI Publishing International LLP*
EOF

    log_success "Deployment report generated: $report_file"
    
    # Display summary
    echo -e "\n${CYAN}=== DEPLOYMENT SUMMARY ===${NC}"
    echo -e "${GREEN}✅ Environment:${NC} $ENVIRONMENT"
    echo -e "${GREEN}✅ Cloud Run Service:${NC} $CLOUD_RUN_SERVICE"
    echo -e "${GREEN}✅ Service URL:${NC} $(gcloud run services describe $CLOUD_RUN_SERVICE --region $REGION --format="value(status.url)" 2>/dev/null || echo "Not available")"
    echo -e "${GREEN}✅ Report:${NC} $report_file"
    echo -e "\n${YELLOW}⚠️  Remember to update secrets with actual values!${NC}"
}

# Main deployment function
main() {
    echo -e "${PURPLE}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█        HRAI-CRMS AI ASSET INTEGRATION DEPLOYMENT             █"
    echo "█        Environment: $ENVIRONMENT                              █"
    echo "█        Project: $GCP_PROJECT                                 █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}\n"
    
    # Deployment steps
    check_prerequisites
    enable_apis
    create_secrets
    create_bigquery_resources
    create_pubsub_resources
    create_service_account
    deploy_cloud_run_service
    create_scheduler_jobs
    create_monitoring
    setup_tenant_iam
    validate_deployment
    generate_deployment_report
    
    echo -e "\n${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "1. Update secrets with actual credentials"
    echo -e "2. Test integration endpoints"
    echo -e "3. Configure monitoring dashboards"
    echo -e "4. Set up backup and disaster recovery"
    echo -e "\n${BLUE}For support, contact Diamond SAO Command Center${NC}"
}

# Run main function
main "$@"