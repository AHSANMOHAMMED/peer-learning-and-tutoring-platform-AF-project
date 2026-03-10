const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const QAService = require('../services/QAService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST /api/qa/:sessionId/questions
 * @desc    Submit a new question
 * @access  Private
 */
router.post('/:sessionId/questions', [
  authenticate,
  param('sessionId').isString(),
  body('text').trim().notEmpty().withMessage('Question text is required'),
  body('isAnonymous').optional().isBoolean(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const questionData = req.body;
    const userId = req.user._id;

    const question = await QAService.submitQuestion(sessionId, questionData, userId);

    // Notify session participants
    req.app.get('io').to(`session_${sessionId}`).emit('new_question', {
      question: {
        ...question,
        askedBy: question.isAnonymous ? null : req.user.name
      }
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({ message: 'Failed to submit question' });
  }
});

/**
 * @route   GET /api/qa/:sessionId/questions
 * @desc    Get questions for a session
 * @access  Private
 */
router.get('/:sessionId/questions', [
  authenticate,
  param('sessionId').isString(),
  query('status').optional().isIn(['all', 'unanswered', 'answered']),
  query('sortBy').optional().isIn(['upvotes', 'newest', 'oldest']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const filters = req.query;

    const questions = await QAService.getQuestions(sessionId, filters);

    res.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ message: 'Failed to get questions' });
  }
});

/**
 * @route   POST /api/qa/:sessionId/questions/:questionId/upvote
 * @desc    Upvote a question
 * @access  Private
 */
router.post('/:sessionId/questions/:questionId/upvote', [
  authenticate,
  param('sessionId').isString(),
  param('questionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const userId = req.user._id;

    const question = await QAService.upvoteQuestion(sessionId, questionId, userId);

    // Notify session about upvote
    req.app.get('io').to(`session_${sessionId}`).emit('question_upvoted', {
      questionId,
      upvotes: question.upvotes,
      upvotedBy: req.user.name
    });

    res.json(question);
  } catch (error) {
    console.error('Error upvoting question:', error);
    res.status(400).json({ message: error.message || 'Failed to upvote question' });
  }
});

/**
 * @route   POST /api/qa/:sessionId/questions/:questionId/answer
 * @desc    Mark question as answered
 * @access  Private (Host/Moderator)
 */
router.post('/:sessionId/questions/:questionId/answer', [
  authenticate,
  param('sessionId').isString(),
  param('questionId').isString(),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  validate
], async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const { answer } = req.body;
    const answeredBy = req.user._id;

    const question = await QAService.markAnswered(sessionId, questionId, answeredBy, answer);

    // Notify participants
    req.app.get('io').to(`session_${sessionId}`).emit('question_answered', {
      questionId,
      answer,
      answeredBy: req.user.name
    });

    res.json(question);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ message: error.message || 'Failed to answer question' });
  }
});

/**
 * @route   POST /api/qa/:sessionId/questions/:questionId/highlight
 * @desc    Highlight a question
 * @access  Private (Host/Moderator)
 */
router.post('/:sessionId/questions/:questionId/highlight', [
  authenticate,
  param('sessionId').isString(),
  param('questionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;

    const question = await QAService.highlightQuestion(sessionId, questionId);

    // Notify participants
    req.app.get('io').to(`session_${sessionId}`).emit('question_highlighted', {
      questionId,
      highlighted: true
    });

    res.json(question);
  } catch (error) {
    console.error('Error highlighting question:', error);
    res.status(500).json({ message: error.message || 'Failed to highlight question' });
  }
});

/**
 * @route   POST /api/qa/:sessionId/questions/:questionId/pin
 * @desc    Pin a question to top
 * @access  Private (Host/Moderator)
 */
router.post('/:sessionId/questions/:questionId/pin', [
  authenticate,
  param('sessionId').isString(),
  param('questionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;

    const question = await QAService.pinQuestion(sessionId, questionId);

    // Notify participants
    req.app.get('io').to(`session_${sessionId}`).emit('question_pinned', {
      questionId,
      pinned: true
    });

    res.json(question);
  } catch (error) {
    console.error('Error pinning question:', error);
    res.status(500).json({ message: error.message || 'Failed to pin question' });
  }
});

/**
 * @route   DELETE /api/qa/:sessionId/questions/:questionId
 * @desc    Delete a question
 * @access  Private
 */
router.delete('/:sessionId/questions/:questionId', [
  authenticate,
  param('sessionId').isString(),
  param('questionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const userId = req.user._id;
    const isModerator = ['tutor', 'admin'].includes(req.user.role);

    await QAService.deleteQuestion(sessionId, questionId, userId, isModerator);

    // Notify participants
    req.app.get('io').to(`session_${sessionId}`).emit('question_deleted', {
      questionId,
      deletedBy: req.user.name
    });

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(error.message === 'Permission denied' ? 403 : 500).json({ 
      message: error.message || 'Failed to delete question' 
    });
  }
});

/**
 * @route   POST /api/qa/:sessionId/questions/:questionId/reaction
 * @desc    Add reaction to question
 * @access  Private
 */
router.post('/:sessionId/questions/:questionId/reaction', [
  authenticate,
  param('sessionId').isString(),
  param('questionId').isString(),
  body('reaction').isString().isIn(['👍', '👎', '😄', '🎉', '😕', '❤️', '🚀', '👀']),
  validate
], async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const { reaction } = req.body;
    const userId = req.user._id;

    const question = await QAService.addReaction(sessionId, questionId, userId, reaction);

    // Notify participants
    req.app.get('io').to(`session_${sessionId}`).emit('question_reaction', {
      questionId,
      reaction,
      reactedBy: req.user.name
    });

    res.json(question);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Failed to add reaction' });
  }
});

/**
 * @route   GET /api/qa/:sessionId/top
 * @desc    Get top questions by upvotes
 * @access  Private
 */
router.get('/:sessionId/top', [
  authenticate,
  param('sessionId').isString(),
  query('count').optional().isInt({ min: 1, max: 20 }),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const count = parseInt(req.query.count) || 5;

    const questions = await QAService.getTopQuestions(sessionId, count);

    res.json(questions);
  } catch (error) {
    console.error('Error getting top questions:', error);
    res.status(500).json({ message: 'Failed to get top questions' });
  }
});

/**
 * @route   GET /api/qa/:sessionId/stats
 * @desc    Get Q&A statistics for a session
 * @access  Private
 */
router.get('/:sessionId/stats', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stats = await QAService.getStats(sessionId);

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

/**
 * @route   GET /api/qa/:sessionId/export
 * @desc    Export Q&A for session recording
 * @access  Private (Host/Moderator)
 */
router.get('/:sessionId/export', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const exportData = await QAService.exportQA(sessionId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="qa-session-${sessionId}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting QA:', error);
    res.status(500).json({ message: 'Failed to export Q&A' });
  }
});

/**
 * @route   DELETE /api/qa/:sessionId/clear
 * @desc    Clear all questions for a session
 * @access  Private (Host/Moderator)
 */
router.delete('/:sessionId/clear', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    await QAService.clearSession(sessionId);

    // Notify participants
    req.app.get('io').to(`session_${sessionId}`).emit('qa_cleared', {
      clearedBy: req.user.name
    });

    res.json({ success: true, message: 'All questions cleared' });
  } catch (error) {
    console.error('Error clearing QA:', error);
    res.status(500).json({ message: 'Failed to clear Q&A' });
  }
});

/**
 * @route   GET /api/qa/popular
 * @desc    Get popular questions across all sessions
 * @access  Private (Admin)
 */
router.get('/popular', [
  authenticate,
  authorize(['admin']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const questions = await QAService.getPopularQuestions(limit);

    res.json(questions);
  } catch (error) {
    console.error('Error getting popular questions:', error);
    res.status(500).json({ message: 'Failed to get popular questions' });
  }
});

module.exports = router;
