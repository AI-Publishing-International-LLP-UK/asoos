const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());

// Health check endpoint - REQUIRED for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'warp-drive-service',
    timestamp: new Date().toISOString(),
    port: PORT,
    binding: '0.0.0.0',
    fix_applied: true
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'warp-drive-service',
    version: '1.0.0-fixed',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: ['/health', '/'],
    fix_applied: true
  });
});

// CRITICAL: Bind to 0.0.0.0 for Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 warp-drive-service started (FIXED)');
  console.log(`📡 Listening on http://0.0.0.0:${PORT}`);
  console.log(`🔧 CLOUD RUN BINDING: 0.0.0.0:${PORT} (FIXED)`);
  console.log(`✅ Health endpoint: http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});
