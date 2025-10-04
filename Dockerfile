FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk update && apk add --no-cache curl bash

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy source code
COPY server.js ./
COPY ecosystem-healer.js ./

# Create non-root user
RUN addgroup -g 1001 -S aixtiv && adduser -S aixtiv -u 1001
RUN chown -R aixtiv:aixtiv /app

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Switch to non-root user
USER aixtiv

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
