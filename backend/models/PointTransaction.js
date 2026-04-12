const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'question_created',
      'answer_created',
      'answer_accepted',
      'upvote_received',
      'downvote_received',
      'daily_login',
      'first_answer_of_day',
      'badge_earned',
      'course_completed',
      'answer_upvote_received',
      'answer_downvote_received',
      'question_upvote_received'
    ]
  },
  points: {
    type: Number,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'subjectType'
  },
  subjectType: {
    type: String,
    enum: ['Question', 'Answer', 'Badge', 'Course', 'question', 'answer'],
    default: 'Question'
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for common queries
pointTransactionSchema.index({ user: 1, createdAt: -1 });
pointTransactionSchema.index({ action: 1 });

/**
 * Get total points for a user
 */
pointTransactionSchema.statics.getUserTotalPoints = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

/**
 * Get points breakdown by type for a user
 */
pointTransactionSchema.statics.getUserPointsByType = async function(userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$action', total: { $sum: '$points' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

/**
 * Get paginated point history for a user
 */
pointTransactionSchema.statics.getUserPointsHistory = async function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const results = await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('subject');

  const total = await this.countDocuments({ user: userId });

  return {
    transactions: results,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get global leaderboard
 */
pointTransactionSchema.statics.getLeaderboard = async function(options = {}) {
  const { limit = 10, timeframe = 'all_time' } = options;
  
  const matchQuery = {};
  if (timeframe === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    matchQuery.createdAt = { $gte: weekAgo };
  } else if (timeframe === 'monthly') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    matchQuery.createdAt = { $gte: monthAgo };
  }

  return await this.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$user', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        totalPoints: 1,
        'user.username': 1,
        'user.profile.firstName': 1,
        'user.profile.lastName': 1,
        'user.profile.avatar': 1,
        'user.reputation': 1
      }
    }
  ]);
};

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
