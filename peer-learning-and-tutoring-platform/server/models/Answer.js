const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'correct', 'incorrect', 'needs_improvement'],
    default: 'pending'
  },
  tutorComment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: {
    type: Date
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
answerSchema.index({ question: 1, createdAt: 1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ upvotes: -1 });
answerSchema.index({ createdAt: -1 });

// Virtual for vote score
answerSchema.virtual('voteScore').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for total votes
answerSchema.virtual('totalVotes').get(function() {
  return this.upvotes + this.downvotes;
});

// Method to accept answer
answerSchema.methods.accept = function(acceptedBy) {
  this.isAccepted = true;
  this.acceptedBy = acceptedBy;
  this.acceptedAt = new Date();
  return this.save();
};

// Method to unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
  this.acceptedBy = undefined;
  this.acceptedAt = undefined;
  return this.save();
};

// Method to update vote counts
answerSchema.methods.updateVoteCounts = async function() {
  const Vote = mongoose.model('Vote');
  const votes = await Vote.find({ targetType: 'answer', targetId: this._id });
  
  this.upvotes = votes.filter(v => v.voteType === 'up').length;
  this.downvotes = votes.filter(v => v.voteType === 'down').length;
  
  return this.save();
};

// Method to update comment count
answerSchema.methods.updateCommentCount = async function() {
  const Comment = mongoose.model('Comment');
  const count = await Comment.countDocuments({ targetType: 'answer', targetId: this._id });
  this.commentCount = count;
  return this.save();
};

// Pre-save middleware to handle acceptance logic
answerSchema.pre('save', async function(next) {
  if (this.isModified('isAccepted') && this.isAccepted) {
    // Unaccept all other answers for this question
    await this.constructor.updateMany(
      { 
        question: this.question, 
        _id: { $ne: this._id },
        isAccepted: true 
      },
      { 
        isAccepted: false,
        acceptedBy: undefined,
        acceptedAt: undefined
      }
    );
    
    // Update question's hasAcceptedAnswer flag
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(this.question, { 
      hasAcceptedAnswer: true 
    });
  } else if (this.isModified('isAccepted') && !this.isAccepted) {
    // Check if there are any other accepted answers
    const otherAccepted = await this.constructor.findOne({
      question: this.question,
      _id: { $ne: this._id },
      isAccepted: true
    });
    
    // Update question's hasAcceptedAnswer flag
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(this.question, { 
      hasAcceptedAnswer: !!otherAccepted
    });
  }
  
  next();
});

// Post-save middleware to update question's answer count
answerSchema.post('save', async function(doc) {
  const Question = mongoose.model('Question');
  await Question.findByIdAndUpdate(doc.question, {
    $inc: { answerCount: 1 }
  });
});

// Post-remove middleware to update question's answer count
answerSchema.post('remove', async function(doc) {
  const Question = mongoose.model('Question');
  await Question.findByIdAndUpdate(doc.question, {
    $inc: { answerCount: -1 }
  });
  
  // Update hasAcceptedAnswer flag if this was the accepted answer
  if (doc.isAccepted) {
    const otherAccepted = await this.constructor.findOne({
      question: doc.question,
      isAccepted: true
    });
    
    await Question.findByIdAndUpdate(doc.question, {
      hasAcceptedAnswer: !!otherAccepted
    });
  }
});

// Static method to get answers for a question
answerSchema.statics.getByQuestion = function(questionId, options = {}) {
  const {
    sortBy = 'oldest',
    page = 1,
    limit = 20
  } = options;

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
    default:
      sortOptions = { isAccepted: -1, voteScore: -1, createdAt: 1 };
  }

  return this.find({ question: questionId })
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate('acceptedBy', 'username profile.firstName profile.lastName');
};

module.exports = mongoose.model('Answer', answerSchema);
