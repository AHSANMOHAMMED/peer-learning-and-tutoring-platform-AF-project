const mongoose = require('mongoose');

const sessionFeedbackSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reviewerType: {
    type: String,
    enum: ['student', 'tutor'],
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    knowledge: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    technicalQuality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  strengths: [{
    type: String,
    maxlength: 100
  }],
  improvements: [{
    type: String,
    maxlength: 100
  }],
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  wouldBookAgain: {
    type: Boolean,
    required: true
  },
  technicalIssues: {
    hadIssues: {
      type: Boolean,
      default: false
    },
    issueTypes: [{
      type: String,
      enum: ['audio', 'video', 'connection', 'screen_share', 'whiteboard', 'other']
    }],
    description: {
      type: String,
      maxlength: 500
    }
  },
  sessionQuality: {
    contentRelevance: {
      type: Number,
      min: 1,
      max: 5
    },
    pace: {
      type: Number,
      min: 1,
      max: 5
    },
    engagement: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  response: {
    content: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  flags: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: Date,
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sessionFeedbackSchema.index({ bookingId: 1, reviewerType: 1 });
sessionFeedbackSchema.index({ revieweeId: 1, overallRating: -1 });
sessionFeedbackSchema.index({ reviewerId: 1 });
sessionFeedbackSchema.index({ createdAt: -1 });
sessionFeedbackSchema.index({ isPublic: 1, isVerified: 1 });

// Virtual for average category rating
sessionFeedbackSchema.virtual('averageCategoryRating').get(function() {
  const categories = ['punctuality', 'knowledge', 'communication', 'helpfulness', 'technicalQuality'];
  const validRatings = categories
    .map(cat => this.categories[cat])
    .filter(rating => rating !== undefined && rating !== null);
  
  if (validRatings.length === 0) return null;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
});

// Virtual for session quality average
sessionFeedbackSchema.virtual('averageSessionQuality').get(function() {
  const qualities = ['contentRelevance', 'pace', 'engagement'];
  const validRatings = qualities
    .map(quality => this.sessionQuality[quality])
    .filter(rating => rating !== undefined && rating !== null);
  
  if (validRatings.length === 0) return null;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
});

// Method to check if feedback can be edited
sessionFeedbackSchema.methods.canEdit = function(userId) {
  return this.reviewerId.toString() === userId.toString() && 
         Date.now() - this.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
};

// Method to add helpful vote
sessionFeedbackSchema.methods.addHelpfulVote = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Method to flag feedback
sessionFeedbackSchema.methods.flag = function(reason, flaggedBy) {
  this.flags.isFlagged = true;
  this.flags.flagReason = reason;
  this.flags.flaggedBy = flaggedBy;
  this.flags.flaggedAt = new Date();
  return this.save();
};

// Method to resolve flag
sessionFeedbackSchema.methods.resolveFlag = function(resolvedBy) {
  this.flags.resolved = true;
  this.flags.resolvedBy = resolvedBy;
  this.flags.resolvedAt = new Date();
  return this.save();
};

// Static method to get tutor ratings
sessionFeedbackSchema.statics.getTutorRatings = async function(tutorId) {
  const feedbacks = await this.find({
    revieweeId: tutorId,
    reviewerType: 'student',
    isVerified: true
  });

  if (feedbacks.length === 0) {
    return {
      overallRating: 0,
      totalReviews: 0,
      categoryRatings: {},
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const overallSum = feedbacks.reduce((sum, f) => sum + f.overallRating, 0);
  const overallRating = overallSum / feedbacks.length;

  const categories = ['punctuality', 'knowledge', 'communication', 'helpfulness', 'technicalQuality'];
  const categoryRatings = {};
  
  categories.forEach(category => {
    const validRatings = feedbacks
      .map(f => f.categories[category])
      .filter(rating => rating !== undefined && rating !== null);
    
    if (validRatings.length > 0) {
      const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
      categoryRatings[category] = sum / validRatings.length;
    }
  });

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbacks.forEach(f => {
    distribution[f.overallRating]++;
  });

  return {
    overallRating: Math.round(overallRating * 10) / 10,
    totalReviews: feedbacks.length,
    categoryRatings,
    distribution
  };
};

// Static method to check if feedback exists
sessionFeedbackSchema.statics.feedbackExists = async function(bookingId, reviewerId, reviewerType) {
  const existing = await this.findOne({
    bookingId,
    reviewerId,
    reviewerType
  });
  return !!existing;
};

// Static method to get public feedback
sessionFeedbackSchema.statics.getPublicFeedback = async function(tutorId, options = {}) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
  
  const skip = (page - 1) * limit;
  
  const [feedbacks, total] = await Promise.all([
    this.find({
      revieweeId: tutorId,
      reviewerType: 'student',
      isPublic: true,
      isVerified: true,
      'flags.isFlagged': { $ne: true }
    })
      .populate('reviewerId', 'profile.firstName profile.lastName username profile.avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments({
      revieweeId: tutorId,
      reviewerType: 'student',
      isPublic: true,
      isVerified: true,
      'flags.isFlagged': { $ne: true }
    })
  ]);
  
  return {
    feedbacks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('SessionFeedback', sessionFeedbackSchema);
