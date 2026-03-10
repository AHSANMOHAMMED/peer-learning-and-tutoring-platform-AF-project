const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Unique identifier
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Contact information
  email: {
    type: String,
    required: true
  },
  
  phone: String,
  
  address: {
    street: String,
    city: String,
    district: String,
    province: String,
    country: { type: String, default: 'Sri Lanka' }
  },
  
  // School type
  type: {
    type: String,
    enum: ['government', 'private', 'international', 'religious'],
    required: true
  },
  
  // Education levels
  levels: [{
    type: String,
    enum: ['primary', 'secondary', 'advanced_level', 'university']
  }],
  
  // Grades offered
  grades: [{
    type: Number,
    min: 1,
    max: 13
  }],
  
  // Administration
  adminUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['principal', 'vice_principal', 'coordinator', 'it_admin']
    },
    permissions: [String]
  }],
  
  // Subscription/Payment
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    maxUsers: {
      type: Number,
      default: 100
    },
    maxStorage: {
      type: Number,
      default: 10 // GB
    }
  },
  
  // Branding
  branding: {
    logo: String,
    primaryColor: { type: String, default: '#3b82f6' },
    accentColor: { type: String, default: '#8b5cf6' }
  },
  
  // Features enabled
  features: {
    peerTutoring: { type: Boolean, default: true },
    groupRooms: { type: Boolean, default: true },
    lectureCourses: { type: Boolean, default: true },
    aiHomework: { type: Boolean, default: false },
    gamification: { type: Boolean, default: true },
    parentDashboard: { type: Boolean, default: false },
    videoConferencing: { type: Boolean, default: true },
    recording: { type: Boolean, default: true }
  },
  
  // Custom settings
  settings: {
    allowExternalTutors: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    autoEnroll: { type: Boolean, default: false },
    publicProfile: { type: Boolean, default: false }
  },
  
  // Statistics
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 }
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'inactive'],
    default: 'pending'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
schoolSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('School', schoolSchema);
