const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const PointsService = require('../services/pointsService');
const { validationResult } = require('express-validator');

// Sri Lankan subjects for Grades 6-13
const SRI_LANKAN_SUBJECTS = {
  core: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Civic Education', 'Health & Physical Education'],
  religion: ['Buddhism', 'Islam', 'Saivaneri', 'Roman Catholicism', 'Christianity'],
  language: ['Sinhala', 'Tamil'],
  elective: ['ICT', 'Business & Accounting Studies', 'Agriculture', 'Aesthetic Studies']
};

const attachAnswers = async (questions) => {
  const questionIds = questions.map((question) => question._id);
  const answers = await Answer.find({ question: { $in: questionIds } })
    .sort({ createdAt: 1 })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar');

  const answersByQuestion = answers.reduce((acc, answer) => {
    const key = answer.question.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(answer);
    return acc;
  }, {});

  return questions.map((question) => {
    const plainQuestion = question.toObject ? question.toObject() : question;
    const questionAnswers = answersByQuestion[plainQuestion._id.toString()] || [];

    return {
      ...plainQuestion,
      answers: questionAnswers,
      answerCount: questionAnswers.length || plainQuestion.answerCount || 0,
      hasAcceptedAnswer: questionAnswers.some((answer) => answer.isAccepted) || plainQuestion.hasAcceptedAnswer
    };
  });
};

// Get all questions with pagination and filtering by grade and subject
const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject = 'all',
      grade = 'all',
      tags = '',
      sortBy = 'newest',
      search = '',
      category = 'all',
      unanswered
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    };

    const baseQuery = { isClosed: false };
    if (unanswered === 'true') {
      baseQuery.answerCount = 0;
    }
    if (category !== 'all') {
      baseQuery.category = category;
    }

    let questions;

    if (search) {
      const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
      questions = await Question.search(search, {
        ...options,
        subject: subject === 'all' ? null : subject,
        grade: grade === 'all' ? null : parseInt(grade),
        tags: tagArray
      });
    } else if (subject === 'all' && grade === 'all') {
      // Get all questions
      questions = await Question.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    } else {
      // Filter by grade and/or subject
      const query = { ...baseQuery };
      if (subject !== 'all') {
        query.subject = subject;
      }
      if (grade !== 'all') {
        query.grade = parseInt(grade);
      }
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
      }

      let sortOptions = {};
      switch (sortBy) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'votes':
          sortOptions = { voteScore: -1 };
          break;
        case 'views':
          sortOptions = { views: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      questions = await Question.find(query)
        .sort(sortOptions)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    }

    const total = await Question.countDocuments(search ? {} : baseQuery);
    const enrichedQuestions = await attachAnswers(questions);

    res.json({
      questions: enrichedQuestions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Get questions asked by the logged-in student with tutor answers attached
const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user._id, isClosed: false })
      .sort({ createdAt: -1 })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');

    const enrichedQuestions = await attachAnswers(questions);

    res.json({
      questions: enrichedQuestions,
      data: enrichedQuestions
    });
  } catch (error) {
    console.error('Error in getMyQuestions:', error);
    res.status(500).json({ error: 'Failed to fetch your questions' });
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
    
    const { title, content, tags, subject, grade } = req.body;
    
    // Validate subject exists in Sri Lankan curriculum
    const allSubjects = [...SRI_LANKAN_SUBJECTS.core, ...SRI_LANKAN_SUBJECTS.religion, ...SRI_LANKAN_SUBJECTS.language, ...SRI_LANKAN_SUBJECTS.elective];
    if (!allSubjects.includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject. Must be from Sri Lankan curriculum.' });
    }
    
    // Validate grade
    if (grade < 6 || grade > 13) {
      return res.status(400).json({ error: 'Grade must be between 6 and 13.' });
    }
    
    const question = new Question({
      title,
      body: content, // Map content to body field
      tags: tags || [],
      subject,
      grade,
      author: req.user._id
    });
    
    await question.save();
    
    // Award points for posting question (+2 points)
    await PointsService.awardQuestionPosted(req.user._id, question._id, subject);
    
    // Update user's forum stats
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (user) {
      await user.updateForumStats('questionsAsked');
      await user.addSubjectPoints(subject, 2);
    }
    
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
    const { id } = req.params;
    const { title, content, body, tags, subject, grade } = req.body;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    
    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this question' 
      });
    }
    
    // Don't allow editing if question is closed
    if (question.isClosed) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot edit a closed question' 
      });
    }
    
    // Update fields (support both 'body' and 'content' for compatibility)
    if (title) question.title = title;
    if (body || content) question.body = body || content;
    if (tags) question.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (subject) question.subject = subject;
    if (grade) question.grade = parseInt(grade);
    
    await question.save();
    
    // Populate author details for response
    await question.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update question',
      error: error.message 
    });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this question' 
      });
    }

    // Delete related answers, votes, and comments
    await Answer.deleteMany({ question: id });
    await Vote.deleteMany({ targetType: 'question', targetId: id });
    await Comment.deleteMany({ targetType: 'question', targetId: id });

    await question.deleteOne();

    res.json({ 
      success: true,
      message: 'Question and all related data deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete question',
      error: error.message 
    });
  }
};

// Close question
const closeQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to close this question' 
      });
    }

    question.isClosed = true;
    question.closeReason = reason;
    question.closedBy = req.user._id;

    await question.save();
    await question.populate('closedBy', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Question closed successfully',
      data: question
    });
  } catch (error) {
    console.error('Error in closeQuestion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to close question',
      error: error.message
    });
  }
};

// Approve question (admin only)
const approveQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can approve questions' 
      });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    question.status = 'approved';
    question.approvedBy = req.user._id;
    question.approvedAt = new Date();

    await question.save();
    await question.populate('approvedBy', 'username');

    res.json({
      success: true,
      message: 'Question approved successfully',
      data: question
    });
  } catch (error) {
    console.error('Error in approveQuestion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to approve question',
      error: error.message
    });
  }
};

// Reject question (admin only)
const rejectQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can reject questions' 
      });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    question.status = 'rejected';
    question.rejectedBy = req.user._id;
    question.rejectedAt = new Date();
    question.rejectReason = reason;

    await question.save();
    await question.populate('rejectedBy', 'username');

    res.json({
      success: true,
      message: 'Question rejected successfully',
      data: question
    });
  } catch (error) {
    console.error('Error in rejectQuestion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reject question',
      error: error.message
    });
  }
};

// Get Sri Lankan subjects by grade
const getSubjectsByGrade = async (req, res) => {
  try {
    const { grade } = req.query;
    
    // All subjects are available for all grades in Sri Lankan system
    // But we can provide grade-specific recommendations
    const subjects = {
      all: SRI_LANKAN_SUBJECTS,
      grade: grade ? parseInt(grade) : null
    };
    
    res.json({
      success: true,
      subjects: SRI_LANKAN_SUBJECTS,
      grade: grade ? parseInt(grade) : 'all',
      message: 'Sri Lankan curriculum subjects for Grades 6-13'
    });
  } catch (error) {
    console.error('Error in getSubjectsByGrade:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
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

// @desc    Get questions/challenges created by the tutor
// @access  Private (Tutor)
const getTutorChallenges = async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username profile.firstName profile.lastName');
    
    // For each question, get the answer count if not already in the model
    const enrichedQuestions = await Promise.all(questions.map(async (q) => {
      const answers = await Answer.find({ question: q._id }).populate('author', 'username profile.firstName profile.lastName');
      return {
        ...q._doc,
        answers,
        answerCount: answers.length
      };
    }));

    res.json({
      success: true,
      data: enrichedQuestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestions,
  getMyQuestions,
  getQuestionById,
  createQuestion,
  getSubjectsByGrade,
  getQuestionStats,
  updateQuestion,
  deleteQuestion,
  closeQuestion,
  approveQuestion,
  rejectQuestion,
  getTutorChallenges
};
