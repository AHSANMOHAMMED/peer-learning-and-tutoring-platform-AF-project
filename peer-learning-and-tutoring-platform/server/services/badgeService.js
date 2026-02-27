const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

class BadgeService {
  // Initialize default badges
  static async initializeDefaultBadges() {
    try {
      const defaultBadges = [
        // Subject Mastery Badges
        {
          name: 'Math Whiz',
          description: 'Earn 100 points in Mathematics',
          icon: '🧮',
          category: 'subject_mastery',
          criteria: { type: 'points', value: 100, subject: 'Mathematics' },
          pointsAwarded: 50,
          rarity: 'uncommon',
          tier: 1
        },
        {
          name: 'Science Expert',
          description: 'Earn 100 points in Science',
          icon: '🔬',
          category: 'subject_mastery',
          criteria: { type: 'points', value: 100, subject: 'Science' },
          pointsAwarded: 50,
          rarity: 'uncommon',
          tier: 1
        },
        {
          name: 'Computer Science Guru',
          description: 'Earn 100 points in Computer Science',
          icon: '💻',
          category: 'subject_mastery',
          criteria: { type: 'points', value: 100, subject: 'Computer Science' },
          pointsAwarded: 50,
          rarity: 'uncommon',
          tier: 1
        },
        {
          name: 'Physics Master',
          description: 'Earn 100 points in Physics',
          icon: '⚛️',
          category: 'subject_mastery',
          criteria: { type: 'points', value: 100, subject: 'Physics' },
          pointsAwarded: 50,
          rarity: 'uncommon',
          tier: 1
        },
        {
          name: 'Chemistry Expert',
          description: 'Earn 100 points in Chemistry',
          icon: '🧪',
          category: 'subject_mastery',
          criteria: { type: 'points', value: 100, subject: 'Chemistry' },
          pointsAwarded: 50,
          rarity: 'uncommon',
          tier: 1
        },
        {
          name: 'Biology Specialist',
          description: 'Earn 100 points in Biology',
          icon: '🧬',
          category: 'subject_mastery',
          criteria: { type: 'points', value: 100, subject: 'Biology' },
          pointsAwarded: 50,
          rarity: 'uncommon',
          tier: 1
        },

        // Activity Badges
        {
          name: 'First Question',
          description: 'Ask your first question',
          icon: '❓',
          category: 'activity',
          criteria: { type: 'questions', value: 1 },
          pointsAwarded: 5,
          rarity: 'common',
          tier: 1
        },
        {
          name: 'First Answer',
          description: 'Provide your first answer',
          icon: '💡',
          category: 'activity',
          criteria: { type: 'answers', value: 1 },
          pointsAwarded: 5,
          rarity: 'common',
          tier: 1
        },
        {
          name: 'Question Master',
          description: 'Ask 10 questions',
          icon: '📝',
          category: 'activity',
          criteria: { type: 'questions', value: 10 },
          pointsAwarded: 20,
          rarity: 'common',
          tier: 2
        },
        {
          name: 'Answer Expert',
          description: 'Provide 25 answers',
          icon: '🎯',
          category: 'activity',
          criteria: { type: 'answers', value: 25 },
          pointsAwarded: 30,
          rarity: 'uncommon',
          tier: 2
        },
        {
          name: 'Prolific Contributor',
          description: 'Provide 100 answers',
          icon: '🌟',
          category: 'activity',
          criteria: { type: 'answers', value: 100 },
          pointsAwarded: 100,
          rarity: 'rare',
          tier: 3
        },
        {
          name: 'Early Bird',
          description: 'Be active before 8 AM for 7 days',
          icon: '🌅',
          category: 'activity',
          criteria: { type: 'custom', value: 7 },
          pointsAwarded: 15,
          rarity: 'uncommon',
          tier: 2
        },
        {
          name: 'Night Owl',
          description: 'Be active after 10 PM for 7 days',
          icon: '🦉',
          category: 'activity',
          criteria: { type: 'custom', value: 7 },
          pointsAwarded: 15,
          rarity: 'uncommon',
          tier: 2
        },

        // Quality Badges
        {
          name: 'Perfect Answer',
          description: 'Get an answer accepted with 10+ upvotes',
          icon: '✨',
          category: 'quality',
          criteria: { type: 'custom', value: 10 },
          pointsAwarded: 25,
          rarity: 'rare',
          tier: 2
        },
        {
          name: 'Popular Question',
          description: 'Get a question with 20+ upvotes',
          icon: '🔥',
          category: 'quality',
          criteria: { type: 'custom', value: 20 },
          pointsAwarded: 30,
          rarity: 'rare',
          tier: 2
        },
        {
          name: 'Helpful Soul',
          description: 'Receive 50 upvotes on your answers',
          icon: '💝',
          category: 'quality',
          criteria: { type: 'upvotes', value: 50 },
          pointsAwarded: 40,
          rarity: 'rare',
          tier: 3
        },
        {
          name: 'Quality Contributor',
          description: 'Maintain 80% answer acceptance rate with 25+ answers',
          icon: '🏆',
          category: 'quality',
          criteria: { type: 'acceptance_rate', value: 80 },
          pointsAwarded: 50,
          rarity: 'epic',
          tier: 3
        },

        // Community Badges
        {
          name: 'Welcome Wagon',
          description: 'Help 5 new users with their first questions',
          icon: '👋',
          category: 'community',
          criteria: { type: 'custom', value: 5 },
          pointsAwarded: 20,
          rarity: 'uncommon',
          tier: 2
        },
        {
          name: 'Mentor',
          description: 'Help 20 users get accepted answers',
          icon: '🎓',
          category: 'community',
          criteria: { type: 'custom', value: 20 },
          pointsAwarded: 60,
          rarity: 'epic',
          tier: 4
        },
        {
          name: 'Community Leader',
          description: 'Reach top 10 in monthly leaderboard',
          icon: '👑',
          category: 'community',
          criteria: { type: 'custom', value: 10 },
          pointsAwarded: 75,
          rarity: 'legendary',
          tier: 5
        },

        // Milestone Badges
        {
          name: 'Century Club',
          description: 'Reach 100 reputation points',
          icon: '💯',
          category: 'milestone',
          criteria: { type: 'points', value: 100 },
          pointsAwarded: 25,
          rarity: 'common',
          tier: 2
        },
        {
          name: 'Thousand Points',
          description: 'Reach 1,000 reputation points',
          icon: '🌟',
          category: 'milestone',
          criteria: { type: 'points', value: 1000 },
          pointsAwarded: 100,
          rarity: 'rare',
          tier: 3
        },
        {
          name: 'Elite Contributor',
          description: 'Reach 5,000 reputation points',
          icon: '🏅',
          category: 'milestone',
          criteria: { type: 'points', value: 5000 },
          pointsAwarded: 250,
          rarity: 'epic',
          tier: 4
        },
        {
          name: 'Living Legend',
          description: 'Reach 10,000 reputation points',
          icon: '👑',
          category: 'milestone',
          criteria: { type: 'points', value: 10000 },
          pointsAwarded: 500,
          rarity: 'legendary',
          tier: 5
        }
      ];

      for (const badgeData of defaultBadges) {
        const existingBadge = await Badge.findOne({ name: badgeData.name });
        if (!existingBadge) {
          await Badge.create(badgeData);
        }
      }

      console.log('Default badges initialized successfully');
    } catch (error) {
      console.error('Error initializing default badges:', error);
      throw error;
    }
  }

  // Get all badges
  static async getAllBadges(options = {}) {
    try {
      const { category, rarity, subject } = options;
      let query = { isActive: true };

      if (category) query.category = category;
      if (rarity) query.rarity = rarity;
      if (subject) query['criteria.subject'] = subject;

      return await Badge.find(query).sort({ category: 1, tier: 1, name: 1 });
    } catch (error) {
      console.error('Error getting all badges:', error);
      throw error;
    }
  }

  // Get user's badges
  static async getUserBadges(userId, options = {}) {
    try {
      return await UserBadge.getUserBadges(userId, options);
    } catch (error) {
      console.error('Error getting user badges:', error);
      throw error;
    }
  }

  // Get user's badge progress
  static async getUserBadgeProgress(userId) {
    try {
      return await Badge.getUserBadgeProgress(userId);
    } catch (error) {
      console.error('Error getting user badge progress:', error);
      throw error;
    }
  }

  // Award badge to user
  static async awardBadge(userId, badgeId, metadata = {}) {
    try {
      return await UserBadge.awardBadge(userId, badgeId, metadata);
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  // Check if user qualifies for a specific badge
  static async checkBadgeQualification(userId, badgeId) {
    try {
      return await Badge.checkUserQualification(userId, badgeId);
    } catch (error) {
      console.error('Error checking badge qualification:', error);
      throw error;
    }
  }

  // Get recent badge awards
  static async getRecentBadgeAwards(limit = 10) {
    try {
      return await UserBadge.getRecentBadges(limit);
    } catch (error) {
      console.error('Error getting recent badge awards:', error);
      throw error;
    }
  }

  // Get badge leaderboard
  static async getBadgeLeaderboard(options = {}) {
    try {
      return await UserBadge.getBadgeLeaderboard(options);
    } catch (error) {
      console.error('Error getting badge leaderboard:', error);
      throw error;
    }
  }

  // Get badge statistics
  static async getBadgeStats() {
    try {
      const totalBadges = await Badge.countDocuments({ isActive: true });
      const badgesByCategory = await Badge.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const badgesByRarity = await Badge.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const totalAwarded = await UserBadge.countDocuments();
      const uniqueUsersWithBadges = await UserBadge.distinct('user');

      const mostAwardedBadges = await UserBadge.aggregate([
        {
          $group: {
            _id: '$badge',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'badges',
            localField: '_id',
            foreignField: '_id',
            as: 'badgeInfo'
          }
        },
        { $unwind: '$badgeInfo' }
      ]);

      return {
        totalBadges,
        badgesByCategory,
        badgesByRarity,
        totalAwarded,
        uniqueUsersWithBadges: uniqueUsersWithBadges.length,
        mostAwardedBadges
      };
    } catch (error) {
      console.error('Error getting badge stats:', error);
      throw error;
    }
  }

  // Toggle badge display status
  static async toggleBadgeDisplay(userId, userBadgeId) {
    try {
      const userBadge = await UserBadge.findOne({ _id: userBadgeId, user: userId });
      if (!userBadge) {
        throw new Error('User badge not found');
      }

      return await userBadge.toggleDisplay();
    } catch (error) {
      console.error('Error toggling badge display:', error);
      throw error;
    }
  }

  // Get badges by category
  static async getBadgesByCategory(category, options = {}) {
    try {
      return await Badge.getByCategory(category, options);
    } catch (error) {
      console.error('Error getting badges by category:', error);
      throw error;
    }
  }

  // Get badges by rarity
  static async getBadgesByRarity(rarity, options = {}) {
    try {
      return await Badge.getByRarity(rarity, options);
    } catch (error) {
      console.error('Error getting badges by rarity:', error);
      throw error;
    }
  }

  // Get badges by subject
  static async getBadgesBySubject(subject, options = {}) {
    try {
      return await Badge.getBySubject(subject, options);
    } catch (error) {
      console.error('Error getting badges by subject:', error);
      throw error;
    }
  }

  // Check custom badge criteria (for complex badges)
  static async checkCustomCriteria(userId, badgeType, value) {
    try {
      const User = require('../models/User');
      const Question = require('../models/Question');
      const Answer = require('../models/Answer');
      const Vote = require('../models/Vote');

      switch (badgeType) {
        case 'early_bird':
          // Check if user was active before 8 AM for consecutive days
          const earlyBirdActivities = await PointTransaction.find({
            user: userId,
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          });
          const earlyDays = new Set();
          earlyBirdActivities.forEach(activity => {
            if (activity.createdAt.getHours() < 8) {
              earlyDays.add(activity.createdAt.toDateString());
            }
          });
          return earlyDays.size >= value;

        case 'night_owl':
          // Check if user was active after 10 PM for consecutive days
          const nightOwlActivities = await PointTransaction.find({
            user: userId,
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          });
          const nightDays = new Set();
          nightOwlActivities.forEach(activity => {
            if (activity.createdAt.getHours() >= 22) {
              nightDays.add(activity.createdAt.toDateString());
            }
          });
          return nightDays.size >= value;

        case 'perfect_answer':
          // Check if user has an accepted answer with 10+ upvotes
          const perfectAnswers = await Answer.find({
            author: userId,
            isAccepted: true,
            upvotes: { $gte: value }
          });
          return perfectAnswers.length > 0;

        case 'popular_question':
          // Check if user has a question with 20+ upvotes
          const popularQuestions = await Question.find({
            author: userId,
            upvotes: { $gte: value }
          });
          return popularQuestions.length > 0;

        case 'acceptance_rate':
          // Check if user maintains 80% acceptance rate with 25+ answers
          const userAnswers = await Answer.find({ author: userId });
          if (userAnswers.length < 25) return false;
          
          const acceptedAnswers = userAnswers.filter(a => a.isAccepted).length;
          const acceptanceRate = (acceptedAnswers / userAnswers.length) * 100;
          return acceptanceRate >= value;

        case 'welcome_wagon':
          // Check if user helped new users with their first questions
          const helpedNewUsers = await Answer.aggregate([
            {
              $lookup: {
                from: 'questions',
                localField: 'question',
                foreignField: '_id',
                as: 'questionInfo'
              }
            },
            { $unwind: '$questionInfo' },
            {
              $lookup: {
                from: 'users',
                localField: 'questionInfo.author',
                foreignField: '_id',
                as: 'questionAuthor'
              }
            },
            { $unwind: '$questionAuthor' },
            {
              $match: {
                author: mongoose.Types.ObjectId(userId),
                'questionAuthor.createdAt': {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // New users from last 30 days
                }
              }
            },
            {
              $group: {
                _id: '$questionAuthor._id',
                count: { $sum: 1 }
              }
            }
          ]);
          return helpedNewUsers.length >= value;

        case 'mentor':
          // Check if user helped 20 users get accepted answers
          const mentorHelp = await Answer.aggregate([
            {
              $match: {
                author: mongoose.Types.ObjectId(userId),
                isAccepted: true
              }
            },
            {
              $lookup: {
                from: 'questions',
                localField: 'question',
                foreignField: '_id',
                as: 'questionInfo'
              }
            },
            { $unwind: '$questionInfo' },
            {
              $group: {
                _id: '$questionInfo.author',
                count: { $sum: 1 }
              }
            }
          ]);
          return mentorHelp.length >= value;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking custom criteria:', error);
      return false;
    }
  }
}

module.exports = BadgeService;
