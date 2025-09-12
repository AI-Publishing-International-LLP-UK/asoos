# Multi-stage build for optimized production image
FROM node:24.7.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Production stage
FROM node:24.7.0-alpine AS production

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aixtiv -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code from builder
COPY --from=builder --chown=aixtiv:nodejs /app/index.js ./
COPY --from=builder --chown=aixtiv:nodejs /app/diamond-cli ./diamond-cli/
COPY --from=builder --chown=aixtiv:nodejs /app/services ./services/
COPY --from=builder --chown=aixtiv:nodejs /app/tests ./tests/

# Copy other necessary files
COPY --from=builder --chown=aixtiv:nodejs /app/*.js ./

# Switch to non-root user
USER aixtiv

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "http.get('http://localhost:8080/health', (res) => { \
        res.statusCode === 200 ? process.exit(0) : process.exit(1) \
    })"

# Start the application
CMD ["node", "index.js"]
