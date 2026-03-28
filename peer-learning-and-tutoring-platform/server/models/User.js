const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'parent', 'admin'],
    default: 'student'
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    grade: {
      type: Number,
      min: 6,
      max: 13
    },
    school: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  // Forum and gamification fields
  reputation: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserBadge'
  }],
  subjectPoints: {
    type: Map,
    of: Number,
    default: {}
  },
  forumStats: {
    questionsAsked: { type: Number, default: 0 },
    answersGiven: { type: Number, default: 0 },
    bestAnswers: { type: Number, default: 0 },
    upvotesReceived: { type: Number, default: 0 },
    downvotesReceived: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for better query performance
// Note: email and username already have indexes via unique: true
// userSchema.index({ role: 1 });
// userSchema.index({ reputation: -1 });
// userSchema.index({ totalPoints: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.username;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

// Method to update forum stats
userSchema.methods.updateForumStats = async function(type, increment = 1) {
  const validTypes = ['questionsAsked', 'answersGiven', 'bestAnswers', 'upvotesReceived', 'downvotesReceived'];
  if (validTypes.includes(type)) {
    this.forumStats[type] += increment;
    return this.save();
  }
  throw new Error(`Invalid forum stat type: ${type}`);
};

// Method to add subject points
userSchema.methods.addSubjectPoints = function(subject, points) {
  const currentPoints = this.subjectPoints.get(subject) || 0;
  this.subjectPoints.set(subject, currentPoints + points);
  return this.save();
};

// Method to get user's forum rank
userSchema.methods.getForumRank = async function() {
  const totalUsers = await this.constructor.countDocuments();
  const usersWithHigherReputation = await this.constructor.countDocuments({ 
    reputation: { $gt: this.reputation } 
  });
  return Math.floor(((totalUsers - usersWithHigherReputation) / totalUsers) * 100);
};

module.exports = mongoose.model('User', userSchema);
