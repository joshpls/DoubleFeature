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

🚦 Getting Started
Prerequisites

    Docker Desktop

    A TMS (Gracenote) API Key (Get one here)

Installation & Run

    Create a folder and move to that folder in terminal / command prompt:
    Bash
    mk cinema-planner
    cd cinema-planner

    Inside the folder create a docker-compose.yaml file:
    Bash

    services:
    # The Backend API
    backend:
        image: ghcr.io/joshpls/movie-backend:latest
        container_name: movie-backend
        ports:
        - "8080:8080"
        environment:
        - MOVIE_API_KEY=${MOVIE_API_KEY}
        # Add any other backend variables here
        restart: always

    # The React Frontend
    frontend:
        image: ghcr.io/joshpls/movie-frontend:latest
        container_name: movie-frontend
        ports:
        - "3000:80"
        environment:
        - VITE_API_URL=http://localhost:8080
        depends_on:
        - backend
        restart: always

    Create a .env file:
    Bash

    # Put your actual TMS / Movie API Key here:
    MOVIE_API_KEY=your_api_key_here

    # Optional: Change these if port 3000 or 8080 are already in use on your PC
    FRONTEND_PORT=3000
    BACKEND_PORT=8080

    Launch with Docker:
    Bash

    docker-compose up -d

    Access the App:

        Frontend: http://localhost:3000

        Backend Health Check: http://localhost:5000/api/health

    Shutting down the App:
    Bash

    docker-compose down

🏗 System Architecture

    Client requests showtimes via the Search Form.

    Rate Limiter validates the request frequency.

    Controller checks the Cache Service for existing data for that Zip/Date.

    On a Cache Miss, the server fetches data from TMS API, stores it, and returns it.

    React State manages the "First Movie" selection to dynamically filter remaining "Second Movie" options.

📝 License

Distributed under the MIT License. See LICENSE for more information.
