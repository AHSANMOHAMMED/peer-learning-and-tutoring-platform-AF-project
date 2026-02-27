require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const BadgeService = require('./services/badgeService');

// Initialize database connection
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io available globally
global.io = io;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join question room for real-time updates
  socket.on('joinQuestion', (questionId) => {
    socket.join(`question_${questionId}`);
    console.log(`User ${socket.id} joined question room: ${questionId}`);
  });

  // Leave question room
  socket.on('leaveQuestion', (questionId) => {
    socket.leave(`question_${questionId}`);
    console.log(`User ${socket.id} left question room: ${questionId}`);
  });

  // Join leaderboard room for real-time updates
  socket.on('joinLeaderboard', (type) => {
    socket.join(`leaderboard_${type}`);
    console.log(`User ${socket.id} joined leaderboard room: ${type}`);
  });

  // Handle typing indicators for answers
  socket.on('typingAnswer', (data) => {
    const { questionId, userId, isTyping } = data;
    socket.to(`question_${questionId}`).emit('userTyping', {
      userId,
      isTyping,
      questionId
    });
  });

  // Handle real-time notifications
  socket.on('markNotificationRead', (notificationId) => {
    // This would typically update the database
    socket.emit('notificationRead', { notificationId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));
// Enable CORS preflight for all routes
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PeerLearn API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/sessions', require('./routes/sessions')); // Temporarily commented
// app.use('/api/materials', require('./routes/materials')); // Temporarily commented
app.use('/api/moderation', require('./routes/moderation'));
app.use('/api/admin', require('./routes/admin'));

// Forum and Gamification Routes
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/points', require('./routes/points'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Q&A Module Routes (Isolated Feature)
app.use('/api/qa', require('./modules/qa/routes/qa.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = err.errors?.map(error => ({
      field: error.path,
      message: error.msg
    })) || [];
    
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 PeerLearn API is ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.io server is running`);
  
  // Initialize default badges
  try {
    await BadgeService.initializeDefaultBadges();
    console.log('🏆 Default badges initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing default badges:', error);
  }
});
