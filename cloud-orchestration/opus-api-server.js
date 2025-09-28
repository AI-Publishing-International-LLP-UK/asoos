/**
 * OPUS API SERVER
 * 
 * Express API server to serve the Eleven Opus ERP Orchestrator
 * Provides immediate access to 1.5M workflows and 18.65M agents
 */

const express = require('express');
const cors = require('cors');
const ElevenOpusERPOrchestrator = require('./eleven-opus-erp-orchestrator');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize orchestrator
const orchestrator = new ElevenOpusERPOrchestrator();
let isInitialized = false;

// Initialize on startup
(async () => {
  try {
    console.log('🚀 Starting Opus API Server...');
    await orchestrator.initialize();
    isInitialized = true;
    console.log('✅ Opus API Server ready for ERP orchestration');
  } catch (error) {
    console.error('❌ Failed to initialize orchestrator:', error);
  }
})();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Eleven Opus ERP API',
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  });
});

// Get system status
app.get('/api/v1/status', (req, res) => {
  try {
    const status = orchestrator.getSystemStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all Opus modules
app.get('/api/v1/modules', (req, res) => {
  try {
    const modules = orchestrator.opusModules;
    res.json({
      success: true,
      data: {
        modules,
        totalModules: Object.keys(modules).length,
        totalWorkflows: orchestrator.getTotalWorkflows(),
        totalAgents: orchestrator.getTotalAgents()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Orchestrate specific Opus module
app.post('/api/v1/orchestrate/:opusId', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Orchestrator not initialized yet'
      });
    }

    const { opusId } = req.params;
    const request = req.body;

    // Validate request
    if (!request.type) {
      return res.status(400).json({
        success: false,
        error: 'Request type is required'
      });
    }

    // Set default complexity if not provided
    if (!request.complexity) {
      request.complexity = 5;
    }

    const result = await orchestrator.orchestrateOpus(opusId, request);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch orchestration - multiple Opus modules
app.post('/api/v1/orchestrate/batch', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Orchestrator not initialized yet'
      });
    }

    const { requests } = req.body;

    if (!Array.isArray(requests)) {
      return res.status(400).json({
        success: false,
        error: 'Requests must be an array'
      });
    }

    const results = await Promise.allSettled(
      requests.map(({ opusId, request }) => 
        orchestrator.orchestrateOpus(opusId, request)
      )
    );

    const successfulResults = results.filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    const errors = results.filter(r => r.status === 'rejected')
      .map(r => r.reason.message);

    res.json({
      success: true,
      data: {
        successful: successfulResults,
        errors: errors,
        totalRequests: requests.length,
        successfulCount: successfulResults.length,
        errorCount: errors.length
      }
    });

  } catch (error) {
    console.error('Batch orchestration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflows by domain
app.get('/api/v1/workflows/:domain', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Orchestrator not initialized yet'
      });
    }

    const { domain } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const workflows = await orchestrator.getWorkflowsForDomain(domain, {
      limit
    });

    res.json({
      success: true,
      data: {
        domain,
        workflows,
        count: workflows.length
      }
    });

  } catch (error) {
    console.error('Workflows query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search prompts
app.post('/api/v1/prompts/search', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Orchestrator not initialized yet'
      });
    }

    const { query, limit = 25 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const prompts = await orchestrator.getPromptsForRequest({
      description: query,
      type: 'search'
    });

    res.json({
      success: true,
      data: {
        query,
        prompts: prompts.slice(0, limit),
        totalFound: prompts.length
      }
    });

  } catch (error) {
    console.error('Prompt search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get DIDC career patterns
app.get('/api/v1/didc/:careerCode', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Orchestrator not initialized yet'
      });
    }

    const { careerCode } = req.params;
    const patterns = await orchestrator.getDIDCPatternsForCareer(careerCode);

    if (!patterns) {
      return res.status(404).json({
        success: false,
        error: `DIDC patterns not found for career ${careerCode}`
      });
    }

    res.json({
      success: true,
      data: {
        careerCode,
        patterns
      }
    });

  } catch (error) {
    console.error('DIDC query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI Publishing International LLP Demo Endpoint
app.post('/api/v1/demo/real-estate-analysis', async (req, res) => {
  try {
    const demoRequest = {
      type: 'commercial_real_estate_investment_analysis',
      description: 'Comprehensive analysis of commercial real estate opportunities with AI-driven market intelligence, risk assessment, and ROI projections',
      complexity: 8,
      userCareer: 'commercial_real_estate_analyst_5001',
      demoMode: true
    };

    const result = await orchestrator.orchestrateOpus('opus-2', demoRequest);

    res.json({
      success: true,
      demo: 'AI Publishing International LLP - Real Estate Intelligence',
      data: result,
      note: 'This demonstrates immediate access to 125,000+ real estate workflows and 1.51M orchestration agents'
    });

  } catch (error) {
    console.error('Demo error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Comprehensive ERP Demo - All 11 Opus Modules
app.post('/api/v1/demo/full-erp', async (req, res) => {
  try {
    console.log('🎯 Running comprehensive ERP demo across all 11 Opus modules...');

    const demoRequests = [
      { opusId: 'opus-1', request: { type: 'productivity_optimization', complexity: 6 }},
      { opusId: 'opus-2', request: { type: 'investment_portfolio_analysis', complexity: 7 }},
      { opusId: 'opus-3', request: { type: 'legal_compliance_audit', complexity: 8 }},
      { opusId: 'opus-4', request: { type: 'urban_planning_design', complexity: 9 }},
      { opusId: 'opus-5', request: { type: 'tax_optimization_strategy', complexity: 7 }},
      { opusId: 'opus-6', request: { type: 'governance_framework_design', complexity: 8 }},
      { opusId: 'opus-7', request: { type: 'knowledge_architecture_build', complexity: 6 }},
      { opusId: 'opus-8', request: { type: 'supply_chain_optimization', complexity: 7 }},
      { opusId: 'opus-9', request: { type: 'manufacturing_process_ai', complexity: 8 }},
      { opusId: 'opus-10', request: { type: 'talent_management_system', complexity: 6 }},
      { opusId: 'opus-11', request: { type: 'customer_experience_ai', complexity: 7 }}
    ];

    const results = await Promise.allSettled(
      demoRequests.map(({ opusId, request }) => 
        orchestrator.orchestrateOpus(opusId, request)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const totalAgentsDeployed = successful.reduce((sum, result) => 
      sum + result.results.agentsDeployed, 0
    );
    const totalWorkflowsExecuted = successful.reduce((sum, result) => 
      sum + result.results.workflowsExecuted, 0
    );

    res.json({
      success: true,
      demo: 'COMPLETE ERP ORCHESTRATION DEMO - ALL 11 OPUS MODULES',
      summary: {
        modulesOrchestrated: successful.length,
        totalAgentsDeployed: totalAgentsDeployed.toLocaleString(),
        totalWorkflowsExecuted: totalWorkflowsExecuted,
        executionTime: new Date(),
        status: 'ENTERPRISE_READY'
      },
      data: successful,
      note: 'This demonstrates immediate enterprise ERP deployment without 3-6 month build cycles'
    });

  } catch (error) {
    console.error('Full ERP demo error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/v1/status',
      'GET /api/v1/modules',
      'POST /api/v1/orchestrate/:opusId',
      'POST /api/v1/orchestrate/batch',
      'GET /api/v1/workflows/:domain',
      'POST /api/v1/prompts/search',
      'GET /api/v1/didc/:careerCode',
      'POST /api/v1/demo/real-estate-analysis',
      'POST /api/v1/demo/full-erp'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🌟 Opus API Server running on port ${PORT}`);
  console.log(`📊 Ready to orchestrate ${orchestrator.getTotalWorkflows().toLocaleString()} workflows`);
  console.log(`🤖 Managing ${orchestrator.getTotalAgents().toLocaleString()} Testament Array agents`);
  console.log(`🚀 IMMEDIATE ERP DEPLOYMENT READY - NO 3-6 MONTH BUILD REQUIRED!`);
});

module.exports = app;