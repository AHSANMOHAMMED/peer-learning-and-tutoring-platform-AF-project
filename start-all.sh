#!/bin/bash

# PeerLearn Start Script
# This script starts both the backend and frontend development servers.

echo "🚀 Starting PeerLearn Platform..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT

# Start Backend
echo "📡 Starting Backend Server..."
cd backend && npm run dev & 
# Wait for backend to start (simple check)
sleep 2

# Start Frontend
echo "💻 Starting Frontend Dev Server..."
cd ../frontend && npm run dev &

# Keep script running
wait
