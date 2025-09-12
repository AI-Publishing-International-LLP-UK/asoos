// Universal MCP Proxy - Connects to both ASOOS Master MCP and Universal Orchestrator
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// MCP Configuration
const MCP_CONFIG = {
  ASOOS_MASTER_MCP: 'https://asoos-master-mcp-mocoa-west-859242575175.us-west1.run.app',
  UNIVERSAL_ORCHESTRATOR: 'https://universal-gateway-859242575175.us-west1.run.app',
  MCP_AIPUB: 'https://mcp-aipub-proxy-859242575175.us-west1.run.app',
};
const BYTE_CONVERSION_FACTOR = 1024;
const BYTES_TO_GB = BYTE_CONVERSION_FACTOR * BYTE_CONVERSION_FACTOR * BYTE_CONVERSION_FACTOR;
const BYTES_TO_MB = BYTE_CONVERSION_FACTOR * BYTE_CONVERSION_FACTOR;
const MS_TO_SECONDS = 1000;
const PERCENTAGE_MULTIPLIER = 100;
const DECIMAL_PLACES = 2;
const JSON_INDENT = 2;
const POWER_BASE = 2;
const REPEAT_COUNT = 80;
const HIGH_MEMORY_THRESHOLD = 90;
const MINIMUM_FREE_MEMORY_GB = 1;
const MICROSECONDS_TO_MS = 1000000;
const CPU_MULTIPLIER = 4;
const MAX_WORKERS = 32;


// MCP Routes - Forward to appropriate MCP
app.use(
  '/api/orchestrator',
  createProxyMiddleware({
    target: MCP_CONFIG.ASOOS_MASTER_MCP,
    changeOrigin: true,
    pathRewrite: { '^/api/orchestrator': '/api/orchestrate' },
    onProxyReq: proxyReq => {
      proxyReq.setHeader('X-MCP-Service', 'mocoa-interface');
      proxyReq.setHeader('X-Universal-Orchestrator', 'true');
    },
  })
);

// Universal Orchestrator Routes
app.use(
  '/api/universal',
  createProxyMiddleware({
    target: MCP_CONFIG.UNIVERSAL_ORCHESTRATOR,
    changeOrigin: true,
    onProxyReq: proxyReq => {
      proxyReq.setHeader('X-Service-Source', 'mocoa-interface');
    },
  })
);

// AIPUB MCP Routes
app.use(
  '/api/aipub',
  createProxyMiddleware({
    target: MCP_CONFIG.MCP_AIPUB,
    changeOrigin: true,
    pathRewrite: { '^/api/aipub': '/api' },
    onProxyReq: proxyReq => {
      proxyReq.setHeader('X-Interface', 'MOCOA-AIPUB');
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mocoa-interface' });
});

app.listen(PORT, () => {
  console.log(`MOCOA Interface running on port ${PORT}`);
  console.log(`Connected to ASOOS Master MCP: ${MCP_CONFIG.ASOOS_MASTER_MCP}`);
  console.log(`Connected to Universal Orchestrator: ${MCP_CONFIG.UNIVERSAL_ORCHESTRATOR}`);
  console.log(`Connected to AIPUB MCP: ${MCP_CONFIG.MCP_AIPUB}`);
});
