# Step 1: Build the app
FROM node:20-alpine AS build

# Accept the API URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the app with Nginx
FROM nginx:stable-alpine
# Copy the built files from the build stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config if you have one, or use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Standard Nginx health check using wget
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1