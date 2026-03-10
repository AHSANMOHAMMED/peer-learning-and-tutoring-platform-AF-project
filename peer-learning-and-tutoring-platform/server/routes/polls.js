const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const PollingService = require('../services/PollingService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST /api/lectures/:sessionId/polls
 * @desc    Create a new poll
 * @access  Private (Host only)
 */
router.post('/:sessionId/polls', [
  authenticate,
  param('sessionId').isString(),
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options required'),
  body('type').optional().isIn(['single_choice', 'multiple_choice', 'rating']),
  body('duration').optional().isInt({ min: 10, max: 300 }),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const pollData = {
      ...req.body,
      createdBy: req.user._id
    };

    const poll = await PollingService.createPoll(sessionId, pollData);
    
    // Emit to all participants in the session
    req.app.get('io').to(`session_${sessionId}`).emit('poll_created', { poll });

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: 'Failed to create poll' });
  }
});

/**
 * @route   POST /api/lectures/polls/:pollId/start
 * @desc    Start a poll
 * @access  Private (Host only)
 */
router.post('/polls/:pollId/start', [
  authenticate,
  param('pollId').isString(),
  validate
], async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const poll = await PollingService.startPoll(pollId);
    
    // Emit to all participants
    req.app.get('io').to(`session_${poll.lectureId}`).emit('poll_started', { pollId });

    res.json(poll);
  } catch (error) {
    console.error('Error starting poll:', error);
    res.status(500).json({ message: error.message || 'Failed to start poll' });
  }
});

/**
 * @route   POST /api/lectures/polls/:pollId/end
 * @desc    End a poll
 * @access  Private (Host only)
 */
router.post('/polls/:pollId/end', [
  authenticate,
  param('pollId').isString(),
  validate
], async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const poll = await PollingService.endPoll(pollId);
    const results = await PollingService.getPollResults(pollId);
    
    // Emit final results to all participants
    req.app.get('io').to(`session_${poll.lectureId}`).emit('poll_ended', { 
      pollId, 
      results 
    });

    res.json(results);
  } catch (error) {
    console.error('Error ending poll:', error);
    res.status(500).json({ message: error.message || 'Failed to end poll' });
  }
});

/**
 * @route   POST /api/lectures/polls/:pollId/vote
 * @desc    Submit a vote
 * @access  Private
 */
router.post('/polls/:pollId/vote', [
  authenticate,
  param('pollId').isString(),
  body('optionIds').isArray({ min: 1 }).withMessage('At least one option required'),
  validate
], async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIds } = req.body;
    const userId = req.user._id;

    const results = await PollingService.submitVote(pollId, userId, optionIds);
    
    // Get poll details for emitting
    const poll = await PollingService.getPollResults(pollId);
    
    // Emit updated results to all participants (but not individual votes if anonymous)
    if (!poll.isAnonymous) {
      req.app.get('io').to(`session_${poll.lectureId}`).emit('poll_updated', { 
        pollId, 
        results,
        voterId: userId
      });
    } else {
      req.app.get('io').to(`session_${poll.lectureId}`).emit('poll_updated', { 
        pollId, 
        results 
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(400).json({ message: error.message || 'Failed to submit vote' });
  }
});

/**
 * @route   GET /api/lectures/:sessionId/polls
 * @desc    Get active and completed polls for a session
 * @access  Private
 */
router.get('/:sessionId/polls', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [active, history] = await Promise.all([
      PollingService.getActivePolls(sessionId),
      PollingService.getPollHistory(sessionId)
    ]);

    res.json({ active, history });
  } catch (error) {
    console.error('Error getting polls:', error);
    res.status(500).json({ message: 'Failed to get polls' });
  }
});

/**
 * @route   GET /api/lectures/polls/:pollId/results
 * @desc    Get poll results
 * @access  Private
 */
router.get('/polls/:pollId/results', [
  authenticate,
  param('pollId').isString(),
  validate
], async (req, res) => {
  try {
    const { pollId } = req.params;

    const results = await PollingService.getPollResults(pollId);
    res.json(results);
  } catch (error) {
    console.error('Error getting poll results:', error);
    res.status(500).json({ message: error.message || 'Failed to get results' });
  }
});

/**
 * @route   DELETE /api/lectures/polls/:pollId
 * @desc    Delete a poll
 * @access  Private (Host only)
 */
router.delete('/polls/:pollId', [
  authenticate,
  param('pollId').isString(),
  validate
], async (req, res) => {
  try {
    const { pollId } = req.params;

    await PollingService.deletePoll(pollId);
    res.json({ success: true, message: 'Poll deleted' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ message: error.message || 'Failed to delete poll' });
  }
});

module.exports = router;
