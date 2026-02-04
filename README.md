Here is a reformatted version of your README.md. I’ve restructured it to flow from High-Level Purpose → Technical Setup → Internal Logic, making it much easier for a new developer to follow.
🎥 Cinema Double-Feature Planner

A full-stack application designed to solve "lobby math." It helps users plan the perfect movie double-feature by calculating travel times and theater gaps so you never miss the previews.
✨ Features

    Smart Scheduling: Automatically filters second-movie options based on your first selection’s end time.

    Theater Locking: Dynamically locks showtimes to a single location once your journey begins.

    Gap Visualization: Color-coded UI (Ideal, Tight, Long Wait) with exact minute-difference tooltips.

    Vintage Itinerary: Generates a printable, nostalgic movie stub for your finalized schedule.

    Real-time Data: Powered by the TMS (Gracenote) API for accurate theater showtimes.

🛠 Tech Stack
Layer	Technologies	Key Implementation
Frontend	React, TypeScript, Vite	Strict type safety & CSS-in-JS ticket styling.
Backend	Node.js, Express	MVC architecture with decoupled Service layers.
Caching	node-cache	Protects API quota and reduces latency.
Security	express-rate-limit	DDoS protection and environment masking.
DevOps	Docker, Nginx, GH Actions	Multi-container setup with automated CI/CD.
📂 Project Structure
```Plaintext

.
├── movie-planner-backend/      # Express API & Business Logic
│   ├── Dockerfile
│   └── .dockerignore
├── movie-planner-frontend/     # React (Vite) User Interface
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml          # Production/Base configuration
├── docker-compose.override.yml # Local development volumes
└── .env                        # Local secrets (ignored by Git)
```

🚀 Quick Start Guide
1. Prerequisites

    Docker & Docker Compose

    A TMS (Gracenote) API Key

2. Environment Setup

Create a .env file in the root directory:
```Bash

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# API Keys
TMS_API_KEY=your_tms_api_key_here

# Internal URLs
VITE_API_URL=http://localhost:8080/api
```

3. Launching the App

Run the automated setup (or manual command) in the root folder:
```Bash

docker compose up --build

    Frontend: http://localhost:3000

    Backend API: http://localhost:8080/api
```

🏗 System Architecture

    Request: User searches for movies via the React Search Form.

    Middleware: Rate Limiter validates request frequency; Cache Service checks for existing Zip/Date data.

    Data Fetch: On a Cache Miss, the server fetches from TMS API and populates the cache.

    Logic: React state handles "Theater Locking" to dynamically filter valid "Second Movie" options.

    Output: An itinerary is generated and formatted into a printable CSS ticket stub.

🛠 Development & Troubleshooting

    [!TIP] Hot Reloading: The project uses Docker Volumes. Changes in ./movie-planner-frontend or ./movie-planner-backend reflect instantly in the container.

    Cleanup: If ports are stuck or node_modules are busy:
    Bash

    docker compose down -v

    Linux/CachyOS Permissions: If you encounter permission errors with Docker:
    Bash

    sudo usermod -aG docker $USER # Log out and back in after running

📝 License

Distributed under the MIT License. See LICENSE for more information.