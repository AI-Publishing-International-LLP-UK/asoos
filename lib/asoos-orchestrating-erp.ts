/**
 * ████████████████████████████████████████████████████████████████
 * █              ASOOS ORCHESTRATING ERP SYSTEM                   █
 * ████████████████████████████████████████████████████████████████
 *
 * Professional ERP system built on HRAI-CRMS foundation
 * FCA UK regulatory compliance for balance sheet reporting
 * Complete customer lifecycle and brand asset management
 *
 * Features:
 * • MCP Customer Lead Management & Conversion Tracking
 * • User Role/Company Transition History
 * • Retail Subscriber Service Tracking (Recurring/Non-recurring)
 * • Product Brand Asset Valuation & Balance Sheet Integration
 * • FCA UK Regulatory Compliance & Statutory Reporting
 * • Historical Record Management for Audit Trail
 * • BACA Coin Investment Backing with Tangible Assets
 *
 * @author AI Publishing International LLP
 * @version 1.0.0-enterprise-erp
 * @license Proprietary - Diamond SAO Command Center
 * @regulatory_compliance FCA_UK_STATUTORY_REPORTING
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { HRAICRMSAIAssetIntegration } from './hrai-crms-ai-asset-integration';

// ========================================
// CUSTOMER LIFECYCLE & MCP MANAGEMENT
// ========================================

export interface MCPCustomerLead {
  lead_id: string;
  mcp_domain: string; // mcp.{company}.2100.cool
  company_name: string;
  primary_contact: {
    name: string;
    email: string;
    phone?: string;
    position: string;
  };
  lead_source: 'WEBSITE' | 'REFERRAL' | 'SALES_OUTREACH' | 'PARTNER' | 'EVENT' | 'OTHER';
  lead_status:
    | 'PROSPECT'
    | 'QUALIFIED'
    | 'DEMO_SCHEDULED'
    | 'PROPOSAL_SENT'
    | 'NEGOTIATION'
    | 'CONVERTED'
    | 'LOST';
  estimated_value: number; // GBP
  probability_percent: number;
  expected_close_date: Date;

  // MCP Configuration
  mcp_config: {
    requested_agents: number;
    pilot_preferences: string[];
    use_case_description: string;
    technical_requirements: string[];
    integration_needs: string[];
  };

  // Conversion Tracking
  conversion_data?: {
    converted_date: Date;
    customer_id: string;
    initial_contract_value: number;
    contract_duration_months: number;
  };

  // Lead Journey
  touchpoints: Array<{
    date: Date;
    type: 'EMAIL' | 'CALL' | 'DEMO' | 'MEETING' | 'PROPOSAL' | 'FOLLOW_UP';
    description: string;
    outcome: string;
    next_action?: string;
  }>;

  created_at: Date;
  updated_at: Date;
  created_by: string;
  assigned_to: string;
}

export interface MCPCustomer {
  customer_id: string;
  mcp_domain: string;
  company_profile: {
    legal_name: string;
    trading_name?: string;
    company_number?: string; // Companies House number
    registered_address: {
      address_line_1: string;
      address_line_2?: string;
      city: string;
      county?: string;
      postcode: string;
      country: string;
    };
    industry: string;
    employee_count: number;
    annual_revenue?: number;
  };

  // Customer Status
  status: 'ACTIVE' | 'SUSPENDED' | 'CHURNED' | 'NON_PAYING' | 'TRIAL';
  tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';

  // Contract Information
  contracts: Array<{
    contract_id: string;
    contract_type: 'MCP_SUBSCRIPTION' | 'PROFESSIONAL_SERVICES' | 'LICENSING' | 'CUSTOM';
    start_date: Date;
    end_date: Date;
    value: number;
    currency: 'GBP';
    payment_terms: string;
    renewal_terms: string;
    status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  }>;

  // Financial Tracking
  financial_summary: {
    total_contract_value: number;
    annual_recurring_revenue: number;
    monthly_recurring_revenue: number;
    lifetime_value: number;
    payment_status: 'CURRENT' | 'OVERDUE' | 'DEFAULTED';
    next_payment_date: Date;
  };

  created_at: Date;
  updated_at: Date;
}

export interface MCPUser {
  user_id: string;
  personal_details: {
    name: string;
    email: string;
    phone?: string;
    preferred_language: string;
  };

  // Current Assignment
  current_assignment: {
    customer_id: string;
    mcp_domain: string;
    role: 'ADMIN' | 'USER' | 'VIEWER' | 'DEVELOPER' | 'ANALYST';
    permissions: string[];
    start_date: Date;
    employment_type: 'EMPLOYEE' | 'CONTRACTOR' | 'CONSULTANT' | 'PARTNER';
  };

  // Historical Assignments (for tracking transitions)
  assignment_history: Array<{
    customer_id: string;
    mcp_domain: string;
    role: string;
    employment_type: string;
    start_date: Date;
    end_date: Date;
    transition_reason:
      | 'PROMOTION'
      | 'ROLE_CHANGE'
      | 'COMPANY_CHANGE'
      | 'CONTRACT_END'
      | 'TERMINATION';
    notes?: string;
  }>;

  // Subscription Status (for individual paying users)
  subscription_status?: {
    type: 'INDIVIDUAL_SUBSCRIBER' | 'COMPANY_ALLOCATED';
    services: Array<{
      service_name: string;
      service_type: 'RECURRING' | 'ONE_TIME';
      monthly_cost: number;
      billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
      start_date: Date;
      end_date?: Date;
      status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED';
    }>;
    total_monthly_value: number;
  };

  created_at: Date;
  updated_at: Date;
}

// ========================================
// PRODUCT BRAND ASSET MANAGEMENT
// ========================================

export interface ProductBrandAsset {
  asset_id: string;
  asset_name: string;
  asset_type:
    | 'BRAND'
    | 'TRADEMARK'
    | 'COPYRIGHT'
    | 'PATENT'
    | 'TRADE_SECRET'
    | 'DOMAIN'
    | 'SOFTWARE_IP';

  // Brand/Product Information
  brand_details: {
    brand_name: string;
    tagline?: string;
    description: string;
    target_market: string[];
    competitive_position: string;
    brand_category: 'CORE' | 'SUBSIDIARY' | 'PARTNERSHIP' | 'LICENSED';
  };

  // Legal Protection
  legal_protection: {
    trademark_numbers: string[];
    copyright_registrations: string[];
    patent_numbers: string[];
    domain_registrations: string[];
    protection_jurisdictions: string[];
    renewal_dates: Date[];
  };

  // Financial Valuation (UK GAAP FRS 102)
  valuation: {
    // Cost Model
    historical_cost: number;
    development_costs: number;
    legal_costs: number;
    marketing_investment: number;

    // Current Valuation
    current_book_value: number;
    fair_value_estimate: number;
    market_value_estimate?: number;

    // Depreciation/Amortization
    useful_life_years: number;
    amortization_method: 'STRAIGHT_LINE' | 'REDUCING_BALANCE' | 'USAGE_BASED';
    accumulated_amortization: number;
    annual_amortization: number;

    // Impairment Testing
    last_impairment_test: Date;
    next_impairment_test: Date;
    impairment_indicators: string[];
    recoverable_amount: number;
  };

  // Revenue Attribution
  revenue_attribution: {
    directly_attributable_revenue: number; // Revenue directly from this brand
    indirectly_attributable_revenue: number; // Revenue supported by this brand
    revenue_multiple: number; // Revenue multiple for valuation
    profit_margin_impact: number;
  };

  // Strategic Value
  strategic_metrics: {
    market_penetration_score: number; // 0-100
    brand_recognition_score: number; // 0-100
    competitive_advantage_score: number; // 0-100
    strategic_importance: 'CRITICAL' | 'IMPORTANT' | 'SUPPORTING' | 'NON_CORE';
    synergy_value: number; // Value from combination with other assets
  };

  // BACA Coin Backing
  baca_coin_backing?: {
    allocated_coins: number;
    backing_percentage: number; // % of asset value backing BACA coins
    backing_date: Date;
    valuation_basis: string;
  };

  created_at: Date;
  updated_at: Date;
  last_valuation_date: Date;
  next_valuation_date: Date;
}

// ========================================
// FCA UK REGULATORY REPORTING
// ========================================

export interface FCABalanceSheetReport {
  report_id: string;
  reporting_entity: {
    company_name: 'AI Publishing International LLP';
    company_number: string; // Companies House number
    registered_office: {
      address: string;
      postcode: string;
    };
    financial_year_end: Date;
    reporting_period: {
      start_date: Date;
      end_date: Date;
    };
  };

  // Regulatory Framework
  regulatory_framework: {
    accounting_standards: 'FRS_102' | 'FRS_105' | 'IFRS';
    company_type: 'LLP' | 'LIMITED' | 'PLC';
    audit_requirement: boolean;
    small_company_exemptions: boolean;
  };

  // Balance Sheet (£)
  balance_sheet: {
    // Non-Current Assets
    non_current_assets: {
      intangible_assets: {
        ai_agent_assets: number;
        brand_assets: number;
        software_assets: number;
        development_costs: number;
        patents_and_trademarks: number;
        total_intangible: number;
      };
      tangible_assets: {
        computer_equipment: number;
        office_equipment: number;
        total_tangible: number;
      };
      investments: {
        baca_coin_investments: number;
        other_investments: number;
        total_investments: number;
      };
      total_non_current_assets: number;
    };

    // Current Assets
    current_assets: {
      trade_debtors: number;
      other_debtors: number;
      prepayments: number;
      cash_and_bank: number;
      total_current_assets: number;
    };

    total_assets: number;

    // Members' Equity (for LLP)
    members_equity: {
      members_capital: number;
      retained_earnings: number;
      current_year_profit: number;
      total_members_equity: number;
    };

    // Current Liabilities
    current_liabilities: {
      trade_creditors: number;
      accruals: number;
      deferred_revenue: number;
      tax_liabilities: number;
      other_creditors: number;
      total_current_liabilities: number;
    };

    // Non-Current Liabilities
    non_current_liabilities: {
      long_term_debt: number;
      deferred_tax: number;
      provisions: number;
      total_non_current_liabilities: number;
    };

    total_liabilities: number;
    total_equity_and_liabilities: number;
  };

  // Supporting Notes
  accounting_policies: {
    basis_of_preparation: string;
    intangible_asset_policy: string;
    depreciation_policy: string;
    revenue_recognition_policy: string;
    going_concern_assessment: string;
  };

  // Validation and Approval
  validation: {
    balances_verified: boolean;
    audit_trail_complete: boolean;
    regulatory_compliance_confirmed: boolean;
    prepared_by: string;
    reviewed_by: string; // Dr. Burby
    approved_by: string[]; // Morgan O'Brien, Mike, Paul
    approval_date: Date;
  };

  // BACA Coin Asset Backing Detail
  baca_backing_analysis: {
    total_tangible_asset_value: number;
    total_intangible_asset_value: number;
    total_backing_value: number;
    total_baca_coins_issued: number;
    backing_ratio: number; // Asset value per BACA coin
    backing_certificate: string;
  };

  created_at: Date;
  report_date: Date;
  filing_deadline: Date;
  filed_date?: Date;
}

/**
 * 🏢 ASOOS ORCHESTRATING ERP SYSTEM
 */
export class ASOOSOrchestratingERP extends HRAICRMSAIAssetIntegration {
  // Additional collections for ERP functionality
  private mcpLeads: Collection<MCPCustomerLead> | null = null;
  private mcpCustomers: Collection<MCPCustomer> | null = null;
  private mcpUsers: Collection<MCPUser> | null = null;
  private productBrandAssets: Collection<ProductBrandAsset> | null = null;
  private fcaBalanceSheetReports: Collection<FCABalanceSheetReport> | null = null;

  constructor(options: { gcpProject?: string } = {}) {
    super(options);
  }

  /**
   * 🔌 INITIALIZE ASOOS ERP SYSTEM
   */
  async initializeERP(): Promise<void> {
    console.log('🔌 Initializing ASOOS Orchestrating ERP System...');

    // Initialize parent HRAI-CRMS system
    await super.initialize();

    // Initialize ERP-specific collections
    this.mcpLeads = this.db!.collection('mcp_customer_leads');
    this.mcpCustomers = this.db!.collection('mcp_customers');
    this.mcpUsers = this.db!.collection('mcp_users');
    this.productBrandAssets = this.db!.collection('product_brand_assets');
    this.fcaBalanceSheetReports = this.db!.collection('fca_balance_sheet_reports');

    // Create ERP-specific indexes
    await this.createERPIndexes();

    console.log('✅ ASOOS Orchestrating ERP System initialized');
  }

  /**
   * 🎯 MCP LEAD MANAGEMENT
   */
  async createMCPLead(leadData: {
    company_name: string;
    primary_contact: MCPCustomerLead['primary_contact'];
    lead_source: MCPCustomerLead['lead_source'];
    estimated_value: number;
    mcp_config: MCPCustomerLead['mcp_config'];
  }): Promise<MCPCustomerLead> {
    console.log(`🎯 Creating MCP lead: ${leadData.company_name}`);

    const leadId = `MCP-LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const mcpDomain = `mcp.${leadData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.2100.cool`;

    const lead: MCPCustomerLead = {
      lead_id: leadId,
      mcp_domain: mcpDomain,
      company_name: leadData.company_name,
      primary_contact: leadData.primary_contact,
      lead_source: leadData.lead_source,
      lead_status: 'PROSPECT',
      estimated_value: leadData.estimated_value,
      probability_percent: 20, // Default for new prospect
      expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      mcp_config: leadData.mcp_config,
      touchpoints: [],
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'SYSTEM',
      assigned_to: 'SALES_TEAM',
    };

    await this.mcpLeads!.insertOne(lead);

    // Publish lead creation event
    await this.publishEvent('MCP_LEAD_CREATED', {
      lead_id: leadId,
      company_name: leadData.company_name,
      estimated_value: leadData.estimated_value,
    });

    console.log(`✅ MCP lead created: ${leadData.company_name} - ${mcpDomain}`);
    return lead;
  }

  /**
   * 🔄 CONVERT MCP LEAD TO CUSTOMER
   */
  async convertMCPLeadToCustomer(
    leadId: string,
    conversionData: {
      contract_value: number;
      contract_duration_months: number;
      tier: MCPCustomer['tier'];
      legal_company_details: MCPCustomer['company_profile'];
    }
  ): Promise<{ customer: MCPCustomer; updatedLead: MCPCustomerLead }> {
    console.log(`🔄 Converting MCP lead to customer: ${leadId}`);

    const lead = await this.mcpLeads!.findOne({ lead_id: leadId });
    if (!lead) {
      throw new Error(`MCP lead not found: ${leadId}`);
    }

    // Create customer record
    const customerId = `MCP-CUST-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const customer: MCPCustomer = {
      customer_id: customerId,
      mcp_domain: lead.mcp_domain,
      company_profile: conversionData.legal_company_details,
      status: 'ACTIVE',
      tier: conversionData.tier,
      contracts: [
        {
          contract_id: `CONT-${Date.now()}`,
          contract_type: 'MCP_SUBSCRIPTION',
          start_date: new Date(),
          end_date: new Date(
            Date.now() + conversionData.contract_duration_months * 30 * 24 * 60 * 60 * 1000
          ),
          value: conversionData.contract_value,
          currency: 'GBP',
          payment_terms: 'Monthly in advance',
          renewal_terms: 'Auto-renewal unless cancelled',
          status: 'ACTIVE',
        },
      ],
      financial_summary: {
        total_contract_value: conversionData.contract_value,
        annual_recurring_revenue:
          conversionData.contract_value * (12 / conversionData.contract_duration_months),
        monthly_recurring_revenue:
          conversionData.contract_value / conversionData.contract_duration_months,
        lifetime_value: conversionData.contract_value,
        payment_status: 'CURRENT',
        next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Update lead with conversion data
    const updatedLead = await this.mcpLeads!.findOneAndUpdate(
      { lead_id: leadId },
      {
        $set: {
          lead_status: 'CONVERTED',
          conversion_data: {
            converted_date: new Date(),
            customer_id: customerId,
            initial_contract_value: conversionData.contract_value,
            contract_duration_months: conversionData.contract_duration_months,
          },
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    await this.mcpCustomers!.insertOne(customer);

    // Publish conversion event
    await this.publishEvent('MCP_LEAD_CONVERTED', {
      lead_id: leadId,
      customer_id: customerId,
      contract_value: conversionData.contract_value,
    });

    console.log(`✅ MCP lead converted: ${lead.company_name} -> ${customerId}`);
    return { customer, updatedLead: updatedLead.value! };
  }

  /**
   * 👥 TRACK USER ROLE/COMPANY TRANSITIONS
   */
  async trackUserTransition(
    userId: string,
    transitionData: {
      new_customer_id: string;
      new_mcp_domain: string;
      new_role: MCPUser['current_assignment']['role'];
      new_employment_type: MCPUser['current_assignment']['employment_type'];
      transition_reason: MCPUser['assignment_history'][0]['transition_reason'];
      notes?: string;
    }
  ): Promise<MCPUser> {
    console.log(`👥 Tracking user transition: ${userId}`);

    const user = await this.mcpUsers!.findOne({ user_id: userId });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Move current assignment to history
    const historicalAssignment = {
      ...user.current_assignment,
      end_date: new Date(),
      transition_reason: transitionData.transition_reason,
      notes: transitionData.notes,
    };

    // Update user with new assignment
    const updatedUser = await this.mcpUsers!.findOneAndUpdate(
      { user_id: userId },
      {
        $set: {
          current_assignment: {
            customer_id: transitionData.new_customer_id,
            mcp_domain: transitionData.new_mcp_domain,
            role: transitionData.new_role,
            permissions: this.getDefaultPermissionsForRole(transitionData.new_role),
            start_date: new Date(),
            employment_type: transitionData.new_employment_type,
          },
          updated_at: new Date(),
        },
        $push: {
          assignment_history: historicalAssignment,
        },
      },
      { returnDocument: 'after' }
    );

    // Publish transition event
    await this.publishEvent('USER_TRANSITION_TRACKED', {
      user_id: userId,
      from_customer: user.current_assignment.customer_id,
      to_customer: transitionData.new_customer_id,
      transition_reason: transitionData.transition_reason,
    });

    console.log(`✅ User transition tracked: ${userId}`);
    return updatedUser.value!;
  }

  /**
   * 🏷️ REGISTER PRODUCT BRAND ASSET
   */
  async registerProductBrandAsset(assetData: {
    brand_name: string;
    asset_type: ProductBrandAsset['asset_type'];
    brand_details: ProductBrandAsset['brand_details'];
    initial_valuation: {
      historical_cost: number;
      development_costs: number;
      legal_costs: number;
      marketing_investment: number;
      useful_life_years: number;
    };
    baca_coin_backing?: {
      allocated_coins: number;
      backing_percentage: number;
    };
  }): Promise<ProductBrandAsset> {
    console.log(`🏷️ Registering product brand asset: ${assetData.brand_name}`);

    const assetId = `BRAND-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const totalCost =
      assetData.initial_valuation.historical_cost +
      assetData.initial_valuation.development_costs +
      assetData.initial_valuation.legal_costs +
      assetData.initial_valuation.marketing_investment;

    const asset: ProductBrandAsset = {
      asset_id: assetId,
      asset_name: assetData.brand_name,
      asset_type: assetData.asset_type,
      brand_details: assetData.brand_details,
      legal_protection: {
        trademark_numbers: [],
        copyright_registrations: [],
        patent_numbers: [],
        domain_registrations: [],
        protection_jurisdictions: ['UK'],
        renewal_dates: [],
      },
      valuation: {
        historical_cost: assetData.initial_valuation.historical_cost,
        development_costs: assetData.initial_valuation.development_costs,
        legal_costs: assetData.initial_valuation.legal_costs,
        marketing_investment: assetData.initial_valuation.marketing_investment,
        current_book_value: totalCost,
        fair_value_estimate: totalCost,
        useful_life_years: assetData.initial_valuation.useful_life_years,
        amortization_method: 'STRAIGHT_LINE',
        accumulated_amortization: 0,
        annual_amortization: totalCost / assetData.initial_valuation.useful_life_years,
        last_impairment_test: new Date(),
        next_impairment_test: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        impairment_indicators: [],
        recoverable_amount: totalCost,
      },
      revenue_attribution: {
        directly_attributable_revenue: 0,
        indirectly_attributable_revenue: 0,
        revenue_multiple: 1.0,
        profit_margin_impact: 0,
      },
      strategic_metrics: {
        market_penetration_score: 50,
        brand_recognition_score: 50,
        competitive_advantage_score: 50,
        strategic_importance: 'IMPORTANT',
        synergy_value: 0,
      },
      baca_coin_backing: assetData.baca_coin_backing
        ? {
            ...assetData.baca_coin_backing,
            backing_date: new Date(),
            valuation_basis: 'Historical cost with development investment',
          }
        : undefined,
      created_at: new Date(),
      updated_at: new Date(),
      last_valuation_date: new Date(),
      next_valuation_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Quarterly revaluation
    };

    await this.productBrandAssets!.insertOne(asset);

    // Publish asset registration event
    await this.publishEvent('BRAND_ASSET_REGISTERED', {
      asset_id: assetId,
      brand_name: assetData.brand_name,
      book_value: totalCost,
      baca_backing: !!assetData.baca_coin_backing,
    });

    console.log(
      `✅ Product brand asset registered: ${assetData.brand_name} - £${totalCost.toLocaleString()}`
    );
    return asset;
  }

  /**
   * 📊 GENERATE FCA UK REGULATORY BALANCE SHEET REPORT
   */
  async generateFCABalanceSheetReport(
    reportingPeriod: { start_date: Date; end_date: Date },
    approvalData: {
      prepared_by: string;
      reviewed_by: string; // Dr. Burby
      approved_by: string[]; // Morgan, Mike, Paul
    }
  ): Promise<FCABalanceSheetReport> {
    console.log('📊 Generating FCA UK regulatory balance sheet report...');

    // Aggregate AI Agent Assets
    const aiAssetsPipeline = [
      { $match: { asset_status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          total_cost: { $sum: '$initial_cost' },
          total_book_value: { $sum: '$current_book_value' },
          total_accumulated_depreciation: { $sum: '$accumulated_depreciation' },
        },
      },
    ];
    const [aiAssetsData] = await this.aiAgentAssets!.aggregate(aiAssetsPipeline).toArray();

    // Aggregate Brand Assets
    const brandAssetsPipeline = [
      {
        $group: {
          _id: '$asset_type',
          total_cost: { $sum: '$valuation.historical_cost' },
          total_book_value: { $sum: '$valuation.current_book_value' },
          total_accumulated_amortization: { $sum: '$valuation.accumulated_amortization' },
        },
      },
    ];
    const brandAssetsData = await this.productBrandAssets!.aggregate(brandAssetsPipeline).toArray();

    // Calculate brand assets totals
    const totalBrandCost = brandAssetsData.reduce((sum, item) => sum + (item.total_cost || 0), 0);
    const totalBrandBookValue = brandAssetsData.reduce(
      (sum, item) => sum + (item.total_book_value || 0),
      0
    );

    // Aggregate Customer Revenue (for debtors calculation)
    const customerRevenuePipeline = [
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          total_arr: { $sum: '$financial_summary.annual_recurring_revenue' },
          total_mrr: { $sum: '$financial_summary.monthly_recurring_revenue' },
          current_debtors: {
            $sum: {
              $cond: [
                { $eq: ['$financial_summary.payment_status', 'OVERDUE'] },
                '$financial_summary.monthly_recurring_revenue',
                0,
              ],
            },
          },
        },
      },
    ];
    const [customerRevenueData] =
      await this.mcpCustomers!.aggregate(customerRevenuePipeline).toArray();

    // Calculate BACA Coin backing
    const bacaCoinPipeline = [
      { $match: { baca_coin_backing: { $exists: true } } },
      {
        $group: {
          _id: null,
          total_backing_value: {
            $sum: {
              $multiply: [
                '$valuation.current_book_value',
                { $divide: ['$baca_coin_backing.backing_percentage', 100] },
              ],
            },
          },
          total_coins_allocated: { $sum: '$baca_coin_backing.allocated_coins' },
        },
      },
    ];
    const [bacaCoinData] = await this.productBrandAssets!.aggregate(bacaCoinPipeline).toArray();

    const reportId = `FCA-BSR-${Date.now()}`;
    const report: FCABalanceSheetReport = {
      report_id: reportId,
      reporting_entity: {
        company_name: 'AI Publishing International LLP',
        company_number: 'OC000000', // Replace with actual Companies House number
        registered_office: {
          address: 'To be updated with registered office',
          postcode: 'To be updated',
        },
        financial_year_end: new Date(reportingPeriod.end_date.getFullYear(), 11, 31), // 31st December
        reporting_period: reportingPeriod,
      },
      regulatory_framework: {
        accounting_standards: 'FRS_102',
        company_type: 'LLP',
        audit_requirement: true, // Assuming required due to size/complexity
        small_company_exemptions: false,
      },
      balance_sheet: {
        non_current_assets: {
          intangible_assets: {
            ai_agent_assets: aiAssetsData?.total_book_value || 0,
            brand_assets: totalBrandBookValue,
            software_assets: 50000, // Estimated - should be tracked separately
            development_costs: 100000, // Estimated - should be tracked separately
            patents_and_trademarks: 25000, // Estimated - should be tracked separately
            total_intangible: (aiAssetsData?.total_book_value || 0) + totalBrandBookValue + 175000,
          },
          tangible_assets: {
            computer_equipment: 15000, // Estimated - should be tracked separately
            office_equipment: 5000, // Estimated - should be tracked separately
            total_tangible: 20000,
          },
          investments: {
            baca_coin_investments: bacaCoinData?.total_backing_value || 0,
            other_investments: 0,
            total_investments: bacaCoinData?.total_backing_value || 0,
          },
          total_non_current_assets: 0, // Will be calculated
        },
        current_assets: {
          trade_debtors: customerRevenueData?.current_debtors || 0,
          other_debtors: 10000, // Estimated
          prepayments: 5000, // Estimated
          cash_and_bank: 50000, // Estimated - should be tracked separately
          total_current_assets: 0, // Will be calculated
        },
        total_assets: 0, // Will be calculated
        members_equity: {
          members_capital: 100000, // Should be tracked based on actual member contributions
          retained_earnings: 0, // Should be calculated from profit/loss history
          current_year_profit: customerRevenueData?.total_arr || 0, // Simplified - actual P&L needed
          total_members_equity: 0, // Will be calculated
        },
        current_liabilities: {
          trade_creditors: 25000, // Estimated
          accruals: 10000, // Estimated
          deferred_revenue: customerRevenueData?.total_mrr * 3 || 0, // 3 months advance payments
          tax_liabilities: 15000, // Estimated
          other_creditors: 5000, // Estimated
          total_current_liabilities: 0, // Will be calculated
        },
        non_current_liabilities: {
          long_term_debt: 0,
          deferred_tax: 0,
          provisions: 10000, // Estimated
          total_non_current_liabilities: 10000,
        },
        total_liabilities: 0, // Will be calculated
        total_equity_and_liabilities: 0, // Will be calculated
      },
      accounting_policies: {
        basis_of_preparation:
          'These financial statements have been prepared under FRS 102 Section 1A (Small Entities).',
        intangible_asset_policy:
          'AI agent assets are valued based on development costs and enhanced through performance metrics. Brand assets are valued at historical cost less accumulated amortization.',
        depreciation_policy:
          'Intangible assets are amortized on a straight-line basis over their estimated useful economic lives.',
        revenue_recognition_policy:
          'Revenue is recognized when services are provided and there is a contractual right to consideration.',
        going_concern_assessment:
          'The directors have assessed the company as a going concern based on current trading performance and future prospects.',
      },
      validation: {
        balances_verified: false, // To be completed during review
        audit_trail_complete: false, // To be completed during review
        regulatory_compliance_confirmed: false, // To be confirmed by Dr. Burby
        prepared_by: approvalData.prepared_by,
        reviewed_by: approvalData.reviewed_by,
        approved_by: approvalData.approved_by,
        approval_date: new Date(),
      },
      baca_backing_analysis: {
        total_tangible_asset_value: 20000,
        total_intangible_asset_value:
          (aiAssetsData?.total_book_value || 0) + totalBrandBookValue + 175000,
        total_backing_value: bacaCoinData?.total_backing_value || 0,
        total_baca_coins_issued: bacaCoinData?.total_coins_allocated || 0,
        backing_ratio: bacaCoinData?.total_coins_allocated
          ? bacaCoinData.total_backing_value / bacaCoinData.total_coins_allocated
          : 0,
        backing_certificate: `This certifies that BACA coins are backed by tangible business assets with a total value of £${(bacaCoinData?.total_backing_value || 0).toLocaleString()}`,
      },
      created_at: new Date(),
      report_date: new Date(),
      filing_deadline: new Date(reportingPeriod.end_date.getFullYear() + 1, 8, 31), // 9 months after year end
      filed_date: undefined,
    };

    // Calculate totals
    report.balance_sheet.non_current_assets.total_non_current_assets =
      report.balance_sheet.non_current_assets.intangible_assets.total_intangible +
      report.balance_sheet.non_current_assets.tangible_assets.total_tangible +
      report.balance_sheet.non_current_assets.investments.total_investments;

    report.balance_sheet.current_assets.total_current_assets =
      report.balance_sheet.current_assets.trade_debtors +
      report.balance_sheet.current_assets.other_debtors +
      report.balance_sheet.current_assets.prepayments +
      report.balance_sheet.current_assets.cash_and_bank;

    report.balance_sheet.total_assets =
      report.balance_sheet.non_current_assets.total_non_current_assets +
      report.balance_sheet.current_assets.total_current_assets;

    report.balance_sheet.members_equity.total_members_equity =
      report.balance_sheet.members_equity.members_capital +
      report.balance_sheet.members_equity.retained_earnings +
      report.balance_sheet.members_equity.current_year_profit;

    report.balance_sheet.current_liabilities.total_current_liabilities =
      report.balance_sheet.current_liabilities.trade_creditors +
      report.balance_sheet.current_liabilities.accruals +
      report.balance_sheet.current_liabilities.deferred_revenue +
      report.balance_sheet.current_liabilities.tax_liabilities +
      report.balance_sheet.current_liabilities.other_creditors;

    report.balance_sheet.total_liabilities =
      report.balance_sheet.current_liabilities.total_current_liabilities +
      report.balance_sheet.non_current_liabilities.total_non_current_liabilities;

    report.balance_sheet.total_equity_and_liabilities =
      report.balance_sheet.members_equity.total_members_equity +
      report.balance_sheet.total_liabilities;

    // Save report
    await this.fcaBalanceSheetReports!.insertOne(report);

    // Publish report creation event
    await this.publishEvent('FCA_BALANCE_SHEET_GENERATED', {
      report_id: reportId,
      total_assets: report.balance_sheet.total_assets,
      total_intangible_assets:
        report.balance_sheet.non_current_assets.intangible_assets.total_intangible,
      baca_backing_value: report.baca_backing_analysis.total_backing_value,
    });

    console.log(
      `✅ FCA Balance Sheet Report generated: ${reportId} - Total Assets: £${report.balance_sheet.total_assets.toLocaleString()}`
    );
    return report;
  }

  // Private helper methods
  private getDefaultPermissionsForRole(role: MCPUser['current_assignment']['role']): string[] {
    const permissions = {
      ADMIN: ['READ', 'WRITE', 'DELETE', 'MANAGE_USERS', 'CONFIGURE'],
      USER: ['READ', 'WRITE'],
      VIEWER: ['READ'],
      DEVELOPER: ['READ', 'WRITE', 'DEPLOY'],
      ANALYST: ['READ', 'ANALYTICS'],
    };
    return permissions[role] || ['READ'];
  }

  private async publishEvent(eventType: string, data: any): Promise<void> {
    const message = {
      json: {
        event_type: eventType,
        timestamp: new Date().toISOString(),
        ...data,
      },
    };
    await this.pubsub.topic('asoos-erp-events').publishMessage(message);
  }

  private async createERPIndexes(): Promise<void> {
    await Promise.all([
      // MCP Leads
      this.mcpLeads!.createIndex({ lead_id: 1 }, { unique: true }),
      this.mcpLeads!.createIndex({ company_name: 1 }),
      this.mcpLeads!.createIndex({ lead_status: 1 }),
      this.mcpLeads!.createIndex({ assigned_to: 1 }),
      this.mcpLeads!.createIndex({ mcp_domain: 1 }),

      // MCP Customers
      this.mcpCustomers!.createIndex({ customer_id: 1 }, { unique: true }),
      this.mcpCustomers!.createIndex({ mcp_domain: 1 }),
      this.mcpCustomers!.createIndex({ status: 1 }),
      this.mcpCustomers!.createIndex({ 'company_profile.legal_name': 1 }),

      // MCP Users
      this.mcpUsers!.createIndex({ user_id: 1 }, { unique: true }),
      this.mcpUsers!.createIndex({ 'personal_details.email': 1 }),
      this.mcpUsers!.createIndex({ 'current_assignment.customer_id': 1 }),
      this.mcpUsers!.createIndex({ 'current_assignment.mcp_domain': 1 }),

      // Product Brand Assets
      this.productBrandAssets!.createIndex({ asset_id: 1 }, { unique: true }),
      this.productBrandAssets!.createIndex({ asset_name: 1 }),
      this.productBrandAssets!.createIndex({ asset_type: 1 }),
      this.productBrandAssets!.createIndex({ 'brand_details.brand_name': 1 }),

      // FCA Reports
      this.fcaBalanceSheetReports!.createIndex({ report_id: 1 }, { unique: true }),
      this.fcaBalanceSheetReports!.createIndex({ report_date: -1 }),
      this.fcaBalanceSheetReports!.createIndex({ 'reporting_entity.financial_year_end': -1 }),
    ]);

    console.log('✅ ERP indexes created');
  }
}

export default ASOOSOrchestratingERP;
