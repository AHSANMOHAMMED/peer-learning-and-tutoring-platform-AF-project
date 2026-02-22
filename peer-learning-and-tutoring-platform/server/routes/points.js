const express = require('express');
const router = express.Router();
const PointsService = require('../services/pointsService');
const auth = require('../middleware/auth');

// Get user's points information
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalPoints = await PointsService.getUserTotalPoints(userId);
    const pointsBreakdown = await PointsService.getUserPointsBreakdown(userId);
    const progress = await PointsService.getUserProgress(userId);
    
    res.json({
      totalPoints,
      pointsBreakdown,
      progress
    });
  } catch (error) {
    console.error('Error getting user points:', error);
    res.status(500).json({ error: 'Failed to fetch user points' });
  }
});

// Get user's points history
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      type
    };
    
    const history = await PointsService.getUserPointsHistory(userId, options);
    
    res.json(history);
  } catch (error) {
    console.error('Error getting points history:', error);
    res.status(500).json({ error: 'Failed to fetch points history' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 10, offset = 0 } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    const leaderboard = await PointsService.getLeaderboard(options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get subject-specific leaderboard
router.get('/leaderboard/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    const leaderboard = await PointsService.getSubjectLeaderboard(subject, options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting subject leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch subject leaderboard' });
  }
});

// Get user's subject rank
router.get('/user/:userId/rank/:subject', async (req, res) => {
  try {
    const { userId, subject } = req.params;
    
    const rank = await PointsService.getUserSubjectRank(userId, subject);
    
    res.json({ subject, rank });
  } catch (error) {
    console.error('Error getting user subject rank:', error);
    res.status(500).json({ error: 'Failed to fetch user subject rank' });
  }
});

// Get points statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = await PointsService.getPointsStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting points stats:', error);
    res.status(500).json({ error: 'Failed to fetch points statistics' });
  }
});

// Process daily login bonus
router.post('/daily-login', async (req, res) => {
  try {
    const result = await PointsService.processDailyLogin(req.user._id);
    
    res.json(result);
  } catch (error) {
    console.error('Error processing daily login:', error);
    res.status(500).json({ error: 'Failed to process daily login bonus' });
  }
});

// Award first answer of day bonus
router.post('/first-answer-bonus', async (req, res) => {
  try {
    const result = await PointsService.awardFirstAnswerOfDay(req.user._id);
    
    res.json(result);
  } catch (error) {
    console.error('Error awarding first answer bonus:', error);
    res.status(500).json({ error: 'Failed to award first answer bonus' });
  }
});

module.exports = router;
