#!/usr/bin/env node

/**
 * 🌐 UNIVERSAL SERVICES API ROUTES
 * 💎 Diamond SAO Command Center - Universal Service Integration
 * 
 * Single API endpoint for 100+ services:
 * OpenAI, Anthropic, Google AI, GCP, AWS, GitHub, Slack, etc.
 * 
 * Authority: Diamond SAO Command Center
 * Classification: UNIVERSAL_SERVICE_GATEWAY
 */

const express = require('express');
const axios = require('axios');
const { authenticate, universalProxy } = require('../middleware/sallyport-universal-bridge');

const router = express.Router();

/**
 * Universal Service Proxy Route
 * Handles all service calls through cookie-based authentication
 * 
 * Examples:
 * POST /api/services/ai_services/openai/chat/completions
 * POST /api/services/cloud_services/gcp/compute/v1/instances
 * POST /api/services/dev_services/github/repos
 */
router.all('/services/:category/:service/*', authenticate, universalProxy, async (req, res) => {
  try {
    const { category, service } = req.params;
    const endpoint = req.params[0]; // Everything after /service/
    const serviceConfig = req.serviceConfig;
    const serviceToken = req.serviceToken;

    if (!serviceConfig) {
      return res.status(404).json({
        error: 'Service not found',
        category: category,
        service: service,
        authority: 'Diamond SAO Command Center'
      });
    }

    // Build service request
    const serviceUrl = `${serviceConfig.endpoint}/${endpoint}`;
    const headers = buildServiceHeaders(serviceConfig, serviceToken);
    
    // Forward request to service
    const response = await axios({
      method: req.method,
      url: serviceUrl,
      headers: headers,
      data: req.body,
      params: req.query,
      timeout: 30000
    });

    // Log successful service call
    console.log(`[UNIVERSAL-SERVICE] ${req.auth.sallyport.user_id} → ${service}/${endpoint} ✓`);

    res.json(response.data);
  } catch (error) {
    console.error(`[UNIVERSAL-SERVICE-ERROR] ${req.params.service}:`, error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Service error',
        service: req.params.service,
        message: error.response.data?.error?.message || error.message,
        authority: 'Diamond SAO Command Center'
      });
    }

    res.status(500).json({
      error: 'Universal service error',
      service: req.params.service,
      message: error.message,
      authority: 'Diamond SAO Command Center'
    });
  }
});

/**
 * AI Services - OpenAI Integration
 */
router.post('/ai/openai/chat', authenticate, async (req, res) => {
  try {
    const openaiToken = req.cookies.openai_auth;
    if (!openaiToken) {
      return res.status(401).json({ error: 'OpenAI authentication required' });
    }

    const decryptedToken = require('../middleware/sallyport-universal-bridge').decryptToken(openaiToken);
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', req.body, {
      headers: {
        'Authorization': `Bearer ${decryptedToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * AI Services - Anthropic Claude Integration
 */
router.post('/ai/anthropic/messages', authenticate, async (req, res) => {
  try {
    const anthropicToken = req.cookies.anthropic_auth;
    if (!anthropicToken) {
      return res.status(401).json({ error: 'Anthropic authentication required' });
    }

    const decryptedToken = require('../middleware/sallyport-universal-bridge').decryptToken(anthropicToken);
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
      headers: {
        'x-api-key': decryptedToken,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Voice Services - ElevenLabs Integration
 */
router.post('/voice/elevenlabs/text-to-speech', authenticate, async (req, res) => {
  try {
    const elevenLabsToken = req.cookies.elevenlabs_auth;
    if (!elevenLabsToken) {
      return res.status(401).json({ error: 'ElevenLabs authentication required' });
    }

    const decryptedToken = require('../middleware/sallyport-universal-bridge').decryptToken(elevenLabsToken);
    
    const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${req.body.voice_id}`, {
      text: req.body.text,
      voice_settings: req.body.voice_settings || {}
    }, {
      headers: {
        'xi-api-key': decryptedToken,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length
    });
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cloud Services - Google Cloud Platform Integration
 */
router.all('/cloud/gcp/*', authenticate, async (req, res) => {
  try {
    const gcpToken = req.cookies.gcp_auth;
    if (!gcpToken) {
      return res.status(401).json({ error: 'GCP authentication required' });
    }

    const decryptedToken = require('../middleware/sallyport-universal-bridge').decryptToken(gcpToken);
    const endpoint = req.params[0];
    
    const response = await axios({
      method: req.method,
      url: `https://googleapis.com/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${decryptedToken}`,
        'Content-Type': 'application/json'
      },
      data: req.body,
      params: req.query
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Developer Services - GitHub Integration
 */
router.all('/dev/github/*', authenticate, async (req, res) => {
  try {
    const githubToken = req.cookies.github_auth;
    if (!githubToken) {
      return res.status(401).json({ error: 'GitHub authentication required' });
    }

    const decryptedToken = require('../middleware/sallyport-universal-bridge').decryptToken(githubToken);
    const endpoint = req.params[0];
    
    const response = await axios({
      method: req.method,
      url: `https://api.github.com/${endpoint}`,
      headers: {
        'Authorization': `token ${decryptedToken}`,
        'User-Agent': 'Diamond SAO Command Center',
        'Content-Type': 'application/json'
      },
      data: req.body,
      params: req.query
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Database Services - MongoDB Atlas Integration
 */
router.post('/data/mongodb/query', authenticate, async (req, res) => {
  try {
    // This would integrate with your existing MongoDB connection
    // Using the encrypted connection string from cookies
    const mongoAuth = req.cookies.mongodb_auth;
    if (!mongoAuth) {
      return res.status(401).json({ error: 'MongoDB authentication required' });
    }

    // Implementation would use your existing MongoDB client
    res.json({
      message: 'MongoDB integration placeholder',
      authority: 'Diamond SAO Command Center'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Vector Database - Pinecone Integration
 */
router.all('/data/pinecone/*', authenticate, async (req, res) => {
  try {
    const pineconeToken = req.cookies.pinecone_auth;
    if (!pineconeToken) {
      return res.status(401).json({ error: 'Pinecone authentication required' });
    }

    const decryptedToken = require('../middleware/sallyport-universal-bridge').decryptToken(pineconeToken);
    const endpoint = req.params[0];
    
    const response = await axios({
      method: req.method,
      url: `https://api.pinecone.io/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${decryptedToken}`,
        'Content-Type': 'application/json'
      },
      data: req.body,
      params: req.query
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Service Status and Health Check
 */
router.get('/services/status', authenticate, (req, res) => {
  const userServices = Object.keys(req.cookies)
    .filter(key => key.endsWith('_auth'))
    .map(key => key.replace('_auth', ''));

  res.json({
    message: 'Universal Services Status',
    authority: 'Diamond SAO Command Center',
    user: {
      id: req.auth.sallyport.user_id,
      tenant: req.auth.tenant.level,
      security_level: req.auth.security_level
    },
    available_services: userServices,
    total_services: userServices.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Service Discovery
 */
router.get('/services/discover', authenticate, (req, res) => {
  const { universalServices } = require('../middleware/sallyport-universal-bridge').universalBridge;
  
  res.json({
    message: 'Universal Service Discovery',
    authority: 'Diamond SAO Command Center',
    categories: Object.keys(universalServices),
    total_services: Object.values(universalServices).reduce((total, category) => {
      return total + Object.keys(category).length;
    }, 0),
    user_access_level: req.auth.security_level,
    timestamp: new Date().toISOString()
  });
});

/**
 * Build service headers based on auth type
 */
function buildServiceHeaders(serviceConfig, token) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Diamond SAO Command Center'
  };

  switch (serviceConfig.auth_type) {
    case 'bearer':
      headers['Authorization'] = `Bearer ${token}`;
      break;
    case 'x-api-key':
      headers['x-api-key'] = token;
      break;
    case 'xi-api-key':
      headers['xi-api-key'] = token;
      break;
    case 'api-key':
      headers['api-key'] = token;
      break;
    case 'basic':
      headers['Authorization'] = `Basic ${Buffer.from(token).toString('base64')}`;
      break;
    default:
      headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

module.exports = router;
