#!/bin/bash

# PeerLearn Advanced Start Script
# Ensures environment is correctly configured before launching services.

echo "🚀 Starting PeerLearn Platform..."

# Ensure Node/NPM are in PATH
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# Function to check for dependencies
check_deps() {
    if [ ! -d "$1/node_modules" ]; then
        echo "⚠️  $1 dependencies not found. Installing..."
        cd "$1" && npm install && cd ..
    fi
    if [ ! -f "$1/.env" ]; then
        echo "❌ $1/.env is missing. Please check the setup guide."
        exit 1
    fi
}

# Validate Backend & Frontend
check_deps "backend"
check_deps "frontend"

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping PeerLearn servers..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT

# Start Backend
echo "📡 [BACKEND] Starting Express Server..."
cd backend && npm run dev & 
sleep 3

# Start Frontend
echo "💻 [FRONTEND] Starting Vite Dev Server..."
cd frontend && npm run dev &

echo "✨ Services are initializing. Access the platform at http://localhost:5173"
echo "Press Ctrl+C to stop all servers."

# Keep script running
wait
