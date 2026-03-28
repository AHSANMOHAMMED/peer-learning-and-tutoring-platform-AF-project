const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationalQuestion',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    default: 0
  },
  timeTaken: {
    type: Number, // seconds
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  confidence: {
    type: Number, // 1-5 scale
    min: 1,
    max: 5
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
// studentAnswerSchema.index({ studentId: 1, submittedAt: -1 });
// studentAnswerSchema.index({ questionId: 1, isCorrect: 1 });
// studentAnswerSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);
