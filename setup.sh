#!/bin/bash

# --- 1. Load or Prompt for API Key ---
if [ -f .env ]; then
    EXISTING_KEY=$(grep TMS_API_KEY .env | cut -d '=' -f2)
fi

if [ -z "$EXISTING_KEY" ] || [ "$EXISTING_KEY" == "your_key_here" ]; then
    echo "🔑 TMS API Key not found."
    read -p "Please enter your TMS_API_KEY: " USER_KEY
else
    USER_KEY=$EXISTING_KEY
    echo "✅ Using existing TMS_API_KEY."
fi

# --- 2. API Key Validation ---
echo "📡 Validating API Key with TMS OnConnect..."
# We test a simple 'movies' endpoint to see if the key works
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://feeds.tmsapi.com/v2.1/movies/showings?zip=90210&api_key=$USER_KEY")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✨ API Key is VALID."
elif [ "$HTTP_STATUS" -eq 403 ]; then
    echo "❌ ERROR: Invalid API Key (403 Forbidden). Please check your key and try again."
    exit 1
else
    echo "⚠️  WARNING: Could not verify key (Status: $HTTP_STATUS). Proceeding anyway..."
fi

# Create/Update .env
printf "BACKEND_PORT=8080\nFRONTEND_PORT=3000\nVITE_API_URL=http://localhost:8080/api\nTMS_API_KEY=$USER_KEY\n" > .env

# --- 3. Cleanup & Resource Reset ---
echo "🧹 Cleaning up old Docker state..."
docker compose down -v --remove-orphans 2>/dev/null
rm -rf movie-planner-backend/node_modules movie-planner-frontend/node_modules

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo chown -R $USER:$USER .
fi

# --- 4. Launch ---
echo "🏗️ Starting containers..."
docker compose up --build -d

echo "-------------------------------------------------------"
echo "✅ Setup Complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "-------------------------------------------------------"

# --- 5. Post-Launch Permission Sync ---
# This ensures the host 'node_modules' created by Docker are editable by the user
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔒 Syncing file permissions for IDE support..."
    sudo chown -R $USER:$USER .
fi