const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['question', 'answer']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });
// commentSchema.index({ author: 1, createdAt: -1 });
// commentSchema.index({ isDeleted: 1 });

// Virtual for vote score
commentSchema.virtual('voteScore').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for total votes
commentSchema.virtual('totalVotes').get(function() {
  return this.upvotes + this.downvotes;
});

// Method to edit comment
commentSchema.methods.edit = function(newBody) {
  this.body = newBody;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to soft delete comment
commentSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  // Clear the body for privacy but keep it for moderation
  this.body = '[deleted]';
  return this.save();
};

// Static method to get comments for a target
commentSchema.statics.getByTarget = function(targetType, targetId, options = {}) {
  const {
    sortBy = 'oldest',
    page = 1,
    limit = 50
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
      sortOptions = { createdAt: 1 };
  }

  return this.find({ 
    targetType, 
    targetId, 
    isDeleted: false 
  })
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate('deletedBy', 'username profile.firstName profile.lastName');
};

// Static method to get comment count for a target
commentSchema.statics.getCountByTarget = function(targetType, targetId) {
  return this.countDocuments({ 
    targetType, 
    targetId, 
    isDeleted: false 
  });
};

// Post-save middleware to update target comment count
commentSchema.post('save', async function(doc) {
  if (!doc.isDeleted) {
    const TargetModel = mongoose.model(doc.targetType === 'question' ? 'Question' : 'Answer');
    await TargetModel.findById(doc.targetId).then(target => {
      if (target) {
        target.updateCommentCount();
      }
    });
  }
});

// Post-remove middleware to update target comment count
commentSchema.post('remove', async function(doc) {
  const TargetModel = mongoose.model(doc.targetType === 'question' ? 'Question' : 'Answer');
  await TargetModel.findById(doc.targetId).then(target => {
    if (target) {
      target.updateCommentCount();
    }
  });
});

module.exports = mongoose.model('Comment', commentSchema);
