# October 13th Global Launch - Optimized Node.js 22 Container
FROM node:22-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create non-root user for security
RUN addgroup --gid 1001 --system nodejs &&     adduser --system --uid 1001 nodeuser

# Set ownership
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3   CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "start"]
