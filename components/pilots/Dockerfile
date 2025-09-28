# ASOOS Pilots Container - Launch Ready
FROM node:24-slim-alpine

WORKDIR /app

# Copy pilot system files
COPY . .

# Install dependencies
RUN npm install express cors

# Create simple server for pilots
COPY <<EOF server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'asoos-pilots', 
    pilots: 14,
    ready: true,
    timestamp: new Date().toISOString()
  });
});

// Pilots API
app.get('/api/pilots', (req, res) => {
  res.json({
    total: 14,
    active: 14,
    squadrons: 'ready',
    swarms: 'active'
  });
});

app.listen(PORT, () => {
  console.log(`🎭 ASOOS Pilots ready on port ${PORT}`);
});
EOF

EXPOSE 3000
CMD ["node", "server.js"]