const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
    index: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    teaching: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    knowledge: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    }
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  tutorResponse: {
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date
    }
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    isReported: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date
    }
  },
  verifiedPurchase: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per booking per reviewer
reviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ tutorId: 1, createdAt: -1 });
reviewSchema.index({ isVisible: 1, tutorId: 1 });

// Virtual for average of specific ratings
reviewSchema.virtual('averageSpecificRatings').get(function() {
  const ratings = [this.rating.teaching, this.rating.knowledge, this.rating.communication, this.rating.punctuality];
  const validRatings = ratings.filter(r => r > 0);
  return validRatings.length > 0 
    ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1) 
    : 0;
});

// Method to add tutor response
reviewSchema.methods.addTutorResponse = function(comment) {
  this.tutorResponse = {
    comment,
    createdAt: new Date()
  };
};

// Method to mark as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count = this.helpful.users.length;
    return true;
  }
  return false;
};

// Method to report review
reviewSchema.methods.report = function(reason, reportedBy) {
  this.reported = {
    isReported: true,
    reason,
    reportedBy,
    reportedAt: new Date()
  };
};

// Static method to get reviews for a tutor
reviewSchema.statics.getTutorReviews = async function(tutorId, options = {}) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = {};
  sortOptions[sortBy] = sortDirection;
  
  const skip = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    this.find({ tutorId, isVisible: true })
      .populate('reviewerId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('bookingId', 'date subject')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments({ tutorId, isVisible: true })
  ]);
  
  return {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to calculate tutor statistics
reviewSchema.statics.calculateTutorStats = async function(tutorId) {
  const stats = await this.aggregate([
    { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), isVisible: true } },
    {
      $group: {
        _id: null,
        averageOverall: { $avg: '$rating.overall' },
        averageTeaching: { $avg: '$rating.teaching' },
        averageKnowledge: { $avg: '$rating.knowledge' },
        averageCommunication: { $avg: '$rating.communication' },
        averagePunctuality: { $avg: '$rating.punctuality' },
        totalReviews: { $sum: 1 },
        fiveStar: { $sum: { $cond: [{ $eq: ['$rating.overall', 5] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ['$rating.overall', 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ['$rating.overall', 3] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ['$rating.overall', 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ['$rating.overall', 1] }, 1, 0] } }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : null;
};

module.exports = mongoose.model('Review', reviewSchema);
