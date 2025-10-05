/**
 * VLS API Endpoints for Cloudflare Worker
 * Provides REST endpoints for Voice Leadership Systems integration
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { VoiceLeadershipSystems, VOICE_PROFILES, VLS_CONFIGURATION } from '../integrations/voices-vls-system';

interface Env {
  ELEVENLABS_API_KEY: string;
  HUME_API_KEY: string;
  VLS_ORCHESTRATION_ENDPOINT: string;
  CUSTOMER_DB: D1Database;
  VOICE_ANALYTICS: AnalyticsEngineDataset;
}

const vls = new Hono<{ Bindings: Env }>();

// Apply CORS middleware
vls.use('*', cors({
  origin: ['https://mcp.aipub.2100.cool', 'https://sallyport.2100.cool', 'https://*.2100.cool'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Error handler middleware
vls.onError((err, c) => {
  console.error('VLS API Error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// Initialize VLS system
function initializeVLS(env: Env): VoiceLeadershipSystems {
  return new VoiceLeadershipSystems(env);
}

// GET /api/vls/status - Get VLS system status
vls.get('/status', async (c) => {
  try {
    const vlsSystem = initializeVLS(c.env);
    const status = await vlsSystem.getVLSStatus();
    
    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [status.totalAgents, status.totalPilots],
      blobs: ['vls_status_check', 'system_operational'],
      indexes: ['vls_system']
    });

    return c.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('VLS status error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve VLS status',
      details: error.message
    }, 500);
  }
});

// GET /api/vls/voices - Get all available voices
vls.get('/voices', async (c) => {
  try {
    const tier = c.req.query('tier') || 'all';
    const vlsSystem = initializeVLS(c.env);
    
    let availableVoices;
    if (tier === 'all') {
      availableVoices = Object.values(VOICE_PROFILES);
    } else {
      const availablePilots = (vlsSystem as any).getAvailablePilotsForTier(tier);
      availableVoices = availablePilots.map(id => VOICE_PROFILES[id]).filter(Boolean);
    }

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [availableVoices.length],
      blobs: ['voice_catalog_request', tier],
      indexes: ['voice_catalog']
    });

    return c.json({
      success: true,
      data: {
        voices: availableVoices,
        total: availableVoices.length,
        tier: tier,
        configurations: VLS_CONFIGURATION
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve voices',
      details: error.message
    }, 500);
  }
});

// GET /api/vls/voices/:voiceId - Get specific voice details
vls.get('/voices/:voiceId', async (c) => {
  try {
    const voiceId = c.req.param('voiceId');
    const voice = VOICE_PROFILES[voiceId];
    
    if (!voice) {
      return c.json({
        success: false,
        error: 'Voice not found',
        voiceId
      }, 404);
    }

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [voice.agentCapacity],
      blobs: ['voice_details_request', voice.name, voice.wing],
      indexes: [voiceId]
    });

    return c.json({
      success: true,
      data: voice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve voice details',
      details: error.message
    }, 500);
  }
});

// POST /api/vls/initialize - Initialize a voice pilot
vls.post('/initialize', async (c) => {
  try {
    const { pilotId, context = {} } = await c.req.json();
    
    if (!pilotId) {
      return c.json({
        success: false,
        error: 'Pilot ID is required'
      }, 400);
    }

    const vlsSystem = initializeVLS(c.env);
    const pilot = await vlsSystem.initializeVoicePilot(pilotId, context);

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [pilot.agentCapacity],
      blobs: ['pilot_initialized', pilot.name, pilot.wing],
      indexes: [pilotId, 'pilot_init']
    });

    return c.json({
      success: true,
      data: pilot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to initialize pilot',
      details: error.message
    }, 400);
  }
});

// POST /api/vls/synthesize - Synthesize voice for a pilot
vls.post('/synthesize', async (c) => {
  try {
    const { pilotId, text, options = {} } = await c.req.json();
    
    if (!pilotId || !text) {
      return c.json({
        success: false,
        error: 'Pilot ID and text are required'
      }, 400);
    }

    const vlsSystem = initializeVLS(c.env);
    const synthesis = await vlsSystem.synthesizeVoice(pilotId, text, options);

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [synthesis.duration, text.length],
      blobs: ['voice_synthesis', synthesis.pilotName, synthesis.wing],
      indexes: [pilotId, 'synthesis']
    });

    // Convert ArrayBuffer to base64 for JSON response
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(synthesis.audioBuffer)));

    return c.json({
      success: true,
      data: {
        ...synthesis,
        audioBuffer: audioBase64, // Base64 encoded audio
        format: 'base64'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to synthesize voice',
      details: error.message
    }, 500);
  }
});

// POST /api/vls/orchestrate - Orchestrate multiple pilots
vls.post('/orchestrate', async (c) => {
  try {
    const { primaryPilot, supportingPilots = [], text, context = {} } = await c.req.json();
    
    if (!primaryPilot || !text) {
      return c.json({
        success: false,
        error: 'Primary pilot and text are required'
      }, 400);
    }

    const vlsSystem = initializeVLS(c.env);
    const orchestration = await vlsSystem.orchestrateVoicePilots({
      primaryPilot,
      supportingPilots,
      text,
      context
    });

    // Convert audio buffer to base64
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(orchestration.primary.response.audioBuffer)));

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [orchestration.totalAgentCapacity, supportingPilots.length],
      blobs: ['pilot_orchestration', primaryPilot, `supporting_${supportingPilots.length}`],
      indexes: [orchestration.orchestrationId, 'orchestration']
    });

    return c.json({
      success: true,
      data: {
        ...orchestration,
        primary: {
          ...orchestration.primary,
          response: {
            ...orchestration.primary.response,
            audioBuffer: audioBase64,
            format: 'base64'
          }
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to orchestrate pilots',
      details: error.message
    }, 500);
  }
});

// POST /api/vls/deploy - Deploy VLS to customer
vls.post('/deploy', async (c) => {
  try {
    const { customerId, tier, selectedPilots = [] } = await c.req.json();
    
    if (!customerId || !tier) {
      return c.json({
        success: false,
        error: 'Customer ID and tier are required'
      }, 400);
    }

    const vlsSystem = initializeVLS(c.env);
    const deployment = await vlsSystem.deployVLSToCustomer(customerId, tier, selectedPilots);

    // Store deployment in database
    await c.env.CUSTOMER_DB.prepare(`
      INSERT OR REPLACE INTO vls_deployments 
      (customer_id, tier, pilot_count, total_agents, features, deployed_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customerId,
      tier,
      deployment.pilots.length,
      deployment.totalAgentCapacity,
      JSON.stringify(deployment.features),
      deployment.deployedAt,
      deployment.status
    ).run();

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [deployment.totalAgentCapacity, deployment.pilots.length],
      blobs: ['vls_deployment', tier, customerId],
      indexes: [customerId, 'deployment']
    });

    return c.json({
      success: true,
      data: deployment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to deploy VLS',
      details: error.message
    }, 500);
  }
});

// GET /api/vls/deployments/:customerId - Get customer deployment status
vls.get('/deployments/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    const deployment = await c.env.CUSTOMER_DB.prepare(`
      SELECT * FROM vls_deployments WHERE customer_id = ? ORDER BY deployed_at DESC LIMIT 1
    `).bind(customerId).first();

    if (!deployment) {
      return c.json({
        success: false,
        error: 'No deployment found for customer',
        customerId
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        customerId: deployment.customer_id,
        tier: deployment.tier,
        pilotCount: deployment.pilot_count,
        totalAgents: deployment.total_agents,
        features: JSON.parse(deployment.features),
        deployedAt: deployment.deployed_at,
        status: deployment.status
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve deployment status',
      details: error.message
    }, 500);
  }
});

// POST /api/vls/emotion-analysis - Analyze emotion context (Hume AI)
vls.post('/emotion-analysis', async (c) => {
  try {
    const { audioBase64, pilotId } = await c.req.json();
    
    if (!audioBase64 || !pilotId) {
      return c.json({
        success: false,
        error: 'Audio data and pilot ID are required'
      }, 400);
    }

    // Convert base64 back to ArrayBuffer
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0)).buffer;
    
    const vlsSystem = initializeVLS(c.env);
    const analysis = await vlsSystem.analyzeEmotionContext(audioBuffer, pilotId);

    if (analysis === null) {
      return c.json({
        success: false,
        error: 'Emotion analysis not available (Hume API key not configured)'
      }, 503);
    }

    // Log analytics
    c.env.VOICE_ANALYTICS?.writeDataPoint({
      doubles: [1], // Analysis count
      blobs: ['emotion_analysis', pilotId, 'hume_ai'],
      indexes: [pilotId, 'emotion']
    });

    return c.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to analyze emotion context',
      details: error.message
    }, 500);
  }
});

// GET /api/vls/analytics - Get VLS usage analytics
vls.get('/analytics', async (c) => {
  try {
    const timeRange = c.req.query('timeRange') || '24h';
    const metric = c.req.query('metric') || 'all';

    // This would typically query the Analytics Engine dataset
    // For now, return mock analytics data
    const analytics = {
      timeRange,
      metric,
      data: {
        totalSynthesisRequests: 1247,
        totalOrchestrations: 89,
        totalDeployments: 34,
        avgResponseTime: '0.3s',
        topPilots: [
          { pilotId: 'dr-lucy-srix', requests: 342, avgDuration: 15.2 },
          { pilotId: 'elite11', requests: 189, avgDuration: 28.7 },
          { pilotId: 'dr-memoria-srix', requests: 156, avgDuration: 12.8 }
        ],
        customerTiers: {
          'Diamond SAO': 12,
          'Emerald SAO': 8,
          'Sapphire SAO': 14,
          'Opal SAO': 23,
          'Onyx SAO': 31
        },
        systemHealth: {
          uptime: '99.97%',
          errorRate: '0.03%',
          avgLatency: '89ms'
        }
      },
      generatedAt: new Date().toISOString()
    };

    return c.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve analytics',
      details: error.message
    }, 500);
  }
});

// GET /api/vls/health - Health check endpoint
vls.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    system: 'VLS Voice Leadership Systems',
    version: '1.0.0',
    totalVoices: Object.keys(VOICE_PROFILES).length,
    totalWings: Object.keys(VLS_CONFIGURATION.wings).length,
    timestamp: new Date().toISOString()
  });
});

// Error handling for invalid routes
vls.all('*', (c) => {
  return c.json({
    success: false,
    error: 'VLS API endpoint not found',
    availableEndpoints: [
      'GET /api/vls/status',
      'GET /api/vls/voices',
      'GET /api/vls/voices/:voiceId',
      'POST /api/vls/initialize',
      'POST /api/vls/synthesize',
      'POST /api/vls/orchestrate',
      'POST /api/vls/deploy',
      'GET /api/vls/deployments/:customerId',
      'POST /api/vls/emotion-analysis',
      'GET /api/vls/analytics',
      'GET /api/vls/health'
    ]
  }, 404);
});

export default vls;