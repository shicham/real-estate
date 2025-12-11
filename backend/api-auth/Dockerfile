FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]