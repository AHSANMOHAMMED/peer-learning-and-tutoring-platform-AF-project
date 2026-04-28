const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const PointTransaction = require('../models/PointTransaction');
const PointsService = require('../services/pointsService');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

// Get answers for a question
const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'oldest',
      status = 'all'
    } = req.query;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    };

    // Filter by status if provided
    const query = { question: questionId };
    if (status !== 'all') {
      query.status = status;
    }

    const answers = await Answer.find(query)
      .sort({ createdAt: sortBy === 'newest' ? -1 : 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation')
      .populate('acceptedBy', 'username profile.firstName profile.lastName');

    // Get user votes for each answer if authenticated
    let userVotes = {};
    if (req.user) {
      const answerIds = answers.map(a => a._id);
      const votes = await Vote.find({
        targetType: 'answer',
        targetId: { $in: answerIds },
        user: req.user._id
      });
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.targetId.toString()] = vote.voteType;
        return acc;
      }, {});
    }

    const answersWithVotes = answers.map(answer => ({
      ...answer.toObject(),
      userVote: userVotes[answer._id.toString()] || null
    }));

    const total = await Answer.countDocuments({ question: questionId });

    res.json({
      answers: answersWithVotes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error in getAnswersByQuestion:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
};

// Get single answer by ID
const getAnswerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const answer = await Answer.findById(id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation')
      .populate('question', 'title')
      .populate('acceptedBy', 'username profile.firstName profile.lastName');

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Get user's vote if authenticated
    let userVote = null;
    if (req.user) {
      const vote = await Vote.findOne({
        targetType: 'answer',
        targetId: id,
        user: req.user._id
      });
      userVote = vote ? vote.voteType : null;
    }

    res.json({
      answer,
      userVote: userVote
    });
  } catch (error) {
    console.error('Error in getAnswerById:', error);
    res.status(500).json({ error: 'Failed to fetch answer' });
  }
};

// Create new answer
const createAnswer = async (req, res) => {
  try {
    console.log('Creating answer with data:', req.body);
    console.log('Question ID:', req.params.questionId);
    
 

    const { questionId } = req.params;
    const { body } = req.body;

    console.log('Looking for question:', questionId);
    // Check if question exists and is not closed
    const question = await Question.findById(questionId);
    console.log('Found question:', question);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.isClosed) {
      return res.status(400).json({ error: 'Cannot answer a closed question' });
    }

    console.log('Creating answer object...');
    const answer = new Answer({
      body,
      question: questionId,
      author: req.user._id
    });

    console.log('Saving answer...');
    await answer.save();
    console.log('Answer saved successfully:', answer._id);

    // Award points for posting answer
    await PointsService.awardPoints(
      req.user._id,
      5,
      'answer_created',
      answer._id,
      'answer',
      'Posted an answer'
    );

    // Update user's forum stats
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (user) {
      await user.updateForumStats('answersGiven');
      await user.addSubjectPoints(question.subject, 5);
    }

    // Update question's answer count (handled by post-save middleware in Answer model, but explicitly calling here if needed)
    // await question.updateAnswerCount();

    // Populate author details for response
    await answer.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');

    // Emit real-time event
    if (global.io) {
      global.io.emit('newAnswer', {
        answer,
        question: {
          _id: question._id,
          title: question.title
        }
      });
    }

    console.log('Sending response...');
    res.status(201).json(answer);
  } catch (error) {
    console.error('Error in createAnswer:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
};

// Update answer
const updateAnswer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { body } = req.body;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is the author or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this answer' });
    }

    answer.body = body || answer.body;
    await answer.save();

    await answer.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');

    res.json(answer);
  } catch (error) {
    console.error('Error in updateAnswer:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
};

// Delete answer
const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is the author or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this answer' });
    }

    // Delete related votes and comments
    await Vote.deleteMany({ targetType: 'answer', targetId: id });
    await Comment.deleteMany({ targetType: 'answer', targetId: id });

    await answer.remove();

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAnswer:', error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
};

// Accept answer
const acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id).populate('question');
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is the question author or admin
    if (answer.question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to accept this answer' });
    }

    // Toggle acceptance
    if (answer.isAccepted) {
      await answer.unaccept();
    } else {
      await answer.accept(req.user._id);

      // Award points for accepted answer
      await PointsService.awardPoints(
        answer.author,
        15,
        'answer_accepted',
        answer._id,
        'answer',
        'Answer was accepted'
      );

      // Update answer author's forum stats
      const User = require('../models/User');
      const answerAuthor = await User.findById(answer.author);
      if (answerAuthor) {
        await answerAuthor.updateForumStats('bestAnswers');
        await answerAuthor.addSubjectPoints(answer.question.subject, 15);
      }
    }

    await answer.populate([
      { path: 'author', select: 'username profile.firstName profile.lastName profile.avatar reputation' },
      { path: 'acceptedBy', select: 'username profile.firstName profile.lastName' }
    ]);

    // Emit real-time event
    if (global.io) {
      global.io.to(answer.author.toString()).emit('answerAccepted', {
        answer,
        accepted: answer.isAccepted,
        acceptedBy: req.user._id
      });
    }

    res.json(answer);
  } catch (error) {
    console.error('Error in acceptAnswer:', error);
    res.status(500).json({ error: 'Failed to accept answer' });
  }
};

// Update answer status (for tutors)
const updateAnswerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tutorComment } = req.body;

    // Validate status
    const validStatuses = ['pending', 'correct', 'incorrect', 'needs_improvement'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const answer = await Answer.findById(id).populate('question');
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is tutor of the question or admin
    if (answer.question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this answer status' });
    }

    answer.status = status;
    answer.tutorComment = tutorComment || '';
    
    // If status is correct, also mark as accepted
    if (status === 'correct') {
      answer.isAccepted = true;
      answer.acceptedBy = req.user._id;
      answer.acceptedAt = new Date();
      
      // Award points to student
      try {
        await PointsService.awardAnswerCorrect(
          answer.author, 
          answer._id, 
          answer.question.subject
        );
      } catch (pointsErr) {
        console.error('Error awarding points for correct answer:', pointsErr);
      }
      // Notify student
      try {
        await notificationService.emitNotification(answer.author, {
          type: 'review_received',
          data: {
            answerId: answer._id,
            questionId: answer.question._id,
            status: 'correct',
            tutorComment: tutorComment || ''
          }
        });
      } catch (notifyErr) {
        console.error('Error sending notification for correct answer:', notifyErr);
      }
    }

    await answer.save();
    await answer.populate('author', 'username profile.firstName profile.lastName profile.avatar');
    await answer.populate('acceptedBy', 'username profile.firstName profile.lastName');

    // Emit real-time event
    if (global.io) {
      global.io.to(answer.author.toString()).emit('answerStatusUpdated', {
        answer,
        status,
        tutorComment
      });
    }

    res.json(answer);
  } catch (error) {
    console.error('Error in updateAnswerStatus:', error);
    res.status(500).json({ error: 'Failed to update answer status' });
  }
};

// Get answer statistics
const getAnswerStats = async (req, res) => {
  try {
    const totalAnswers = await Answer.countDocuments();
    const acceptedAnswers = await Answer.countDocuments({ isAccepted: true });
    const answersByQuestion = await Answer.aggregate([
      { $group: { _id: '$question', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalAnswers,
      acceptedAnswers,
      acceptanceRate: totalAnswers > 0 ? (acceptedAnswers / totalAnswers * 100).toFixed(2) : 0,
      answersByQuestion
    });
  } catch (error) {
    console.error('Error in getAnswerStats:', error);
    res.status(500).json({ error: 'Failed to fetch answer statistics' });
  }
};

// List all answers for moderation
const listAnswersForModeration = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest',
      status = 'all'
    } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const answers = await Answer.find(query)
      .sort({ createdAt: sortBy === 'newest' ? -1 : 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('question', 'title');

    const total = await Answer.countDocuments(query);

    res.json({
      success: true,
      answers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Error in listAnswersForModeration:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch answers for moderation' });
  }
};

module.exports = {
  getAnswersByQuestion,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  updateAnswerStatus,
  getAnswerStats,
  listAnswersForModeration
};
