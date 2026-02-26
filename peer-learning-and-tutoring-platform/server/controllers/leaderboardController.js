const PointsService = require('../services/pointsService');
const User = require('../models/User');

// Get global leaderboard
const getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 20, period = 'all' } = req.query;
    
    const options = {
      period,
      limit: parseInt(limit)
    };
    
    const leaderboard = await PointsService.getLeaderboard(options);
    
    res.json({
      leaderboard,
      period,
      limit: parseInt(limit),
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error in getGlobalLeaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
};

// Get subject-specific leaderboard
const getSubjectLeaderboard = async (req, res) => {
  try {
    const { subject } = req.params;
    const { limit = 10 } = req.query;
    
    // Validate subject
    const validSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Other'];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject' });
    }
    
    const options = {
      limit: parseInt(limit)
    };
    
    const leaderboard = await PointsService.getSubjectLeaderboard(subject, options);
    
    res.json({
      subject,
      leaderboard,
      limit: parseInt(limit),
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error in getSubjectLeaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch subject leaderboard' });
  }
};

// Get user's rank in leaderboards
const getUserRanks = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's total points
    const totalPoints = await PointsService.getUserTotalPoints(userId);
    
    // Get global rank
    const globalLeaderboard = await PointsService.getLeaderboard({ limit: 1000 });
    const globalRank = globalLeaderboard.findIndex(entry => entry.user._id.toString() === userId) + 1;
    
    // Get subject ranks
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    const subjectRanks = {};
    
    for (const subject of subjects) {
      const subjectLeaderboard = await PointsService.getSubjectLeaderboard(subject, { limit: 1000 });
      const subjectRank = subjectLeaderboard.findIndex(entry => entry.user._id.toString() === userId) + 1;
      if (subjectRank > 0) {
        subjectRanks[subject] = subjectRank;
      }
    }
    
    res.json({
      userId,
      totalPoints,
      globalRank: globalRank || null,
      subjectRanks
    });
  } catch (error) {
    console.error('Error in getUserRanks:', error);
    res.status(500).json({ error: 'Failed to fetch user ranks' });
  }
};

// Get leaderboard statistics
const getLeaderboardStats = async (req, res) => {
  try {
    const stats = await PointsService.getPointsStats();
    
    res.json({
      ...stats,
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ totalPoints: { $gt: 0 } })
    });
  } catch (error) {
    console.error('Error in getLeaderboardStats:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard stats' });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getSubjectLeaderboard,
  getUserRanks,
  getLeaderboardStats
};
