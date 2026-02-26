const mongoose = require('mongoose');

const moderatorActionSchema = new mongoose.Schema({
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: [
      'warning',           // Issue warning to user
      'suspend',          // Suspend user temporarily
      'ban',              // Ban user permanently
      'delete_content',   // Delete reported content
      'approve_content',  // Approve flagged content
      'flag_content',     // Manually flag content
      'unflag_content',   // Remove flag from content
      'restrict_access',  // Restrict user access
      'verify_user',      // Verify user account
      'unverify_user',    // Remove verification
      'escalate',         // Escalate to higher level
      'assign_case',      // Assign case to moderator
      'close_case',       // Close case
      'note_only'         // Add note without action
    ],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['user', 'material', 'session', 'review', 'message', 'report'],
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  duration: {
    type: Number, // in days, for suspensions
    min: 1,
    max: 365
  },
  permanent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  // Related report(s)
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  // Action details
  details: {
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    evidence: [String], // URLs to evidence
    screenshots: [String], // URLs to screenshots
    automated: {
      type: Boolean,
      default: false
    },
    batchAction: {
      type: Boolean,
      default: false
    },
    batchCount: Number
  },
  // Appeal information
  appeal: {
    isAppealed: {
      type: Boolean,
      default: false
    },
    appealReason: {
      type: String,
      maxlength: 1000
    },
    appealedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appealedAt: Date,
    appealStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appealReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appealReviewedAt: Date,
    appealNotes: {
      type: String,
      maxlength: 1000
    }
  },
  // Review and oversight
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_review'],
    default: 'pending'
  },
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
  // Effectiveness tracking
  effectiveness: {
    issueResolved: {
      type: Boolean,
      default: false
    },
    recurrencePrevented: {
      type: Boolean,
      default: false
    },
    userSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  },
  // Communication
  notificationsSent: {
    toUser: {
      type: Boolean,
      default: false
    },
    toReporter: {
      type: Boolean,
      default: false
    },
    toAdmins: {
      type: Boolean,
      default: false
    }
  },
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: {
      type: String,
      enum: ['web', 'mobile', 'api']
    },
    additionalData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
moderatorActionSchema.index({ moderatorId: 1, createdAt: -1 });
moderatorActionSchema.index({ targetType: 1, targetId: 1 });
moderatorActionSchema.index({ actionType: 1, createdAt: -1 });
moderatorActionSchema.index({ reviewStatus: 1 });
moderatorActionSchema.index({ 'appeal.appealStatus': 1 });

// Virtual for action duration
moderatorActionSchema.virtual('actionDuration').get(function() {
  if (this.actionType !== 'suspend' || this.permanent) return null;
  return this.duration;
});

// Virtual for is active
moderatorActionSchema.virtual('isActive').get(function() {
  if (this.actionType === 'ban' || this.actionType === 'delete_content') {
    return this.reviewStatus !== 'rejected';
  }
  
  if (this.actionType === 'suspend' && !this.permanent) {
    const now = new Date();
    const endDate = new Date(this.createdAt.getTime() + this.duration * 24 * 60 * 60 * 1000);
    return now <= endDate && this.reviewStatus !== 'rejected';
  }
  
  return false;
});

// Virtual for expiration date
moderatorActionSchema.virtual('expirationDate').get(function() {
  if (this.actionType !== 'suspend' || this.permanent) return null;
  return new Date(this.createdAt.getTime() + this.duration * 24 * 60 * 60 * 1000);
});

// Method to add appeal
moderatorActionSchema.methods.addAppeal = function(reason, appealedBy) {
  this.appeal.isAppealed = true;
  this.appeal.appealReason = reason;
  this.appeal.appealedBy = appealedBy;
  this.appeal.appealedAt = new Date();
  return this.save();
};

// Method to review appeal
moderatorActionSchema.methods.reviewAppeal = function(status, notes, reviewedBy) {
  this.appeal.appealStatus = status;
  this.appeal.appealNotes = notes;
  this.appeal.appealReviewedBy = reviewedBy;
  this.appeal.appealReviewedAt = new Date();
  return this.save();
};

// Method to add review
moderatorActionSchema.methods.addReview = function(status, notes, reviewedBy) {
  this.reviewStatus = status;
  this.reviewNotes = notes;
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to update effectiveness
moderatorActionSchema.methods.updateEffectiveness = function(updates) {
  this.effectiveness = {
    ...this.effectiveness,
    ...updates
  };
  return this.save();
};

// Method to check if action can be appealed
moderatorActionSchema.methods.canAppeal = function() {
  const nonAppealableActions = ['note_only', 'assign_case', 'close_case'];
  
  if (nonAppealableActions.includes(this.actionType)) {
    return false;
  }
  
  if (this.appeal.isAppealed) {
    return false;
  }
  
  // Check if appeal window is still open (30 days)
  const now = new Date();
  const appealWindow = new Date(this.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return now <= appealWindow;
};

// Static method to get actions by moderator
moderatorActionSchema.statics.getByModerator = async function(moderatorId, options = {}) {
  const { page = 1, limit = 20, actionType, status } = options;
  
  const query = { moderatorId };
  if (actionType) query.actionType = actionType;
  if (status) query.reviewStatus = status;
  
  const skip = (page - 1) * limit;
  
  const [actions, total] = await Promise.all([
    this.find(query)
      .populate('moderatorId', 'profile.firstName profile.lastName username')
      .populate('targetId', 'profile.firstName profile.lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);
  
  return {
    actions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get actions by target
moderatorActionSchema.statics.getByTarget = async function(targetType, targetId, options = {}) {
  const { page = 1, limit = 20, actionType } = options;
  
  const query = { targetType, targetId };
  if (actionType) query.actionType = actionType;
  
  const skip = (page - 1) * limit;
  
  const [actions, total] = await Promise.all([
    this.find(query)
      .populate('moderatorId', 'profile.firstName profile.lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);
  
  return {
    actions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get pending appeals
moderatorActionSchema.statics.getPendingAppeals = async function(options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const query = {
    'appeal.isAppealed': true,
    'appeal.appealStatus': 'pending'
  };
  
  const skip = (page - 1) * limit;
  
  const [actions, total] = await Promise.all([
    this.find(query)
      .populate('moderatorId', 'profile.firstName profile.lastName username')
      .populate('appeal.appealedBy', 'profile.firstName profile.lastName username')
      .populate('targetId', 'profile.firstName profile.lastName username')
      .sort({ 'appeal.appealedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);
  
  return {
    actions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get actions needing review
moderatorActionSchema.statics.getNeedingReview = async function(options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const query = {
    reviewStatus: { $in: ['pending', 'needs_review'] }
  };
  
  const skip = (page - 1) * limit;
  
  const [actions, total] = await Promise.all([
    this.find(query)
      .populate('moderatorId', 'profile.firstName profile.lastName username')
      .populate('targetId', 'profile.firstName profile.lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);
  
  return {
    actions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get statistics
moderatorActionSchema.statics.getStatistics = async function(timeframe = '30d') => {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const [
    totalActions,
    actionsByType,
    actionsByTarget,
    pendingReviews,
    pendingAppeals,
    automatedActions,
    batchActions
  ] = await Promise.all([
    this.countDocuments({ createdAt: { $gte: startDate } }),
    this.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$actionType', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$targetType', count: { $sum: 1 } } }
    ]),
    this.countDocuments({ createdAt: { $gte: startDate }, reviewStatus: { $in: ['pending', 'needs_review'] } }),
    this.countDocuments({ createdAt: { $gte: startDate }, 'appeal.appealStatus': 'pending' }),
    this.countDocuments({ createdAt: { $gte: startDate }, 'details.automated': true }),
    this.countDocuments({ createdAt: { $gte: startDate }, 'details.batchAction': true })
  ]);
  
  return {
    total: totalActions,
    byType: actionsByType,
    byTarget: actionsByTarget,
    pendingReviews,
    pendingAppeals,
    automatedActions,
    batchActions
  };
};

// Static method to get moderator performance
moderatorActionSchema.statics.getModeratorPerformance = async function(moderatorId, timeframe = '30d') => {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const [
    totalActions,
    actionsByType,
    averageReviewTime,
    appealRate,
    reversalRate
  ] = await Promise.all([
    this.countDocuments({ moderatorId, createdAt: { $gte: startDate } }),
    this.aggregate([
      { $match: { moderatorId, createdAt: { $gte: startDate } } },
      { $group: { _id: '$actionType', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { moderatorId, createdAt: { $gte: startDate }, reviewedAt: { $exists: true } } },
      { $group: { _id: null, avgTime: { $avg: { $subtract: ['$reviewedAt', '$createdAt'] } } } }
    ]),
    this.aggregate([
      { $match: { moderatorId, createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: 1 }, appealed: { $sum: { $cond: ['$appeal.isAppealed', 1, 0] } } } }
    ]),
    this.aggregate([
      { $match: { moderatorId, createdAt: { $gte: startDate }, 'appeal.appealStatus': 'rejected' } },
      { $group: { _id: null, total: { $sum: 1 }, reversed: { $sum: { $cond: [{ $eq: ['$appeal.appealStatus', 'accepted'] }, 1, 0] } } } }
    ])
  ]);
  
  return {
    totalActions,
    actionsByType,
    averageReviewTime: averageReviewTime[0]?.avgTime || 0,
    appealRate: appealRate[0] ? (appealRate[0].appealed / appealRate[0].total * 100).toFixed(1) : 0,
    reversalRate: reversalRate[0] ? (reversalRate[0].reversed / reversalRate[0].total * 100).toFixed(1) : 0
  };
};

module.exports = mongoose.model('ModeratorAction', moderatorActionSchema);
