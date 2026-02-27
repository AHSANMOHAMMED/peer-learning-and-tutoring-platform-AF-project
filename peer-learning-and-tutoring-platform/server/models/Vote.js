const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['question', 'answer'],
    required: true
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
    enum: ['up', 'down'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per target
voteSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true });
voteSchema.index({ targetType: 1, targetId: 1 });
voteSchema.index({ user: 1 });

// Static method to get user's vote on a specific target
voteSchema.statics.getUserVote = async function(targetType, targetId, userId) {
  return this.findOne({
    targetType,
    targetId,
    user: userId
  });
};

// Static method to get vote counts for a target
voteSchema.statics.getVoteCounts = async function(targetType, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId)
      }
    },
    {
      $group: {
        _id: '$voteType',
        count: { $sum: 1 }
      }
    }
  ]);

  const counts = { up: 0, down: 0 };
  result.forEach(item => {
    counts[item._id] = item.count;
  });

  return counts;
};

// Static method to toggle vote
voteSchema.statics.toggleVote = async function(targetType, targetId, userId, voteType) {
  const existingVote = await this.findOne({
    targetType,
    targetId,
    user: userId
  });

  if (!existingVote) {
    // Create new vote
    await this.create({
      targetType,
      targetId,
      user: userId,
      voteType
    });
    return { action: 'added' };
  }

  if (existingVote.voteType === voteType) {
    // Remove vote if same type
    await this.deleteOne({ _id: existingVote._id });
    return { action: 'removed' };
  }

  // Change vote type
  existingVote.voteType = voteType;
  await existingVote.save();
  return { action: 'changed' };
};

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
