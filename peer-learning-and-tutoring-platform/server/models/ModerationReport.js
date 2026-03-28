const mongoose = require('mongoose');

/**
 * @description Moderation Report Schema
 * Tracks content moderation reports and actions
 */

const moderationReportSchema = new mongoose.Schema({
  // Content being reported
  contentType: {
    type: String,
    enum: ['message', 'post', 'comment', 'profile', 'course', 'session'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  
  // Reporter information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Report details
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate_content', 'academic_misconduct', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // AI analysis
  aiAnalysis: {
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    categories: [String],
    flaggedWords: [String]
  },
  
  // Moderation status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  
  // Reviewer information
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  actionTaken: {
    type: String,
    enum: ['no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned']
  },
  
  // Timestamps
  reviewedAt: Date,
  resolvedAt: Date
}, {
  timestamps: true
});

// Indexes
// moderationReportSchema.index({ contentType: 1, contentId: 1 });
// moderationReportSchema.index({ reporter: 1 });
// moderationReportSchema.index({ status: 1 });
// moderationReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ModerationReport', moderationReportSchema);
