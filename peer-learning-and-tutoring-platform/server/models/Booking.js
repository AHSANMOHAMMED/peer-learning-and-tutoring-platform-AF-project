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
    default: 'pending',
    index: true
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

// Method to start session
bookingSchema.methods.startSession = function() {
  if (this.status === 'confirmed') {
    this.status = 'in_progress';
    this.session.startedAt = new Date();
    return true;
  }
  return false;
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
