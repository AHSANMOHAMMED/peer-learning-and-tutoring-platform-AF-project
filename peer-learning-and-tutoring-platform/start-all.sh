#!/bin/bash
# Start MongoDB
mongod --config /opt/homebrew/etc/mongod.conf &
sleep 3

# Start servers
cd server && npm run dev &
cd ../client && npm run dev &

echo "✅ All services started"
wait
