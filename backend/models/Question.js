const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  subject: {
    type: String,
    required: true,
    enum: [
      'Combined Mathematics', 
      'Biological Sciences', 
      'Commercial Stream', 
      'Physical Sciences', 
      'Arts Stream', 
      'Technology Stream', 
      'O/L General',
      'London A/L',
      'Other'
    ]
  },
  grade: {
    type: Number,
    required: true,
    min: 6,
    max: 13
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  answerCount: {
    type: Number,
    default: 0
  },
  hasAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  closeReason: {
    type: String,
    enum: ['duplicate', 'off-topic', 'unclear', 'too-broad', 'opinion-based', 'other']
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['mcq', 'structured', 'essay'],
    default: 'structured'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  points: {
    type: Number,
    default: 5,
    min: 0
  },
  options: [{
    type: String,
    trim: true,
    maxlength: 300
  }],
  correctAnswer: {
    type: String,
    trim: true,
    maxlength: 10000
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: 10000
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// questionSchema.index({ author: 1, createdAt: -1 });
// questionSchema.index({ category: 1, createdAt: -1 });
// questionSchema.index({ tags: 1 });
// questionSchema.index({ upvotes: -1 });
// questionSchema.index({ views: -1 });
// questionSchema.index({ createdAt: -1 });

// Virtual for vote score
questionSchema.virtual('voteScore').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for total votes
questionSchema.virtual('totalVotes').get(function() {
  return this.upvotes + this.downvotes;
});

// Method to increment view count
questionSchema.methods.incrementViewCount = function() {
  this.views += 1;
  return this.save();
};

// Method to update vote counts
questionSchema.methods.updateVoteCounts = async function() {
  const Vote = mongoose.model('Vote');
  const votes = await Vote.find({ targetType: 'question', targetId: this._id });
  
  this.upvotes = votes.filter(v => v.voteType === 'up').length;
  this.downvotes = votes.filter(v => v.voteType === 'down').length;
  
  return this.save();
};

// Method to update answer count
questionSchema.methods.updateAnswerCount = async function() {
  const Answer = mongoose.model('Answer');
  const count = await Answer.countDocuments({ question: this._id });
  this.answerCount = count;
  
  // Check if there's an accepted answer
  const hasAccepted = await Answer.findOne({ question: this._id, isAccepted: true });
  this.hasAcceptedAnswer = !!hasAccepted;
  
  return this.save();
};

// Static method to get popular questions
questionSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isClosed: false })
    .sort({ voteScore: -1, views: -1 })
    .limit(limit)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar');
};

// Static method to get unanswered questions
questionSchema.statics.getUnanswered = function(limit = 10) {
  return this.find({ answerCount: 0, isClosed: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar');
};

// Static method to search questions
questionSchema.statics.search = function(query, options = {}) {
  const {
    category,
    tags,
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = options;

  const searchQuery = {
    isClosed: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { body: { $regex: query, $options: 'i' } }
    ]
  };

  if (category && category !== 'all') {
    searchQuery.category = category;
  }

  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }

  let sortOptions = {};
  switch (sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'votes':
      sortOptions = { voteScore: -1 };
      break;
    case 'views':
      sortOptions = { views: -1 };
      break;
    default: // relevance
      sortOptions = { voteScore: -1, createdAt: -1 };
  }

  return this.find(searchQuery)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar');
};

module.exports = mongoose.model('Question', questionSchema);
