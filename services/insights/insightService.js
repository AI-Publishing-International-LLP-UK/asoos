/**
 * @fileoverview Market Intelligence Insight Service
 *
 * Generates market briefings with fully documented evidence chains.
 * Each insight includes citations and source attribution for transparency
 * and accountability in AI-generated content.
 */

const { ASOOSCrypto } = require('../../lib/crypto-security.js');
const crypto = new ASOOSCrypto();

// Import data sources
const marketDataService = require('../data/marketDataService');
const pineconeService = require('../data/pineconeService');
const firestoreService = require('../data/firestoreService');

/**
 * Evidence types for citation tracking
 */
const EVIDENCE_TYPES = {
  WEB_SCRAPE: 'web_scrape',
  API_RESPONSE: 'api_response',
  DATABASE_QUERY: 'database_query',
  ML_INFERENCE: 'ml_inference',
  USER_INPUT: 'user_input',
  CACHED_RESULT: 'cached_result',
};

/**
 * Generates a comprehensive market brief with evidence trails
 *
 * @param {Object} context - Personalization context from middleware
 * @returns {Promise<Object>} - Market brief with insights and evidence
 */
async function getMarketBrief(context) {
  if (!context || !context.user) {
    throw new Error('Valid personalization context required');
  }

  const briefId = crypto.generateSecureToken();
  const timestamp = Date.now();

  try {
    // 1. Gather market data based on user context
    const marketData = await gatherMarketData(context);

    // 2. Generate insights using AI/ML pipeline
    const insights = await generateInsights(marketData, context);

    // 3. Build evidence chain for each insight
    const insightsWithEvidence = await buildEvidenceChains(insights, marketData);

    // 4. Create summary metrics
    const metrics = calculateBriefMetrics(insightsWithEvidence, marketData);

    // 5. Record brief generation for analytics
    recordBriefGeneration({
      briefId,
      userId: context.user.id,
      orgId: context.organization.id,
      timestamp,
      insightCount: insightsWithEvidence.length,
      evidenceCount: countTotalEvidence(insightsWithEvidence),
    });

    return {
      briefId,
      timestamp,
      user: context.user.name,
      organization: context.organization.name,
      summary: {
        totalInsights: insightsWithEvidence.length,
        highConfidence: insightsWithEvidence.filter((i) => i.confidence > 0.8).length,
        sourcesCited: countUniqueSources(insightsWithEvidence),
      },
      insights: insightsWithEvidence,
      metrics,
      evidence: extractAllEvidence(insightsWithEvidence),
      metadata: {
        generatedAt: timestamp,
        contextId: context.contextId,
        processingTime: Date.now() - timestamp,
      },
    };
  } catch (error) {
    console.error('Error generating market brief:', error);
    throw new Error(`Failed to generate market brief: ${error.message}`);
  }
}

/**
 * Gathers relevant market data based on user context
 *
 * @param {Object} context - User/org personalization context
 * @returns {Promise<Object>} - Collected market data with sources
 */
async function gatherMarketData(context) {
  const promises = [];
  const evidence = [];

  // Industry-specific data based on user's organization
  if (context.organization?.industry) {
    promises.push(
      marketDataService.getIndustryTrends(context.organization.industry).then((data) => {
        evidence.push({
          type: EVIDENCE_TYPES.API_RESPONSE,
          source: 'Industry Trends API',
          query: `industry=${context.organization.industry}`,
          timestamp: Date.now(),
          dataPoints: data.length,
        });
        return { industryTrends: data };
      })
    );
  }

  // Topic-specific data based on user interests
  if (context.content?.relevantTopics?.length > 0) {
    promises.push(
      marketDataService
        .getTopicInsights(context.content.relevantTopics.slice(0, 5))
        .then((data) => {
          evidence.push({
            type: EVIDENCE_TYPES.DATABASE_QUERY,
            source: 'Market Intelligence Database',
            query: `topics=${context.content.relevantTopics.slice(0, 5).join(',')}`,
            timestamp: Date.now(),
            recordsReturned: data.length,
          });
          return { topicInsights: data };
        })
    );
  }

  // Vector-based similar content
  if (context.content?.recentInsights?.length > 0) {
    promises.push(
      pineconeService.findSimilarTrends(context.content.recentInsights[0]).then((data) => {
        evidence.push({
          type: EVIDENCE_TYPES.ML_INFERENCE,
          source: 'Pinecone Vector Database',
          query: 'similarity_search',
          timestamp: Date.now(),
          vectorDimensions: 1536,
          matchCount: data.length,
        });
        return { similarTrends: data };
      })
    );
  }

  // Competitor analysis if organization has competitors defined
  if (context.organization?.competitors?.length > 0) {
    promises.push(
      marketDataService.getCompetitorActivity(context.organization.competitors).then((data) => {
        evidence.push({
          type: EVIDENCE_TYPES.WEB_SCRAPE,
          source: 'Competitor Monitoring',
          query: `competitors=${context.organization.competitors.join(',')}`,
          timestamp: Date.now(),
          sitesScraped: context.organization.competitors.length,
        });
        return { competitorActivity: data };
      })
    );
  }

  const results = await Promise.allSettled(promises);
  const marketData = {};

  // Combine successful results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      Object.assign(marketData, result.value);
    } else {
      console.warn(`Market data source ${index} failed:`, result.reason);
    }
  });

  return {
    data: marketData,
    evidence: evidence,
    timestamp: Date.now(),
  };
}

/**
 * Generates insights using AI/ML analysis
 *
 * @param {Object} marketData - Raw market data
 * @param {Object} context - User context
 * @returns {Promise<Array>} - Generated insights
 */
async function generateInsights(marketData, context) {
  const insights = [];

  // Industry trend analysis
  if (marketData.data.industryTrends) {
    const trendInsight = await analyzeTrends(
      marketData.data.industryTrends,
      context.organization.industry
    );
    insights.push({
      id: crypto.generateSecureToken(),
      type: 'trend_analysis',
      title: `${context.organization.industry} Market Trends`,
      content: trendInsight.analysis,
      confidence: trendInsight.confidence,
      impact: trendInsight.impact,
      timeframe: '90 days',
      sourceData: 'industryTrends',
    });
  }

  // Competitive landscape insights
  if (marketData.data.competitorActivity) {
    const competitorInsight = await analyzeCompetitors(
      marketData.data.competitorActivity,
      context.organization
    );
    insights.push({
      id: crypto.generateSecureToken(),
      type: 'competitive_analysis',
      title: 'Competitive Landscape Update',
      content: competitorInsight.analysis,
      confidence: competitorInsight.confidence,
      impact: competitorInsight.impact,
      timeframe: '30 days',
      sourceData: 'competitorActivity',
    });
  }

  // Topic-based insights
  if (marketData.data.topicInsights) {
    const topicInsight = await analyzeTopics(
      marketData.data.topicInsights,
      context.content.relevantTopics
    );
    insights.push({
      id: crypto.generateSecureToken(),
      type: 'topic_analysis',
      title: 'Relevant Topic Insights',
      content: topicInsight.analysis,
      confidence: topicInsight.confidence,
      impact: topicInsight.impact,
      timeframe: '60 days',
      sourceData: 'topicInsights',
    });
  }

  // Emerging opportunities
  const opportunityInsight = await identifyOpportunities(marketData.data, context);
  if (opportunityInsight) {
    insights.push({
      id: crypto.generateSecureToken(),
      type: 'opportunity_identification',
      title: 'Emerging Opportunities',
      content: opportunityInsight.analysis,
      confidence: opportunityInsight.confidence,
      impact: opportunityInsight.impact,
      timeframe: '180 days',
      sourceData: 'combined_analysis',
    });
  }

  return insights;
}

/**
 * Builds evidence chains for each insight
 *
 * @param {Array} insights - Generated insights
 * @param {Object} marketData - Source market data with evidence
 * @returns {Promise<Array>} - Insights with evidence chains
 */
async function buildEvidenceChains(insights, marketData) {
  return Promise.all(
    insights.map(async (insight) => {
      const evidence = [];

      // Find relevant evidence from market data collection
      marketData.evidence.forEach((evidenceItem, index) => {
        // Match evidence to insight based on source data used
        if (shouldIncludeEvidence(insight.sourceData, evidenceItem)) {
          evidence.push({
            id: index + 1,
            type: evidenceItem.type,
            source: evidenceItem.source,
            description: generateEvidenceDescription(evidenceItem),
            timestamp: evidenceItem.timestamp,
            reliability: calculateReliability(evidenceItem),
            url: evidenceItem.url || null,
          });
        }
      });

      // Add ML model evidence if this insight used AI analysis
      if (['trend_analysis', 'competitive_analysis', 'topic_analysis'].includes(insight.type)) {
        evidence.push({
          id: evidence.length + 1,
          type: EVIDENCE_TYPES.ML_INFERENCE,
          source: 'AIXTIV Market Intelligence Model',
          description: `AI analysis using ${insight.type} model with ${insight.confidence} confidence`,
          timestamp: Date.now(),
          reliability: insight.confidence,
          modelVersion: '2.1.0',
        });
      }

      return {
        ...insight,
        evidence,
        citations: evidence.map((e) => `[${e.id}]`).join(''),
      };
    })
  );
}

/**
 * Helper function to determine if evidence should be included
 */
function shouldIncludeEvidence(sourceData, evidenceItem) {
  const sourceMap = {
    industryTrends: ['Industry Trends API'],
    competitorActivity: ['Competitor Monitoring', 'Web Scraping'],
    topicInsights: ['Market Intelligence Database'],
    combined_analysis: ['all'], // Include all evidence for opportunity insights
  };

  const relevantSources = sourceMap[sourceData] || [];
  return (
    relevantSources.includes('all') ||
    relevantSources.some((source) => evidenceItem.source.includes(source))
  );
}

/**
 * Generates human-readable evidence descriptions
 */
function generateEvidenceDescription(evidenceItem) {
  switch (evidenceItem.type) {
    case EVIDENCE_TYPES.API_RESPONSE:
      return `API query returned ${evidenceItem.dataPoints} data points for ${evidenceItem.query}`;
    case EVIDENCE_TYPES.DATABASE_QUERY:
      return `Database search returned ${evidenceItem.recordsReturned} records for ${evidenceItem.query}`;
    case EVIDENCE_TYPES.WEB_SCRAPE:
      return `Web scraping of ${evidenceItem.sitesScraped} competitor sites`;
    case EVIDENCE_TYPES.ML_INFERENCE:
      return `Vector similarity search with ${evidenceItem.vectorDimensions} dimensions, ${evidenceItem.matchCount} matches`;
    default:
      return 'Data analysis performed';
  }
}

/**
 * Calculates reliability score for evidence
 */
function calculateReliability(evidenceItem) {
  const reliabilityScores = {
    [EVIDENCE_TYPES.API_RESPONSE]: 0.9,
    [EVIDENCE_TYPES.DATABASE_QUERY]: 0.95,
    [EVIDENCE_TYPES.WEB_SCRAPE]: 0.7,
    [EVIDENCE_TYPES.ML_INFERENCE]: 0.8,
    [EVIDENCE_TYPES.USER_INPUT]: 0.6,
    [EVIDENCE_TYPES.CACHED_RESULT]: 0.85,
  };

  return reliabilityScores[evidenceItem.type] || 0.5;
}

/**
 * Helper functions for insight analysis (mock implementations)
 */
async function analyzeTrends(data, industry) {
  return {
    analysis: `Industry analysis for ${industry} sector shows emerging trends based on ${data.length} data points.`,
    confidence: 0.82,
    impact: 'medium',
  };
}

async function analyzeCompetitors(data, org) {
  return {
    analysis: `Competitive analysis reveals market positioning opportunities for ${org.name}.`,
    confidence: 0.75,
    impact: 'high',
  };
}

async function analyzeTopics(data, topics) {
  return {
    analysis: `Topic analysis of ${topics.join(', ')} shows relevant market developments.`,
    confidence: 0.88,
    impact: 'medium',
  };
}

async function identifyOpportunities(data, context) {
  return {
    analysis: `Cross-analysis identifies potential opportunities in ${context.organization.industry} sector.`,
    confidence: 0.72,
    impact: 'high',
  };
}

/**
 * Utility functions
 */
function calculateBriefMetrics(insights, marketData) {
  return {
    avgConfidence: insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length,
    dataSourcesUsed: marketData.evidence.length,
    highImpactInsights: insights.filter((i) => i.impact === 'high').length,
    processingTime: Date.now() - marketData.timestamp,
  };
}

function countTotalEvidence(insights) {
  return insights.reduce((total, insight) => total + insight.evidence.length, 0);
}

function countUniqueSources(insights) {
  const sources = new Set();
  insights.forEach((insight) => {
    insight.evidence.forEach((evidence) => {
      sources.add(evidence.source);
    });
  });
  return sources.size;
}

function extractAllEvidence(insights) {
  const allEvidence = [];
  const evidenceMap = new Map();

  insights.forEach((insight) => {
    insight.evidence.forEach((evidence) => {
      if (!evidenceMap.has(evidence.id)) {
        evidenceMap.set(evidence.id, evidence);
        allEvidence.push(evidence);
      }
    });
  });

  return allEvidence.sort((a, b) => a.id - b.id);
}

function recordBriefGeneration(metadata) {
  // Async recording - don't block response
  firestoreService
    .recordBriefGeneration(metadata)
    .catch((err) => console.error('Failed to record brief generation:', err));
}

module.exports = {
  getMarketBrief,
  EVIDENCE_TYPES,
};
