const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
// Load environment variables
dotenv.config();

// Configuration for AI Homework Multimodal support
// Note: Increased payload limits to 50MB to support large base64 data.

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const passport = require('./config/passport');

// Suppress Mongoose reserved key warnings (harmless isNew warning)
process.noDeprecation = true;

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(passport.initialize());


// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

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
app.use('/api/system', require('./routes/system'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/homework', require('./routes/homework'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date(),
    mongo: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    uptime: process.uptime(),
    memory: {
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024)
    },
    cpu: (Math.random() * (15 - 5) + 5).toFixed(1) // Mock CPU for telemetry consistency
  });
});

// Forum and Gamification Routes
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/badges', require('./routes/badges'));

// Peer Tutoring and Group Room Routes
app.use('/api/peer', require('./routes/peer'));
app.use('/api/groups', require('./routes/groups'));

// Lecture/Course Routes
app.use('/api/lectures', require('./routes/lectures'));

// Phase 3-6 Advanced Routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/feature-flags', require('./routes/featureFlags'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/ai-homework', require('./routes/aiHomework'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api', require('./routes/parentModeration'));
app.use('/api/personalization', require('./routes/personalization'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/video', require('./routes/video'));
app.use('/api/social', require('./routes/social'));

// Interactive Session Features
app.use('/api/polls', require('./routes/polls'));
app.use('/api/breakout', require('./routes/breakout'));
app.use('/api/files', require('./routes/files'));
app.use('/api/qa', require('./routes/qa'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/search', require('./routes/search'));


// Socket.io for Real-time Features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });
  
  socket.on('draw', (data) => {
    socket.to(data.sessionId).emit('draw_receive', data);
  });
  
  socket.on('message', (data) => {
    socket.to(data.sessionId).emit('message_receive', data);
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
    socket.emit('notificationRead', { notificationId });
  });

  // Join question room
  socket.on('joinQuestion', (questionId) => {
    socket.join(`question_${questionId}`);
  });

  // Join leaderboard room
  socket.on('joinLeaderboard', (type) => {
    socket.join(`leaderboard_${type}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Global Error Handlers to prevent ghosting or silent failures
process.on('unhandledRejection', (reason, promise) => {
  console.error('😱 UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
  // Optional: Graceful shutdown if error is critical
});

process.on('uncaughtException', (error) => {
  console.error('‼️ UNCAUGHT EXCEPTION:', error.message);
  console.error(error.stack);
  // Exit gracefully to let nodemon restart
  process.exit(1);
});

