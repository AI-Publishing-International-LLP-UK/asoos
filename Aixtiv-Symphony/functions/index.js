/**
 * DIAMOND CLI Owner-Subscriber V2 Immersive System
 * Google Cloud Functions Main Entry Point
 *
 * This file exports all Cloud Functions for the DIAMOND CLI Owner-Subscriber system,
 * including Universal Dispatcher, Memory System, Agent Trigger functions, and Pinecone integration.
 *
 * @module functions/index
 * @author AIXTIV Symphony Team
 * @copyright 2025 AI Publishing International LLP
 * @version 2.0.0
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Logging } = require('@google-cloud/logging');
const { Firestore } = require('@google-cloud/firestore');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Pinecone } = require('@pinecone-database/pinecone');

// Import existing promise handler utilities and security systems
const { safeResolve, serializeForAgent } = require('../utils/promiseHandler');
const SecurityLockdown = require('../utils/securityLockdown');

// Configuration constants
const PROJECT_ID = 'api-for-warp-drive';
const REGION = 'us-west1';
const LOG_NAME = 'warp-drive-function';

// Initialize Google Cloud services
const firestore = new Firestore({
  projectId: PROJECT_ID,
});

const logging = new Logging({
  projectId: PROJECT_ID,
});

const log = logging.log(LOG_NAME);
const secretClient = new SecretManagerServiceClient();

// Cache for secrets and clients
const cache = {
  secrets: {},
  pinecone: null,
  initialized: false,
};

/**
 * Fetch secret from Google Cloud Secret Manager
 * @param {string} secretName - Name of the secret
 * @returns {Promise<string>} Secret value
 */
async function getSecret(secretName) {
  if (cache.secrets[secretName]) {
    return cache.secrets[secretName];
  }

  try {
    const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
    const [version] = await secretClient.accessSecretVersion({ name });
    const secretValue = version.payload.data.toString('utf8');

    // Cache the secret
    cache.secrets[secretName] = secretValue;
    return secretValue;
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}:`, error);
    throw new Error(`Secret ${secretName} not found`);
  }
}

/**
 * Initialize Pinecone client
 * @returns {Promise<Pinecone>} Pinecone client instance
 */
async function initializePinecone() {
  if (cache.pinecone) {
    return cache.pinecone;
  }

  try {
    const apiKey = await getSecret('PINECONE_API_KEY');

    cache.pinecone = new Pinecone({
      apiKey: apiKey,
    });

    return cache.pinecone;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    throw new Error('Pinecone initialization failed');
  }
}

/**
 * Structured logger for Cloud Logging
 */
const logger = {
  info: (message, metadata = {}) => {
    const entry = log.entry(
      { resource: { type: 'cloud_function' } },
      {
        severity: 'INFO',
        message,
        timestamp: new Date().toISOString(),
        component: 'warp-drive-functions',
        ...metadata,
      }
    );
    log.write(entry);
  },

  error: (message, error = null, metadata = {}) => {
    const entry = log.entry(
      { resource: { type: 'cloud_function' } },
      {
        severity: 'ERROR',
        message,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : null,
        timestamp: new Date().toISOString(),
        component: 'warp-drive-functions',
        ...metadata,
      }
    );
    log.write(entry);
  },
};

/**
 * Initialize all services
 */
async function initializeServices() {
  if (cache.initialized) {
    return;
  }

  try {
    await initializePinecone();
    cache.initialized = true;
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', error);
    throw error;
  }
}

// Create Express app
const app = express();

// Configure middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Request logger middleware
const requestLogger = (req, res, next) => {
  logger.info(`Request received: ${req.method} ${req.originalUrl}`, {
    endpoint: req.originalUrl,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  next();
};

// Security validation middleware
const validateSecurity = async (req, res, next) => {
  try {
    // Check for suspicious request patterns
    const suspiciousPatterns = ['<script>', 'javascript:', 'eval(', 'Function(', 'setTimeout('];
    const requestBody = JSON.stringify(req.body || {});
    const requestQuery = JSON.stringify(req.query || {});

    const isSuspicious = suspiciousPatterns.some(
      (pattern) => requestBody.includes(pattern) || requestQuery.includes(pattern)
    );

    if (isSuspicious) {
      logger.error('Suspicious request blocked', {
        operation: 'security_validation',
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(403).json({
        error: 'Request blocked',
        message: 'Suspicious content detected',
        code: 'SECURITY_VIOLATION',
      });
    }

    // Validate authorized domains
    const origin = req.headers.origin || req.headers.referer;
    const authorizedDomains = [
      '2100.cool',
      'asoos.2100.cool',
      'sallyport.2100.cool',
      'mcp.aipub.2100.cool',
      'drclaude.live',
      'localhost',
    ];

    if (origin && !authorizedDomains.some((domain) => origin.includes(domain))) {
      logger.error('Unauthorized domain access attempt', {
        operation: 'domain_validation',
        origin,
        endpoint: req.originalUrl,
      });

      return res.status(403).json({
        error: 'Access denied',
        message: 'Unauthorized domain',
        code: 'DOMAIN_VIOLATION',
      });
    }

    next();
  } catch (error) {
    logger.error('Security validation error', error);
    next(); // Continue on security check failure to avoid blocking legitimate requests
  }
};

// Service initialization middleware
const ensureInitialized = async (req, res, next) => {
  try {
    await initializeServices();
    next();
  } catch (error) {
    logger.error('Service initialization failed', error);
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Failed to initialize required services',
    });
  }
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Map common errors to appropriate status codes
  let statusCode = 500;
  if (err.message.includes('not found')) statusCode = 404;
  if (err.message.includes('unauthorized') || err.message.includes('authentication'))
    statusCode = 401;
  if (err.message.includes('forbidden')) statusCode = 403;
  if (err.message.includes('validation') || err.message.includes('invalid')) statusCode = 400;
  if (err.message.includes('rate limit')) statusCode = 429;

  const errorResponse = {
    error: 'Internal server error',
    message: err.message,
    operation: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (isDev && err.stack) {
    errorResponse.trace = err.stack;
  }

  logger.error('Request error', err, {
    endpoint: req.originalUrl,
    method: req.method,
    statusCode,
    requestBody: req.body,
  });

  res.status(statusCode).json(errorResponse);
};

// Apply middleware
app.use(requestLogger);
app.use(validateSecurity);
app.use(ensureInitialized);

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    // Check Pinecone connection
    const pinecone = await initializePinecone();
    const indexes = await pinecone.listIndexes();

    res.status(200).json({
      status: 'healthy',
      service: 'warp-drive-functions',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      services: {
        firestore: 'operational',
        logging: 'operational',
        secretManager: 'operational',
        pinecone: 'operational',
      },
      pinecone: {
        connected: true,
        indexCount: indexes.length,
      },
      project: PROJECT_ID,
      region: REGION,
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'degraded',
      service: 'warp-drive-functions',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Dr. Claude project delegation endpoint
app.post('/projects/delegate', async (req, res) => {
  try {
    const {
      name,
      description,
      priority = 'medium',
      deadline = null,
      tags = [],
      assigned_to = null,
      orchestrator = 'dr-claude',
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Project description is required' });
    }

    const project_id = uuidv4();
    const timestamp = new Date().toISOString();

    const projectData = {
      project_id,
      name,
      description,
      priority,
      deadline,
      tags: Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()),
      assigned_to,
      orchestrator,
      status: 'active',
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Store in Firestore
    await firestore.collection('projects').doc(project_id).set(projectData);

    logger.info('Project delegation successful', {
      operation: 'project_delegation',
      project_id,
      project_name: name,
      orchestrator,
    });

    // Use promise-safe serialization
    const response = await serializeForAgent({
      status: 'created',
      project_id,
      created_at: timestamp,
      orchestrator,
      assigned_to,
      priority,
      deadline,
      tags: projectData.tags,
    });

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Vector operations endpoint
app.post('/vector/upsert', async (req, res) => {
  try {
    const { id, values, metadata = {}, index_name = 'warp-drive-default' } = req.body;

    // Validate input
    if (!id) {
      return res.status(400).json({ error: 'Vector ID is required' });
    }
    if (!Array.isArray(values) || values.length === 0) {
      return res.status(400).json({ error: 'Values array is required and must not be empty' });
    }
    if (!values.every((v) => typeof v === 'number')) {
      return res.status(400).json({ error: 'All values must be numbers' });
    }

    const pinecone = await initializePinecone();
    const index = pinecone.index(index_name);

    // Upsert to Pinecone
    await index.upsert([
      {
        id,
        values,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'warp-drive-functions',
        },
      },
    ]);

    // Log to Firestore for audit
    const auditDoc = {
      vector_id: id,
      index_name,
      dimension: values.length,
      metadata,
      operation: 'upsert',
      timestamp: new Date().toISOString(),
      user_agent: req.headers['user-agent'],
    };

    await firestore.collection('vector_audits').add(auditDoc);

    logger.info('Vector upsert successful', {
      operation: 'vector_upsert',
      vector_id: id,
      index_name,
      dimension: values.length,
    });

    res.status(200).json({
      status: 'success',
      vector_id: id,
      index_name,
      dimension: values.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Memory storage endpoint
app.post('/memory/store', async (req, res) => {
  try {
    const {
      session_id,
      content,
      importance = 'medium',
      metadata = {},
      embedding = null,
    } = req.body;

    if (!session_id || !content) {
      return res.status(400).json({
        error: 'Session ID and content are required',
      });
    }

    const memory_id = uuidv4();
    const timestamp = new Date().toISOString();

    const memoryData = {
      memory_id,
      session_id,
      content,
      importance,
      metadata: {
        ...metadata,
        created_at: timestamp,
      },
      embedding,
      timestamp,
    };

    // Store in Firestore
    await firestore.collection('memories').doc(memory_id).set(memoryData);

    // If embedding provided, also store in Pinecone
    if (embedding && Array.isArray(embedding)) {
      try {
        const pinecone = await initializePinecone();
        const index = pinecone.index('memories');

        await index.upsert([
          {
            id: memory_id,
            values: embedding,
            metadata: {
              session_id,
              content: content.substring(0, 1000), // Truncate for metadata
              importance,
              timestamp,
            },
          },
        ]);
      } catch (pineconeError) {
        logger.error('Failed to store embedding in Pinecone', pineconeError);
        // Continue without failing the whole operation
      }
    }

    logger.info('Memory stored successfully', {
      operation: 'memory_storage',
      memory_id,
      session_id,
      importance,
      has_embedding: !!embedding,
    });

    res.status(200).json({
      status: 'stored',
      memory_id,
      session_id,
      timestamp,
      has_embedding: !!embedding,
    });
  } catch (error) {
    next(error);
  }
});

// Memory query endpoint
app.post('/memory/query', async (req, res) => {
  try {
    const { session_id, query_embedding, limit = 10, threshold = 0.7 } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    let results = [];

    // If query embedding provided, search Pinecone
    if (query_embedding && Array.isArray(query_embedding)) {
      try {
        const pinecone = await initializePinecone();
        const index = pinecone.index('memories');

        const queryResponse = await index.query({
          vector: query_embedding,
          filter: { session_id },
          topK: limit,
          includeMetadata: true,
          includeValues: false,
        });

        results = queryResponse.matches
          .filter((match) => match.score >= threshold)
          .map((match) => ({
            memory_id: match.id,
            score: match.score,
            content: match.metadata.content,
            importance: match.metadata.importance,
            timestamp: match.metadata.timestamp,
          }));
      } catch (pineconeError) {
        logger.error('Pinecone query failed, falling back to Firestore', pineconeError);
      }
    }

    // Fallback to Firestore query if no Pinecone results
    if (results.length === 0) {
      const memoriesQuery = firestore
        .collection('memories')
        .where('session_id', '==', session_id)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      const querySnapshot = await memoriesQuery.get();

      results = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          memory_id: data.memory_id,
          content: data.content,
          importance: data.importance,
          timestamp: data.timestamp,
          metadata: data.metadata,
        };
      });
    }

    logger.info('Memory query completed', {
      operation: 'memory_query',
      session_id,
      results_count: results.length,
      used_embedding: !!query_embedding,
    });

    res.status(200).json({
      status: 'success',
      session_id,
      results_count: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Agent trigger endpoint
app.post('/agent/trigger', async (req, res) => {
  try {
    const {
      agent_type = 'dr-claude',
      task_description,
      priority = 'medium',
      metadata = {},
      callback_url = null,
    } = req.body;

    if (!task_description) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    const trigger_id = uuidv4();
    const timestamp = new Date().toISOString();

    const triggerData = {
      trigger_id,
      agent_type,
      task_description,
      priority,
      status: 'pending',
      metadata: {
        ...metadata,
        created_at: timestamp,
      },
      callback_url,
      timestamp,
    };

    // Store in Firestore
    await firestore.collection('agent_triggers').doc(trigger_id).set(triggerData);

    logger.info('Agent trigger created', {
      operation: 'agent_trigger',
      trigger_id,
      agent_type,
      priority,
    });

    res.status(200).json({
      status: 'triggered',
      trigger_id,
      agent_type,
      priority,
      timestamp,
    });
  } catch (error) {
    next(error);
  }
});

// Context storage endpoint for MCP
app.post('/context/store', async (req, res) => {
  try {
    const { context_type = 'conversation', data, session_id, metadata = {} } = req.body;

    if (!data || !session_id) {
      return res.status(400).json({
        error: 'Data and session ID are required',
      });
    }

    const context_id = uuidv4();
    const timestamp = new Date().toISOString();

    const contextData = {
      context_id,
      context_type,
      session_id,
      data,
      metadata: {
        ...metadata,
        created_at: timestamp,
      },
      timestamp,
    };

    await firestore.collection('contexts').doc(context_id).set(contextData);

    logger.info('Context stored', {
      operation: 'context_storage',
      context_id,
      context_type,
      session_id,
    });

    res.status(200).json({
      status: 'stored',
      context_id,
      context_type,
      session_id,
      timestamp,
    });
  } catch (error) {
    next(error);
  }
});

// Context retrieval endpoint
app.get('/context/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { type, limit = 50 } = req.query;

    let query = firestore
      .collection('contexts')
      .where('session_id', '==', session_id)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));

    if (type) {
      query = query.where('context_type', '==', type);
    }

    const querySnapshot = await query.get();
    const contexts = querySnapshot.docs.map((doc) => doc.data());

    logger.info('Context retrieved', {
      operation: 'context_retrieval',
      session_id,
      context_type: type,
      results_count: contexts.length,
    });

    res.status(200).json({
      status: 'success',
      session_id,
      context_type: type,
      results_count: contexts.length,
      contexts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handler
app.use(errorHandler);

// Export the main Cloud Function
exports.index = app;

// Export individual function handlers for modular deployment
exports.drClaude = app;
exports.vectorOperations = app;
exports.memorySystem = app;
exports.agentTrigger = app;
exports.contextStorage = app;
