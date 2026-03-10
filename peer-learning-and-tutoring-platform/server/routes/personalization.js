const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');

/**
 * @route   GET /api/personalization/profile
 * @desc    Get user's personalized profile data
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('profile preferences learningStyle');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching personalization profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

/**
 * @route   PUT /api/personalization/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, { preferences });
    
    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

module.exports = router;
