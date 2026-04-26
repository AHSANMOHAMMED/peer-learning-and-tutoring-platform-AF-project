const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['status', 'milestone', 'badge', 'question', 'content'],
    default: 'status'
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  metadata: {
    badgeId: String,
    badgeName: String,
    level: Number,
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LectureCourse' },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAutomated: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Index for feed generation
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
