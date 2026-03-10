const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const AIPersonalizationService = require('../services/AIPersonalizationService');

// Get user learning patterns and insights
router.get('/insights', authenticate, async (req, res) => {
  try {
    const analysis = await AIPersonalizationService.analyzeLearningPatterns(req.user._id);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get personalized recommendations
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const analysis = await AIPersonalizationService.analyzeLearningPatterns(req.user._id);
    
    res.json({
      success: true,
      data: analysis.recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate learning path
router.post('/learning-path', authenticate, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('targetLevel').optional()
], async (req, res) => {
  try {
    const { subject, targetLevel = 'intermediate' } = req.body;
    
    const path = await AIPersonalizationService.generateLearningPath(
      req.user._id,
      subject,
      targetLevel
    );
    
    res.json({
      success: true,
      data: path
    });
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Predict learning outcomes
router.post('/predict', authenticate, [
  body('studyPlan').isArray().withMessage('Study plan must be an array')
], async (req, res) => {
  try {
    const { studyPlan } = req.body;
    
    const predictions = await AIPersonalizationService.predictOutcomes(
      req.user._id,
      studyPlan
    );
    
    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Error predicting outcomes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
