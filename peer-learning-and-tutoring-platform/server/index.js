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

  // Join peer session room
  socket.on('joinPeerSession', (sessionId) => {
    socket.join(`peer_session_${sessionId}`);
    console.log(`User ${socket.id} joined peer session room: ${sessionId}`);
  });

  // Leave peer session room
  socket.on('leavePeerSession', (sessionId) => {
    socket.leave(`peer_session_${sessionId}`);
    console.log(`User ${socket.id} left peer session room: ${sessionId}`);
  });

  // Join group room
  socket.on('joinGroupRoom', (roomId) => {
    socket.join(`group_room_${roomId}`);
    console.log(`User ${socket.id} joined group room: ${roomId}`);
  });

  // Leave group room
  socket.on('leaveGroupRoom', (roomId) => {
    socket.leave(`group_room_${roomId}`);
    console.log(`User ${socket.id} left group room: ${roomId}`);
  });

  // Handle peer session status updates
  socket.on('peerSessionUpdate', (data) => {
    const { sessionId, status, userId } = data;
    socket.to(`peer_session_${sessionId}`).emit('peerSessionStatusChanged', {
      sessionId,
      status,
      userId,
      timestamp: new Date()
    });
  });

  // Handle group room chat messages
  socket.on('groupRoomMessage', (data) => {
    const { roomId, message, userId } = data;
    socket.to(`group_room_${roomId}`).emit('newGroupMessage', {
      roomId,
      message,
      userId,
      timestamp: new Date()
    });
  });

  // Handle group room participant updates
  socket.on('groupRoomParticipantUpdate', (data) => {
    const { roomId, participants, action } = data;
    socket.to(`group_room_${roomId}`).emit('groupRoomParticipantsChanged', {
      roomId,
      participants,
      action,
      timestamp: new Date()
    });
  });

  // Handle typing indicators for group rooms
  socket.on('groupRoomTyping', (data) => {
    const { roomId, userId, isTyping } = data;
    socket.to(`group_room_${roomId}`).emit('groupRoomUserTyping', {
      roomId,
      userId,
      isTyping
    });
  });

  // Handle whiteboard updates for group rooms
  socket.on('whiteboardUpdate', (data) => {
    const { roomId, whiteboardData, userId } = data;
    socket.to(`group_room_${roomId}`).emit('whiteboardChanged', {
      roomId,
      whiteboardData,
      userId,
      timestamp: new Date()
    });
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
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Enable CORS preflight for all routes
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing - accepts all HTTP methods (GET, POST, etc.)
app.all('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PeerLearn API is running',
    timestamp: new Date().toISOString(),
    method: req.method
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
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/moderation', require('./routes/moderation'));
app.use('/api/admin', require('./routes/admin'));

// Forum and Gamification Routes
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/badges', require('./routes/badges'));
// app.use('/api/leaderboard', require('./routes/leaderboard')); // Removed - not part of Q&A

// Peer Tutoring and Group Room Routes
app.use('/api/peer', require('./routes/peer'));
app.use('/api/groups', require('./routes/groups'));

// Lecture/Course Routes
app.use('/api/lectures', require('./routes/lectures'));

// NEW: Phase 3 - AI, Analytics & Advanced Features
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/ai')); // Analytics routes included in ai.js
app.use('/api/recordings', require('./routes/ai')); // Recording routes included in ai.js
app.use('/api/feature-flags', require('./routes/featureFlags'));

// NEW: Phase 4 - NFT Certificates
app.use('/api/certificates', require('./routes/certificates'));

// NEW: Phase 5 - AI Homework Assistant
app.use('/api/ai-homework', require('./routes/aiHomework'));

// NEW: Phase 5 - Gamification System
app.use('/api/gamification', require('./routes/gamification'));

// NEW: Phase 5 - Course Marketplace
app.use('/api/marketplace', require('./routes/marketplace'));

// NEW: Phase 5 - AI Moderation & Parent Dashboard
app.use('/api', require('./routes/parentModeration'));

// NEW: Phase 6 - AI Personalization Engine
app.use('/api/personalization', require('./routes/personalization'));

// NEW: Phase 6 - School/Institution Management
app.use('/api/schools', require('./routes/schools'));

// NEW: Phase 6 - Video Conferencing
app.use('/api/video', require('./routes/video'));

// NEW: Phase 6 - Social Features
app.use('/api/social', require('./routes/social'));

// Q&A Module Routes (Isolated Feature)
// app.use('/api/qa', require('./modules/qa/routes/qa.routes')); // Temporarily disabled

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
