const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const QAService = require('../services/QAService');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const isPrivilegedQAUser = (user) => ['tutor', 'mentor', 'schoolMentor', 'admin', 'websiteAdmin', 'superadmin', 'moderator'].includes(user?.role);
const isQuestionOwner = (question, user) => question.author?.toString() === user?._id?.toString();

const buildQuestionPayload = (body, userId, { partial = false } = {}) => {
  const payload = {};
  const content = body.body ?? body.content ?? body.question ?? body.text;

  if (!partial || body.title !== undefined) payload.title = body.title;
  if (!partial || content !== undefined) payload.body = content;
  if (!partial || body.subject !== undefined) payload.subject = body.subject || 'Other';
  if (!partial || body.grade !== undefined) payload.grade = Number(body.grade) || 10;
  if (!partial || body.tags !== undefined) payload.tags = Array.isArray(body.tags) ? body.tags : [];
  if (!partial || body.type !== undefined) payload.type = body.type || 'structured';
  if (!partial || body.difficulty !== undefined) payload.difficulty = body.difficulty || 'Easy';
  if (!partial || body.points !== undefined) payload.points = body.points === '' || body.points === undefined ? 5 : Number(body.points);
  if (!partial || body.options !== undefined) payload.options = Array.isArray(body.options) ? body.options : [];
  if (!partial || body.correctAnswer !== undefined) payload.correctAnswer = body.correctAnswer || '';
  if (!partial || body.explanation !== undefined) payload.explanation = body.explanation || '';
  if (userId) payload.author = userId;

  return payload;
};

const attachAnswers = async (questions) => {
  const ids = questions.map((question) => question._id);
  const answers = await Answer.find({ question: { $in: ids } })
    .sort({ createdAt: 1 })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar');

  const answersByQuestion = answers.reduce((acc, answer) => {
    const key = answer.question.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(answer);
    return acc;
  }, {});

  return questions.map((question) => {
    const plain = question.toObject ? question.toObject() : question;
    const questionAnswers = answersByQuestion[plain._id.toString()] || [];
    return {
      ...plain,
      answers: questionAnswers,
      answerCount: questionAnswers.length || plain.answerCount || 0,
      content: plain.body
    };
  });
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   GET /api/qa
 * @desc    Read all forum/challenge questions
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject = 'all',
      grade = 'all',
      unanswered,
      mine,
      search = ''
    } = req.query;

    const query = { isClosed: false };
    if (subject !== 'all') query.subject = subject;
    if (grade !== 'all') query.grade = Number(grade);
    if (unanswered === 'true') query.answerCount = 0;
    if (mine === 'true') query.author = req.user._id;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [questions, total] = await Promise.all([
      Question.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'username profile.firstName profile.lastName profile.avatar role'),
      Question.countDocuments(query)
    ]);

    const enrichedQuestions = await attachAnswers(questions);

    res.json({
      success: true,
      data: enrichedQuestions,
      questions: enrichedQuestions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('QA read all error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch QA questions' });
  }
});

/**
 * @route   POST /api/qa
 * @desc    Create a forum/challenge question
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const payload = buildQuestionPayload(req.body, req.user._id);
    if (!payload.title?.trim() || !payload.body?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and question content are required' });
    }

    const question = await Question.create(payload);
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar role');

    res.status(201).json({
      success: true,
      message: 'QA question created',
      data: { ...populatedQuestion.toObject(), content: populatedQuestion.body }
    });
  } catch (error) {
    console.error('QA create error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create QA question' });
  }
});

/**
 * @route   GET /api/qa/:id
 * @desc    Read one forum/challenge question
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return next();

  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar role');

    if (!question) {
      return res.status(404).json({ success: false, message: 'QA question not found' });
    }

    const [enrichedQuestion] = await attachAnswers([question]);
    res.json({
      success: true,
      data: enrichedQuestion,
      question: enrichedQuestion
    });
  } catch (error) {
    console.error('QA read one error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch QA question' });
  }
});

/**
 * @route   PUT /api/qa/:id
 * @desc    Update a forum/challenge question
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res, next) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return next();

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'QA question not found' });
    }
    if (!isQuestionOwner(question, req.user) && !isPrivilegedQAUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You cannot update this QA question' });
    }

    const payload = buildQuestionPayload(req.body, null, { partial: true });
    delete payload.author;
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) question[key] = value;
    });

    await question.save();
    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar role');

    res.json({
      success: true,
      message: 'QA question updated',
      data: { ...updatedQuestion.toObject(), content: updatedQuestion.body }
    });
  } catch (error) {
    console.error('QA update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update QA question' });
  }
});

/**
 * @route   DELETE /api/qa/:id
 * @desc    Delete a forum/challenge question
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return next();

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'QA question not found' });
    }
    if (!isQuestionOwner(question, req.user) && !isPrivilegedQAUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You cannot delete this QA question' });
    }

    await Promise.all([
      Answer.deleteMany({ question: question._id }),
      Question.findByIdAndDelete(question._id)
    ]);

    res.json({ success: true, message: 'QA question deleted' });
  } catch (error) {
    console.error('QA delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete QA question' });
  }
});

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
