# WFA Swarm Phase 6: Enterprise Container with Quantum Orchestration
FROM node:24-slim

# Enterprise build arguments for cache management and quantum orchestration
ARG CACHE_VERSION=1.0.0
ARG BUILD_HASH=prod
ARG QUANTUM_ORCHESTRATION_VERSION=2.4.7

# Set enterprise environment variables
ENV CACHE_VERSION=${CACHE_VERSION}
ENV BUILD_HASH=${BUILD_HASH}
ENV QUANTUM_ORCHESTRATION_VERSION=${QUANTUM_ORCHESTRATION_VERSION}
ENV NODE_ENV=production
ENV WFA_SWARM_PHASE=6

# Set the working directory inside the container
WORKDIR /app

# Install production dependencies for enhanced performance
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json for dependency management
COPY package*.json ./

# Install dependencies with enterprise optimizations
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Copy application code with quantum orchestration
COPY . .

# Create enterprise non-root user for security (Victory36 protection)
RUN groupadd -r mocoa && useradd -r -g mocoa -u 1001 mocoa \
    && chown -R mocoa:mocoa /app

# Switch to non-root user for enhanced security
USER mocoa

# Add enterprise health check for quantum orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose the port for Cloud Run
EXPOSE 8080

# Enterprise startup with quantum orchestration logging
CMD echo "🔮 Starting MOCOA with Dr. Claude Quantum Orchestration v${QUANTUM_ORCHESTRATION_VERSION}" \
    && echo "⚡ Cache Version: ${CACHE_VERSION} | Build Hash: ${BUILD_HASH}" \
    && echo "🛡️ Victory36 Protection: ACTIVE" \
    && echo "🌊 WFA Swarm Phase: ${WFA_SWARM_PHASE}" \
    && npm start
