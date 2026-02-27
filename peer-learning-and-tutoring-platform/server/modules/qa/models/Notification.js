const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['answer_added', 'vote_received', 'answer_accepted']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Can reference question or answer
  },
  relatedType: {
    type: String,
    required: true,
    enum: ['question', 'answer']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('QA_Notification', notificationSchema);
