const express = require('express');
const router = express.Router();
const AIService = require('../services/AIService');
const AnalyticsService = require('../services/AnalyticsService');
const RecordingService = require('../services/RecordingService');
const { authenticate } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

/**
 * @route   POST /api/ai/transcribe
 * @desc    Transcribe a recording
 * @access  Private
 */
router.post('/transcribe', [
  authenticate,
  body('recordingUrl').notEmpty().withMessage('Recording URL is required'),
  body('provider').optional().isIn(['openai', 'google', 'deepgram'])
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

    const { recordingUrl, provider = 'openai' } = req.body;

    const result = await AIService.transcribeRecording(recordingUrl, provider);

    res.json({
      success: true,
      message: 'Transcription completed',
      data: result
    });

  } catch (error) {
    console.error('Error transcribing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transcribe recording',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/summarize
 * @desc    Generate summary from transcript
 * @access  Private
 */
router.post('/summarize', [
  authenticate,
  body('transcript').notEmpty().withMessage('Transcript is required'),
  body('type').optional().isIn(['bullet', 'detailed', 'key-points'])
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

    const { transcript, type = 'bullet' } = req.body;

    const result = await AIService.generateSummary(transcript, type);

    res.json({
      success: true,
      message: 'Summary generated',
      data: result
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/quiz
 * @desc    Generate quiz questions from content
 * @access  Private
 */
router.post('/quiz', [
  authenticate,
  body('content').notEmpty().withMessage('Content is required'),
  body('numQuestions').optional().isInt({ min: 1, max: 20 })
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

    const { content, numQuestions = 5 } = req.body;

    const questions = await AIService.generateQuizQuestions(content, numQuestions);

    res.json({
      success: true,
      message: 'Quiz questions generated',
      data: { questions }
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get personalized learning recommendations
 * @access  Private
 */
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const userData = {
      completedSessions: req.user.profile?.completedSessions || [],
      weakTopics: req.user.profile?.weakTopics || [],
      strongTopics: req.user.profile?.strongTopics || [],
      preferredSubjects: req.user.profile?.subjects || [],
      learningStyle: req.user.profile?.learningStyle || 'visual',
      grade: req.user.profile?.grade,
      goals: req.user.profile?.goals || []
    };

    const recommendations = await AIService.generateLearningRecommendations(
      req.user._id,
      userData
    );

    res.json({
      success: true,
      message: 'Recommendations generated',
      data: recommendations
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/chat
 * @desc    Get AI chat response
 * @access  Private
 */
router.post('/chat', [
  authenticate,
  body('message').notEmpty().withMessage('Message is required'),
  body('history').optional().isArray()
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

    const { message, history = [], options = {} } = req.body;

    // Inject user context for better personalized responses
    options.subject = options.subject || req.user.stream;
    options.grade = options.grade || req.user.grade;

    const response = await AIService.generateChatResponse(message, history, options);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

// ==========================================
// Analytics Routes
// ==========================================

/**
 * @route   GET /api/analytics/platform
 * @desc    Get platform-wide analytics
 * @access  Private (Admin/Moderator)
 */
router.get('/platform', [
  authenticate,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    // Check if user has admin/moderator role
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const analytics = await AnalyticsService.getPlatformAnalytics(filters);

    res.json({
      success: true,
      message: 'Platform analytics retrieved',
      data: analytics
    });

  } catch (error) {
    console.error('Error getting platform analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/user
 * @desc    Get user-specific analytics
 * @access  Private
 */
router.get('/user', authenticate, async (req, res) => {
  try {
    const analytics = await AnalyticsService.getUserAnalytics(req.user._id);

    res.json({
      success: true,
      message: 'User analytics retrieved',
      data: analytics
    });

  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/realtime
 * @desc    Get real-time platform metrics
 * @access  Private (Admin/Moderator)
 */
router.get('/realtime', authenticate, async (req, res) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const metrics = await AnalyticsService.getRealTimeMetrics();

    res.json({
      success: true,
      message: 'Real-time metrics retrieved',
      data: metrics
    });

  } catch (error) {
    console.error('Error getting real-time metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time metrics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/analytics/engagement
 * @desc    Analyze engagement for sessions
 * @access  Private
 */
router.post('/engagement', [
  authenticate,
  body('sessionData').isArray().withMessage('Session data is required')
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

    const analysis = await AIService.analyzeEngagement(req.body.sessionData);

    res.json({
      success: true,
      message: 'Engagement analysis completed',
      data: analysis
    });

  } catch (error) {
    console.error('Error analyzing engagement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze engagement',
      error: error.message
    });
  }
});

// ==========================================
// Recording Routes
// ==========================================

/**
 * @route   POST /api/recordings/start
 * @desc    Start recording a session
 * @access  Private (Instructor/Admin)
 */
router.post('/start', [
  authenticate,
  body('sessionType').notEmpty().isIn(['lecture', 'group', 'peer']),
  body('sessionId').notEmpty(),
  body('roomId').notEmpty()
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

    const { sessionType, sessionId, roomId, options = {} } = req.body;

    const recording = await RecordingService.startRecording(
      sessionType,
      sessionId,
      roomId,
      options
    );

    res.status(201).json({
      success: true,
      message: 'Recording started',
      data: { recording }
    });

  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start recording',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recordings/:id/stop
 * @desc    Stop a recording
 * @access  Private (Instructor/Admin)
 */
router.post('/:id/stop', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const recording = await RecordingService.stopRecording(id);

    res.json({
      success: true,
      message: 'Recording stopped',
      data: { recording }
    });

  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop recording',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recordings/:id/status
 * @desc    Get recording status
 * @access  Private
 */
router.get('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const status = await RecordingService.getRecordingStatus(id);

    res.json({
      success: true,
      message: 'Recording status retrieved',
      data: { status }
    });

  } catch (error) {
    console.error('Error getting recording status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recording status',
      error: error.message
    });
  }
});

module.exports = router;
