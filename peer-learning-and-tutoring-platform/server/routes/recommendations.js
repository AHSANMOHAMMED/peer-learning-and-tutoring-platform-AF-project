const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const RecommendationService = require('../services/RecommendationService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized recommendations for the user
 * @access  Private
 */
router.get('/', [
  authenticate,
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;

    const recommendations = await RecommendationService.getRecommendations(userId);

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

/**
 * @route   GET /api/recommendations/courses
 * @desc    Get course recommendations
 * @access  Private
 */
router.get('/courses', [
  authenticate,
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;

    const courses = await RecommendationService.getCourseRecommendations(userId);

    res.json(courses);
  } catch (error) {
    console.error('Error getting course recommendations:', error);
    res.status(500).json({ message: 'Failed to get course recommendations' });
  }
});

/**
 * @route   GET /api/recommendations/peers
 * @desc    Get peer recommendations
 * @access  Private
 */
router.get('/peers', [
  authenticate,
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;

    const peers = await RecommendationService.getPeerRecommendations(userId);

    res.json(peers);
  } catch (error) {
    console.error('Error getting peer recommendations:', error);
    res.status(500).json({ message: 'Failed to get peer recommendations' });
  }
});

/**
 * @route   GET /api/recommendations/groups
 * @desc    Get group study room recommendations
 * @access  Private
 */
router.get('/groups', [
  authenticate,
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await RecommendationService.getGroupRecommendations(userId);

    res.json(groups);
  } catch (error) {
    console.error('Error getting group recommendations:', error);
    res.status(500).json({ message: 'Failed to get group recommendations' });
  }
});

/**
 * @route   GET /api/recommendations/materials
 * @desc    Get study material recommendations
 * @access  Private
 */
router.get('/materials', [
  authenticate,
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;

    const materials = await RecommendationService.getStudyMaterialRecommendations(userId);

    res.json(materials);
  } catch (error) {
    console.error('Error getting material recommendations:', error);
    res.status(500).json({ message: 'Failed to get material recommendations' });
  }
});

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending content across the platform
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const trending = await RecommendationService.getTrendingContent();

    res.json(trending);
  } catch (error) {
    console.error('Error getting trending content:', error);
    res.status(500).json({ message: 'Failed to get trending content' });
  }
});

/**
 * @route   GET /api/recommendations/learning-path
 * @desc    Get personalized learning path for a subject
 * @access  Private
 */
router.get('/learning-path', [
  authenticate,
  query('subject').trim().notEmpty().withMessage('Subject is required'),
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject } = req.query;

    const learningPath = await RecommendationService.getLearningPathRecommendations(userId, subject);

    res.json(learningPath);
  } catch (error) {
    console.error('Error getting learning path:', error);
    res.status(500).json({ message: 'Failed to get learning path' });
  }
});

/**
 * @route   POST /api/recommendations/interaction
 * @desc    Record user interaction for better recommendations
 * @access  Private
 */
router.post('/interaction', [
  authenticate,
  validate
], async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemType, itemId, interaction } = req.body;

    await RecommendationService.recordInteraction(userId, itemType, itemId, interaction);

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ message: 'Failed to record interaction' });
  }
});

module.exports = router;
