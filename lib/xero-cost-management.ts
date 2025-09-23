/**
 * ████████████████████████████████████████████████████████████████
 * █              XERO COST MANAGEMENT INTEGRATION               █
 * ████████████████████████████████████████████████████████████████
 *
 * Real-time True Production Cost (TPC) tracking and automated billing
 * Integrates with Universal AI Key Manager v2 and Diamond SAO Command Center
 *
 * Features:
 * • Real-time cost allocation per tenant, user, and service
 * • Automated Xero invoice generation with component codes
 * • True Production Cost (TPC) analytics with mean, median, percentiles
 * • Weekly degradation analysis and optimization recommendations
 * • Global SGA and compliance cost rollups
 * • Profitability forecasting and ROI analysis
 *
 * @author AI Publishing International LLP
 * @version 1.0.0-enterprise
 * @license Proprietary - Diamond SAO Command Center
 */

import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import fetch from 'node-fetch';
import * as crypto from 'crypto';

// Xero API Types
export interface XeroContact {
  ContactID?: string;
  Name: string;
  EmailAddress?: string;
  ContactStatus?: 'ACTIVE' | 'ARCHIVED';
  DefaultCurrency?: string;
  ContactPersons?: Array<{
    FirstName?: string;
    LastName?: string;
    EmailAddress?: string;
  }>;
}

export interface XeroInvoice {
  Type: 'ACCREC' | 'ACCPAY';
  Contact: {
    ContactID?: string;
    Name?: string;
  };
  Date: string;
  DueDate?: string;
  Reference?: string;
  Status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID';
  LineItems: XeroLineItem[];
  CurrencyCode?: string;
  BrandingThemeID?: string;
}

export interface XeroLineItem {
  ItemCode?: string;
  Description: string;
  Quantity: number;
  UnitAmount: number;
  AccountCode: string;
  TaxType?: string;
  LineAmount?: number;
  TrackingCategories?: Array<{
    TrackingCategoryID: string;
    TrackingOptionID: string;
  }>;
}

// Analytics Types
export interface TPCAnalytics {
  tenantId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  periodStart: Date;
  periodEnd: Date;
  totalCost: number;
  totalRevenue: number;
  grossProfit: number;
  grossMargin: number;

  // Per-service breakdown
  serviceBreakdown: Array<{
    service: string;
    cost: number;
    usage: number;
    costPerUnit: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;

  // User analytics
  userAnalytics: {
    totalUsers: number;
    activeUsers: number;
    costPerUser: number;
    costPerActiveUser: number;
    topUsers: Array<{
      userId: string;
      cost: number;
      usage: number;
      efficiency: number;
    }>;
  };

  // Statistical analysis
  costDistribution: {
    mean: number;
    median: number;
    percentile95: number;
    percentile99: number;
    standardDeviation: number;
  };
}

export interface DegradationAnalysis {
  period: Date;
  servicesForRemoval: Array<{
    service: string;
    reason: string;
    costSavings: number;
    usageDecline: number;
    lastUsed: Date;
    impactAssessment: 'low' | 'medium' | 'high';
  }>;

  candidateServices: Array<{
    service: string;
    reason: string;
    expectedCost: number;
    expectedROI: number;
    userDemand: number;
    implementationEffort: 'low' | 'medium' | 'high';
  }>;

  recommendations: {
    costReduction: number;
    revenueIncrease: number;
    netBenefit: number;
    nextReviewDate: Date;
  };
}

/**
 * 💰 XERO COST MANAGEMENT SYSTEM
 */
export class XeroCostManager {
  private readonly gcpProject: string;
  private readonly bigquery: BigQuery;
  private readonly pubsub: PubSub;
  private readonly secretClient: SecretManagerServiceClient;
  private readonly xeroBaseUrl = 'https://api.xero.com/api.xro/2.0';

  // Component codes for AI services
  private readonly componentCodes = {
    hume: '13-HUME-AI-TTS',
    elevenlabs: '14-ELEVENLABS-TTS',
    openai: '15-OPENAI-API',
    anthropic: '16-ANTHROPIC-CLAUDE',
    deepgram: '17-DEEPGRAM-STT',
    'global-sga': '20-GLOBAL-SGA',
    'global-compliance': '21-GLOBAL-COMPLIANCE',
    infrastructure: '22-CLOUD-INFRA',
  };

  constructor(
    options: {
      gcpProject?: string;
    } = {}
  ) {
    this.gcpProject = options.gcpProject || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.bigquery = new BigQuery({ projectId: this.gcpProject });
    this.pubsub = new PubSub({ projectId: this.gcpProject });
    this.secretClient = new SecretManagerServiceClient();
  }

  /**
   * 🔄 REAL-TIME COST ALLOCATION PIPELINE
   * Processes usage events and calculates TPC per tenant/user
   */
  async initializeCostAllocationPipeline(): Promise<void> {
    console.log('🔄 Initializing real-time cost allocation pipeline...');

    // Create BigQuery datasets and tables if they don't exist
    await this.setupAnalyticsInfrastructure();

    // Set up Pub/Sub subscription for usage events
    const subscription = this.pubsub
      .topic('ai-usage-events')
      .subscription('cost-allocation-processor');

    subscription.on('message', async (message) => {
      try {
        const usageEvent = JSON.parse(message.data.toString());
        await this.processUsageEvent(usageEvent);
        message.ack();
      } catch (error) {
        console.error('Failed to process usage event:', error);
        message.nack();
      }
    });

    console.log('✅ Cost allocation pipeline active');
  }

  /**
   * 📊 COMPREHENSIVE TPC ANALYTICS
   * Generate detailed cost analysis with mean, median, trends
   */
  async generateTPCAnalytics(
    tenantId?: string,
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'daily',
    endDate: Date = new Date()
  ): Promise<TPCAnalytics[]> {
    console.log(`📊 Generating TPC analytics for ${tenantId || 'all tenants'} - ${period} period`);

    const periodDays = { daily: 1, weekly: 7, monthly: 30, quarterly: 90 };
    const startDate = new Date(endDate.getTime() - periodDays[period] * 24 * 60 * 60 * 1000);

    // Base analytics query
    let query = `
      WITH usage_summary AS (
        SELECT 
          tenant_id,
          user_id,
          service,
          DATE(timestamp) as usage_date,
          SUM(cost_usd) as daily_cost,
          COUNT(*) as daily_usage,
          SUM(tokens_used) as daily_tokens
        FROM \`${this.gcpProject}.ai_analytics.usage_events\`
        WHERE timestamp BETWEEN @start_date AND @end_date
    `;

    if (tenantId) {
      query += ` AND tenant_id = @tenant_id`;
    }

    query += `
        GROUP BY tenant_id, user_id, service, usage_date
      ),
      tenant_totals AS (
        SELECT 
          tenant_id,
          SUM(daily_cost) as total_cost,
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT CASE WHEN daily_usage > 0 THEN user_id END) as active_users,
          AVG(daily_cost) as mean_daily_cost,
          APPROX_QUANTILES(daily_cost, 100)[OFFSET(50)] as median_daily_cost,
          APPROX_QUANTILES(daily_cost, 100)[OFFSET(95)] as p95_daily_cost,
          APPROX_QUANTILES(daily_cost, 100)[OFFSET(99)] as p99_daily_cost,
          STDDEV(daily_cost) as cost_stddev
        FROM usage_summary
        GROUP BY tenant_id
      ),
      service_breakdown AS (
        SELECT 
          tenant_id,
          service,
          SUM(daily_cost) as service_cost,
          SUM(daily_usage) as service_usage,
          AVG(daily_cost) as avg_cost_per_day,
          -- Trend calculation (simple linear regression slope)
          CORR(UNIX_SECONDS(PARSE_DATE('%Y-%m-%d', CAST(usage_date AS STRING))), daily_cost) as cost_trend
        FROM usage_summary
        GROUP BY tenant_id, service
      )
      SELECT 
        tt.tenant_id,
        tt.total_cost,
        tt.total_users,
        tt.active_users,
        tt.mean_daily_cost,
        tt.median_daily_cost,
        tt.p95_daily_cost,
        tt.p99_daily_cost,
        tt.cost_stddev,
        ARRAY_AGG(STRUCT(
          sb.service,
          sb.service_cost as cost,
          sb.service_usage as usage,
          sb.service_cost / NULLIF(sb.service_usage, 0) as cost_per_unit,
          CASE 
            WHEN sb.cost_trend > 0.1 THEN 'increasing'
            WHEN sb.cost_trend < -0.1 THEN 'decreasing'
            ELSE 'stable'
          END as trend
        )) as service_breakdown
      FROM tenant_totals tt
      LEFT JOIN service_breakdown sb ON tt.tenant_id = sb.tenant_id
      GROUP BY tt.tenant_id, tt.total_cost, tt.total_users, tt.active_users, 
               tt.mean_daily_cost, tt.median_daily_cost, tt.p95_daily_cost, 
               tt.p99_daily_cost, tt.cost_stddev
      ORDER BY tt.total_cost DESC
    `;

    const queryParams: any = {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    if (tenantId) {
      queryParams.tenant_id = tenantId;
    }

    const [rows] = await this.bigquery.query({ query, params: queryParams });

    return rows.map((row: any) => ({
      tenantId: row.tenant_id,
      period,
      periodStart: startDate,
      periodEnd: endDate,
      totalCost: row.total_cost,
      totalRevenue: row.total_cost * 1.3, // Assuming 30% markup
      grossProfit: row.total_cost * 0.3,
      grossMargin: 0.3,
      serviceBreakdown: row.service_breakdown,
      userAnalytics: {
        totalUsers: row.total_users,
        activeUsers: row.active_users,
        costPerUser: row.total_cost / Math.max(row.total_users, 1),
        costPerActiveUser: row.total_cost / Math.max(row.active_users, 1),
        topUsers: [], // Would need additional query to get top users
      },
      costDistribution: {
        mean: row.mean_daily_cost,
        median: row.median_daily_cost,
        percentile95: row.p95_daily_cost,
        percentile99: row.p99_daily_cost,
        standardDeviation: row.cost_stddev,
      },
    }));
  }

  /**
   * 📉 WEEKLY DEGRADATION ANALYSIS
   * Identify services for removal and new opportunities
   */
  async performDegradationAnalysis(): Promise<DegradationAnalysis> {
    console.log('📉 Performing weekly degradation analysis...');

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 28 * 24 * 60 * 60 * 1000); // 4 weeks

    // Identify underutilized services
    const degradationQuery = `
      WITH service_usage AS (
        SELECT 
          service,
          COUNT(DISTINCT tenant_id) as active_tenants,
          COUNT(DISTINCT user_id) as active_users,
          SUM(cost_usd) as total_cost,
          COUNT(*) as usage_count,
          MAX(timestamp) as last_used,
          AVG(cost_usd) as avg_cost_per_call
        FROM \`${this.gcpProject}.ai_analytics.usage_events\`
        WHERE timestamp >= @start_date
        GROUP BY service
      ),
      usage_trends AS (
        SELECT 
          service,
          CORR(UNIX_SECONDS(timestamp), cost_usd) as cost_trend,
          COUNT(*) as recent_usage
        FROM \`${this.gcpProject}.ai_analytics.usage_events\`
        WHERE timestamp >= @recent_start
        GROUP BY service
      )
      SELECT 
        su.service,
        su.active_tenants,
        su.active_users,
        su.total_cost,
        su.usage_count,
        su.last_used,
        su.avg_cost_per_call,
        COALESCE(ut.recent_usage, 0) as recent_usage,
        COALESCE(ut.cost_trend, 0) as cost_trend
      FROM service_usage su
      LEFT JOIN usage_trends ut ON su.service = ut.service
      ORDER BY su.total_cost DESC
    `;

    const [rows] = await this.bigquery.query({
      query: degradationQuery,
      params: {
        start_date: startDate.toISOString(),
        recent_start: new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    const servicesForRemoval = rows
      .filter(
        (row: any) =>
          row.recent_usage < 10 || // Less than 10 uses in past week
          row.active_tenants < 2 || // Used by less than 2 tenants
          endDate.getTime() - new Date(row.last_used).getTime() > 14 * 24 * 60 * 60 * 1000 // Not used in 2 weeks
      )
      .map((row: any) => ({
        service: row.service,
        reason: this.getDegradationReason(row),
        costSavings: row.total_cost,
        usageDecline: Math.max(0, (row.usage_count - row.recent_usage) / row.usage_count),
        lastUsed: new Date(row.last_used),
        impactAssessment: this.assessRemovalImpact(row),
      }));

    // Calculate total savings and recommendations
    const totalCostSavings = servicesForRemoval.reduce(
      (sum, service) => sum + service.costSavings,
      0
    );

    return {
      period: endDate,
      servicesForRemoval,
      candidateServices: [], // Would be populated from market analysis
      recommendations: {
        costReduction: totalCostSavings,
        revenueIncrease: 0,
        netBenefit: totalCostSavings,
        nextReviewDate: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    };
  }

  /**
   * 💰 AUTOMATED XERO INVOICE GENERATION
   * Create itemized invoices with component codes
   */
  async generateXeroInvoices(date: Date = new Date()): Promise<void> {
    console.log(`💰 Generating Xero invoices for ${date.toISOString().split('T')[0]}`);

    // Get TPC analytics for all tenants
    const analytics = await this.generateTPCAnalytics(undefined, 'daily', date);

    // Get Xero access token
    const accessToken = await this.getXeroAccessToken();

    for (const tenantAnalytics of analytics) {
      if (tenantAnalytics.totalCost < 0.1) {
        console.log(
          `⏭️ Skipping ${tenantAnalytics.tenantId} - cost too low ($${tenantAnalytics.totalCost.toFixed(2)})`
        );
        continue;
      }

      try {
        // Get or create Xero contact
        const contactId = await this.ensureXeroContact(tenantAnalytics.tenantId, accessToken);

        // Build line items
        const lineItems: XeroLineItem[] = [];

        // Add service costs
        for (const service of tenantAnalytics.serviceBreakdown) {
          if (service.cost > 0.01) {
            lineItems.push({
              ItemCode:
                this.componentCodes[service.service] || `99-${service.service.toUpperCase()}`,
              Description: `${service.service} AI Service - ${service.usage} calls`,
              Quantity: service.usage,
              UnitAmount: service.costPerUnit,
              AccountCode: '4000', // Revenue account
              TaxType: 'NONE',
            });
          }
        }

        // Add SGA allocation (10% of total)
        const sgaAmount = tenantAnalytics.totalCost * 0.1;
        lineItems.push({
          ItemCode: this.componentCodes['global-sga'],
          Description: 'Global SG&A Allocation',
          Quantity: 1,
          UnitAmount: sgaAmount,
          AccountCode: '4100', // SGA Revenue
          TaxType: 'NONE',
        });

        // Add compliance costs (5% of total)
        const complianceAmount = tenantAnalytics.totalCost * 0.05;
        lineItems.push({
          ItemCode: this.componentCodes['global-compliance'],
          Description: 'Global Compliance Costs (GDPR/SOC2/VAT)',
          Quantity: 1,
          UnitAmount: complianceAmount,
          AccountCode: '4200', // Compliance Revenue
          TaxType: 'NONE',
        });

        // Create invoice
        const invoice: XeroInvoice = {
          Type: 'ACCREC',
          Contact: { ContactID: contactId },
          Date: date.toISOString().split('T')[0],
          DueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Reference: `AI-USAGE-${tenantAnalytics.tenantId}-${date.toISOString().split('T')[0]}`,
          Status: 'AUTHORISED',
          LineItems: lineItems,
          CurrencyCode: 'USD',
        };

        const createdInvoice = await this.createXeroInvoice(invoice, accessToken);
        console.log(
          `✅ Created Xero invoice ${createdInvoice.InvoiceNumber} for ${tenantAnalytics.tenantId}: $${tenantAnalytics.totalCost.toFixed(2)}`
        );
      } catch (error) {
        console.error(`❌ Failed to create invoice for ${tenantAnalytics.tenantId}:`, error);
      }
    }
  }

  /**
   * 📈 QUARTERLY PROFITABILITY FORECAST
   * Generate 3-quarter forward projections
   */
  async generateProfitabilityForecast(): Promise<any> {
    console.log('📈 Generating quarterly profitability forecast...');

    // Get historical data for trend analysis
    const query = `
      WITH monthly_totals AS (
        SELECT 
          EXTRACT(YEAR FROM timestamp) as year,
          EXTRACT(MONTH FROM timestamp) as month,
          COUNT(DISTINCT tenant_id) as active_tenants,
          COUNT(DISTINCT user_id) as active_users,
          SUM(cost_usd) as total_cost,
          COUNT(*) as total_usage
        FROM \`${this.gcpProject}.ai_analytics.usage_events\`
        WHERE timestamp >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY year, month
        ORDER BY year, month
      )
      SELECT 
        year,
        month,
        active_tenants,
        active_users,
        total_cost,
        total_usage,
        total_cost / active_tenants as cost_per_tenant,
        total_cost / active_users as cost_per_user,
        total_usage / active_users as usage_per_user
      FROM monthly_totals
    `;

    const [historicalData] = await this.bigquery.query({ query });

    // Simple linear regression for forecasting
    const forecast = this.generateLinearForecast(historicalData, 3); // 3 quarters ahead

    return {
      historical: historicalData,
      forecast,
      nextQuarterProjections: {
        totalCost: forecast[0]?.projected_cost || 0,
        totalRevenue: (forecast[0]?.projected_cost || 0) * 1.3,
        grossProfit: (forecast[0]?.projected_cost || 0) * 0.3,
        netProfit: (forecast[0]?.projected_cost || 0) * 0.15, // Assuming 15% net margin
        projectionConfidence: 0.85,
      },
    };
  }

  // Private helper methods...

  private async setupAnalyticsInfrastructure(): Promise<void> {
    // Create BigQuery dataset
    try {
      await this.bigquery.dataset('ai_analytics').get({ autoCreate: true });
      console.log('✅ BigQuery dataset ready');
    } catch (error) {
      console.log('⚠️ BigQuery dataset setup skipped:', error.message);
    }

    // Create usage events table schema
    const usageEventsSchema = [
      { name: 'trace_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'tenant_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'user_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'service', type: 'STRING', mode: 'REQUIRED' },
      { name: 'operation', type: 'STRING', mode: 'REQUIRED' },
      { name: 'tokens_used', type: 'INTEGER', mode: 'REQUIRED' },
      { name: 'duration_ms', type: 'INTEGER', mode: 'REQUIRED' },
      { name: 'cost_usd', type: 'FLOAT', mode: 'REQUIRED' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'gcp_project', type: 'STRING', mode: 'REQUIRED' },
      { name: 'region', type: 'STRING', mode: 'REQUIRED' },
    ];

    try {
      const table = this.bigquery.dataset('ai_analytics').table('usage_events');
      await table.get({
        autoCreate: true,
        schema: { fields: usageEventsSchema },
      });
      console.log('✅ Usage events table ready');
    } catch (error) {
      console.log('⚠️ Usage events table setup skipped:', error.message);
    }
  }

  private async processUsageEvent(event: any): Promise<void> {
    // Insert into BigQuery for analytics
    const row = {
      trace_id: event.traceId,
      tenant_id: event.tenantId,
      user_id: event.userId,
      service: event.service,
      operation: event.operation,
      tokens_used: event.tokensUsed,
      duration_ms: event.durationMs,
      cost_usd: event.costUsd,
      timestamp: event.timestamp,
      gcp_project: event.gcpProject,
      region: event.region,
    };

    try {
      await this.bigquery.dataset('ai_analytics').table('usage_events').insert([row]);

      console.log(
        `📊 Usage event processed: ${event.tenantId} - ${event.service} - $${event.costUsd.toFixed(4)}`
      );
    } catch (error) {
      console.error('Failed to insert usage event:', error);
      throw error;
    }
  }

  private async getXeroAccessToken(): Promise<string> {
    const tokenSecret = await this.secretClient.accessSecretVersion({
      name: `projects/${this.gcpProject}/secrets/xero-oauth-token/versions/latest`,
    });

    const tokenData = JSON.parse(tokenSecret[0].payload?.data?.toString('utf8') || '{}');
    return tokenData.access_token;
  }

  private async ensureXeroContact(tenantId: string, accessToken: string): Promise<string> {
    const contactName = `MCP ${tenantId.toUpperCase()}`;

    // Search for existing contact
    const searchResponse = await fetch(
      `${this.xeroBaseUrl}/Contacts?where=Name%3D%3D%22${encodeURIComponent(contactName)}%22`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.Contacts && searchResult.Contacts.length > 0) {
        return searchResult.Contacts[0].ContactID;
      }
    }

    // Create new contact
    const newContact: XeroContact = {
      Name: contactName,
      EmailAddress: `billing@${tenantId}.mcp.2100.cool`,
      ContactStatus: 'ACTIVE',
      DefaultCurrency: 'USD',
    };

    const createResponse = await fetch(`${this.xeroBaseUrl}/Contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Contacts: [newContact] }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create Xero contact: ${await createResponse.text()}`);
    }

    const createResult = await createResponse.json();
    return createResult.Contacts[0].ContactID;
  }

  private async createXeroInvoice(invoice: XeroInvoice, accessToken: string): Promise<any> {
    const response = await fetch(`${this.xeroBaseUrl}/Invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Invoices: [invoice] }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Xero invoice: ${error}`);
    }

    const result = await response.json();
    return result.Invoices[0];
  }

  private getDegradationReason(row: any): string {
    if (row.recent_usage === 0) return 'No recent usage';
    if (row.active_tenants < 2) return 'Low tenant adoption';
    if (row.cost_trend < -0.5) return 'Declining cost efficiency';
    return 'Underutilized service';
  }

  private assessRemovalImpact(row: any): 'low' | 'medium' | 'high' {
    if (row.active_tenants <= 1 && row.total_cost < 50) return 'low';
    if (row.active_tenants <= 3 && row.total_cost < 200) return 'medium';
    return 'high';
  }

  private generateLinearForecast(historicalData: any[], periodsAhead: number): any[] {
    // Simple linear regression implementation for cost forecasting
    const n = historicalData.length;
    if (n < 2) return [];

    const sumX = historicalData.reduce((sum, _, i) => sum + i, 0);
    const sumY = historicalData.reduce((sum, d) => sum + d.total_cost, 0);
    const sumXY = historicalData.reduce((sum, d, i) => sum + i * d.total_cost, 0);
    const sumX2 = historicalData.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast = [];
    for (let i = 0; i < periodsAhead; i++) {
      const nextPeriod = n + i;
      forecast.push({
        period: nextPeriod,
        projected_cost: intercept + slope * nextPeriod,
        confidence: Math.max(0.5, 1 - i * 0.15), // Decreasing confidence
      });
    }

    return forecast;
  }
}

/**
 * 🎯 EXPORT FOR PRODUCTION USE
 */
export default XeroCostManager;

// CLI Usage when run directly
if (require.main === module) {
  async function cli() {
    const costManager = new XeroCostManager();

    const command = process.argv[2];

    try {
      switch (command) {
        case 'analytics':
          const analytics = await costManager.generateTPCAnalytics();
          console.log('📊 TPC Analytics:', JSON.stringify(analytics, null, 2));
          break;

        case 'degradation':
          const degradation = await costManager.performDegradationAnalysis();
          console.log('📉 Degradation Analysis:', JSON.stringify(degradation, null, 2));
          break;

        case 'xero-invoices':
          await costManager.generateXeroInvoices();
          console.log('✅ Xero invoices generated');
          break;

        case 'forecast':
          const forecast = await costManager.generateProfitabilityForecast();
          console.log('📈 Profitability Forecast:', JSON.stringify(forecast, null, 2));
          break;

        case 'setup':
          await costManager.initializeCostAllocationPipeline();
          console.log('✅ Cost allocation pipeline initialized');
          break;

        default:
          console.log('Usage: node xero-cost-management.js <command>');
          console.log('Commands: analytics, degradation, xero-invoices, forecast, setup');
          break;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  cli().catch(console.error);
}
