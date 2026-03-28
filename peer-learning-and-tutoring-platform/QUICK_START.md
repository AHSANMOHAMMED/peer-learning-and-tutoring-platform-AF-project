# Quick Start Guide

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd peer-learning-and-tutoring-platform
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Database Setup
```bash
# Option 1: Local MongoDB
brew install mongodb-community
brew services start mongodb-community

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option 3: MongoDB Atlas (free cloud)
# 1. Go to https://www.mongodb.com/atlas
# 2. Create free cluster
# 3. Get connection string
```

### 3. Environment Configuration
```bash
cd server
cp .env.example .env
# Edit .env with your settings:
# - MONGODB_URI (required)
# - JWT_SECRET (required)
# - Other optional settings
```

### 4. Database Migrations
```bash
cd server
npm run migrate
```

### 5. Start Development Servers
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## Default Accounts

After running migrations:
- **Admin**: admin@peerlearn.com / admin123
- **Tutor**: tutor@example.com / password123  
- **Student**: student@example.com / password123

## Development Features

- ✅ Peer matching system
- ✅ Group study rooms
- ✅ Lecture system
- ✅ Real-time chat
- ✅ File sharing
- ✅ Video conferencing (placeholder)
- ✅ AI features (placeholder)
- ✅ Analytics dashboard

## Test the Application

1. Register a new account
2. Create or join a study group
3. Test peer matching
4. Upload files
5. Try real-time features

## Production Deployment

For production deployment:
1. Set up production environment variables
2. Configure MongoDB Atlas
3. Set up Redis for caching
4. Use Docker Compose: `docker-compose up -d`
5. Or use the deploy script: `./deploy.sh production`

## Troubleshooting

**MongoDB Connection Error**
- Check MongoDB is running: `mongosh`
- Verify MONGODB_URI in .env
- Try MongoDB Atlas if local fails

**Port Already in Use**
- Kill process: `lsof -ti:5000 | xargs kill`
- Change PORT in .env

**Missing Dependencies**
- Run: `npm install` in both client and server
- Clear node_modules and reinstall if needed

## Need Help?

- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the [Database Setup Guide](./DATABASE_SETUP.md)
- Open an issue on GitHub
