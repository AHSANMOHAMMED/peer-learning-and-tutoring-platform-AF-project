const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  pointsAwarded: {
    type: Number,
    required: true,
    default: 0
  },
  isDisplayed: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate badges
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

// Indexes for better query performance
userBadgeSchema.index({ user: 1, earnedAt: -1 });
userBadgeSchema.index({ badge: 1, earnedAt: -1 });
userBadgeSchema.index({ isDisplayed: 1 });

// Static method to award badge to user
userBadgeSchema.statics.awardBadge = async function(userId, badgeId, metadata = {}) {
  // Check if user already has this badge
  const existingUserBadge = await this.findOne({ user: userId, badge: badgeId });
  if (existingUserBadge) {
    return existingUserBadge;
  }
  
  const Badge = mongoose.model('Badge');
  const badge = await Badge.findById(badgeId);
  if (!badge) {
    throw new Error('Badge not found');
  }
  
  // Create user badge
  const userBadge = new this({
    user: userId,
    badge: badgeId,
    pointsAwarded: badge.pointsAwarded,
    metadata
  });
  
  await userBadge.save();
  
  // Award points to user
  if (badge.pointsAwarded > 0) {
    const PointTransaction = mongoose.model('PointTransaction');
    await PointTransaction.createTransaction({
      user: userId,
      points: badge.pointsAwarded,
      type: 'badge_earned',
      referenceId: badgeId,
      referenceType: 'badge',
      description: `Earned badge: ${badge.name}`,
      metadata: {
        badgeName: badge.name,
        badgeCategory: badge.category,
        badgeRarity: badge.rarity
      }
    });
  }
  
  // Add badge to user's badges array
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(userId, {
    $addToSet: { badges: userBadge._id }
  });
  
  return userBadge;
};

// Static method to get user's badges
userBadgeSchema.statics.getUserBadges = function(userId, options = {}) {
  const {
    category = null,
    displayed = null,
    page = 1,
    limit = 50
  } = options;
  
  const query = { user: userId };
  if (category) {
    query['badge.category'] = category;
  }
  if (displayed !== null) {
    query.isDisplayed = displayed;
  }
  
  return this.find(query)
    .sort({ earnedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('badge')
    .populate('user', 'username profile.firstName profile.lastName');
};

// Static method to get user's badge count by category
userBadgeSchema.statics.getUserBadgeStats = async function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badge',
        foreignField: '_id',
        as: 'badgeInfo'
      }
    },
    { $unwind: '$badgeInfo' },
    {
      $group: {
        _id: '$badgeInfo.category',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsAwarded' },
        badges: { $push: '$badgeInfo' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get recent badge awards
userBadgeSchema.statics.getRecentBadges = function(limit = 10) {
  return this.find({})
    .sort({ earnedAt: -1 })
    .limit(limit)
    .populate('badge', 'name icon category rarity')
    .populate('user', 'username profile.firstName profile.lastName profile.avatar');
};

// Static method to get badge leaderboard
userBadgeSchema.statics.getBadgeLeaderboard = async function(options = {}) {
  const {
    period = 'all', // 'all', 'week', 'month', 'year'
    limit = 10,
    category = null
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
    
    matchStage.earnedAt = { $gte: startDate };
  }
  
  if (category) {
    matchStage['badge.category'] = category;
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'badges',
        localField: 'badge',
        foreignField: '_id',
        as: 'badgeInfo'
      }
    },
    { $unwind: '$badgeInfo' },
    {
      $group: {
        _id: '$user',
        totalBadges: { $sum: 1 },
        totalPoints: { $sum: '$pointsAwarded' },
        badges: { $push: '$badgeInfo' },
        categories: { $addToSet: '$badgeInfo.category' }
      }
    },
    { $sort: { totalPoints: -1, totalBadges: -1 } },
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
        totalBadges: 1,
        totalPoints: 1,
        categories: 1,
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

// Method to toggle display status
userBadgeSchema.methods.toggleDisplay = function() {
  this.isDisplayed = !this.isDisplayed;
  return this.save();
};

module.exports = mongoose.model('UserBadge', userBadgeSchema);
