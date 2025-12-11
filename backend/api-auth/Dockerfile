# backend/api-auth/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first (helps cache)
COPY package.json package-lock.json* ./

# Install all deps (including dev) so we can run the TypeScript compiler
RUN npm ci

# Copy source
COPY . .

# Build TypeScript (outputs to dist)
RUN npm run build

# Remove devDependencies to keep node_modules small for runtime
RUN npm prune --production

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy only production node_modules and compiled output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]