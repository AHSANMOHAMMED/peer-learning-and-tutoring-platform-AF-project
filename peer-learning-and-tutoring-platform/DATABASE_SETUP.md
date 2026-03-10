# Database Setup Guide

## MongoDB Setup

### Option 1: Local Installation
```bash
# Install MongoDB Community Server
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

### Option 2: Docker
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or with docker-compose
docker-compose up -d mongo
```

### Option 3: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env` with: `MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/peer_learning`

## Redis Setup (Optional - for caching)

### Local Installation
```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis
```

### Docker
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

## Run Database Migrations

After setting up MongoDB:

```bash
cd server
cp .env.example .env
# Edit .env with your database URI

# Run migrations
npm run migrate

# Or directly
node scripts/migrate.js
```

## What Migrations Do

1. **Create Database Indexes** - Optimizes query performance
2. **Create Admin User** - Default admin account
3. **Create Sample Data** - Development users and test data

## Environment Variables

Required for database setup:
```bash
MONGODB_URI=mongodb://localhost:27017/peer_learning
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Verify Setup

Check if everything works:
```bash
# Start the server
npm run dev

# Server should start without database errors
# You can now register users and use the platform
```
