# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install latest npm and dependencies (silently)
RUN npm install -g npm@latest --silent && \
    npm install --omit=dev --silent && \
    npm cache clean --force

# Production stage
FROM node:20-alpine AS production

# Create app directory
WORKDIR /app

# Create non-root user and install dependencies in one layer
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 && \
    apk add --no-cache curl && \
    npm install -g npm@latest --silent

# Copy package files
COPY package*.json ./

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY src/ ./src/

# Set environment variables to suppress npm notices
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
ENV NODE_NO_WARNINGS=1

# Create logs directory and set ownership in one layer
RUN mkdir -p logs && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]