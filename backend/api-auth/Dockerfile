# backend/api-auth/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first (speeds up cache)
COPY package.json package-lock.json* ./

# Install production deps: prefer npm ci if lockfile exists, otherwise npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy source
COPY . .

# Build TypeScript (assumes there's a build script that outputs to dist)
RUN npm run build

# Final runtime image (smaller)
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy only production deps from build stage node_modules and dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]