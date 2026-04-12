const mongoose = require('mongoose');

const qaSubmissionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    questionTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    grade: {
      type: Number,
      required: true,
      min: 6,
      max: 13,
    },
    type: {
      type: String,
      enum: ['mcq', 'structured', 'essay'],
      default: 'structured',
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    marks: {
      type: Number,
      default: 0,
      min: 0,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

qaSubmissionSchema.index({ grade: 1, submittedAt: -1 });
qaSubmissionSchema.index({ studentId: 1, submittedAt: -1 });
qaSubmissionSchema.index({ questionId: 1, studentId: 1, submittedAt: -1 });

module.exports = mongoose.model('QASubmission', qaSubmissionSchema);
