# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine
# Copy the custom config we just made
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the build artifacts (Use /app/dist for Vite or /app/build for CRA)
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
