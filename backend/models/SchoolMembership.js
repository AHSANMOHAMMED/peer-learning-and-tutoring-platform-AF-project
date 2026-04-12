const mongoose = require('mongoose');

const schoolMembershipSchema = new mongoose.Schema({
  // School reference
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },
  
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Role in school
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'parent'],
    required: true
  },
  
  // School-specific info
  studentInfo: {
    grade: Number,
    class: String,
    rollNumber: String,
    enrollmentDate: Date,
    graduationYear: Number
  },
  
  teacherInfo: {
    subjects: [String],
    classes: [String],
    employeeId: String,
    joiningDate: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred', 'suspended'],
    default: 'active'
  },
  
  // Join date
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // If left school
  leftAt: Date,
  
  leftReason: String,
  
  // Permissions (overrides defaults)
  permissions: {
    canCreateSessions: { type: Boolean, default: true },
    canJoinExternal: { type: Boolean, default: true },
    canAccessAI: { type: Boolean, default: true },
    canAccessGamification: { type: Boolean, default: true }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
schoolMembershipSchema.index({ school: 1, user: 1 }, { unique: true });
schoolMembershipSchema.index({ school: 1, role: 1 });
schoolMembershipSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('SchoolMembership', schoolMembershipSchema);
