# syntax=docker/dockerfile:1.4
# Multi-stage Dockerfile for Cloud Run AMD64 compatibility

# Build stage
FROM --platform=linux/amd64 node:24-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json .npmrc ./

# Install Node.js dependencies with explicit platform targeting
RUN npm ci --omit=dev --arch=x64 --platform=linux && npm cache clean --force

# Production stage
FROM --platform=linux/amd64 node:24-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user early
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /usr/src/app

# Copy dependencies from build stage
COPY --from=base --chown=appuser:appuser /usr/src/app/node_modules ./node_modules

# Copy application files
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PLATFORM=linux
ENV ARCH=x64

# Health check (use PORT env var set by Cloud Run)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start the application (adjust as needed)
CMD ["node", "server.js"]
