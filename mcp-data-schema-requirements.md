# MCP Data Schema Requirements
## Universal Data Schema for All Customer Implementations

### Core Entity Structure

#### 1. Organization Profile
```sql
-- Core organizational context for Q4D and CRX optimization
CREATE TABLE organization_profile (
  id UUID PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  size ENUM('small', 'medium', 'large', 'enterprise'),
  sector VARCHAR(100), -- finance, healthcare, manufacturing, technology, etc.
  structure ENUM('hierarchical', 'flat', 'matrix', 'hybrid'),
  compliance_level ENUM('minimal', 'moderate', 'high', 'critical'),
  employee_count INTEGER,
  annual_revenue DECIMAL(15,2),
  regulatory_requirements JSON, -- SOX, GAAP, HIPAA, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. User Roles & Context
```sql
-- Individual user context for personalization
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  user_id VARCHAR(255) NOT NULL,
  function_category VARCHAR(100), -- accounting, sales, hr, operations, etc.
  role_level ENUM('assistant', 'specialist', 'manager', 'director', 'executive'),
  breadth ENUM('narrow', 'moderate', 'broad'),
  depth ENUM('surface', 'moderate', 'deep'),
  decision_authority ENUM('limited', 'moderate', 'high', 'autonomous'),
  stakeholder_count INTEGER,
  approval_layers INTEGER,
  integration_points INTEGER, -- Number of tools they work with
  q4d_profile JSON, -- Cultural empathy and personality insights
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Tool Integration Registry
```sql
-- Track all 9,000+ integrated tools and their usage
CREATE TABLE tool_integrations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  tool_name VARCHAR(255) NOT NULL,
  tool_category VARCHAR(100), -- crm, erp, accounting, collaboration, etc.
  integration_status ENUM('active', 'configured', 'available', 'deprecated'),
  usage_frequency VARCHAR(50), -- daily, weekly, monthly, occasional
  automation_level VARCHAR(50), -- manual, semi-automated, fully-automated
  data_flow_direction ENUM('inbound', 'outbound', 'bidirectional'),
  api_endpoints JSON,
  configuration JSON,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Workflow Patterns & Optimization
```sql
-- ML-detected workflow patterns for optimization
CREATE TABLE workflow_patterns (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  user_id VARCHAR(255),
  pattern_name VARCHAR(255),
  process_steps JSON, -- Detailed workflow steps
  frequency VARCHAR(50), -- daily, weekly, monthly, quarterly
  time_investment INTEGER, -- Minutes spent
  optimization_potential JSON, -- CRX-identified improvements
  automation_opportunities JSON,
  tools_involved JSON,
  compliance_requirements JSON,
  pattern_confidence DECIMAL(5,2), -- ML confidence score
  last_analyzed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. GCP Project Management
```sql
-- Track customer GCP projects and billing
CREATE TABLE gcp_projects (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  project_id VARCHAR(255) NOT NULL, -- GCP project ID
  project_name VARCHAR(255),
  billing_account VARCHAR(255),
  enabled_services JSON, -- List of enabled GCP services
  monthly_budget DECIMAL(10,2),
  cost_tracking JSON, -- Detailed cost breakdown
  data_location VARCHAR(100), -- Data residency requirements
  security_settings JSON,
  compliance_certifications JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  last_billing_sync TIMESTAMP
);
```

#### 6. Recommendations & Actions
```sql
-- CRX-generated recommendations and their outcomes
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  user_id VARCHAR(255),
  recommendation_type ENUM('process_optimization', 'career_development', 'tool_optimization', 'predictive_workflow'),
  priority ENUM('low', 'medium', 'high', 'critical'),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  expected_impact TEXT,
  effort_level ENUM('low', 'medium', 'high'),
  consultant_level VARCHAR(255), -- McKinsey-level, etc.
  implementation_status ENUM('pending', 'in_progress', 'completed', 'declined'),
  crx_model VARCHAR(10), -- CRX01, CRX02, CRX03
  ml_confidence DECIMAL(5,2),
  tools_affected JSON,
  predicted_savings JSON, -- Time, cost, efficiency gains
  actual_results JSON, -- Post-implementation results
  created_at TIMESTAMP DEFAULT NOW(),
  implemented_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

#### 7. Pilot Coordination & Intelligence
```sql
-- Track pilot allocation and coordination
CREATE TABLE pilot_coordination (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  session_id VARCHAR(255),
  active_pilots INTEGER DEFAULT 20000,
  ml_engines INTEGER DEFAULT 47,
  predictive_accuracy DECIMAL(5,2),
  cultural_empathy_mode VARCHAR(50),
  sector_specialization VARCHAR(100),
  pilot_instructions JSON, -- Contextual instructions for pilots
  performance_metrics JSON,
  optimization_results JSON,
  session_start TIMESTAMP DEFAULT NOW(),
  last_update TIMESTAMP DEFAULT NOW()
);
```

#### 8. Data Sovereignty Configuration
```sql
-- Track customer data storage preferences
CREATE TABLE data_sovereignty (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  storage_option ENUM('self_managed', 'managed_custom', 'hybrid'),
  data_center_config JSON, -- Configuration details
  access_controls JSON,
  encryption_settings JSON,
  backup_strategy JSON,
  compliance_requirements JSON,
  audit_trail JSON,
  last_security_review TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. OAuth2/OIDC Authentication
```sql
-- Track OAuth2/OIDC authentication and identity integration
CREATE TABLE authentication_config (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  auth_provider VARCHAR(100), -- Azure AD, Google Workspace, Okta, etc.
  oidc_issuer VARCHAR(500),
  client_id VARCHAR(255),
  scopes JSON, -- OAuth2 scopes granted
  identity_claims JSON, -- OIDC claims mapping
  sso_enabled BOOLEAN DEFAULT true,
  mfa_required BOOLEAN DEFAULT true,
  session_timeout INTEGER DEFAULT 480, -- Minutes
  refresh_token_rotation BOOLEAN DEFAULT true,
  audit_logging BOOLEAN DEFAULT true,
  last_token_refresh TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. Repository Integration (Coaching2100 & DIDC)
```sql
-- Track integration with Coaching2100 Google Drive repository (LLM-processed from DIDC archives)
CREATE TABLE repository_sync (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  resource_type ENUM('schema', 'template', 'documentation', 'configuration'),
  drive_file_id VARCHAR(255), -- Google Drive file ID
  local_path VARCHAR(500), -- Local GCP storage path
  didc_source_archive VARCHAR(255), -- Original DIDC archive reference
  llm_processing_version VARCHAR(50), -- LLM version that processed the content
  contextual_adaptations JSON, -- LLM adaptations for this organization
  version VARCHAR(50),
  checksum VARCHAR(64), -- File integrity verification
  sync_status ENUM('synced', 'pending', 'error', 'outdated'),
  last_sync TIMESTAMP,
  sync_frequency ENUM('real_time', 'hourly', 'daily', 'manual'),
  access_permissions JSON,
  intelligence_updates JSON, -- Track DIDC knowledge updates
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 11. DSAO Integration Gateway (dsao.ig)
```sql
-- Track dsao.ig integration management (11th sidebar icon)
CREATE TABLE dsao_integration_gateway (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  sapphire_sao_user VARCHAR(255), -- Sapphire SAO managing integrations
  integration_name VARCHAR(255),
  integration_type VARCHAR(100), -- API, webhook, file_sync, database, etc.
  status ENUM('active', 'configured', 'pending', 'error', 'disabled'),
  configuration JSON, -- Integration-specific configuration
  secret_manager_refs JSON, -- GCP Secret Manager references
  workload_identity JSON, -- Workload Identity Federation config
  saml_sso_config JSON, -- SAML SSO configuration
  api_endpoints JSON,
  rate_limits JSON,
  monitoring_config JSON,
  last_health_check TIMESTAMP,
  setup_assistance JSON, -- Track our setup and help provided
  pcp_recommendations JSON, -- PCP suggestions for optimization
  created_at TIMESTAMP DEFAULT NOW(),
  last_modified TIMESTAMP DEFAULT NOW()
);
```

#### 11. One-Hour Onboarding Process
```sql
-- Track the structured 1-hour onboarding process
CREATE TABLE onboarding_process (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  onboarding_status ENUM('scheduled', 'in_progress', 'completed', 'needs_followup'),
  brand_assets_url VARCHAR(500), -- URL for brand colors and schema
  organization_name VARCHAR(255),
  geographic_structure JSON, -- Where they operate
  functional_structure JSON, -- Departments and roles  
  organizational_chart JSON, -- Who reports to whom
  employee_directory JSON, -- Names and email addresses
  special_requirements JSON, -- Any custom integration requests
  onboarding_start TIMESTAMP,
  onboarding_completed TIMESTAMP,
  implementation_time_minutes INTEGER DEFAULT 60, -- Target: 1 hour
  integrations_configured JSON, -- What we set up for them
  technical_setup_completed BOOLEAN DEFAULT false,
  customer_approval_received BOOLEAN DEFAULT false,
  go_live_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 12. Zero-Touch Integration Management
```sql
-- Track all integrations we handle automatically for customers
CREATE TABLE managed_integrations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization_profile(id),
  integration_name VARCHAR(255),
  setup_method ENUM('automatic', 'guided', 'custom_request'),
  technical_complexity ENUM('simple', 'moderate', 'complex'),
  customer_involvement ENUM('none', 'approval_only', 'information_only'),
  setup_time_minutes INTEGER,
  our_responsibility TEXT, -- What we handle
  customer_responsibility TEXT, -- What they need to provide (minimal)
  status ENUM('identified', 'configured', 'tested', 'live', 'maintaining'),
  cost_savings_vs_traditional DECIMAL(10,2), -- What this would cost traditionally
  implementation_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### Core Principles for Implementation

1. **Customer Data Ownership**: All customer operational data stays in their designated storage
2. **Metadata Only**: We only store configuration, preferences, and optimization metadata
3. **Schema Flexibility**: JSON fields allow for customization per organization
4. **Audit Trail**: Complete tracking of all changes and access
5. **Compliance Ready**: Built-in fields for regulatory requirements
6. **Scalability**: UUID primary keys and proper indexing for 10,000+ customers
7. **Real-time Sync**: Timestamps and sync tracking for live updates

### Implementation Notes for IT Teams

- **Database**: PostgreSQL recommended for JSON support and scalability
- **Indexing**: Create composite indexes on organization_id + frequently queried fields
- **Backup**: Regular backups with point-in-time recovery
- **Encryption**: At-rest and in-transit encryption for all data
- **Access Control**: Role-based access with audit logging
- **Monitoring**: Real-time monitoring of schema performance and usage

This schema becomes the foundation for every MCP implementation across all 10,000 customers while ensuring complete data sovereignty and operational intelligence.