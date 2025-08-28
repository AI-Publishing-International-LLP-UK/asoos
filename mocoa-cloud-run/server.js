const express = require('express');
const path = require('path');
const app = express();

// Set the port from environment variable or default to 8080 (Cloud Run default)
const PORT = process.env.PORT || 8080;

// Serve static files (CSS, JS, images) with proper MIME types
app.use(express.static(__dirname, {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.html')) {
      res.set('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Serve the MOCOA interface on all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'mocoa-interface',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MOCOA Interface server running on port ${PORT}`);
  console.log(`🎯 Health check available at /health`);
  console.log(`🤖 PCP System Ready - QB (Dr. Lucy sRIX) available for activation`);
});
