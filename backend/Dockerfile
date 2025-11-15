# Multi-stage Dockerfile for BookMySaloon backend
# Builder stage: install dev deps and build
FROM node:18-alpine AS builder
WORKDIR /app

# Install build-time deps (dev + prod)
COPY package*.json ./
RUN npm ci

# Copy source and run build
COPY . .
RUN npm run build

# Runner stage: smaller final image with only production deps
FROM node:18-alpine AS runner
WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
# If your app serves any static files, copy public too (uncomment if needed)
# COPY --from=builder /app/public ./public

ENV NODE_ENV=production
# Railway provides PORT; default to 5000 if not provided
ENV PORT 5000
EXPOSE 5000

# Healthcheck — query local port
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget -qO- --timeout=2 http://127.0.0.1:${PORT}/health || exit 1

# Start the application (uses package.json start script -> node dist/server.js)
CMD ["npm", "start"]

