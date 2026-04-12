const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  icon: {
    type: String,
    required: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['subject_mastery', 'activity', 'quality', 'community', 'milestone']
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: ['points', 'questions', 'answers', 'upvotes', 'acceptance_rate', 'streak', 'custom']
    },
    value: {
      type: Number,
      required: true
    },
    subject: {
      type: String,
      enum: [
        'Combined Mathematics', 
        'Biological Sciences', 
        'Commercial Stream', 
        'Physical Sciences', 
        'Arts Stream', 
        'Technology Stream', 
        'O/L General',
        'Other',
        'all'
      ],
      default: 'all'
    },
    timeFrame: {
      type: String,
      enum: ['all_time', 'week', 'month', 'year'],
      default: 'all_time'
    }
  },
  pointsAwarded: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  tier: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// badgeSchema.index({ category: 1, isActive: 1 });
// badgeSchema.index({ rarity: 1, isActive: 1 });
// badgeSchema.index({ 'criteria.subject': 1, isActive: 1 });

// Static method to get badges by category
badgeSchema.statics.getByCategory = function(category, options = {}) {
  const { includeInactive = false } = options;
  
  const query = { category };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query).sort({ tier: 1, name: 1 });
};

// Static method to get badges by rarity
badgeSchema.statics.getByRarity = function(rarity, options = {}) {
  const { includeInactive = false } = options;
  
  const query = { rarity };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query).sort({ tier: 1, name: 1 });
};

// Static method to get badges by subject
badgeSchema.statics.getBySubject = function(subject, options = {}) {
  const { includeInactive = false } = options;
  
  const query = { 'criteria.subject': subject };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query).sort({ category: 1, tier: 1, name: 1 });
};

// Static method to check if user qualifies for badge
badgeSchema.statics.checkUserQualification = async function(userId, badgeId) {
  const badge = await this.findById(badgeId);
  if (!badge || !badge.isActive) return { qualified: false };
  
  const User = mongoose.model('User');
  const PointTransaction = mongoose.model('PointTransaction');
  const Question = mongoose.model('Question');
  const Answer = mongoose.model('Answer');
  
  let qualified = false;
  let currentValue = 0;
  
  switch (badge.criteria.type) {
    case 'points':
      currentValue = await PointTransaction.getUserTotalPoints(userId);
      qualified = currentValue >= badge.criteria.value;
      break;
      
    case 'questions':
      const questionQuery = { author: userId };
      if (badge.criteria.subject !== 'all') {
        questionQuery.category = badge.criteria.subject;
      }
      currentValue = await Question.countDocuments(questionQuery);
      qualified = currentValue >= badge.criteria.value;
      break;
      
    case 'answers':
      const answerQuery = { author: userId };
      if (badge.criteria.subject !== 'all') {
        // Need to join with questions for subject filtering
        const answers = await Answer.find(answerQuery)
          .populate({
            path: 'question',
            match: { category: badge.criteria.subject }
          });
        currentValue = answers.filter(a => a.question).length;
      } else {
        currentValue = await Answer.countDocuments(answerQuery);
      }
      qualified = currentValue >= badge.criteria.value;
      break;
      
    case 'upvotes':
      // This would require more complex aggregation
      // For now, simplified version
      const upvoteQuery = {
        user: userId,
        points: { $gt: 0 }
      };
      if (badge.criteria.subject !== 'all') {
        // Would need to filter by subject in aggregation
      }
      const upvoteResult = await PointTransaction.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId), points: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]);
      currentValue = upvoteResult.length > 0 ? Math.floor(upvoteResult[0].total / 10) : 0; // Assuming 10 points per upvote
      qualified = currentValue >= badge.criteria.value;
      break;
      
    case 'custom':
      // Custom criteria would be implemented as needed
      qualified = false;
      break;
  }
  
  return {
    qualified,
    currentValue,
    requiredValue: badge.criteria.value,
    badge
  };
};

// Static method to get all badges user qualifies for
badgeSchema.statics.getQualifiedBadges = async function(userId) {
  const badges = await this.find({ isActive: true });
  const qualifiedBadges = [];
  
  for (const badge of badges) {
    const result = await this.checkUserQualification(userId, badge._id);
    if (result.qualified) {
      qualifiedBadges.push(result.badge);
    }
  }
  
  return qualifiedBadges;
};

// Static method to get user's progress towards badges
badgeSchema.statics.getUserBadgeProgress = async function(userId) {
  const badges = await this.find({ isActive: true });
  const progress = [];
  
  for (const badge of badges) {
    const result = await this.checkUserQualification(userId, badge._id);
    progress.push({
      badge: result.badge,
      currentValue: result.currentValue,
      requiredValue: result.requiredValue,
      qualified: result.qualified,
      progressPercentage: Math.min(100, (result.currentValue / result.requiredValue) * 100)
    });
  }
  
  return progress;
};

module.exports = mongoose.model('Badge', badgeSchema);
