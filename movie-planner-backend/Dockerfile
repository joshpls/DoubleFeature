FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
# Install dependencies natively
RUN npm install

COPY . .

# Final stage: Use TARGETPLATFORM for the actual running image
FROM node:20-slim
WORKDIR /app
# Copy the node_modules built in the previous step
COPY --from=builder /app /app

EXPOSE 8080
CMD ["node", "server.js"]

# Pings the health route every 10 seconds
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
