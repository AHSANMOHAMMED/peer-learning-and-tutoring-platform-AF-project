const express = require('express');
const router = express.Router();
const socialService = require('../services/SocialService');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/social/feed
 * @desc    Get social activity feed
 * @access  Private
 */
router.get('/feed', protect, async (req, res) => {
  try {
    const { filter = 'all', page = 1 } = req.query;
    const posts = await socialService.getFeed(req.user._id, { filter, page });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/post
 * @desc    Create a new post
 * @access  Private
 */
router.post('/post', protect, async (req, res) => {
  try {
    const post = await socialService.createPost(req.user._id, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/follow/:userId
 * @desc    Follow a user
 * @access  Private
 */
router.post('/follow/:userId', protect, async (req, res) => {
  try {
    const result = await socialService.followUser(req.user._id, req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/unfollow/:userId
 * @desc    Unfollow a user
 * @access  Private
 */
router.post('/unfollow/:userId', protect, async (req, res) => {
  try {
    const result = await socialService.unfollowUser(req.user._id, req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/like/:postId
 * @desc    Like or unlike a post
 * @access  Private
 */
router.post('/like/:postId', protect, async (req, res) => {
  try {
    const result = await socialService.toggleLike(req.params.postId, req.user._id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/social/recommendations
 * @desc    Get suggested users to follow
 * @access  Private
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const recommendations = await socialService.getRecommendations(req.user._id);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
