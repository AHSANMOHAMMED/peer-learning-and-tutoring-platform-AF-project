const express = require('express');
const router = express.Router();
const AIHomeworkAssistant = require('../services/AIHomeworkAssistant');
const { authenticate } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

/**
 * @route   POST /api/ai-homework/help
 * @desc    Unified AI homework help endpoint (supports start and sendMessage actions)
 * @access  Private
 */
router.post('/help', authenticate, async (req, res) => {
  try {
    const { action, sessionId, message, image, voiceNote, audio, subject, grade, topic } = req.body;
    
    // Normalize audio field (frontend might send 'audio' or 'voiceNote')
    const finalVoice = voiceNote || audio;

    if (action === 'sendMessage') {
      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Session ID is required for sendMessage action.' });
      }
      const response = await AIHomeworkAssistant.processMessage(sessionId, message, image, finalVoice);
      return res.json({ success: true, data: response });
    } else {
      // Default action is 'start' or no action
      const session = await AIHomeworkAssistant.startSession(req.user._id, { 
        subject: subject || 'general', 
        topic, 
        grade: grade || req.user.grade 
      });
      return res.json({ success: true, data: session });
    }
  } catch (error) {
    console.error('Error in AI help endpoint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai-homework/start
 * @desc    Start a new AI homework help session
 * @access  Private
 */
router.post('/start', [
  authenticate,
  body('subject').isIn(['mathematics', 'physics', 'chemistry', 'biology', 'biological_sciences', 'science', 'english', 'history', 'geography', 'commerce', 'general']),
  body('topic').optional().trim(),
  body('grade').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const session = await AIHomeworkAssistant.startSession(
      req.user._id,
      {
        subject: req.body.subject,
        topic: req.body.topic,
        grade: req.body.grade,
        specificQuestion: req.body.specificQuestion
      }
    );

    res.status(201).json({
      success: true,
      message: 'AI homework session started',
      data: session
    });

  } catch (error) {
    console.error('Error starting homework session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-homework/:sessionId/message
 * @desc    Send a message to the AI tutor
 * @access  Private
 */
router.post('/:sessionId/message', [
  authenticate,
  param('sessionId').isMongoId(),
  body('message').optional({ values: 'falsy' }).trim(),
  body('image').optional({ values: 'falsy' }).isObject(),
  body('voiceNote').optional({ values: 'falsy' })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { image, voiceNote } = req.body;
    // Allow empty message if image or voice is provided
    const message = req.body.message || (image ? 'Please analyze this image and explain.' : (voiceNote ? 'Please process this voice note.' : ''));
    
    if (!message && !image && !voiceNote) {
      return res.status(400).json({ success: false, message: 'Message, image, or voice note is required.' });
    }

    const response = await AIHomeworkAssistant.processMessage(sessionId, message, image, voiceNote);

    res.json({
      success: true,
      message: 'Response generated',
      data: response
    });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-homework/:sessionId/end
 * @desc    End an AI homework session
 * @access  Private
 */
router.post('/:sessionId/end', [
  authenticate,
  param('sessionId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;

    const result = await AIHomeworkAssistant.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended',
      data: result
    });

  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai-homework/sessions/active
 * @desc    Get user's active AI homework sessions
 * @access  Private
 */
router.get('/sessions/active', authenticate, async (req, res) => {
  try {
    const sessions = await AIHomeworkAssistant.getUserActiveSessions(req.user._id);

    res.json({
      success: true,
      message: 'Active sessions retrieved',
      data: { sessions }
    });

  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai-homework/sessions/history
 * @desc    Get user's AI homework session history
 * @access  Private
 */
router.get('/sessions/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sessions = await AIHomeworkAssistant.getUserSessionHistory(req.user._id, limit);

    res.json({
      success: true,
      message: 'Session history retrieved',
      data: { sessions }
    });

  } catch (error) {
    console.error('Error getting session history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai-homework/:sessionId/summary
 * @desc    Get session summary
 * @access  Private
 */
router.get('/:sessionId/summary', [
  authenticate,
  param('sessionId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;

    const summary = await AIHomeworkAssistant.getSessionSummary(sessionId);

    res.json({
      success: true,
      message: 'Session summary retrieved',
      data: { summary }
    });

  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get summary',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-homework/:sessionId/practice
 * @desc    Generate practice problems based on session
 * @access  Private
 */
router.post('/:sessionId/practice', [
  authenticate,
  param('sessionId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;

    const problems = await AIHomeworkAssistant.generatePracticeProblems(sessionId);

    res.json({
      success: true,
      message: 'Practice problems generated',
      data: { problems }
    });

  } catch (error) {
    console.error('Error generating problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate problems',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-homework/:sessionId/rate
 * @desc    Rate the AI homework session
 * @access  Private
 */
router.post('/:sessionId/rate', [
  authenticate,
  param('sessionId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { rating, feedback } = req.body;

    const HomeworkSession = require('../models/HomeworkSession');
    
    await HomeworkSession.findByIdAndUpdate(sessionId, {
      $set: {
        studentRating: rating,
        studentFeedback: feedback
      }
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Error saving rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save rating',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai-homework/stats
 * @desc    Get AI homework usage statistics (Admin)
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

    const HomeworkSession = require('../models/HomeworkSession');
    
    const stats = await HomeworkSession.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgSessionDuration: { $avg: { $subtract: ['$endedAt', '$startedAt'] } },
          totalMessages: { $sum: { $size: '$messages' } },
          avgRating: { $avg: '$studentRating' }
        }
      }
    ]);

    const subjectStats = await HomeworkSession.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      message: 'Statistics retrieved',
      data: {
        overall: stats[0] || {},
        bySubject: subjectStats
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
 * @route   POST /api/ai-homework/upload-image
 * @desc    Upload an image for AI processing
 * @access  Private
 */
const multer = require('multer');
const upload = multer();
const GridFSService = require('../services/GridFSService');

router.post('/upload-image', [
  authenticate,
  upload.single('image')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const gridFile = await GridFSService.upload(req.file.buffer, {
      filename: `ai_context_${Date.now()}_${req.file.originalname}`,
      contentType: req.file.mimetype,
      metadata: { userId: req.user._id, purpose: 'ai_context' }
    });

    res.json({
      success: true,
      data: {
        fileId: gridFile._id,
        filename: gridFile.filename,
        mimeType: req.file.mimetype,
        base64: req.file.buffer.toString('base64') // For immediate use in AI session
      }
    });
  } catch (error) {
    console.error('AI Image Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
