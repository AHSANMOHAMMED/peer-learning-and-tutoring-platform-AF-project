import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinRoom(room) {
    if (this.socket && this.connected) {
      this.socket.emit('join', room);
    }
  }

  leaveRoom(room) {
    if (this.socket && this.connected) {
      this.socket.emit('leave', room);
    }
  }

  joinQuestionRoom(questionId) {
    if (this.socket && this.connected) {
      this.socket.emit('joinQuestion', questionId);
    }
  }

  leaveQuestionRoom(questionId) {
    if (this.socket && this.connected) {
      this.socket.emit('leaveQuestion', questionId);
    }
  }

  joinLeaderboard(type) {
    if (this.socket && this.connected) {
      this.socket.emit('joinLeaderboard', type);
    }
  }

  // Listen for new questions
  onNewQuestion(callback) {
    if (this.socket) {
      this.socket.on('newQuestion', callback);
    }
  }

  // Listen for new answers
  onNewAnswer(callback) {
    if (this.socket) {
      this.socket.on('newAnswer', callback);
    }
  }

  // Listen for answer posted notifications
  onAnswerPosted(callback) {
    if (this.socket) {
      this.socket.on('answerPosted', callback);
    }
  }

  // Listen for answer acceptance
  onAnswerAccepted(callback) {
    if (this.socket) {
      this.socket.on('answerAccepted', callback);
    }
  }

  // Listen for vote updates
  onVoteUpdate(callback) {
    if (this.socket) {
      this.socket.on('voteUpdate', callback);
    }
  }

  // Listen for new comments
  onNewComment(callback) {
    if (this.socket) {
      this.socket.on('newComment', callback);
    }
  }

  // Listen for comment posted notifications
  onCommentPosted(callback) {
    if (this.socket) {
      this.socket.on('commentPosted', callback);
    }
  }

  // Listen for badge earned
  onBadgeEarned(callback) {
    if (this.socket) {
      this.socket.on('badgeEarned', callback);
    }
  }

  // Listen for typing indicators
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  // Send typing indicator
  sendTypingAnswer(questionId, isTyping) {
    if (this.socket && this.connected) {
      this.socket.emit('typingAnswer', {
        questionId,
        userId: localStorage.getItem('userId'),
        isTyping
      });
    }
  }

  // Mark notification as read
  markNotificationRead(notificationId) {
    if (this.socket && this.connected) {
      this.socket.emit('markNotificationRead', notificationId);
    }
  }

  // Listen for notification read confirmation
  onNotificationRead(callback) {
    if (this.socket) {
      this.socket.on('notificationRead', callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
