const express = require('express');
const { body, param, query } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Start a video session
router.post('/:id/start', auth, [
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('config').optional().isObject().withMessage('Config must be an object'),
  body('config.isRecordingEnabled').optional().isBoolean(),
  body('config.isChatEnabled').optional().isBoolean(),
  body('config.isScreenShareEnabled').optional().isBoolean(),
  body('config.isWhiteboardEnabled').optional().isBoolean(),
  body('config.maxParticipants').optional().isInt({ min: 2, max: 50 }),
  body('config.password').optional().isString().isLength({ min: 0, max: 50 }),
  body('config.waitingRoom').optional().isBoolean()
], validate, sessionController.startSession);

// Join a video session
router.post('/:id/join', auth, [
  param('id').isMongoId().withMessage('Invalid session ID')
], validate, sessionController.joinSession);

// Leave a video session
router.post('/:id/leave', auth, [
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('connectionQuality').optional().isIn(['excellent', 'good', 'fair', 'poor'])
], validate, sessionController.leaveSession);

// End a video session
router.post('/:id/end', auth, [
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('analytics').optional().isObject(),
  body('analytics.totalDuration').optional().isInt({ min: 0 }),
  body('analytics.chatMessagesCount').optional().isInt({ min: 0 }),
  body('analytics.screenShareDuration').optional().isInt({ min: 0 }),
  body('analytics.whiteboardUsage').optional().isInt({ min: 0 }),
  body('analytics.connectionIssues').optional().isInt({ min: 0 })
], validate, sessionController.endSession);

// Start recording
router.post('/:id/recording/start', auth, [
  param('id').isMongoId().withMessage('Invalid session ID')
], validate, sessionController.startRecording);

// Stop recording
router.post('/:id/recording/stop', auth, [
  param('id').isMongoId().withMessage('Invalid session ID')
], validate, sessionController.stopRecording);

// Report technical issue
router.post('/:id/issues', auth, [
  param('id').isMongoId().withMessage('Invalid session ID'),
  body('issueType').isIn(['audio', 'video', 'connection', 'screen_share', 'whiteboard', 'other'])
    .withMessage('Invalid issue type')
], validate, sessionController.reportTechnicalIssue);

// Get session details
router.get('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid session ID')
], validate, sessionController.getSessionDetails);

// Get session history
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('Invalid status')
], validate, sessionController.getSessionHistory);

module.exports = router;
