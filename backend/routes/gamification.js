const express = require('express');
const router = express.Router();
const GamificationService = require('../services/GamificationService');
const { authenticate } = require('../middleware/auth');
const { param, body, validationResult } = require('express-validator');

/**
 * @route   GET /api/gamification/profile
 * @desc    Get user's gamification profile
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const summary = await GamificationService.getUserSummary(req.user._id);

    res.json({
      success: true,
      message: 'Gamification profile retrieved',
      data: summary
    });

  } catch (error) {
    console.error('Error getting gamification profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/badges
 * @desc    Get all available badges
 * @access  Private
 */
router.get('/badges', authenticate, async (req, res) => {
  try {
    const badges = await GamificationService.getAllBadges(req.user._id);

    res.json({
      success: true,
      message: 'Badges retrieved',
      data: { badges }
    });

  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/badges/my
 * @desc    Get user's earned badges
 * @access  Private
 */
router.get('/badges/my', authenticate, async (req, res) => {
  try {
    const UserGamification = require('../models/UserGamification');
    
    const gamification = await UserGamification.findOne({ user: req.user._id })
      .populate('badges.badge')
      .select('badges');

    if (!gamification) {
      return res.json({
        success: true,
        data: { badges: [] }
      });
    }

    res.json({
      success: true,
      message: 'Earned badges retrieved',
      data: { badges: gamification.badges }
    });

  } catch (error) {
    console.error('Error getting earned badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gamification/badges/viewed
 * @desc    Mark badges as viewed
 * @access  Private
 */
router.post('/badges/viewed', authenticate, async (req, res) => {
  try {
    await GamificationService.markBadgesAsViewed(req.user._id);

    res.json({
      success: true,
      message: 'Badges marked as viewed'
    });

  } catch (error) {
    console.error('Error marking badges viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark badges',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Get leaderboard
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'global', limit = 100, subject = 'Global' } = req.query;
    const parsedLimit = parseInt(limit);

    const leaderboard = await GamificationService.getLeaderboard(
      type,
      parsedLimit,
      subject
    );

    res.json({
      success: true,
      message: 'Leaderboard retrieved',
      data: {
        type,
        leaderboard,
        totalCount: leaderboard.length
      }
    });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/leaderboard/districts
 * @desc    Get regional district leaderboard
 * @access  Public
 */
router.get('/leaderboard/districts', async (req, res) => {
  try {
    const leaderboard = await GamificationService.getDistrictLeaderboard();
    res.json({
      success: true,
      message: 'District leaderboard retrieved',
      data: { leaderboard }
    });
  } catch (error) {
    console.error('Error getting district leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get district leaderboard',
      error: error.message
    });
  }
});


/**
 * @route   GET /api/gamification/leaderboard/nearby
 * @desc    Get leaderboard users near current user's ranking
 * @access  Private
 */
router.get('/leaderboard/nearby', authenticate, async (req, res) => {
  try {
    const summary = await GamificationService.getUserSummary(req.user._id);

    res.json({
      success: true,
      message: 'Nearby leaderboard retrieved',
      data: {
        nearbyUsers: summary.nearbyLeaderboard,
        userRank: summary.ranking.global
      }
    });

  } catch (error) {
    console.error('Error getting nearby leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby leaderboard',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/stats
 * @desc    Get gamification statistics (Admin)
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const UserGamification = require('../models/UserGamification');
    const Badge = require('../models/Badge');

    const stats = await Promise.all([
      // Total users with gamification profiles
      UserGamification.countDocuments(),
      
      // Average level
      UserGamification.aggregate([
        { $group: { _id: null, avgLevel: { $avg: '$level.current' } } }
      ]),
      
      // Total points distributed
      UserGamification.aggregate([
        { $group: { _id: null, totalPoints: { $sum: '$points.lifetime' } } }
      ]),
      
      // Badge distribution
      Badge.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$tier', count: { $sum: 1 } } }
      ]),
      
      // Most earned badges
      UserGamification.aggregate([
        { $unwind: '$badges' },
        { $group: { _id: '$badges.badge', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'badges',
            localField: '_id',
            foreignField: '_id',
            as: 'badge'
          }
        }
      ])
    ]);

    res.json({
      success: true,
      message: 'Statistics retrieved',
      data: {
        totalUsers: stats[0],
        averageLevel: stats[1][0]?.avgLevel || 0,
        totalPointsDistributed: stats[2][0]?.totalPoints || 0,
        badgeDistribution: stats[3],
        mostEarnedBadges: stats[4]
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gamification/award-points
 * @desc    Manually award points to user (Admin)
 * @access  Private (Admin)
 */
router.post('/award-points', [
  authenticate,
  body('userId').isMongoId(),
  body('points').isInt({ min: 1 }),
  body('reason').trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, points, reason } = req.body;

    const result = await GamificationService.awardPoints(userId, 'custom', points / 50);

    res.json({
      success: true,
      message: `Awarded ${points} points to user`,
      data: {
        pointsAwarded: points,
        reason,
        result
      }
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gamification/catalog
 * @desc    Get learning games catalog
 * @access  Private
 */
router.get('/catalog', authenticate, async (req, res) => {
  try {
    const summary = await GamificationService.getUserSummary(req.user._id);
    
    // Sample Catalog Data
    const catalog = [
      {
        gameId: 'quiz-math-elementary',
        title: 'Neural Math Blitz',
        topic: 'math',
        difficulty: 'Easy',
        level: 'easy',
        gameType: 'quiz',
        maxScore: 1000,
        timerEnabled: true,
        timeLimit: 120,
        questions: [
          { prompt: 'What is 15 x 6?', options: ['80', '90', '100', '75'], correctAnswer: '90', explanation: '15 multiplied by 6 equals 90.' },
          { prompt: 'Resolve: (12 / 3) + 8', options: ['10', '12', '14', '16'], correctAnswer: '12', explanation: '4 + 8 = 12.' }
        ]
      },
      {
        gameId: 'memory-science-elements',
        title: 'Atomic Recall',
        topic: 'science',
        difficulty: 'Medium',
        level: 'medium',
        gameType: 'memory',
        maxScore: 1200,
        pairs: [
          { id: '1', left: 'H', right: 'Hydrogen' },
          { id: '2', left: 'He', right: 'Helium' },
          { id: '3', left: 'Li', right: 'Lithium' },
          { id: '4', left: 'Be', right: 'Beryllium' }
        ]
      }
    ];

    res.json({
      success: true,
      message: 'Learning games catalog retrieved',
      data: {
        catalog,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ success: false, message: 'Failed to load catalog' });
  }
});

/**
 * @route   POST /api/gamification/attempt
 * @desc    Submit game attempt
 * @access  Private
 */
router.post('/attempt', authenticate, async (req, res) => {
  try {
    const { gameId, score, accuracy, timeSpent, isTimeOut } = req.body;
    
    // Award points based on performance
    const pointsAwarded = Math.round(score / 10);
    const result = await GamificationService.awardPoints(req.user._id, 'sessionComplete', pointsAwarded / 50);

    res.json({
      success: true,
      message: 'Attempt recorded',
      data: {
        pointsAwarded,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        newBadges: result.newBadges
      }
    });

  } catch (error) {
    console.error('Error submitting attempt:', error);
    res.status(500).json({ success: false, message: 'Failed to record attempt' });
  }
});

module.exports = router;

