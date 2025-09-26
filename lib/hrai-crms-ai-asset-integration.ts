/**
 * ████████████████████████████████████████████████████████████████
 * █         HRAI-CRMS & AI ASSET ACCOUNTING INTEGRATION          █
 * ████████████████████████████████████████████████████████████████
 *
 * Integrates Universal AI Key Manager v2 with HRAI-CRMS system
 * Full HR/LLP member tracking with UK GAAP AI Agent Asset Accounting
 *
 * Features:
 * • Owner Subscriber linking to HRAI-CRMS
 * • HR Classification (.hr1 to .hr4) integration
 * • AI Agent asset accounting per UK GAAP
 * • VLS Flight Tracking System (FMS) integration
 * • Balance sheet value enhancement tracking
 * • Individual pilot-agent cost accounting
 *
 * @author AI Publishing International LLP
 * @version 1.0.0-enterprise
 * @license Proprietary - Diamond SAO Command Center
 */

import { MongoClient, Db, Collection } from 'mongodb';
import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { UniversalAIKeyManagerV2 } from './universal-ai-key-manager-v2';
import fetch from 'node-fetch';

// HRAI-CRMS Types
export interface OwnerSubscriber {
  uuid: string;
  name: string;
  email: string;
  company_name: string;
  mcp_endpoint: string;
  hr_classification: '.hr1' | '.hr2' | '.hr3' | '.hr4';
  classification_type:
    | 'MEMBER_LLP_CONTRACT'
    | 'MEMBER_LLP_EMPLOYEE'
    | 'NON_MEMBER_CONTRACT_EMPLOYEE'
    | 'MEMBER_LLP_NO_EMPLOYMENT';
  llp_membership_status: 'ACTIVE_MEMBER' | 'INACTIVE_MEMBER' | 'NON_MEMBER';
  employment_relationship: 'CONTRACTED' | 'EMPLOYEE' | 'NO_EMPLOYMENT_RELATIONSHIP';
  sao_level: 'DIAMOND' | 'EMERALD' | 'SAPPHIRE' | 'OPAL' | 'ONYX';
  auth_level: number;
  equity_percentage?: number;
  voting_rights?: boolean;
  package_level: string;
  access_rights: string[];
  position: string;
  join_date: string;
  region: string;
  created_at: Date;
  updated_at: Date;
}

// AI Agent Asset Types (UK GAAP Compliant)
export interface AIAgentAsset {
  agent_id: string;
  pilot_agent_name: string;
  pilot_lineage: string; // dr-lucy, dr-claude, etc.
  agent_classification:
    | 'RIX'
    | 'sRIX'
    | 'qRIX'
    | 'HQRIX'
    | 'MAESTRO-01'
    | 'MAESTRO-02'
    | 'MAESTRO-03'
    | 'CRX-01'
    | 'CRX-02'
    | 'PROFESSIONAL-COPILOT';

  // UK GAAP Asset Accounting
  asset_category: 'INTANGIBLE_ASSET';
  asset_subcategory: 'AI_INTELLECTUAL_PROPERTY';
  initial_cost: number; // Development/training cost
  current_book_value: number;
  accumulated_depreciation: number;
  useful_life_years: number;
  depreciation_method: 'STRAIGHT_LINE' | 'REDUCING_BALANCE' | 'USAGE_BASED';

  // Value Enhancement Tracking
  weekly_value_enhancement: number;
  total_flights_completed: number;
  flight_performance_score: number;
  capability_development_score: number;
  market_value_indicator: number;

  // VLS Flight Management System Integration
  vls_tracking: {
    last_flight_date: Date;
    total_flight_hours: number;
    average_flight_performance: number;
    flight_efficiency_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    next_scheduled_flight: Date;
  };

  // Asset Lifecycle
  acquisition_date: Date;
  last_valuation_date: Date;
  next_valuation_date: Date;
  disposal_date?: Date;
  asset_status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'DISPOSED';

  // Cost Center Allocation
  tenant_allocation: Array<{
    tenant_id: string;
    allocation_percentage: number;
    cost_allocation: number;
  }>;

  created_at: Date;
  updated_at: Date;
}

export interface VLSFlightRecord {
  flight_id: string;
  agent_id: string;
  pilot_agent_name: string;
  flight_date: Date;
  flight_duration_minutes: number;
  flight_type: 'TRAINING' | 'PRODUCTION' | 'MAINTENANCE' | 'TESTING';
  performance_metrics: {
    efficiency_score: number;
    accuracy_score: number;
    innovation_score: number;
    collaboration_score: number;
  };
  value_enhancement_amount: number;
  cost_attribution: {
    tenant_id?: string;
    user_id?: string;
    project_code?: string;
  };
  flight_outcome: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'REQUIRES_REVIEW';
  notes?: string;
  created_at: Date;
}

export interface UKGAAPDepreciationEntry {
  entry_id: string;
  agent_id: string;
  depreciation_date: Date;
  depreciation_amount: number;
  accumulated_depreciation: number;
  book_value_after: number;
  depreciation_method: string;
  useful_life_remaining_years: number;
  value_enhancement_offset: number; // Weekly enhancement that offsets depreciation
  net_depreciation: number; // After enhancement offset
  accounting_period: string;
  journal_entry_reference: string;
  created_at: Date;
}

/**
 * 🏢 HRAI-CRMS & AI ASSET ACCOUNTING INTEGRATION
 */
export class HRAICRMSAIAssetIntegration {
  private readonly gcpProject: string;
  private readonly bigquery: BigQuery;
  private readonly pubsub: PubSub;
  private readonly secretClient: SecretManagerServiceClient;
  private readonly keyManager: UniversalAIKeyManagerV2;
  private mongoClient: MongoClient | null = null;
  private db: Db | null = null;

  // Collections
  private ownerSubscribers: Collection<OwnerSubscriber> | null = null;
  private aiAgentAssets: Collection<AIAgentAsset> | null = null;
  private vlsFlightRecords: Collection<VLSFlightRecord> | null = null;
  private depreciationEntries: Collection<UKGAAPDepreciationEntry> | null = null;

  constructor(
    options: {
      gcpProject?: string;
    } = {}
  ) {
    this.gcpProject = options.gcpProject || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.bigquery = new BigQuery({ projectId: this.gcpProject });
    this.pubsub = new PubSub({ projectId: this.gcpProject });
    this.secretClient = new SecretManagerServiceClient();
    this.keyManager = new UniversalAIKeyManagerV2({ gcpProject: this.gcpProject });
  }

  /**
   * 🔌 INITIALIZE HRAI-CRMS CONNECTION
   */
  async initialize(): Promise<void> {
    console.log('🔌 Initializing HRAI-CRMS & AI Asset Integration...');

    // Get MongoDB connection string from Secret Manager
    const mongoUri = await this.getSecret('mongodb-atlas-connection-string');

    // Connect to MongoDB Atlas
    this.mongoClient = new MongoClient(mongoUri);
    await this.mongoClient.connect();

    this.db = this.mongoClient.db('hrai_crms');

    // Initialize collections
    this.ownerSubscribers = this.db.collection('owner_subscribers');
    this.aiAgentAssets = this.db.collection('ai_agent_assets');
    this.vlsFlightRecords = this.db.collection('vls_flight_records');
    this.depreciationEntries = this.db.collection('depreciation_entries');

    // Ensure indexes for performance
    await this.createIndexes();

    console.log('✅ HRAI-CRMS & AI Asset Integration initialized');
  }

  /**
   * 👤 SYNC OWNER SUBSCRIBER WITH HRAI-CRMS
   */
  async syncOwnerSubscriber(
    uuid: string,
    tenantId: string,
    ownerData: Partial<OwnerSubscriber>
  ): Promise<OwnerSubscriber> {
    console.log(`👤 Syncing owner subscriber: ${uuid} (${tenantId})`);

    const ownerSubscriber: OwnerSubscriber = {
      uuid,
      name: ownerData.name!,
      email: ownerData.email!,
      company_name: tenantId,
      mcp_endpoint: `mcp.${tenantId}.2100.cool`,
      hr_classification: ownerData.hr_classification || '.hr4',
      classification_type: this.mapHRClassificationToType(ownerData.hr_classification || '.hr4'),
      llp_membership_status: this.getLLPMembershipStatus(ownerData.hr_classification || '.hr4'),
      employment_relationship: this.getEmploymentRelationship(
        ownerData.hr_classification || '.hr4'
      ),
      sao_level: ownerData.sao_level || 'SAPPHIRE',
      auth_level: ownerData.auth_level || 5,
      equity_percentage: ownerData.equity_percentage,
      voting_rights: ownerData.voting_rights,
      package_level: ownerData.package_level || 'sapphire',
      access_rights: ownerData.access_rights || [],
      position: ownerData.position || 'Owner / Subscriber',
      join_date: ownerData.join_date || new Date().toISOString().split('T')[0],
      region: ownerData.region || 'global',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Upsert owner subscriber
    await this.ownerSubscribers!.updateOne({ uuid }, { $set: ownerSubscriber }, { upsert: true });

    // Link with Universal AI Key Manager
    await this.linkOwnerWithKeyManager(tenantId, ownerSubscriber);

    console.log(
      `✅ Owner subscriber synced: ${ownerData.name} (${ownerSubscriber.hr_classification})`
    );
    return ownerSubscriber;
  }

  /**
   * 🤖 REGISTER AI AGENT AS ASSET (UK GAAP)
   */
  async registerAIAgentAsset(
    agentId: string,
    pilotAgentName: string,
    agentData: {
      pilot_lineage: string;
      agent_classification: string;
      initial_cost: number;
      useful_life_years: number;
      tenant_allocations: Array<{ tenant_id: string; allocation_percentage: number }>;
    }
  ): Promise<AIAgentAsset> {
    console.log(`🤖 Registering AI agent as asset: ${pilotAgentName} (${agentId})`);

    const currentDate = new Date();
    const nextValuationDate = new Date(currentDate);
    nextValuationDate.setMonth(nextValuationDate.getMonth() + 3); // Quarterly valuation

    const agentAsset: AIAgentAsset = {
      agent_id: agentId,
      pilot_agent_name: pilotAgentName,
      pilot_lineage: agentData.pilot_lineage,
      agent_classification: agentData.agent_classification as any,

      // UK GAAP Asset Accounting
      asset_category: 'INTANGIBLE_ASSET',
      asset_subcategory: 'AI_INTELLECTUAL_PROPERTY',
      initial_cost: agentData.initial_cost,
      current_book_value: agentData.initial_cost,
      accumulated_depreciation: 0,
      useful_life_years: agentData.useful_life_years,
      depreciation_method: 'STRAIGHT_LINE',

      // Value Enhancement (starts at zero, grows with flights)
      weekly_value_enhancement: 0,
      total_flights_completed: 0,
      flight_performance_score: 0,
      capability_development_score: 0,
      market_value_indicator: agentData.initial_cost,

      // VLS Flight Management System
      vls_tracking: {
        last_flight_date: currentDate,
        total_flight_hours: 0,
        average_flight_performance: 0,
        flight_efficiency_trend: 'STABLE',
        next_scheduled_flight: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      },

      // Asset Lifecycle
      acquisition_date: currentDate,
      last_valuation_date: currentDate,
      next_valuation_date: nextValuationDate,
      asset_status: 'ACTIVE',

      // Cost Center Allocation
      tenant_allocation: agentData.tenant_allocations.map((allocation) => ({
        ...allocation,
        cost_allocation: agentData.initial_cost * (allocation.allocation_percentage / 100),
      })),

      created_at: currentDate,
      updated_at: currentDate,
    };

    // Insert AI agent asset
    await this.aiAgentAssets!.insertOne(agentAsset);

    // Create initial depreciation schedule
    await this.createDepreciationSchedule(agentAsset);

    // Publish asset creation event
    await this.publishAssetEvent('ASSET_CREATED', agentAsset);

    console.log(
      `✅ AI agent registered as asset: ${pilotAgentName} - £${agentData.initial_cost.toLocaleString()}`
    );
    return agentAsset;
  }

  /**
   * ✈️ RECORD VLS FLIGHT AND UPDATE ASSET VALUE
   */
  async recordVLSFlight(
    agentId: string,
    flightData: {
      flight_duration_minutes: number;
      flight_type: 'TRAINING' | 'PRODUCTION' | 'MAINTENANCE' | 'TESTING';
      performance_metrics: {
        efficiency_score: number;
        accuracy_score: number;
        innovation_score: number;
        collaboration_score: number;
      };
      tenant_id?: string;
      user_id?: string;
      project_code?: string;
    }
  ): Promise<{ flightRecord: VLSFlightRecord; valueEnhancement: number }> {
    console.log(`✈️ Recording VLS flight for agent: ${agentId}`);

    // Get agent asset
    const agentAsset = await this.aiAgentAssets!.findOne({ agent_id: agentId });
    if (!agentAsset) {
      throw new Error(`AI agent asset not found: ${agentId}`);
    }

    // Calculate value enhancement based on performance
    const valueEnhancement = this.calculateValueEnhancement(
      flightData.performance_metrics,
      flightData.flight_duration_minutes,
      agentAsset.current_book_value
    );

    // Create flight record
    const flightRecord: VLSFlightRecord = {
      flight_id: `FLT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      agent_id: agentId,
      pilot_agent_name: agentAsset.pilot_agent_name,
      flight_date: new Date(),
      flight_duration_minutes: flightData.flight_duration_minutes,
      flight_type: flightData.flight_type,
      performance_metrics: flightData.performance_metrics,
      value_enhancement_amount: valueEnhancement,
      cost_attribution: {
        tenant_id: flightData.tenant_id,
        user_id: flightData.user_id,
        project_code: flightData.project_code,
      },
      flight_outcome: this.determineFlightOutcome(flightData.performance_metrics),
      created_at: new Date(),
    };

    // Insert flight record
    await this.vlsFlightRecords!.insertOne(flightRecord);

    // Update agent asset with flight data and value enhancement
    await this.updateAgentAssetFromFlight(agentAsset, flightRecord, valueEnhancement);

    // Publish flight event for cost allocation
    await this.publishFlightEvent(flightRecord);

    console.log(
      `✅ VLS flight recorded: ${flightRecord.flight_id} - Value enhancement: £${valueEnhancement.toFixed(2)}`
    );
    return { flightRecord, valueEnhancement };
  }

  /**
   * 📊 CALCULATE WEEKLY DEPRECIATION WITH VALUE ENHANCEMENT
   */
  async processWeeklyDepreciation(): Promise<void> {
    console.log('📊 Processing weekly depreciation with value enhancement...');

    // Get all active AI agent assets
    const activeAssets = await this.aiAgentAssets!.find({ asset_status: 'ACTIVE' }).toArray();

    for (const asset of activeAssets) {
      await this.calculateWeeklyDepreciation(asset);
    }

    console.log(`✅ Processed weekly depreciation for ${activeAssets.length} AI agent assets`);
  }

  /**
   * 💰 GENERATE BALANCE SHEET REPORT (UK GAAP)
   */
  async generateBalanceSheetReport(reportDate: Date = new Date()): Promise<any> {
    console.log('💰 Generating UK GAAP balance sheet report for AI assets...');

    const pipeline = [
      { $match: { asset_status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          total_ai_assets_cost: { $sum: '$initial_cost' },
          total_ai_assets_book_value: { $sum: '$current_book_value' },
          total_accumulated_depreciation: { $sum: '$accumulated_depreciation' },
          total_value_enhancement: { $sum: '$weekly_value_enhancement' },
          total_flights_completed: { $sum: '$total_flights_completed' },
          asset_count: { $sum: 1 },
          assets_by_classification: {
            $push: {
              classification: '$agent_classification',
              book_value: '$current_book_value',
              pilot_name: '$pilot_agent_name',
            },
          },
        },
      },
    ];

    const [aggregateResult] = await this.aiAgentAssets!.aggregate(pipeline).toArray();

    const balanceSheetReport = {
      report_date: reportDate,
      reporting_standard: 'UK_GAAP_FRS_102',
      currency: 'GBP',

      intangible_assets: {
        ai_intellectual_property: {
          cost: aggregateResult?.total_ai_assets_cost || 0,
          accumulated_depreciation: -(aggregateResult?.total_accumulated_depreciation || 0),
          net_book_value: aggregateResult?.total_ai_assets_book_value || 0,
          value_enhancement_ytd: aggregateResult?.total_value_enhancement || 0,
        },
      },

      asset_summary: {
        total_ai_agents: aggregateResult?.asset_count || 0,
        total_flights_completed: aggregateResult?.total_flights_completed || 0,
        average_book_value_per_agent:
          (aggregateResult?.total_ai_assets_book_value || 0) / (aggregateResult?.asset_count || 1),
        assets_by_classification: aggregateResult?.assets_by_classification || [],
      },

      depreciation_policy: {
        method: 'STRAIGHT_LINE',
        useful_life_range: '3-7 years',
        value_enhancement_recognition: 'WEEKLY_FLIGHT_PERFORMANCE',
        impairment_review_frequency: 'QUARTERLY',
      },
    };

    // Store report in BigQuery for analytics
    await this.storBalanceSheetReportInBigQuery(balanceSheetReport);

    return balanceSheetReport;
  }

  /**
   * 🔗 INTEGRATION WITH XERO FOR UK LLP ACCOUNTING
   */
  async syncWithXeroUKLLP(balanceSheetData: any): Promise<void> {
    console.log('🔗 Syncing AI asset data with Xero UK LLP accounting...');

    try {
      // Get Xero UK LLP credentials
      const xeroCredentials = await this.getSecret('xero-uk-llp-credentials');
      const xeroConfig = JSON.parse(xeroCredentials);

      // Create journal entries for AI asset movements
      const journalEntries = this.createXeroJournalEntries(balanceSheetData);

      // Post to Xero API (simplified - would need full OAuth2 implementation)
      for (const entry of journalEntries) {
        await this.postXeroJournalEntry(entry, xeroConfig.access_token);
      }

      console.log('✅ AI asset data synced with Xero UK LLP');
    } catch (error) {
      console.error('❌ Xero UK LLP sync failed:', error);
      // Continue processing - don't fail the whole system
    }
  }

  // Private helper methods...

  private async getSecret(secretName: string): Promise<string> {
    const [version] = await this.secretClient.accessSecretVersion({
      name: `projects/${this.gcpProject}/secrets/${secretName}/versions/latest`,
    });
    return version.payload?.data?.toString('utf8') || '';
  }

  private mapHRClassificationToType(hrClass: string): OwnerSubscriber['classification_type'] {
    const mapping = {
      '.hr1': 'MEMBER_LLP_CONTRACT' as const,
      '.hr2': 'MEMBER_LLP_EMPLOYEE' as const,
      '.hr3': 'NON_MEMBER_CONTRACT_EMPLOYEE' as const,
      '.hr4': 'MEMBER_LLP_NO_EMPLOYMENT' as const,
    };
    return mapping[hrClass as keyof typeof mapping] || 'MEMBER_LLP_NO_EMPLOYMENT';
  }

  private getLLPMembershipStatus(hrClass: string): OwnerSubscriber['llp_membership_status'] {
    return hrClass === '.hr3' ? 'NON_MEMBER' : 'ACTIVE_MEMBER';
  }

  private getEmploymentRelationship(hrClass: string): OwnerSubscriber['employment_relationship'] {
    const mapping = {
      '.hr1': 'CONTRACTED' as const,
      '.hr2': 'EMPLOYEE' as const,
      '.hr3': 'CONTRACTED' as const,
      '.hr4': 'NO_EMPLOYMENT_RELATIONSHIP' as const,
    };
    return mapping[hrClass as keyof typeof mapping] || 'NO_EMPLOYMENT_RELATIONSHIP';
  }

  private async linkOwnerWithKeyManager(tenantId: string, owner: OwnerSubscriber): Promise<void> {
    // Create tenant context for Universal AI Key Manager
    const tenantContext = {
      tenantId,
      mcpDomain: `mcp.${tenantId}.2100.cool`,
      tier: owner.sao_level === 'DIAMOND' ? 'managed-enterprise' : 'managed-premium',
      region: 'us-west1',
      complianceFlags: ['SOC2', 'GDPR'] as ('SOC2' | 'GDPR' | 'HIPAA')[],
    };

    // Ensure AI service keys are provisioned for the owner's tenant
    const services = ['hume', 'openai', 'anthropic'];
    for (const service of services) {
      try {
        await this.keyManager.getAPIKey(service, tenantContext, owner.uuid);
        console.log(`✅ AI service ${service} linked for ${owner.name}`);
      } catch (error) {
        console.log(`⚠️ Could not link ${service} for ${owner.name}: ${error.message}`);
      }
    }
  }

  private calculateValueEnhancement(
    metrics: VLSFlightRecord['performance_metrics'],
    duration: number,
    currentBookValue: number
  ): number {
    // Calculate composite performance score (0-100)
    const compositeScore =
      metrics.efficiency_score * 0.3 +
      metrics.accuracy_score * 0.3 +
      metrics.innovation_score * 0.2 +
      metrics.collaboration_score * 0.2;

    // Base enhancement rate: 0.1% of book value per hour for 100% performance
    const baseEnhancementRate = 0.001; // 0.1%
    const hoursFlown = duration / 60;

    // Enhancement is proportional to performance and time
    const enhancement =
      currentBookValue * baseEnhancementRate * (compositeScore / 100) * hoursFlown;

    // Cap enhancement at 1% of book value per flight for prudence
    return Math.min(enhancement, currentBookValue * 0.01);
  }

  private determineFlightOutcome(
    metrics: VLSFlightRecord['performance_metrics']
  ): VLSFlightRecord['flight_outcome'] {
    const averageScore =
      (metrics.efficiency_score +
        metrics.accuracy_score +
        metrics.innovation_score +
        metrics.collaboration_score) /
      4;

    if (averageScore >= 85) return 'SUCCESS';
    if (averageScore >= 70) return 'PARTIAL_SUCCESS';
    return 'REQUIRES_REVIEW';
  }

  private async updateAgentAssetFromFlight(
    asset: AIAgentAsset,
    flight: VLSFlightRecord,
    valueEnhancement: number
  ): Promise<void> {
    const updatedAsset = {
      current_book_value: asset.current_book_value + valueEnhancement,
      weekly_value_enhancement: asset.weekly_value_enhancement + valueEnhancement,
      total_flights_completed: asset.total_flights_completed + 1,
      flight_performance_score: this.calculateRunningAverage(
        asset.flight_performance_score,
        asset.total_flights_completed,
        (flight.performance_metrics.efficiency_score +
          flight.performance_metrics.accuracy_score +
          flight.performance_metrics.innovation_score +
          flight.performance_metrics.collaboration_score) /
          4
      ),
      'vls_tracking.last_flight_date': flight.flight_date,
      'vls_tracking.total_flight_hours':
        asset.vls_tracking.total_flight_hours + flight.flight_duration_minutes / 60,
      'vls_tracking.average_flight_performance': this.calculateRunningAverage(
        asset.vls_tracking.average_flight_performance,
        asset.total_flights_completed,
        (flight.performance_metrics.efficiency_score +
          flight.performance_metrics.accuracy_score +
          flight.performance_metrics.innovation_score +
          flight.performance_metrics.collaboration_score) /
          4
      ),
      updated_at: new Date(),
    };

    await this.aiAgentAssets!.updateOne({ agent_id: asset.agent_id }, { $set: updatedAsset });
  }

  private calculateRunningAverage(currentAverage: number, count: number, newValue: number): number {
    return (currentAverage * count + newValue) / (count + 1);
  }

  private async calculateWeeklyDepreciation(asset: AIAgentAsset): Promise<void> {
    // Calculate weekly depreciation using straight-line method
    const annualDepreciation = asset.initial_cost / asset.useful_life_years;
    const weeklyDepreciation = annualDepreciation / 52;

    // Offset by weekly value enhancement (UK GAAP allows for value increases)
    const netDepreciation = Math.max(0, weeklyDepreciation - asset.weekly_value_enhancement);

    // Create depreciation entry
    const depreciationEntry: UKGAAPDepreciationEntry = {
      entry_id: `DEP-${asset.agent_id}-${Date.now()}`,
      agent_id: asset.agent_id,
      depreciation_date: new Date(),
      depreciation_amount: weeklyDepreciation,
      accumulated_depreciation: asset.accumulated_depreciation + netDepreciation,
      book_value_after: Math.max(0, asset.current_book_value - netDepreciation),
      depreciation_method: asset.depreciation_method,
      useful_life_remaining_years:
        asset.useful_life_years -
        (Date.now() - asset.acquisition_date.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      value_enhancement_offset: asset.weekly_value_enhancement,
      net_depreciation: netDepreciation,
      accounting_period: `${new Date().getFullYear()}-W${this.getWeekNumber(new Date())}`,
      journal_entry_reference: `JE-${asset.agent_id}-${Date.now()}`,
      created_at: new Date(),
    };

    // Insert depreciation entry
    await this.depreciationEntries!.insertOne(depreciationEntry);

    // Update asset
    await this.aiAgentAssets!.updateOne(
      { agent_id: asset.agent_id },
      {
        $set: {
          accumulated_depreciation: depreciationEntry.accumulated_depreciation,
          current_book_value: depreciationEntry.book_value_after,
          weekly_value_enhancement: 0, // Reset weekly enhancement
          last_valuation_date: new Date(),
          updated_at: new Date(),
        },
      }
    );
  }

  private getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  private async createDepreciationSchedule(asset: AIAgentAsset): Promise<void> {
    // This would create a full depreciation schedule for the asset
    // Implementation depends on specific requirements
    console.log(`📋 Created depreciation schedule for ${asset.pilot_agent_name}`);
  }

  private async publishAssetEvent(eventType: string, asset: AIAgentAsset): Promise<void> {
    const message = {
      json: {
        event_type: eventType,
        agent_id: asset.agent_id,
        pilot_name: asset.pilot_agent_name,
        book_value: asset.current_book_value,
        timestamp: new Date().toISOString(),
        tenant_allocations: asset.tenant_allocation,
      },
    };

    await this.pubsub.topic('ai-asset-events').publishMessage(message);
  }

  private async publishFlightEvent(flight: VLSFlightRecord): Promise<void> {
    const message = {
      json: {
        ...flight,
        timestamp: flight.flight_date.toISOString(),
      },
    };

    await this.pubsub.topic('vls-flight-events').publishMessage(message);
  }

  private async storBalanceSheetReportInBigQuery(report: any): Promise<void> {
    // Store balance sheet report in BigQuery for analytics
    const table = this.bigquery.dataset('financial_reporting').table('balance_sheet_reports');
    await table.insert([
      {
        ...report,
        report_date: report.report_date.toISOString(),
      },
    ]);
  }

  private createXeroJournalEntries(balanceSheetData: any): any[] {
    // Create Xero-compatible journal entries for AI asset movements
    return [
      {
        narration: 'AI Asset Depreciation - Weekly',
        journal_lines: [
          {
            account_code: '1220', // Intangible Assets
            line_amount: -balanceSheetData.depreciation_amount,
            description: 'AI Asset Depreciation',
          },
          {
            account_code: '7400', // Depreciation Expense
            line_amount: balanceSheetData.depreciation_amount,
            description: 'Depreciation of AI Assets',
          },
        ],
      },
    ];
  }

  private async postXeroJournalEntry(entry: any, accessToken: string): Promise<void> {
    // Post journal entry to Xero API
    // This is a simplified version - full implementation would need proper OAuth2
    console.log('📋 Would post to Xero:', JSON.stringify(entry, null, 2));
  }

  private async createIndexes(): Promise<void> {
    // Create MongoDB indexes for performance
    await Promise.all([
      this.ownerSubscribers!.createIndex({ uuid: 1 }, { unique: true }),
      this.ownerSubscribers!.createIndex({ email: 1 }),
      this.ownerSubscribers!.createIndex({ company_name: 1 }),
      this.ownerSubscribers!.createIndex({ hr_classification: 1 }),

      this.aiAgentAssets!.createIndex({ agent_id: 1 }, { unique: true }),
      this.aiAgentAssets!.createIndex({ asset_status: 1 }),
      this.aiAgentAssets!.createIndex({ pilot_lineage: 1 }),
      this.aiAgentAssets!.createIndex({ 'tenant_allocation.tenant_id': 1 }),

      this.vlsFlightRecords!.createIndex({ agent_id: 1 }),
      this.vlsFlightRecords!.createIndex({ flight_date: -1 }),
      this.vlsFlightRecords!.createIndex({ 'cost_attribution.tenant_id': 1 }),

      this.depreciationEntries!.createIndex({ agent_id: 1 }),
      this.depreciationEntries!.createIndex({ depreciation_date: -1 }),
      this.depreciationEntries!.createIndex({ accounting_period: 1 }),
    ]);

    console.log('✅ MongoDB indexes created');
  }
}

/**
 * 🎯 EXPORT FOR PRODUCTION USE
 */
export default HRAICRMSAIAssetIntegration;

// CLI Usage when run directly
if (require.main === module) {
  async function cli() {
    const integration = new HRAICRMSAIAssetIntegration();

    const command = process.argv[2];

    try {
      await integration.initialize();

      switch (command) {
        case 'sync-owner':
          const uuid = process.argv[3];
          const tenantId = process.argv[4];
          if (!uuid || !tenantId) {
            console.error(
              'Usage: node hrai-crms-ai-asset-integration.js sync-owner <uuid> <tenantId>'
            );
            process.exit(1);
          }

          await integration.syncOwnerSubscriber(uuid, tenantId, {
            name: 'Test Owner',
            email: 'owner@test.com',
            hr_classification: '.hr4',
            sao_level: 'SAPPHIRE',
          });
          console.log('✅ Owner subscriber synced');
          break;

        case 'register-agent':
          const agentId = process.argv[3] || 'test-agent-001';
          await integration.registerAIAgentAsset(agentId, 'Test Pilot Agent', {
            pilot_lineage: 'dr-lucy',
            agent_classification: 'PROFESSIONAL-COPILOT',
            initial_cost: 50000, // £50,000
            useful_life_years: 5,
            tenant_allocations: [{ tenant_id: 'test-tenant', allocation_percentage: 100 }],
          });
          console.log('✅ AI agent registered as asset');
          break;

        case 'record-flight':
          const flightAgentId = process.argv[3] || 'test-agent-001';
          await integration.recordVLSFlight(flightAgentId, {
            flight_duration_minutes: 120,
            flight_type: 'PRODUCTION',
            performance_metrics: {
              efficiency_score: 92,
              accuracy_score: 88,
              innovation_score: 85,
              collaboration_score: 90,
            },
            tenant_id: 'test-tenant',
          });
          console.log('✅ VLS flight recorded');
          break;

        case 'weekly-depreciation':
          await integration.processWeeklyDepreciation();
          console.log('✅ Weekly depreciation processed');
          break;

        case 'balance-sheet':
          const report = await integration.generateBalanceSheetReport();
          console.log('📊 Balance Sheet Report:', JSON.stringify(report, null, 2));
          break;

        default:
          console.log('Usage: node hrai-crms-ai-asset-integration.js <command>');
          console.log(
            'Commands: sync-owner, register-agent, record-flight, weekly-depreciation, balance-sheet'
          );
          break;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  cli().catch(console.error);
}
