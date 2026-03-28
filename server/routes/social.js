const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const UserGamification = require('../models/UserGamification');
const PeerSession = require('../models/PeerSession');

// Get all users for social discovery
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      role: { $in: ['student', 'tutor'] },
      isActive: true
    })
    .select('name email role profile.avatar profile.subjects profile.grade profile.school')
    .limit(50);

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const [user, gamification, sessions] = await Promise.all([
      User.findById(req.params.userId).select('-password'),
      UserGamification.findOne({ user: req.params.userId }),
      PeerSession.find({
        $or: [
          { 'participants.user': req.params.userId },
          { tutor: req.params.userId }
        ],
        status: 'completed'
      })
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          sessions: sessions.length,
          hours: Math.round(totalHours * 10) / 10,
          level: gamification?.level?.current || 1,
          points: gamification?.points?.lifetime || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Follow user
router.post('/follow/:userId', authenticate, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 'social.following': req.params.userId }
    });

    // Add to followers list
    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { 'social.followers': req.user._id }
    });

    res.json({ success: true, message: 'User followed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unfollow user
router.post('/unfollow/:userId', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { 'social.following': req.params.userId }
    });

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { 'social.followers': req.user._id }
    });

    res.json({ success: true, message: 'User unfollowed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get following list
router.get('/following', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('social.following', 'name email profile.avatar role');
    
    res.json({ success: true, data: user?.social?.following || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get followers list
router.get('/followers', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('social.followers', 'name email profile.avatar role');
    
    res.json({ success: true, data: user?.social?.followers || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get activity feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const following = user?.social?.following || [];
    
    // Get recent sessions from followed users
    const sessions = await PeerSession.find({
      'participants.user': { $in: following },
      status: 'completed'
    })
    .populate('participants.user', 'name profile.avatar')
    .sort({ completedAt: -1 })
    .limit(20);

    // Format as feed items
    const feed = sessions.map(session => ({
      type: 'session_completed',
      user: session.participants[0]?.user,
      subject: session.subject,
      timestamp: session.completedAt,
      duration: session.duration
    }));

    res.json({ success: true, data: feed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
