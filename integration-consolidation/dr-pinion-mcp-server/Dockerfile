# Dr. Pinion - Pinecone MCP Server Container
# Handles semantic search across 10M+ ChatGPT/Claude conversation pages

FROM node:24-slim-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S drpinion -u 1001

# Set ownership
RUN chown -R drpinion:nodejs /app
USER drpinion

# Expose MCP server port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the Dr. Pinion MCP server
CMD ["node", "server.js"]