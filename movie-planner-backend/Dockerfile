# Use BUILDPLATFORM to run npm install on the runner's native CPU (fast)
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install dependencies natively
RUN npm install

COPY . .

# Final stage: Use TARGETPLATFORM for the actual running image
FROM node:20-alpine
WORKDIR /app
# Copy the node_modules built in the previous step
COPY --from=builder /app /app

EXPOSE 8080
CMD ["node", "server.js"]
