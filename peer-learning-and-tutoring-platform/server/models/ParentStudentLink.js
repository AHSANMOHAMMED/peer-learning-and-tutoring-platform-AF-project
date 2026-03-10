const mongoose = require('mongoose');

const parentStudentLinkSchema = new mongoose.Schema({
  // Parent user
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Student user
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Relationship type
  relationship: {
    type: String,
    enum: ['parent', 'guardian', 'other'],
    default: 'parent'
  },
  
  // Link status
  status: {
    type: String,
    enum: ['pending', 'active', 'revoked'],
    default: 'pending'
  },
  
  // Student approval
  studentApproved: {
    type: Boolean,
    default: false
  },
  
  studentApprovedAt: {
    type: Date
  },
  
  // Permissions granted by student
  permissions: {
    viewProgress: { type: Boolean, default: true },
    viewSchedule: { type: Boolean, default: true },
    viewGrades: { type: Boolean, default: true },
    viewActivity: { type: Boolean, default: true },
    receiveNotifications: { type: Boolean, default: true },
    manageEnrollments: { type: Boolean, default: false },
    viewMessages: { type: Boolean, default: false }
  },
  
  // When link was created
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // When link was activated
  activatedAt: {
    type: Date
  },
  
  // If revoked
  revokedAt: {
    type: Date
  },
  
  revokeReason: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes
parentStudentLinkSchema.index({ parent: 1, student: 1 }, { unique: true });
parentStudentLinkSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('ParentStudentLink', parentStudentLinkSchema);
