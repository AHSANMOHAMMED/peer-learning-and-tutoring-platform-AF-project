const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
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
    required: true
  },
  value: {
    type: Number,
    required: true,
    enum: [1, -1] // +1 for upvote, -1 for downvote
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate votes
voteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('QA_Vote', voteSchema);
