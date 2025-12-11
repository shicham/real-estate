# backend/api-auth/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first (helps Docker layer cache)
COPY package.json package-lock.json* ./

# Prefer npm ci when a lockfile exists, otherwise fallback to npm install,
# install all deps so we can run the TypeScript compiler
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source
COPY . .

# Build TypeScript (assumes there's a build script that outputs to dist)
RUN npm run build

# Remove devDependencies so we only keep production deps for the runtime image
RUN npm prune --production

# Final runtime image
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only production node_modules and compiled output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]