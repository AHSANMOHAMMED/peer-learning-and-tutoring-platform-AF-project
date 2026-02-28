const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: Number,
    min: 6,
    max: 13
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 180 // minutes
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'pending'
    // Note: index removed as explicit index below covers status queries
  },
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    stripePaymentIntentId: {
      type: String
    }
  },
  session: {
    roomId: {
      type: String
    },
    joinUrl: {
      type: String
    },
    recordingUrl: {
      type: String
    },
    whiteboardData: {
      type: String
    },
    startedAt: {
      type: Date
    },
    endedAt: {
      type: Date
    },
    videoProvider: {
      type: String,
      enum: ['jitsi', 'agora', 'zoom'],
      default: 'jitsi'
    },
    roomConfig: {
      isRecordingEnabled: {
        type: Boolean,
        default: false
      },
      isChatEnabled: {
        type: Boolean,
        default: true
      },
      isScreenShareEnabled: {
        type: Boolean,
        default: true
      },
      isWhiteboardEnabled: {
        type: Boolean,
        default: true
      },
      maxParticipants: {
        type: Number,
        default: 2
      },
      password: {
        type: String
      },
      waitingRoom: {
        type: Boolean,
        default: false
      }
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date,
      leftAt: Date,
      duration: Number, // in minutes
      connectionQuality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      },
      technicalIssues: [{
        type: String,
        enum: ['audio', 'video', 'connection', 'screen_share', 'whiteboard', 'other']
      }]
    }],
    recording: {
      isRecording: {
        type: Boolean,
        default: false
      },
      recordingId: String,
      recordingUrl: String,
      recordingDuration: Number, // in seconds
      recordingSize: Number, // in bytes
      recordingFormat: {
        type: String,
        enum: ['mp4', 'webm', 'mkv']
      },
      recordingStartedAt: Date,
      recordingEndedAt: Date,
      downloadUrl: String,
      isProcessing: {
        type: Boolean,
        default: false
      }
    },
    analytics: {
      totalDuration: Number, // actual session duration in minutes
      participantCount: {
        type: Number,
        default: 0
      },
      chatMessagesCount: {
        type: Number,
        default: 0
      },
      screenShareDuration: {
        type: Number,
        default: 0
      },
      whiteboardUsage: {
        type: Number,
        default: 0
      },
      connectionIssues: {
        type: Number,
        default: 0
      }
    }
  },
  notes: {
    student: {
      type: String,
      maxlength: 1000
    },
    tutor: {
      type: String,
      maxlength: 1000
    },
    admin: {
      type: String,
      maxlength: 1000
    }
  },
  cancellation: {
    reason: {
      type: String,
      maxlength: 500
    },
    cancelledBy: {
      type: String,
      enum: ['student', 'tutor', 'system']
    },
    cancelledAt: {
      type: Date
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'denied']
    }
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  reminders: {
    emailSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    pushSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: {
      type: Date
    },
    smsSentAt: {
      type: Date
    }
  },
  review: {
    studentReviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    tutorReviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    bookingSource: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ studentId: 1, status: 1 });
bookingSchema.index({ tutorId: 1, status: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'payment.status': 1 });

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  const bookingDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.startTime}`);
  return bookingDateTime > new Date() && !['cancelled', 'completed', 'no_show'].includes(this.status);
});

// Virtual for checking if booking is past
bookingSchema.virtual('isPast').get(function() {
  const bookingDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.endTime}`);
  return bookingDateTime <= new Date();
});

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to confirm booking
bookingSchema.methods.confirm = function() {
  if (this.status === 'pending') {
    this.status = 'confirmed';
    return true;
  }
  return false;
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy) {
  if (['pending', 'confirmed'].includes(this.status)) {
    this.status = 'cancelled';
    this.cancellation = {
      reason,
      cancelledBy,
      cancelledAt: new Date(),
      refundStatus: 'pending'
    };
    return true;
  }
  return false;
};

// Method to complete booking
bookingSchema.methods.complete = function() {
  if (['in_progress'].includes(this.status)) {
    this.status = 'completed';
    this.session.endedAt = new Date();
    return true;
  }
  return false;
};

// Method to start video session
bookingSchema.methods.startVideoSession = function(roomId, joinUrl, config = {}) {
  if (this.status === 'confirmed') {
    this.status = 'in_progress';
    this.session.startedAt = new Date();
    this.session.roomId = roomId;
    this.session.joinUrl = joinUrl;
    this.session.roomConfig = {
      ...this.session.roomConfig,
      ...config
    };
    return true;
  }
  return false;
};

// Method to join video session
bookingSchema.methods.joinVideoSession = function(userId) {
  const participant = this.session.participants.find(p => p.userId.toString() === userId.toString());
  
  if (participant) {
    participant.joinedAt = new Date();
  } else {
    this.session.participants.push({
      userId,
      joinedAt: new Date()
    });
  }
  
  this.session.analytics.participantCount = this.session.participants.length;
  return this.save();
};

// Method to leave video session
bookingSchema.methods.leaveVideoSession = function(userId, connectionQuality) {
  const participant = this.session.participants.find(p => p.userId.toString() === userId.toString());
  
  if (participant && participant.joinedAt) {
    participant.leftAt = new Date();
    participant.duration = Math.round((participant.leftAt - participant.joinedAt) / (1000 * 60)); // minutes
    if (connectionQuality) {
      participant.connectionQuality = connectionQuality;
    }
  }
  
  return this.save();
};

// Method to start recording
bookingSchema.methods.startRecording = function(recordingId) {
  this.session.recording.isRecording = true;
  this.session.recording.recordingId = recordingId;
  this.session.recording.recordingStartedAt = new Date();
  this.session.recording.isProcessing = true;
  return this.save();
};

// Method to stop recording
bookingSchema.methods.stopRecording = function(recordingUrl, recordingDuration, recordingSize) {
  this.session.recording.isRecording = false;
  this.session.recording.recordingUrl = recordingUrl;
  this.session.recording.recordingDuration = recordingDuration;
  this.session.recording.recordingSize = recordingSize;
  this.session.recording.recordingEndedAt = new Date();
  this.session.recording.isProcessing = false;
  return this.save();
};

// Method to add technical issue
bookingSchema.methods.addTechnicalIssue = function(userId, issueType) {
  const participant = this.session.participants.find(p => p.userId.toString() === userId.toString());
  
  if (participant) {
    if (!participant.technicalIssues.includes(issueType)) {
      participant.technicalIssues.push(issueType);
      this.session.analytics.connectionIssues += 1;
    }
  }
  
  return this.save();
};

// Method to update session analytics
bookingSchema.methods.updateSessionAnalytics = function(updates) {
  this.session.analytics = {
    ...this.session.analytics,
    ...updates
  };
  return this.save();
};

// Method to get session duration
bookingSchema.methods.getSessionDuration = function() {
  if (this.session.startedAt && this.session.endedAt) {
    return Math.round((this.session.endedAt - this.session.startedAt) / (1000 * 60)); // minutes
  }
  return 0;
};

// Method to check if session can be started
bookingSchema.methods.canStartSession = function() {
  const now = new Date();
  const sessionStart = new Date(`${this.date.toISOString().split('T')[0]}T${this.startTime}`);
  const timeDiff = sessionStart - now;
  
  // Can start session if within 15 minutes of scheduled time
  return this.status === 'confirmed' && timeDiff <= 15 * 60 * 1000 && timeDiff >= -60 * 60 * 1000;
};

// Method to check if user can join session
bookingSchema.methods.canJoinSession = function(userId) {
  const isParticipant = this.studentId.toString() === userId.toString() || this.tutorId.toString() === userId.toString();
  const isActive = ['confirmed', 'in_progress'].includes(this.status);
  
  return isParticipant && isActive;
};

// Method to mark as paid
bookingSchema.methods.markAsPaid = function(transactionId, stripePaymentIntentId) {
  this.payment.status = 'paid';
  this.payment.transactionId = transactionId;
  this.payment.stripePaymentIntentId = stripePaymentIntentId;
  this.payment.paidAt = new Date();
};

// Method to add review
bookingSchema.methods.addReview = function(reviewId, reviewerType) {
  if (reviewerType === 'student') {
    this.review.studentReviewId = reviewId;
  } else if (reviewerType === 'tutor') {
    this.review.tutorReviewId = reviewId;
  }
};

// Static method to get upcoming bookings
bookingSchema.statics.getUpcoming = async function(userId, userType) {
  const now = new Date();
  const query = userType === 'student' 
    ? { studentId: userId }
    : { tutorId: userId };
  
  return this.find({
    ...query,
    date: { $gte: now },
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('studentId', 'profile.firstName profile.lastName profile.avatar username')
    .populate('tutorId', 'userId subjects')
    .sort({ date: 1, startTime: 1 })
    .exec();
};

// Static method to get booking history
bookingSchema.statics.getHistory = async function(userId, userType, options = {}) {
  const { page = 1, limit = 10, status } = options;
  
  const query = userType === 'student' 
    ? { studentId: userId }
    : { tutorId: userId };
  
  if (status) {
    query.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  const [bookings, total] = await Promise.all([
    this.find(query)
      .populate('studentId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('tutorId', 'userId subjects bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);
  
  return {
    bookings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(tutorId, date, startTime, duration) {
  const requestedStart = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);
  
  const conflictingBookings = await this.find({
    tutorId,
    date: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
    $or: [
      {
        startTime: { $lte: startTime },
        endTime: { $gt: startTime }
      },
      {
        startTime: { $lt: new Date(requestedEnd).toISOString().split('T')[1].substring(0, 5) },
        endTime: { $gte: new Date(requestedEnd).toISOString().split('T')[1].substring(0, 5) }
      }
    ]
  });
  
  return conflictingBookings.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
