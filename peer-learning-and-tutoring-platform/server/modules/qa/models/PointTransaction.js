const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'question_created',
      'answer_created',
      'answer_upvoted',
      'answer_downvoted',
      'question_upvoted',
      'question_downvoted',
      'answer_accepted',
      'badge_earned'
    ]
  },
  points: {
    type: Number,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Can reference question, answer, or badge
  },
  subjectType: {
    type: String,
    required: true,
    enum: ['question', 'answer', 'badge']
  }
}, {
  timestamps: true
});

// Indexes for better performance
pointTransactionSchema.index({ userId: 1, createdAt: -1 });
pointTransactionSchema.index({ action: 1 });

module.exports = mongoose.model('QA_PointTransaction', pointTransactionSchema);
