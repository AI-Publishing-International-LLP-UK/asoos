# 🎭 AIXTIV Symphony - Enterprise Voice Synthesis Docker Image
# Multi-stage build with Node.js 24, Diamond CLI, and enterprise voice capabilities
# Authority: Diamond SAO Command Center - Mr. Phillip Corey Roark
# Mission: World-class 18-agent voice synthesis system

FROM node:24.11.0-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    curl \
    wget \
    git \
    bash \
    dumb-init \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S aixtiv && \
    adduser -S aixtiv -u 1001

# Install global npm packages
RUN npm install -g newman newman-reporter-htmlextra

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Make Diamond CLI executable if it exists
RUN if [ -f "diamond-cli/bin/diamond" ]; then chmod +x diamond-cli/bin/diamond && ln -s /app/diamond-cli/bin/diamond /usr/local/bin/diamond; fi

# Production build stage
FROM base AS builder

# Copy package files
COPY package*.json ./
COPY diamond-cli/package*.json ./diamond-cli/

# Install dependencies
RUN npm ci --only=production --no-audit --no-fund
RUN cd diamond-cli && npm ci --only=production --no-audit --no-fund

# Copy source code
COPY . .

# Build the application (if build script exists)
RUN if [ -f "package.json" ] && grep -q '"build"' package.json; then npm run build; fi

# Make Diamond CLI executable if it exists
RUN if [ -f "diamond-cli/bin/diamond" ]; then chmod +x diamond-cli/bin/diamond; fi

# Production stage
FROM node:24.7.0-alpine AS production

# Install runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    curl \
    wget \
    bash \
    dumb-init \
    ca-certificates \
    tini && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S aixtiv && \
    adduser -S aixtiv -u 1001

# Set working directory
WORKDIR /app

# Install global npm packages needed for runtime
RUN npm install -g newman newman-reporter-htmlextra

# Copy built application from builder stage
COPY --from=builder --chown=aixtiv:aixtiv /app .

# Create symlink for Diamond CLI global access if it exists
RUN if [ -f "/app/diamond-cli/bin/diamond" ]; then ln -s /app/diamond-cli/bin/diamond /usr/local/bin/diamond; fi

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp && \
    chown -R aixtiv:aixtiv /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    GCP_PROJECT=api-for-warp-drive \
    CLOUD_ML_REGION=us-west1 \
    INTEGRATION_MCP=enabled \
    MOCOA_ORCHESTRATION=enabled \
    DIAMOND_CLI_VERSION=latest \
    VOICE_SYSTEM_ENABLED=true \
    ENTERPRISE_MODE=true \
    MAX_VOICE_CONCURRENT=100 \
    VOICE_CACHE_TTL=3600 \
    AGENT_COUNT=18

# Enterprise Health check with voice system verification
HEALTHCHECK --interval=30s --timeout=15s --start-period=90s --retries=5 \
    CMD curl -f http://localhost:8080/health && \
        curl -f http://localhost:8080/api/agents/voices && \
        curl -f http://localhost:8080/api/system/status || exit 1

# Security: Switch to non-root user
USER aixtiv

# Expose port
EXPOSE 8080

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["tini", "--"]

# Enterprise voice synthesis server
CMD ["node", "server-enterprise.js"]

# Alternative enterprise commands:
# CMD ["node", "server.js"]  # Basic server
# CMD ["diamond", "monitor"]   # Diamond CLI monitoring
# CMD ["node", "server-enterprise.js"] # Full enterprise voice system (default)
