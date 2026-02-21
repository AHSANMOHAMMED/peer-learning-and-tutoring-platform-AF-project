const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportedType: {
    type: String,
    enum: ['user', 'material', 'session', 'review', 'message'],
    required: true,
    index: true
  },
  reportedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: ['inappropriate', 'spam', 'harassment', 'copyright', 'fake', 'misinformation', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  evidence: [{
    type: String, // URLs to screenshots, links, etc.
    trim: true
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: {
      type: String,
      enum: ['web', 'mobile', 'api']
    },
    additionalData: mongoose.Schema.Types.Mixed
  },
  // Auto-escalation rules
  escalation: {
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    autoEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalationReason: String
  },
  // Resolution tracking
  resolution: {
    action: {
      type: String,
      enum: ['no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'content_flagged']
    },
    notes: {
      type: String,
      maxlength: 2000
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    duration: Number // Time in hours from creation to resolution
  },
  // Reporter feedback
  reporterFeedback: {
    satisfied: {
      type: Boolean,
      default: false
    },
    feedback: {
      type: String,
      maxlength: 500
    },
    respondedAt: Date
  },
  // Related reports (for duplicate or related issues)
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
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
    appealResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appealResolvedAt: Date,
    appealNotes: {
      type: String,
      maxlength: 1000
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ reportedType: 1, reportedId: 1, status: 1 });
reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ assignedTo: 1, status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ 'escalation.level': -1, status: 1 });

// Virtual for time since creation
reportSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
});

// Virtual for is overdue
reportSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'dismissed') return false;
  
  const now = new Date();
  const hoursSinceCreation = (now - this.createdAt) / (1000 * 60 * 60);
  
  // Priority-based SLA
  const slaHours = {
    urgent: 2,
    high: 8,
    medium: 24,
    low: 72
  };
  
  return hoursSinceCreation > slaHours[this.priority];
});

// Method to assign report to moderator
reportSchema.methods.assignTo = function(moderatorId) {
  this.assignedTo = moderatorId;
  if (this.status === 'pending') {
    this.status = 'under_review';
  }
  return this.save();
};

// Method to escalate report
reportSchema.methods.escalate = function(reason, newLevel) {
  this.escalation.level = Math.min(newLevel || this.escalation.level + 1, 5);
  this.escalation.autoEscalated = false;
  this.escalation.escalatedAt = new Date();
  this.escalation.escalationReason = reason;
  
  // Update priority based on escalation
  if (this.escalation.level >= 3) {
    this.priority = 'high';
  }
  if (this.escalation.level >= 4) {
    this.priority = 'urgent';
  }
  
  return this.save();
};

// Method to resolve report
reportSchema.methods.resolve = function(action, notes, resolvedBy) {
  this.status = 'resolved';
  this.resolution = {
    action,
    notes,
    resolvedBy,
    resolvedAt: new Date(),
    duration: (new Date() - this.createdAt) / (1000 * 60 * 60) // hours
  };
  return this.save();
};

// Method to dismiss report
reportSchema.methods.dismiss = function(notes, dismissedBy) {
  this.status = 'dismissed';
  this.resolution = {
    action: 'no_action',
    notes,
    resolvedBy: dismissedBy,
    resolvedAt: new Date(),
    duration: (new Date() - this.createdAt) / (1000 * 60 * 60) // hours
  };
  return this.save();
};

// Method to add appeal
reportSchema.methods.addAppeal = function(reason, appealedBy) {
  this.appeal.isAppealed = true;
  this.appeal.appealReason = reason;
  this.appeal.appealedBy = appealedBy;
  this.appeal.appealedAt = new Date();
  return this.save();
};

// Method to resolve appeal
reportSchema.methods.resolveAppeal = function(status, notes, resolvedBy) {
  this.appeal.appealStatus = status;
  this.appeal.appealNotes = notes;
  this.appeal.appealResolvedBy = resolvedBy;
  this.appeal.appealResolvedAt = new Date();
  return this.save();
};

// Method to add reporter feedback
reportSchema.methods.addReporterFeedback = function(satisfied, feedback) {
  this.reporterFeedback.satisfied = satisfied;
  this.reporterFeedback.feedback = feedback;
  this.reporterFeedback.respondedAt = new Date();
  return this.save();
};

// Static method to get reports by status
reportSchema.statics.getByStatus = async function(status, options = {}) {
  const { page = 1, limit = 20, assignedTo } = options;
  
  const query = { status };
  if (assignedTo) {
    query.assignedTo = assignedTo;
  }
  
  const skip = (page - 1) * limit;
  
  const [reports, total] = await Promise.all([
    this.find(query)
      .populate('reporterId', 'profile.firstName profile.lastName username')
      .populate('assignedTo', 'profile.firstName profile.lastName username')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);
  
  return {
    reports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get overdue reports
reportSchema.statics.getOverdue = async function() {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  const query = {
    status: { $in: ['pending', 'under_review'] },
    $or: [
      { priority: 'urgent', createdAt: { $lt: twoHoursAgo } },
      { priority: 'high', createdAt: { $lt: eightHoursAgo } },
      { priority: 'medium', createdAt: { $lt: oneDayAgo } },
      { priority: 'low', createdAt: { $lt: twoDaysAgo } }
    ]
  };
  
  return this.find(query)
    .populate('reporterId', 'profile.firstName profile.lastName username')
    .populate('assignedTo', 'profile.firstName profile.lastName username')
    .sort({ priority: -1, createdAt: 1 })
    .exec();
};

// Static method to auto-escalate reports
reportSchema.statics.autoEscalate = async function() {
  const now = new Date();
  const thresholds = {
    urgent: 2,   // 2 hours
    high: 8,     // 8 hours
    medium: 24,  // 24 hours
    low: 72      // 72 hours
  };
  
  const reportsToEscalate = [];
  
  for (const [priority, hours] of Object.entries(thresholds)) {
    const threshold = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const reports = await this.find({
      status: { $in: ['pending', 'under_review'] },
      priority,
      createdAt: { $lt: threshold },
      'escalation.level': { $lt: 5 }
    });
    
    reportsToEscalate.push(...reports);
  }
  
  // Escalate reports
  for (const report of reportsToEscalate) {
    await report.escalate(`Auto-escalated due to SLA breach (${report.priority} priority)`);
  }
  
  return reportsToEscalate.length;
};

// Static method to get statistics
reportSchema.statics.getStatistics = async function(timeframe = '30d') => {
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
    totalReports,
    pendingReports,
    resolvedReports,
    dismissedReports,
    reportsByType,
    reportsByReason,
    reportsByPriority,
    averageResolutionTime
  ] = await Promise.all([
    this.countDocuments({ createdAt: { $gte: startDate } }),
    this.countDocuments({ createdAt: { $gte: startDate }, status: 'pending' }),
    this.countDocuments({ createdAt: { $gte: startDate }, status: 'resolved' }),
    this.countDocuments({ createdAt: { $gte: startDate }, status: 'dismissed' }),
    this.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$reportedType', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { createdAt: { $gte: startDate }, 'resolution.duration': { $exists: true } } },
      { $group: { _id: null, avgDuration: { $avg: '$resolution.duration' } } }
    ])
  ]);
  
  return {
    total: totalReports,
    pending: pendingReports,
    resolved: resolvedReports,
    dismissed: dismissedReports,
    byType: reportsByType,
    byReason: reportsByReason,
    byPriority: reportsByPriority,
    averageResolutionTime: averageResolutionTime[0]?.avgDuration || 0,
    resolutionRate: totalReports > 0 ? ((resolvedReports + dismissedReports) / totalReports * 100).toFixed(1) : 0
  };
};

module.exports = mongoose.model('Report', reportSchema);
