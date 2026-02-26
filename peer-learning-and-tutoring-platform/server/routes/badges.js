const express = require('express');
const router = express.Router();
const BadgeService = require('../services/badgeService');
const auth = require('../middleware/auth');

// Get all badges
router.get('/', async (req, res) => {
  try {
    const { category, rarity, subject } = req.query;
    
    const options = { category, rarity, subject };
    const badges = await BadgeService.getAllBadges(options);
    
    res.json(badges);
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user's badges
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, displayed } = req.query;
    
    const options = { category, displayed: displayed !== undefined ? displayed === 'true' : undefined };
    const userBadges = await BadgeService.getUserBadges(userId, options);
    
    res.json(userBadges);
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// Get user's badge progress
router.get('/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = await BadgeService.getUserBadgeProgress(userId);
    
    res.json(progress);
  } catch (error) {
    console.error('Error getting user badge progress:', error);
    res.status(500).json({ error: 'Failed to fetch user badge progress' });
  }
});

// Check if user qualifies for a specific badge
router.get('/check/:userId/:badgeId', async (req, res) => {
  try {
    const { userId, badgeId } = req.params;
    
    const qualification = await BadgeService.checkBadgeQualification(userId, badgeId);
    
    res.json(qualification);
  } catch (error) {
    console.error('Error checking badge qualification:', error);
    res.status(500).json({ error: 'Failed to check badge qualification' });
  }
});

// Get recent badge awards
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentBadges = await BadgeService.getRecentBadgeAwards(parseInt(limit));
    
    res.json(recentBadges);
  } catch (error) {
    console.error('Error getting recent badge awards:', error);
    res.status(500).json({ error: 'Failed to fetch recent badge awards' });
  }
});

// Get badge leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 10, category } = req.query;
    
    const options = { period, limit: parseInt(limit), category };
    const leaderboard = await BadgeService.getBadgeLeaderboard(options);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting badge leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch badge leaderboard' });
  }
});

// Get badge statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await BadgeService.getBadgeStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting badge stats:', error);
    res.status(500).json({ error: 'Failed to fetch badge statistics' });
  }
});

// Get badges by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { includeInactive = false } = req.query;
    
    const options = { includeInactive: includeInactive === 'true' };
    const badges = await BadgeService.getBadgesByCategory(category, options);
    
    res.json(badges);
  } catch (error) {
    console.error('Error getting badges by category:', error);
    res.status(500).json({ error: 'Failed to fetch badges by category' });
  }
});

// Get badges by rarity
router.get('/rarity/:rarity', async (req, res) => {
  try {
    const { rarity } = req.params;
    const { includeInactive = false } = req.query;
    
    const options = { includeInactive: includeInactive === 'true' };
    const badges = await BadgeService.getBadgesByRarity(rarity, options);
    
    res.json(badges);
  } catch (error) {
    console.error('Error getting badges by rarity:', error);
    res.status(500).json({ error: 'Failed to fetch badges by rarity' });
  }
});

// Get badges by subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const { includeInactive = false } = req.query;
    
    const options = { includeInactive: includeInactive === 'true' };
    const badges = await BadgeService.getBadgesBySubject(subject, options);
    
    res.json(badges);
  } catch (error) {
    console.error('Error getting badges by subject:', error);
    res.status(500).json({ error: 'Failed to fetch badges by subject' });
  }
});

// Award badge to user (admin only)
router.post('/award', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId, badgeId, metadata = {} } = req.body;
    
    if (!userId || !badgeId) {
      return res.status(400).json({ error: 'User ID and Badge ID are required' });
    }
    
    const userBadge = await BadgeService.awardBadge(userId, badgeId, metadata);
    
    res.status(201).json(userBadge);
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Toggle badge display status
router.put('/toggle/:userBadgeId', async (req, res) => {
  try {
    const { userBadgeId } = req.params;
    
    const userBadge = await BadgeService.toggleBadgeDisplay(req.user._id, userBadgeId);
    
    res.json(userBadge);
  } catch (error) {
    console.error('Error toggling badge display:', error);
    res.status(500).json({ error: 'Failed to toggle badge display' });
  }
});

// Initialize default badges (admin only)
router.post('/initialize', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await BadgeService.initializeDefaultBadges();
    
    res.json({ message: 'Default badges initialized successfully' });
  } catch (error) {
    console.error('Error initializing default badges:', error);
    res.status(500).json({ error: 'Failed to initialize default badges' });
  }
});

module.exports = router;
