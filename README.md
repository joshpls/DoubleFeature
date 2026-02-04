![CI/CD Status](https://github.com/joshpls/DoubleFeature/actions/workflows/deploy.yml/badge.svg)

🎥 Cinema Double-Feature Planner

A full-stack application that helps users plan a perfect movie double-feature. It handles the "lobby math" for you, ensuring you have enough time for popcorn between films without driving across town.

🚀 Features

    Smart Scheduling: Automatically filters second-movie options based on the end time and location of your first choice.

    Theater Locking: Once a movie is selected, the app locks showtimes to that specific theater for a seamless transition.

    Gap Visualization: Color-coded showtime buttons (Ideal, Tight, Long Wait) with hover tooltips showing exact minute differences.

    Vintage Itinerary: Generates a printable, vintage-style movie stub with your full day's schedule.

    Live Data: Integrated with the TMS (Gracenote) API for real-time showtimes.

🛠 Tech Stack
Frontend

    React (TypeScript): Component-based UI with strict type safety.

    CSS-in-JS: Custom ticket stub styling and interactive UI states.

Backend (Node.js/Express)

    Architecture: MVC (Models, Controllers, Routes) pattern for scalability.

    Caching: node-cache implementation to reduce API latency and protect quota.

    Security: express-rate-limit for DDoS protection and .env for API key masking.

    Services: Decoupled cache and logic layers.

Infrastructure

    Docker: Multi-container setup using docker-compose.

    Nginx: Production-grade web server for the React frontend.

🎥 Movie Planner - Quick Start Guide

This project is a full-stack movie planning application with a Node.js/Express backend and a Vite/React frontend, fully containerized with Docker.

🚀 Getting Started
1. Prerequisites

Ensure you have the following installed:

    Docker (Native engine recommended for Linux users)

    Docker Compose

2. Environment Setup

Create a .env file in the root directory and fill in your credentials:
Plaintext

# --- Ports ---
BACKEND_PORT=8080
FRONTEND_PORT=3000

# --- API Keys ---
TMS_API_KEY=your_tms_api_key_here

# --- URLs ---
VITE_API_URL=http://localhost:8080/api

3. Launching the App

Run the following command in the root folder to build and start both services:
Bash

docker compose up --build

Once the containers are healthy, you can access the app at:

    Frontend: http://localhost:3000

    Backend API: http://localhost:8080/api

🛠 Development Workflow
Local File Syncing

The project is configured with Docker Volumes. This means any changes you make to the code in ./movie-planner-frontend or ./movie-planner-backend will automatically reflect in the running containers without needing a rebuild.
Troubleshooting

If you encounter "Port already allocated" or "node_modules busy" errors, run the clean-up command:
Bash

docker compose down -v

📂 Project Structure
Plaintext

.
├── movie-planner-backend/   # Express API
│   ├── Dockerfile
│   └── .dockerignore
├── movie-planner-frontend/  # Vite + React
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml       # Production/Base Config
├── docker-compose.override.yml # Local Dev Config
└── .env                     # Secret variables (do not commit)

A Note for CachyOS/Arch Users

If you get a permission error, ensure your user is part of the docker group:
Bash

sudo usermod -aG docker $USER

(You must log out and back in for this to take effect.)

🏗 System Architecture

    Client requests showtimes via the Search Form.

    Rate Limiter validates the request frequency.

    Controller checks the Cache Service for existing data for that Zip/Date.

    On a Cache Miss, the server fetches data from TMS API, stores it, and returns it.

    React State manages the "First Movie" selection to dynamically filter remaining "Second Movie" options.

📝 License

Distributed under the MIT License. See LICENSE for more information.
