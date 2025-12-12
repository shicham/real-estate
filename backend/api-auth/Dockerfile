FROM node:20-alpine AS build
WORKDIR /app

# Copy package manifests first for caching
COPY package.json package-lock.json* ./

# Install all deps (including dev) so tsc is available
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Final image
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy only production node_modules and compiled output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]