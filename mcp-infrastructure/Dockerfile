# Quantum Swarm MCP Infrastructure Dockerfile
# Node.js 24+ with production optimizations

FROM node:24-slim

# Set working directory
WORKDIR /app

# Install system dependencies for production
RUN apt-get update && apt-get install -y \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with production optimizations
ENV NODE_ENV=production
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

# Copy application files
COPY master-mcp-template.js ./
COPY customer-mcp-provisioner.js ./
COPY diamond-sao-mcp-manager.js ./

# Create directories for runtime data
RUN mkdir -p /app/logs /app/tmp \
    && chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV PORT=8080
ENV NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps"
ENV QUANTUM_VMS_COUNT=12000
ENV DASHBOARD_VERSION=34
ENV MASTER_TEMPLATE=true

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "master-mcp-template.js"]

# Metadata
LABEL \
    org.opencontainers.image.title="Quantum Swarm MCP Infrastructure" \
    org.opencontainers.image.description="Master MCP Template for 12,000+ customer instances" \
    org.opencontainers.image.vendor="AI Publishing International LLP" \
    org.opencontainers.image.version="1.0.0" \
    org.opencontainers.image.created="2025-01-29" \
    org.opencontainers.image.source="https://github.com/AI-Publishing-International-LLP-UK/integration-gateway" \
    org.opencontainers.image.url="https://mcp.asoos.2100.cool" \
    quantum.vms.count="12000" \
    diamond.sao.version="34"