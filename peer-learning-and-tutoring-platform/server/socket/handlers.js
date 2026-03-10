/**
 * Socket Handlers - Real-time event handlers for interactive features
 * Manages WebSocket events for sessions, breakout rooms, whiteboard, chat, etc.
 */

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Session Room Events
      socket.on('join_session', (data) => this.handleJoinSession(socket, data));
      socket.on('leave_session', (data) => this.handleLeaveSession(socket, data));
      socket.on('session_message', (data) => this.handleSessionMessage(socket, data));
      
      // Whiteboard Events
      socket.on('whiteboard_stroke', (data) => this.handleWhiteboardStroke(socket, data));
      socket.on('whiteboard_clear', (data) => this.handleWhiteboardClear(socket, data));
      
      // Screen Share Events
      socket.on('screen_share_started', (data) => this.handleScreenShareStarted(socket, data));
      socket.on('screen_share_stopped', (data) => this.handleScreenShareStopped(socket, data));
      
      // Breakout Room Events
      socket.on('join_breakout_room', (data) => this.handleJoinBreakoutRoom(socket, data));
      socket.on('leave_breakout_room', (data) => this.handleLeaveBreakoutRoom(socket, data));
      socket.on('breakout_message', (data) => this.handleBreakoutMessage(socket, data));
      socket.on('request_room_change', (data) => this.handleRoomChangeRequest(socket, data));
      
      // Polling Events
      socket.on('poll_vote', (data) => this.handlePollVote(socket, data));
      socket.on('poll_subscribe', (data) => this.handlePollSubscribe(socket, data));
      
      // Q&A Events
      socket.on('qa_question', (data) => this.handleQAQuestion(socket, data));
      socket.on('qa_upvote', (data) => this.handleQAUpvote(socket, data));
      socket.on('qa_answer', (data) => this.handleQAAnswer(socket, data));
      
      // File Sharing Events
      socket.on('file_shared', (data) => this.handleFileShared(socket, data));
      
      // User Presence Events
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
      socket.on('user_presence', (data) => this.handleUserPresence(socket, data));

      // Disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  // Session Room Handlers
  handleJoinSession(socket, { sessionId, user }) {
    socket.join(`session_${sessionId}`);
    socket.userId = user._id;
    socket.sessionId = sessionId;
    
    // Notify others in session
    socket.to(`session_${sessionId}`).emit('participant_joined', {
      user,
      timestamp: new Date()
    });

    // Send current participants to new joiner
    const sessionSockets = this.getSessionSockets(sessionId);
    socket.emit('session_state', {
      participants: sessionSockets.map(s => ({ userId: s.userId }))
    });

    console.log(`User ${user._id} joined session ${sessionId}`);
  }

  handleLeaveSession(socket, { sessionId }) {
    socket.to(`session_${sessionId}`).emit('participant_left', {
      userId: socket.userId,
      timestamp: new Date()
    });
    
    socket.leave(`session_${sessionId}`);
    console.log(`User ${socket.userId} left session ${sessionId}`);
  }

  handleSessionMessage(socket, { sessionId, message }) {
    // Broadcast to all in session except sender
    socket.to(`session_${sessionId}`).emit('new_message', {
      ...message,
      senderId: socket.userId,
      timestamp: new Date()
    });
  }

  // Whiteboard Handlers
  handleWhiteboardStroke(socket, { sessionId, stroke }) {
    // Broadcast stroke to all in session
    socket.to(`session_${sessionId}`).emit('whiteboard_update', {
      stroke: {
        ...stroke,
        userId: socket.userId
      },
      timestamp: new Date()
    });
  }

  handleWhiteboardClear(socket, { sessionId }) {
    socket.to(`session_${sessionId}`).emit('whiteboard_clear', {
      clearedBy: socket.userId,
      timestamp: new Date()
    });
  }

  // Screen Share Handlers
  handleScreenShareStarted(socket, { sessionId, streamId }) {
    socket.to(`session_${sessionId}`).emit('screen_share_started', {
      userId: socket.userId,
      streamId,
      timestamp: new Date()
    });
  }

  handleScreenShareStopped(socket, { sessionId }) {
    socket.to(`session_${sessionId}`).emit('screen_share_stopped', {
      userId: socket.userId,
      timestamp: new Date()
    });
  }

  // Breakout Room Handlers
  handleJoinBreakoutRoom(socket, { roomId, user }) {
    socket.join(`breakout_${roomId}`);
    
    socket.to(`breakout_${roomId}`).emit('breakout_participant_joined', {
      user,
      roomId,
      timestamp: new Date()
    });

    console.log(`User ${user._id} joined breakout room ${roomId}`);
  }

  handleLeaveBreakoutRoom(socket, { roomId, userId }) {
    socket.to(`breakout_${roomId}`).emit('breakout_participant_left', {
      userId,
      roomId,
      timestamp: new Date()
    });
    
    socket.leave(`breakout_${roomId}`);
  }

  handleBreakoutMessage(socket, { roomId, message }) {
    socket.to(`breakout_${roomId}`).emit('breakout_message', {
      ...message,
      senderId: socket.userId,
      timestamp: new Date()
    });
  }

  handleRoomChangeRequest(socket, { sessionId, targetRoomId }) {
    // Notify host of room change request
    socket.to(`session_${sessionId}`).emit('room_change_request', {
      userId: socket.userId,
      targetRoomId,
      timestamp: new Date()
    });
  }

  // Polling Handlers
  handlePollVote(socket, { sessionId, pollId, optionId }) {
    // Broadcast vote to all subscribers
    this.io.to(`poll_${pollId}`).emit('poll_vote_cast', {
      pollId,
      optionId,
      voterId: socket.userId,
      timestamp: new Date()
    });
  }

  handlePollSubscribe(socket, { pollId }) {
    socket.join(`poll_${pollId}`);
    socket.emit('poll_subscribed', { pollId });
  }

  // Q&A Handlers
  handleQAQuestion(socket, { sessionId, question }) {
    socket.to(`session_${sessionId}`).emit('new_question', {
      ...question,
      askedBy: socket.userId,
      timestamp: new Date()
    });
  }

  handleQAUpvote(socket, { sessionId, questionId }) {
    socket.to(`session_${sessionId}`).emit('question_upvoted', {
      questionId,
      voterId: socket.userId,
      timestamp: new Date()
    });
  }

  handleQAAnswer(socket, { sessionId, questionId, answer }) {
    socket.to(`session_${sessionId}`).emit('question_answered', {
      questionId,
      answer,
      answeredBy: socket.userId,
      timestamp: new Date()
    });
  }

  // File Sharing Handlers
  handleFileShared(socket, { sessionId, file }) {
    socket.to(`session_${sessionId}`).emit('file_uploaded', {
      file,
      sharedBy: socket.userId,
      timestamp: new Date()
    });
  }

  // User Presence Handlers
  handleTypingStart(socket, { sessionId, userId }) {
    socket.to(`session_${sessionId}`).emit('user_typing', {
      userId,
      isTyping: true
    });
  }

  handleTypingStop(socket, { sessionId, userId }) {
    socket.to(`session_${sessionId}`).emit('user_typing', {
      userId,
      isTyping: false
    });
  }

  handleUserPresence(socket, { sessionId, status }) {
    socket.to(`session_${sessionId}`).emit('presence_update', {
      userId: socket.userId,
      status, // 'online', 'away', 'busy'
      timestamp: new Date()
    });
  }

  // Disconnect Handler
  handleDisconnect(socket) {
    if (socket.sessionId) {
      socket.to(`session_${socket.sessionId}`).emit('participant_left', {
        userId: socket.userId,
        timestamp: new Date()
      });
    }
    console.log('Client disconnected:', socket.id);
  }

  // Utility Methods
  getSessionSockets(sessionId) {
    const room = this.io.sockets.adapter.rooms.get(`session_${sessionId}`);
    if (!room) return [];
    
    const sockets = [];
    room.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) sockets.push(socket);
    });
    return sockets;
  }

  broadcastToSession(sessionId, event, data) {
    this.io.to(`session_${sessionId}`).emit(event, data);
  }

  broadcastToBreakoutRoom(roomId, event, data) {
    this.io.to(`breakout_${roomId}`).emit(event, data);
  }
}

module.exports = SocketHandlers;
