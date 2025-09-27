/**
 * @fileoverview Enhanced Dashboard Route with Evidence-Based Insights
 *
 * Secure, personalized dashboard endpoint that integrates:
 * - SallyPort OAuth2 authentication
 * - Personalized context building
 * - Market intelligence with evidence chains
 * - Citation rendering with footnotes
 */

const express = require('express');
const router = express.Router();

// Import middleware and services
const {
  personalizationContextMiddleware,
} = require('../services/middleware/personalizationContext');
const { getMarketBrief } = require('../services/insights/insightService');
const { ASOOSCrypto } = require('../lib/crypto-security.js');

// Import authentication middleware
const { requireAuth, requireSallyPortAuth } = require('../middleware/auth');
const { validateOrganization } = require('../middleware/organization');

const crypto = new ASOOSCrypto();

/**
 * Dashboard main route with full evidence-based insights
 *
 * Flow:
 * 1. Authenticate user via SallyPort
 * 2. Validate organization context
 * 3. Build personalization context (Firestore + Pinecone)
 * 4. Generate market insights with evidence
 * 5. Render dashboard with citations
 */
router.get(
  '/dashboard',
  requireAuth, // Basic auth check
  requireSallyPortAuth, // SallyPort verification
  validateOrganization, // Org context validation
  personalizationContextMiddleware(), // Build rich context
  async (req, res) => {
    const requestId = crypto.generateSecureToken();
    const startTime = Date.now();

    try {
      console.log(`[${requestId}] Dashboard request for user ${req.user.id}, org ${req.org?.id}`);

      // Get personalization context from middleware
      const ctx = req.personalizationContext;

      if (!ctx) {
        console.warn(`[${requestId}] No personalization context available, using fallback`);
        return renderBasicDashboard(req, res, requestId);
      }

      console.log(
        `[${requestId}] Context built: ${ctx.content.relevantTopics.length} topics, ${ctx.content.knowledgeAreas.length} knowledge areas`
      );

      // Generate market brief with evidence
      const insights = await getMarketBrief(ctx);

      console.log(
        `[${requestId}] Generated ${insights.insights.length} insights with ${insights.evidence.length} evidence items`
      );

      // Track dashboard view
      recordDashboardView({
        requestId,
        userId: req.user.id,
        orgId: req.org.id,
        insightCount: insights.insights.length,
        evidenceCount: insights.evidence.length,
        processingTime: Date.now() - startTime,
      });

      // Render dashboard with full context
      res.render('dashboard', {
        user: req.user,
        organization: req.org,
        ctx,
        insights,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
        // Helper functions for the template
        helpers: {
          formatCitations: formatCitations,
          formatTimestamp: formatTimestamp,
          getConfidenceClass: getConfidenceClass,
          getImpactBadge: getImpactBadge,
        },
      });
    } catch (error) {
      console.error(`[${requestId}] Dashboard error:`, error);

      // Track error for analytics
      recordDashboardError({
        requestId,
        userId: req.user?.id,
        orgId: req.org?.id,
        error: error.message,
        stack: error.stack,
      });

      // Render error dashboard
      res.status(500).render('dashboard-error', {
        error: 'Unable to load personalized insights',
        requestId,
        user: req.user,
        organization: req.org,
      });
    }
  }
);

/**
 * Dashboard API endpoint for programmatic access
 */
router.get(
  '/api/dashboard',
  requireAuth,
  requireSallyPortAuth,
  validateOrganization,
  personalizationContextMiddleware(),
  async (req, res) => {
    const requestId = crypto.generateSecureToken();

    try {
      const ctx = req.personalizationContext;
      if (!ctx) {
        return res.status(400).json({
          error: 'Personalization context not available',
          requestId,
        });
      }

      const insights = await getMarketBrief(ctx);

      res.json({
        success: true,
        requestId,
        data: {
          context: {
            user: ctx.user,
            organization: ctx.organization,
            contentSummary: {
              topics: ctx.content.relevantTopics.length,
              knowledgeAreas: ctx.content.knowledgeAreas.length,
              recentInsights: ctx.content.recentInsights.length,
            },
          },
          insights: insights.insights,
          evidence: insights.evidence,
          summary: insights.summary,
          metrics: insights.metrics,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: insights.metadata.processingTime,
        },
      });
    } catch (error) {
      console.error(`[${requestId}] Dashboard API error:`, error);

      res.status(500).json({
        error: 'Failed to generate insights',
        requestId,
        details: error.message,
      });
    }
  }
);

/**
 * Individual insight details with full evidence chain
 */
router.get('/dashboard/insight/:insightId', requireAuth, requireSallyPortAuth, async (req, res) => {
  const { insightId } = req.params;
  const requestId = crypto.generateSecureToken();

  try {
    // In a real implementation, you'd fetch from a cache or regenerate
    // For now, we'll redirect to main dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error(`[${requestId}] Insight detail error:`, error);
    res.status(404).render('insight-not-found', {
      insightId,
      requestId,
    });
  }
});

/**
 * Fallback dashboard for when personalization context fails
 */
async function renderBasicDashboard(req, res, requestId) {
  try {
    const basicContext = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      organization: {
        id: req.org?.id || 'unknown',
        name: req.org?.name || 'Your Organization',
      },
    };

    const basicInsights = {
      briefId: requestId,
      timestamp: Date.now(),
      user: req.user.name,
      organization: req.org?.name || 'Your Organization',
      summary: {
        totalInsights: 0,
        highConfidence: 0,
        sourcesCited: 0,
      },
      insights: [],
      evidence: [],
      metadata: {
        generatedAt: Date.now(),
        processingTime: 0,
        fallback: true,
      },
    };

    res.render('dashboard', {
      user: req.user,
      organization: req.org,
      ctx: basicContext,
      insights: basicInsights,
      fallback: true,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Basic dashboard error:`, error);
    res.status(500).render('error', {
      message: 'Dashboard temporarily unavailable',
    });
  }
}

/**
 * Helper functions for template rendering
 */
function formatCitations(evidence) {
  return evidence.map((item, index) => `[${index + 1}]`).join('');
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getConfidenceClass(confidence) {
  if (confidence >= 0.8) {
    return 'confidence-high';
  }
  if (confidence >= 0.6) {
    return 'confidence-medium';
  }
  return 'confidence-low';
}

function getImpactBadge(impact) {
  const badges = {
    high: '<span class=\"badge badge-danger\">High Impact</span>',
    medium: '<span class=\"badge badge-warning\">Medium Impact</span>',
    low: '<span class=\"badge badge-info\">Low Impact</span>',
  };
  return badges[impact] || '<span class=\"badge badge-secondary\">Unknown</span>';
}

/**
 * Analytics tracking functions
 */
function recordDashboardView(metadata) {
  // Async analytics - don't block response
  process.nextTick(() => {
    console.log('Dashboard view:', metadata);
    // Would integrate with your analytics system
  });
}

function recordDashboardError(errorData) {
  // Async error tracking
  process.nextTick(() => {
    console.error('Dashboard error tracked:', errorData);
    // Would integrate with error tracking system
  });
}

module.exports = router;
