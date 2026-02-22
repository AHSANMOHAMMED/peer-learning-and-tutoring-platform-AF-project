const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const PointTransaction = require('../models/PointTransaction');
const { validationResult } = require('express-validator');

// Get all questions with pagination and filtering
const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = 'all',
      tags = '',
      sortBy = 'newest'
    } = req.query;
    
    const query = { isClosed: false, ...(category !== 'all' && { category }) };
    
    const questions = await Question.find(query)
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    
    const total = await Question.countDocuments(
      search ? { isClosed: false, ...(category !== 'all' && { category }) }
      : {}
    );
    
    res.json({
      questions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
      }
    });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Get single question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation')
      .populate('closedBy', 'username profile.firstName profile.lastName');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Increment view count
    await question.incrementViewCount();
    
    // Get user's vote if authenticated
    let userVote = null;
    if (req.user) {
      userVote = await Vote.getUserVote('question', id, req.user._id);
    }
    
    res.json({
      question,
      userVote: userVote ? userVote.voteType : null
    });
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

// Create new question
const createQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, body, tags, category } = req.body;
    
    const question = new Question({
      title,
      body,
      tags: tags || [],
      category,
      author: req.user._id
    });
    
    await question.save();
    
    // Award points for posting question
    await PointTransaction.createTransaction({
      user: req.user._id,
      points: 2,
      type: 'question_posted',
      referenceId: question._id,
      referenceType: 'question',
      description: 'Posted a question'
    });
    
    // Update user's forum stats
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    await user.updateForumStats('questionsAsked');
    await user.addSubjectPoints(category, 2);
    
    // Populate author details for response
    await question.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    
    // Emit real-time event
    if (global.io) {
      global.io.emit('newQuestion', {
        question,
        author: question.author
      });
    }
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { title, body, tags, category } = req.body;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this question' });
    }
    
    // Don't allow editing if question is closed
    if (question.isClosed) {
      return res.status(400).json({ error: 'Cannot edit a closed question' });
    }
    
    question.title = title || question.title;
    question.body = body || question.body;
    question.tags = tags || question.tags;
    question.category = category || question.category;
    
    await question.save();
    
    // Populate author details for response
    await question.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    
    res.json(question);
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }
    
    // Delete related answers, votes, and comments
    await Answer.deleteMany({ question: id });
    await Vote.deleteMany({ targetType: 'question', targetId: id });
    await Comment.deleteMany({ targetType: 'question', targetId: id });
    
    await question.remove();
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Close question
const closeQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to close this question' });
    }
    
    question.isClosed = true;
    question.closeReason = reason;
    question.closedBy = req.user._id;
    
    await question.save();
    
    // Populate author details for response
    await question.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    
    res.json(question);
  } catch (error) {
    console.error('Error in closeQuestion:', error);
    res.status(500).json({ error: 'Failed to close question' });
  }
};

// Get question statistics
const getQuestionStats = async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const openQuestions = await Question.countDocuments({ isClosed: false });
    const closedQuestions = await Question.countDocuments({ isClosed: true });
    const questionsByCategory = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalQuestions,
      openQuestions,
      closedQuestions,
      questionsByCategory
    });
  } catch (error) {
    console.error('Error in getQuestionStats:', error);
    res.status(500).json({ error: 'Failed to fetch question statistics' });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  closeQuestion,
  getQuestionStats
};
