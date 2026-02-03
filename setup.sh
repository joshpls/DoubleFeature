#!/bin/bash

echo "🎬 Movie Planner - Setup Wizard"
echo "-------------------------------"

# 1. Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install it first."
    exit 1
fi

# 2. Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    read -p "Enter your MOVIE_API_KEY: " api_key
    
    cat <<EOF > .env
MOVIE_API_KEY=$api_key
VITE_API_URL=http://localhost:8080
FRONTEND_PORT=3000
BACKEND_PORT=8080
EOF
    echo "✅ .env created!"
else
    echo "ℹ️  .env file already exists, skipping creation."
fi

# 3. Pull and Start
echo "🚀 Pulling latest images and starting containers..."
docker compose pull
docker compose up -d

echo "-------------------------------"
echo "🎉 Setup Complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "⚙️  Backend API: http://localhost:8080"
