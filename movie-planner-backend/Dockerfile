# 1. Use a lightweight Node.js image
FROM node:20-alpine

# 2. Set the directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy the rest of your source code
COPY . .

# 5. Expose the port your Express app runs on
EXPOSE 5000

# 6. Command to start the server
CMD ["node", "server.js"]
