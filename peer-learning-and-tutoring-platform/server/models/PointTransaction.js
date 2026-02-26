const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'question_posted',
      'answer_posted',
      'answer_accepted',
      'upvote_received',
      'downvote_received',
      'upvote_given',
      'downvote_given',
      'badge_earned',
      'daily_login',
      'first_answer_of_day',
      'helpful_answer',
      'popular_question'
    ]
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  referenceType: {
    type: String,
    enum: ['question', 'answer', 'badge', 'user'],
    required: false
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
pointTransactionSchema.index({ user: 1, createdAt: -1 });
pointTransactionSchema.index({ type: 1, createdAt: -1 });
pointTransactionSchema.index({ referenceId: 1, referenceType: 1 });

// Static method to get user's total points
pointTransactionSchema.statics.getUserTotalPoints = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get user's points by type
pointTransactionSchema.statics.getUserPointsByType = async function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { 
      $group: { 
        _id: '$type', 
        total: { $sum: '$points' },
        count: { $sum: 1 }
      } 
    },
    { $sort: { total: -1 } }
  ]);
};

// Static method to get user's points history with pagination
pointTransactionSchema.statics.getUserPointsHistory = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null
  } = options;

  const query = { user: userId };
  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('referenceId', 'title body')
    .populate('user', 'username profile.firstName profile.lastName');
};

// Static method to create point transaction
pointTransactionSchema.statics.createTransaction = async function(data) {
  const transaction = new this(data);
  await transaction.save();
  
  // Update user's total points
  const User = mongoose.model('User');
  const totalPoints = await this.getUserTotalPoints(data.user);
  await User.findByIdAndUpdate(data.user, { 
    totalPoints: totalPoints,
    reputation: totalPoints // Reputation is same as total points
  });
  
  return transaction;
};

// Static method to get leaderboard
pointTransactionSchema.statics.getLeaderboard = async function(options = {}) {
  const {
    period = 'all', // 'all', 'week', 'month', 'year'
    limit = 10,
    subject = null
  } = options;

  let matchStage = {};
  
  if (period !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    matchStage.createdAt = { $gte: startDate };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$user',
        totalPoints: { $sum: '$points' },
        transactionCount: { $sum: 1 }
      }
    },
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
        _id: 1,
        totalPoints: 1,
        transactionCount: 1,
        user: {
          _id: '$user._id',
          username: '$user.username',
          firstName: '$user.profile.firstName',
          lastName: '$user.profile.lastName',
          avatar: '$user.profile.avatar'
        }
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Post-save middleware to update user points
pointTransactionSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  const totalPoints = await doc.constructor.getUserTotalPoints(doc.user);
  await User.findByIdAndUpdate(doc.user, { 
    totalPoints: totalPoints,
    reputation: totalPoints
  });
});

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
