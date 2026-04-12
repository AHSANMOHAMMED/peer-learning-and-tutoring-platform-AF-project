const mongoose = require('mongoose');

const homeworkSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Session context
  subject: {
    type: String,
    required: true,
    enum: ['mathematics', 'physics', 'chemistry', 'biology', 'science', 'english', 'history', 'geography', 'general']
  },
  topic: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    required: true
  },
  
  // Session content
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    // For tracking message metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Session tracking
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  endedAt: {
    type: Date
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Learning analytics
  conceptsCovered: [{
    type: String
  }],
  
  hintsGiven: {
    type: Number,
    default: 0
  },
  
  understandingChecks: {
    type: Number,
    default: 0
  },
  
  totalQuestions: {
    type: Number,
    default: 0
  },
  
  totalResponses: {
    type: Number,
    default: 0
  },
  
  // Student feedback
  studentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  studentFeedback: {
    type: String,
    trim: true
  },
  
  // AI metrics
  aiModelUsed: {
    type: String,
    default: 'gpt-4'
  },
  
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  
  // Session outcome
  outcome: {
    type: String,
    enum: ['understood', 'partially_understood', 'needs_more_help', 'not_resolved'],
    default: 'understood'
  },
  
  // Related to other platform features
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PeerSession'
  },
  
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LectureCourse'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for queries
// homeworkSessionSchema.index({ user: 1, status: 1 });
// homeworkSessionSchema.index({ user: 1, createdAt: -1 });
// homeworkSessionSchema.index({ subject: 1, grade: 1 });

// Virtual for session duration
homeworkSessionSchema.virtual('duration').get(function() {
  if (this.endedAt && this.startedAt) {
    return (this.endedAt - this.startedAt) / 1000 / 60; // minutes
  }
  return null;
});

// Method to get summary
homeworkSessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    subject: this.subject,
    topic: this.topic,
    grade: this.grade,
    status: this.status,
    duration: this.duration,
    messageCount: this.messages.length,
    conceptsCovered: this.conceptsCovered,
    startedAt: this.startedAt,
    endedAt: this.endedAt
  };
};

module.exports = mongoose.model('HomeworkSession', homeworkSessionSchema);
