const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  submittedFiles: [{
    name: String,
    url: String,
    fileType: { type: String, enum: ['image', 'pdf', 'document'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['pending', 'submitted', 'marked', 'resubmit'],
    default: 'submitted'
  },
  marks: {
    type: Number,
    min: 0,
    max: 100
  },
  tutorFeedback: {
    type: String,
    trim: true
  },
  markedAt: {
    type: Date
  },
  pointsAwarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for quick retrieval of student-tutor homework pairs
// homeworkSubmissionSchema.index({ student: 1, tutor: 1 });

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
