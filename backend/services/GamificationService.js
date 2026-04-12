const Badge = require('../models/Badge');
const UserGamification = require('../models/UserGamification');
const User = require('../models/User');
const LectureCourse = require('../models/LectureCourse');
const PeerSession = require('../models/PeerSession');
const GroupRoom = require('../models/GroupRoom');

class GamificationService {
  constructor() {
    // Point values for different activities
    this.pointValues = {
      sessionComplete: 50,
      courseEnroll: 20,
      courseComplete: 200,
      homeworkHelp: 30,
      correctAnswer: 25,
      streakBonus: 10, // per day of streak
      ratingReceived: 15,
      helpfulFeedback: 25,
      helpPeer: 40,
      joinGroup: 10,
      firstSession: 100,
      profileComplete: 50,
      aiHomework: 20,
      dailyLogin: 5
    };
    
    // Initialize default badges if none exist
    this.initializeDefaultBadges();
  }

  /**
   * Initialize default badges
   */
  async initializeDefaultBadges() {
    const count = await Badge.countDocuments();
    if (count > 0) return;

    const defaultBadges = [
      // Activity Badges - Sessions
      {
        name: 'First Steps',
        description: 'Complete your first learning session',
        category: 'activity',
        tier: 1, // bronze
        rarity: 'common',
        icon: '/badges/first-session.svg',
        criteria: {
          type: 'points',
          value: 100
        },
        pointsAwarded: 100
      },
      {
        name: 'Session Starter',
        description: 'Complete 10 learning sessions',
        category: 'activity',
        tier: 2, // silver
        rarity: 'uncommon',
        icon: '/badges/sessions-10.svg',
        criteria: {
          type: 'points',
          value: 200
        },
        pointsAwarded: 200
      },
      {
        name: 'Session Master',
        description: 'Complete 50 learning sessions',
        category: 'activity',
        tier: 3, // gold
        rarity: 'rare',
        icon: '/badges/sessions-50.svg',
        criteria: {
          type: 'points',
          value: 500
        },
        pointsAwarded: 500
      },

      // Milestone Badges - Streaks
      {
        name: '7-Day Streak',
        description: 'Maintain a 7-day learning streak',
        category: 'milestone',
        tier: 1,
        rarity: 'common',
        icon: '/badges/streak-7.svg',
        criteria: {
          type: 'streak',
          value: 7
        },
        pointsAwarded: 150
      },
      {
        name: '30-Day Champion',
        description: 'Maintain a 30-day learning streak',
        category: 'milestone',
        tier: 2,
        rarity: 'uncommon',
        icon: '/badges/streak-30.svg',
        criteria: {
          type: 'streak',
          value: 30
        },
        pointsAwarded: 500
      },

      // Subject Mastery - Courses
      {
        name: 'Course Enthusiast',
        description: 'Complete 5 courses',
        category: 'subject_mastery',
        tier: 1,
        rarity: 'common',
        icon: '/badges/courses-5.svg',
        criteria: {
          type: 'custom',
          value: 5
        },
        pointsAwarded: 300
      },

      // Community Badges - Tutoring
      {
        name: 'Helpful Hand',
        description: 'Help 5 students as a peer tutor',
        category: 'community',
        tier: 1,
        rarity: 'common',
        icon: '/badges/help-5.svg',
        criteria: {
          type: 'custom',
          value: 5
        },
        pointsAwarded: 200
      }
    ];

    await Badge.insertMany(defaultBadges);
    console.log('Default badges initialized');
  }

  /**
   * Get or create user gamification profile
   */
  async getUserGamification(userId) {
    let gamification = await UserGamification.findOne({ user: userId });
    
    if (!gamification) {
      gamification = await UserGamification.create({ user: userId });
    }
    
    return gamification;
  }

  /**
   * Award points for an activity
   */
  async awardPoints(userId, activity, multiplier = 1) {
    const gamification = await this.getUserGamification(userId);
    const basePoints = this.pointValues[activity] || 10;
    const points = Math.round(basePoints * multiplier);
    
    // Apply streak bonus
    if (gamification.streaks.current > 1) {
      const streakBonus = Math.min(gamification.streaks.current * this.pointValues.streakBonus, 100);
      points += streakBonus;
    }
    
    const result = gamification.addPoints(points, activity);
    await gamification.save();
    
    // Check for new badges
    const newBadges = await this.checkAndAwardBadges(userId);
    
    return {
      pointsAwarded: points,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      newBadges,
      totalPoints: result.totalPoints,
      currentStreak: gamification.streaks.current
    };
  }

  /**
   * Record user activity and update streak
   */
  async recordActivity(userId, activityType, points = 0) {
    const gamification = await this.getUserGamification(userId);
    
    // Update streak
    const streakUpdate = gamification.updateStreak();
    
    // Update stats based on activity type
    switch (activityType) {
      case 'session':
        gamification.stats.totalSessions += 1;
        break;
      case 'peer_session':
        gamification.stats.peerSessions += 1;
        gamification.stats.totalSessions += 1;
        break;
      case 'group_session':
        gamification.stats.groupSessions += 1;
        gamification.stats.totalSessions += 1;
        break;
      case 'lecture':
        gamification.stats.lectureSessions += 1;
        gamification.stats.totalSessions += 1;
        break;
      case 'course_complete':
        gamification.stats.coursesCompleted += 1;
        break;
      case 'course_enroll':
        gamification.stats.coursesInProgress += 1;
        break;
    }
    
    // Add to recent activity
    gamification.recentActivity.push({
      date: new Date(),
      type: activityType,
      points
    });
    
    // Keep only last 30 days of activity
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    gamification.recentActivity = gamification.recentActivity.filter(
      a => a.date > thirtyDaysAgo
    );
    
    await gamification.save();
    
    return {
      streakUpdate,
      currentStreak: gamification.streaks.current,
      longestStreak: gamification.streaks.longest
    };
  }

  /**
   * Check and award eligible badges
   */
  async checkAndAwardBadges(userId) {
    const gamification = await this.getUserGamification(userId);
    const user = await User.findById(userId);
    const newBadges = [];
    
    // Get all active badges user doesn't have
    const existingBadgeIds = gamification.badges.map(b => b.badge.toString());
    const eligibleBadges = await Badge.find({
      isActive: true,
      _id: { $nin: existingBadgeIds }
    });
    
    for (const badge of eligibleBadges) {
      const meetsRequirements = await this.checkBadgeRequirements(
        badge,
        gamification,
        user
      );
      
      if (meetsRequirements) {
        const badgeResult = gamification.addBadge(badge._id, badge.pointsAwarded);
        
        if (badgeResult) {
          newBadges.push({
            badge: badge.toJSON(),
            pointsAwarded: badge.pointsAwarded
          });
          
          // Update badge awarded count
          badge.awardedCount += 1;
          await badge.save();
        }
      }
    }
    
    if (newBadges.length > 0) {
      await gamification.save();
    }
    
    return newBadges;
  }

  /**
   * Check if user meets badge requirements
   */
  async checkBadgeRequirements(badge, gamification, user) {
    const req = badge.requirements;
    if (!req) return false;
    
    switch (req.type) {
      case 'sessions':
        if (req.sessionType === 'any') {
          return gamification.stats.totalSessions >= req.minSessions;
        }
        if (req.sessionType === 'peer') {
          return gamification.stats.peerSessions >= req.minSessions;
        }
        if (req.sessionType === 'group') {
          return gamification.stats.groupSessions >= req.minSessions;
        }
        if (req.sessionType === 'lecture') {
          return gamification.stats.lectureSessions >= req.minSessions;
        }
        return false;
        
      case 'courses':
        return gamification.stats.coursesCompleted >= req.minCourses;
        
      case 'streak':
        return gamification.streaks.longest >= req.minStreak;
        
      case 'rating':
        return gamification.stats.averageRating >= req.minRating &&
               gamification.stats.totalReviews >= req.minReviews;
        
      case 'help':
        return gamification.stats.studentsHelped >= req.studentsHelped;
        
      case 'social':
        // Check social requirements
        if (req.groupsJoined) {
          const joinedGroups = await GroupRoom.countDocuments({
            'participants.user': user._id,
            'participants.status': 'active'
          });
          return joinedGroups >= req.groupsJoined;
        }
        return false;
        
      default:
        return false;
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(type = 'global', limit = 100, subject = null) {
    let query = {};
    let sortField = 'points.lifetime';
    
    if (type === 'weekly') {
      sortField = 'points.earnedThisWeek';
    } else if (type === 'monthly') {
      sortField = 'points.earnedThisMonth';
    } else if (type === 'streaks') {
      sortField = 'streaks.longest';
    }
    
    const leaderboard = await UserGamification.find(query)
      .sort({ [sortField]: -1 })
      .limit(limit)
      .populate('user', 'name profile.avatar')
      .select('user points level badges streaks stats');
    
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      points: entry.points,
      level: entry.level,
      badgeCount: entry.badges.length,
      currentStreak: entry.streaks.current,
      longestStreak: entry.streaks.longest
    }));
  }

  /**
   * Get user ranking
   */
  async getUserRanking(userId) {
    const userGamification = await this.getUserGamification(userId);
    
    const globalRank = await UserGamification.countDocuments({
      'points.lifetime': { $gt: userGamification.points.lifetime }
    }) + 1;
    
    const weeklyRank = await UserGamification.countDocuments({
      'points.earnedThisWeek': { $gt: userGamification.points.earnedThisWeek }
    }) + 1;
    
    const monthlyRank = await UserGamification.countDocuments({
      'points.earnedThisMonth': { $gt: userGamification.points.earnedThisMonth }
    }) + 1;
    
    return {
      global: globalRank,
      weekly: weeklyRank,
      monthly: monthlyRank
    };
  }

  /**
   * Reset weekly/monthly points (call via cron job)
   */
  async resetPeriodicPoints() {
    const now = new Date();
    const isMonday = now.getDay() === 1;
    const isFirstOfMonth = now.getDate() === 1;
    
    if (isMonday) {
      // Reset weekly points
      await UserGamification.updateMany({}, {
        $set: { 'points.earnedThisWeek': 0 }
      });
    }
    
    if (isFirstOfMonth) {
      // Reset monthly points
      await UserGamification.updateMany({}, {
        $set: { 'points.earnedThisMonth': 0 }
      });
    }
  }

  /**
   * Get gamification summary for user
   */
  async getUserSummary(userId) {
    const gamification = await this.getUserGamification(userId);
    const ranking = await this.getUserRanking(userId);
    const nextLevelPoints = UserGamification.pointsForNextLevel(gamification.level.current);
    
    // Get nearby leaderboard users
    const nearbyUsers = await UserGamification.find({
      'points.lifetime': {
        $gte: gamification.points.lifetime - 500,
        $lte: gamification.points.lifetime + 500
      }
    })
      .sort({ 'points.lifetime': -1 })
      .limit(5)
      .populate('user', 'name');
    
    return {
      points: gamification.points,
      level: gamification.level,
      streaks: gamification.streaks,
      badges: gamification.badges,
      stats: gamification.stats,
      ranking,
      progress: {
        currentPoints: gamification.points.total,
        pointsForNextLevel: nextLevelPoints,
        progressPercentage: gamification.level.progress
      },
      nearbyLeaderboard: nearbyUsers.map((u, i) => ({
        rank: ranking.global - 2 + i,
        name: u.user.name,
        points: u.points.lifetime,
        isCurrentUser: u.user._id.toString() === userId.toString()
      }))
    };
  }

  /**
   * Mark badges as viewed
   */
  async markBadgesAsViewed(userId) {
    await UserGamification.updateOne(
      { user: userId },
      {
        $set: {
          'badges.$[elem].isNewBadge': false,
          'badges.$[elem].viewedAt': new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.isNewBadge': true }]
      }
    );
  }

  /**
   * Get all available badges
   */
  async getAllBadges(userId = null) {
    const badges = await Badge.find({ isActive: true }).sort({ category: 1, tier: 1 });
    
    if (!userId) {
      return badges;
    }
    
    // Mark which badges user has
    const gamification = await UserGamification.findOne({ user: userId });
    const earnedBadgeIds = gamification 
      ? gamification.badges.map(b => b.badge.toString())
      : [];
    
    return badges.map(badge => ({
      ...badge.toJSON(),
      isEarned: earnedBadgeIds.includes(badge._id.toString()),
      earnedAt: earnedBadgeIds.includes(badge._id.toString())
        ? gamification.badges.find(b => b.badge.toString() === badge._id.toString())?.earnedAt
        : null
    }));
  }
}

module.exports = new GamificationService();
