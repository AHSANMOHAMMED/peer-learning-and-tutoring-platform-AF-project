const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voteType: {
    type: String,
    required: true,
    enum: ['up', 'down']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate votes
voteSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true });

// Index for user vote history
voteSchema.index({ user: 1, createdAt: -1 });

// Static method to get user's vote on a target
voteSchema.statics.getUserVote = function(targetType, targetId, userId) {
  return this.findOne({ targetType, targetId, user: userId });
};

// Static method to get vote counts for a target
voteSchema.statics.getVoteCounts = async function(targetType, targetId) {
  const votes = await this.find({ targetType, targetId });
  const upvotes = votes.filter(v => v.voteType === 'up').length;
  const downvotes = votes.filter(v => v.voteType === 'down').length;
  
  return {
    upvotes,
    downvotes,
    total: upvotes + downvotes,
    score: upvotes - downvotes
  };
};

// Static method to toggle vote
voteSchema.statics.toggleVote = async function(targetType, targetId, userId, voteType) {
  const existingVote = await this.findOne({ targetType, targetId, user: userId });
  
  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // Remove vote if same type
      await existingVote.remove();
      return { action: 'removed', vote: existingVote };
    } else {
      // Change vote type
      existingVote.voteType = voteType;
      await existingVote.save();
      return { action: 'changed', vote: existingVote };
    }
  } else {
    // Create new vote
    const newVote = new this({
      targetType,
      targetId,
      user: userId,
      voteType
    });
    await newVote.save();
    return { action: 'created', vote: newVote };
  }
};

// Pre-save middleware to validate vote
voteSchema.pre('save', async function(next) {
  // Prevent self-voting
  const TargetModel = mongoose.model(this.targetType.charAt(0).toUpperCase() + this.targetType.slice(1));
  const target = await TargetModel.findById(this.targetId);
  
  if (target && target.author.toString() === this.user.toString()) {
    const error = new Error('Users cannot vote on their own content');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

// Post-save middleware to update target vote counts
voteSchema.post('save', async function(doc) {
  const TargetModel = mongoose.model(doc.targetType.charAt(0).toUpperCase() + doc.targetType.slice(1));
  await TargetModel.findById(doc.targetId).then(target => {
    if (target) {
      target.updateVoteCounts();
    }
  });
});

// Post-remove middleware to update target vote counts
voteSchema.post('remove', async function(doc) {
  const TargetModel = mongoose.model(doc.targetType.charAt(0).toUpperCase() + doc.targetType.slice(1));
  await TargetModel.findById(doc.targetId).then(target => {
    if (target) {
      target.updateVoteCounts();
    }
  });
});

module.exports = mongoose.model('Vote', voteSchema);
