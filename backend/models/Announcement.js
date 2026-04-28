const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRoles: [{
    type: String,
    enum: ['student', 'tutor', 'parent', 'mentor', 'schoolAdmin', 'all'],
    default: ['all']
  }],
  targetGrades: [{
    type: String // e.g., 'Grade 10', 'A/L 2025'
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  type: {
    type: String,
    enum: ['system', 'event', 'academic', 'maintenance'],
    default: 'system'
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  attachmentUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient fetching
announcementSchema.index({ targetRoles: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
