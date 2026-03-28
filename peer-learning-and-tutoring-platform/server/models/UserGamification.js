const mongoose = require('mongoose');

const userGamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Points system
  points: {
    total: { type: Number, default: 0 },
    earnedThisMonth: { type: Number, default: 0 },
    earnedThisWeek: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0 }
  },
  
  // Level system
  level: {
    current: { type: Number, default: 1 },
    title: { type: String, default: 'Beginner' },
    progress: { type: Number, default: 0 }, // Percentage to next level
    pointsToNextLevel: { type: Number, default: 1000 }
  },
  
  // Earned badges
  badges: [{
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    isNew: {
      type: Boolean,
      default: true
    },
    viewedAt: Date
  }],
  
  // Streak tracking
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: Date,
    streakType: {
      type: String,
      enum: ['daily', 'learning'],
      default: 'daily'
    }
  },
  
  // Session statistics
  stats: {
    totalSessions: { type: Number, default: 0 },
    peerSessions: { type: Number, default: 0 },
    groupSessions: { type: Number, default: 0 },
    lectureSessions: { type: Number, default: 0 },
    
    totalHours: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    coursesInProgress: { type: Number, default: 0 },
    
    // As a tutor
    studentsHelped: { type: Number, default: 0 },
    hoursTutored: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  
  // Achievements unlocked
  achievements: [{
    type: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Recent activity for streaks
  recentActivity: [{
    date: Date,
    type: {
      type: String,
      enum: ['session', 'course', 'homework', 'social']
    },
    points: Number
  }],
  
  // Rank in leaderboard
  ranking: {
    global: Number,
    weekly: Number,
    monthly: Number,
    bySubject: mongoose.Schema.Types.Mixed
  },
  
  // Settings
  preferences: {
    showBadgesOnProfile: { type: Boolean, default: true },
    streakNotifications: { type: Boolean, default: true },
    levelUpNotifications: { type: Boolean, default: true },
    shareAchievements: { type: Boolean, default: true }
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Level titles based on level number
userGamificationSchema.statics.getLevelTitle = function(level) {
  const titles = {
    1: 'Beginner',
    2: 'Learner',
    3: 'Student',
    4: 'Scholar',
    5: 'Academic',
    6: 'Expert',
    7: 'Master',
    8: 'Grandmaster',
    9: 'Legend',
    10: 'Genius'
  };
  
  return titles[level] || `Level ${level}`;
};

// Calculate points needed for next level
userGamificationSchema.statics.pointsForNextLevel = function(currentLevel) {
  // Exponential growth: 1000 * 1.5^(level-1)
  return Math.round(1000 * Math.pow(1.5, currentLevel - 1));
};

// Method to check if user can level up
userGamificationSchema.methods.checkLevelUp = function() {
  const pointsNeeded = this.constructor.pointsForNextLevel(this.level.current);
  
  if (this.points.total >= pointsNeeded) {
    this.level.current += 1;
    this.level.title = this.constructor.getLevelTitle(this.level.current);
    this.points.total -= pointsNeeded;
    this.level.pointsToNextLevel = this.constructor.pointsForNextLevel(this.level.current);
    this.level.progress = 0;
    return true;
  }
  
  // Calculate progress percentage
  this.level.progress = (this.points.total / pointsNeeded) * 100;
  return false;
};

// Method to add points
userGamificationSchema.methods.addPoints = function(points, source) {
  this.points.total += points;
  this.points.lifetime += points;
  this.points.earnedThisWeek += points;
  this.points.earnedThisMonth += points;
  
  // Check for level up
  const leveledUp = this.checkLevelUp();
  
  this.updatedAt = new Date();
  
  return {
    pointsAdded: points,
    leveledUp,
    newLevel: leveledUp ? this.level.current : null,
    totalPoints: this.points.total
  };
};

// Method to update streak
userGamificationSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.streaks.lastActivity;
  
  if (!lastActivity) {
    this.streaks.current = 1;
    this.streaks.lastActivity = now;
    return { streakStarted: true, current: 1 };
  }
  
  const lastActivityDate = new Date(lastActivity);
  const daysSinceLastActivity = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastActivity === 0) {
    // Already active today, no change
    return { streakMaintained: true, current: this.streaks.current };
  } else if (daysSinceLastActivity === 1) {
    // Consecutive day, streak continues
    this.streaks.current += 1;
    if (this.streaks.current > this.streaks.longest) {
      this.streaks.longest = this.streaks.current;
    }
    this.streaks.lastActivity = now;
    return { streakIncreased: true, current: this.streaks.current };
  } else {
    // Streak broken
    this.streaks.current = 1;
    this.streaks.lastActivity = now;
    return { streakReset: true, current: 1, previous: this.streaks.longest };
  }
};

// Method to add badge
userGamificationSchema.methods.addBadge = function(badgeId, pointsAwarded) {
  const alreadyHasBadge = this.badges.some(b => b.badge.toString() === badgeId.toString());
  
  if (!alreadyHasBadge) {
    this.badges.push({
      badge: badgeId,
      earnedAt: new Date(),
      isNew: true
    });
    
    // Add badge points
    if (pointsAwarded) {
      return this.addPoints(pointsAwarded, 'badge');
    }
  }
  
  return null;
};

module.exports = mongoose.model('UserGamification', userGamificationSchema);
