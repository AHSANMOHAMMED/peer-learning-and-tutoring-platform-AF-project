const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  role: { 
    type: String, 
    enum: ['student', 'tutor', 'parent', 'admin', 'superadmin', 'moderator', 'schoolAdmin'], 
    default: 'student' 
  },
  district: { 
    type: String, 
    enum: [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
      'Moneragala', 'Ratnapura', 'Kegalle'
    ]
  },
  stream: { 
    type: String, 
    enum: [
      'Combined Mathematics', 
      'Biological Sciences', 
      'Commercial Stream', 
      'Physical Sciences', 
      'Arts Stream', 
      'Technology Stream', 
      'O/L General'
    ] 
  },
  grade: { type: String }, // e.g., 'Grade 11', 'A/L 2025'
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    phoneNumber: String,
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String
    }
  },
  gamification: {
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    badges: [{ type: String }],
    level: { type: Number, default: 1 }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  // OTP for email verification and login
  otpCode: { type: String },
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  // Password reset
  passwordResetToken: { type: String },
  passwordResetExpiry: { type: Date },
  // Auth provider tracking
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  lastLogin: { type: Date },
  registrationDate: { type: Date, default: Date.now },
  subjectPoints: {
    type: Map,
    of: Number,
    default: {}
  },
  forumStats: {
    questionsAsked: { type: Number, default: 0 },
    answersGiven: { type: Number, default: 0 },
    bestAnswers: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Hash password before saving (skip for OAuth users)
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // OAuth users have no password
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update forum stats
userSchema.methods.updateForumStats = function(field) {
  if (this.forumStats[field] !== undefined) {
    this.forumStats[field] += 1;
    return this.save();
  }
};

// Method to add points to a specific subject
userSchema.methods.addSubjectPoints = function(subject, points) {
  const currentPoints = this.subjectPoints.get(subject) || 0;
  this.subjectPoints.set(subject, currentPoints + points);
  return this.save();
};

// Safe public serialization
userSchema.methods.toPublicJSON = function() {
  const obj = {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    profile: this.profile || {},
    gamification: this.gamification || { points: 0, level: 1 },
    isVerified: this.isVerified,
    authProvider: this.authProvider,
    district: this.district,
    grade: this.grade,
    stream: this.stream,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };

  // Safe Map conversion for subjectPoints
  if (this.subjectPoints) {
    if (typeof this.subjectPoints.toJSON === 'function') {
      obj.subjectPoints = this.subjectPoints.toJSON();
    } else if (this.subjectPoints instanceof Map) {
      obj.subjectPoints = Object.fromEntries(this.subjectPoints);
    } else {
      obj.subjectPoints = this.subjectPoints;
    }
  } else {
    obj.subjectPoints = {};
  }

  // Safe nesting for forumStats
  obj.forumStats = this.forumStats || {
    questionsAsked: 0,
    answersGiven: 0,
    bestAnswers: 0
  };

  return obj;
};

module.exports = mongoose.model('User', userSchema);

