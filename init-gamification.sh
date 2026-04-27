#!/bin/bash

# Script to initialize gamification profiles for all users using the RUNNING backend API
# This fixes the "gamification not appearing in student dashboard" issue

BACKEND_URL="http://localhost:5001"

echo "Initializing gamification profiles using backend API..."

# First, let's get a valid token by logging in as admin
echo "Getting authentication token..."

# We need to create a temporary script to get a token
node -e "
const jwt = require('jsonwebtoken');
const mongoose = require('./config/db');
const User = require('./models/User');

async function getAdminToken() {
  await mongoose;
  const admin = await User.findOne({ role: 'superadmin' });
  if (!admin) {
    console.log('No superadmin found');
    process.exit(1);
  }
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret');
  console.log(token);
  process.exit(0);
}

getAdminToken().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
" > /tmp/get_token.js

TOKEN=$(cd /Users/ahsan/peer-learning-and-tutoring-platform/backend && node /tmp/get_token.js 2>/dev/null | tail -1)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Got token (first 20 chars): ${TOKEN:0:20}..."

# Now initialize gamification profiles for all users
echo "Initializing gamification profiles..."

# Call the backend API to initialize profiles
curl -X POST "$BACKEND_URL/api/gamification/init-profiles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  2>/dev/null | python3 -m json.tool

echo "Done!"
rm -f /tmp/get_token.js
