const express = require('express');
const router = express.Router();
const LeaderboardService = require('../services/leaderboardService');
const leaderboardController = require('../controllers/leaderboardController');

// Get global leaderboard
router.get('/global', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Global leaderboard endpoint working!',
      data: {
        period: req.query.period || 'all',
        limit: req.query.limit || 20
      }
    });
  } catch (error) {
    console.error('Error in global leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch global leaderboard' });
  }
});

// Get overall leaderboard (root endpoint - alias for global)
router.get('/', async (req, res) => {
  try {
    const { period = 'all', limit = 10, offset = 0 } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    const leaderboard = await LeaderboardService.getOverallLeaderboard(options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting overall leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
  }
});

// Get subject-specific leaderboard
router.get('/subject/:subject', leaderboardController.getSubjectLeaderboard);

// Get badge leaderboard
router.get('/badges', async (req, res) => {
  try {
    const { period = 'all', limit = 10, category } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit),
      category
    };
    
    const leaderboard = await LeaderboardService.getBadgeLeaderboard(options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting badge leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch badge leaderboard' });
  }
});

// Get question leaderboard
router.get('/questions', async (req, res) => {
  try {
    const { period = 'all', limit = 10, sortBy = 'votes' } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit),
      sortBy
    };
    
    const leaderboard = await LeaderboardService.getQuestionLeaderboard(options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting question leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch question leaderboard' });
  }
});

// Get answer leaderboard
router.get('/answers', async (req, res) => {
  try {
    const { period = 'all', limit = 10, sortBy = 'votes' } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit),
      sortBy
    };
    
    const leaderboard = await LeaderboardService.getAnswerLeaderboard(options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting answer leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch answer leaderboard' });
  }
});

// Get user's ranks in different categories
router.get('/user/:userId/ranks', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const ranks = await LeaderboardService.getUserRanks(userId);
    
    res.json(ranks);
  } catch (error) {
    console.error('Error getting user ranks:', error);
    res.status(500).json({ error: 'Failed to fetch user ranks' });
  }
});

// Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await LeaderboardService.getLeaderboardStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting leaderboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard statistics' });
  }
});

// Get trending topics
router.get('/trending', async (req, res) => {
  try {
    const { period = 'week', limit = 10 } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit)
    };
    
    const trending = await LeaderboardService.getTrendingTopics(options);
    
    res.json(trending);
  } catch (error) {
    console.error('Error getting trending topics:', error);
    res.status(500).json({ error: 'Failed to fetch trending topics' });
  }
});

// Search leaderboard users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    const users = await LeaderboardService.searchUsers(q, options);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;
