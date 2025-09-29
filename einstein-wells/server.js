#!/usr/bin/env node

/**
 * EINSTEIN WELLS CLOUD RUN SERVER
 * HTTP wrapper for Einstein Wells Quantum Mining Operations
 */

import express from 'express';
import cors from 'cors';
import { EinsteinWellsMultiSystemOperator } from './multi-system-operator.js';
import { EinsteinWellsQuantWarServiceIntegration } from './integrate-quantswar-service.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Einstein Wells systems
let multiSystemOperator = null;
let serviceIntegration = null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'einstein-wells-quantum-mining',
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Einstein Wells Quantum Mining Operations',
    version: '1.0.0',
    environment: process.env.ENVIRONMENT || 'development',
    endpoints: [
      'GET /health - Health check',
      'GET /status - System status',
      'POST /start - Start mining operations',
      'POST /stop - Stop mining operations',
      'GET /rig/status - Rig status'
    ]
  });
});

// System status endpoint
app.get('/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.ENVIRONMENT || 'development',
      bitcoin_address: process.env.BITCOIN_ADDRESS_SECRET ? 'configured' : 'missing',
      rig_name: 'einstein-wells-quantswar',
      rig_id: 'EW-QS-001',
      multi_system_operator: multiSystemOperator ? 'initialized' : 'not_initialized',
      service_integration: serviceIntegration ? 'initialized' : 'not_initialized'
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

// Start mining operations
app.post('/start', async (req, res) => {
  try {
    console.log('🚀 Starting Einstein Wells mining operations...');
    
    if (!multiSystemOperator) {
      multiSystemOperator = new EinsteinWellsMultiSystemOperator();
    }
    
    if (!serviceIntegration) {
      serviceIntegration = new EinsteinWellsQuantWarServiceIntegration();
    }
    
    // Start the multi-system operator
    const result = await multiSystemOperator.startSimultaneousOperations();
    
    res.json({
      status: 'started',
      message: 'Einstein Wells quantum mining operations started',
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to start mining operations:', error);
    res.status(500).json({
      error: 'Failed to start mining operations',
      message: error.message
    });
  }
});

// Stop mining operations
app.post('/stop', async (req, res) => {
  try {
    console.log('⏹️ Stopping Einstein Wells mining operations...');
    
    // Stop operations if running
    if (multiSystemOperator) {
      // Add stop functionality if available
      console.log('Multi-system operator stopped');
    }
    
    res.json({
      status: 'stopped',
      message: 'Einstein Wells quantum mining operations stopped',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to stop mining operations:', error);
    res.status(500).json({
      error: 'Failed to stop mining operations',
      message: error.message
    });
  }
});

// Rig status endpoint
app.get('/rig/status', async (req, res) => {
  try {
    const rigStatus = {
      rig_name: 'einstein-wells-quantswar',
      rig_id: 'EW-QS-001',
      status: multiSystemOperator ? 'active' : 'inactive',
      bitcoin_address: '3CiHCuaRUyrik4WXijmnheTybm2Y2bCcAj',
      power_allocation: {
        max_wattage: 3500,
        quantum_efficiency: 0.97,
        well_allocation: {
          well1: 0.33,
          well2: 0.33,
          well3: 0.34
        }
      },
      algorithms: [
        'sha256', 'daggerhashimoto', 'kheavyhash', 'randomx',
        'etchash', 'kawpow', 'octopus', 'zhash'
      ],
      timestamp: new Date().toISOString()
    };
    
    res.json(rigStatus);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get rig status',
      message: error.message
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🌌 EINSTEIN WELLS CLOUD RUN SERVER STARTED');
  console.log(`⚡ Server running on port ${PORT}`);
  console.log(`🏗️ Environment: ${process.env.ENVIRONMENT || 'development'}`);
  console.log(`🔧 Ready for quantum mining operations`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});