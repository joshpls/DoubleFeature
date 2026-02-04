# BUILD STAGE
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
# Use npm ci for clean, reproducible builds
RUN npm ci
COPY . .

# FINAL STAGE
FROM node:20-slim
WORKDIR /app

# Add curl for a more reliable health check (optional but recommended)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy only what is needed
COPY --from=builder /app /app

EXPOSE 8080

# Environment variable to ensure node 20 handles signals correctly
ENV NODE_ENV=production

CMD ["node", "server.js"]

# REVISED HEALTHCHECK: Using curl is much more robust in Docker environments
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1