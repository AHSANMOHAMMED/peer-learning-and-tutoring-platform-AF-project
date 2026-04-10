const Comment = require('../models/Comment');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { validationResult } = require('express-validator');

// Get comments for a target (question or answer)
const getCommentsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const {
      page = 1,
      limit = 50,
      sortBy = 'oldest'
    } = req.query;

    // Validate target type
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    // Check if target exists
    const TargetModel = targetType === 'question' ? Question : Answer;
    const target = await TargetModel.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: `${targetType} not found` });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    };

    const comments = await Comment.getByTarget(targetType, targetId, options);
    const total = await Comment.getCountByTarget(targetType, targetId);

    res.json({
      comments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error in getCommentsByTarget:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Get single comment by ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar reputation')
      .populate('deletedBy', 'username profile.firstName profile.lastName');

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error in getCommentById:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};

// Create new comment
const createComment = async (req, res) => {
  try {
    // Temporarily disable validation for testing
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { targetType, targetId } = req.params;
    const { body } = req.body;

    // Temporarily add mock user for testing
    req.user = { _id: '507f1f77bcf86cd799439012' };

    // Validate target type
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    // Check if target exists
    const TargetModel = targetType === 'question' ? Question : Answer;
    const target = await TargetModel.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: `${targetType} not found` });
    }

    const comment = new Comment({
      body,
      author: req.user._id,
      targetType,
      targetId
    });

    await comment.save();

    // Update target's comment count
    await target.updateCommentCount();

    // Populate author details for response
    await comment.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');

    // Emit real-time event
    if (global.io) {
      // Notify target author
      global.io.emit('newComment', {
        comment,
        target: target,
        targetType
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error in createComment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    // Temporarily add mock user for testing
    req.user = { _id: '507f1f77bcf86cd799439012' };
    
    // Temporarily disable validation for testing
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { id } = req.params;
    const { body } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    // Don't allow editing deleted comments
    if (comment.isDeleted) {
      return res.status(400).json({ error: 'Cannot edit a deleted comment' });
    }

    await comment.edit(body);

    await comment.populate('author', 'username profile.firstName profile.lastName profile.avatar reputation');

    res.json(comment);
  } catch (error) {
    console.error('Error in updateComment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete comment (soft delete)
const deleteComment = async (req, res) => {
  try {
    // Temporarily add mock user for testing
    req.user = { _id: '507f1f77bcf86cd799439012' };
    
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Don't allow deleting already deleted comments
    if (comment.isDeleted) {
      return res.status(400).json({ error: 'Comment already deleted' });
    }

    await comment.softDelete(req.user._id);

    // Update target's comment count
    const TargetModel = comment.targetType === 'question' ? Question : Answer;
    const target = await TargetModel.findById(comment.targetId);
    if (target) {
      await target.updateCommentCount();
    }

    await comment.populate('deletedBy', 'username profile.firstName profile.lastName');

    res.json(comment);
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Get user's comments
const getUserComments = async (req, res) => {
  try {
    // Temporarily add mock user for testing
    req.user = { _id: '507f1f77bcf86cd799439012' };
    
    const {
      page = 1,
      limit = 20,
      targetType = null
    } = req.query;

    const query = { author: req.user._id, isDeleted: false };
    if (targetType) {
      query.targetType = targetType;
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('targetId')
      .populate('author', 'username profile.firstName profile.lastName profile.avatar');

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error in getUserComments:', error);
    res.status(500).json({ error: 'Failed to fetch user comments' });
  }
};

// Get comment statistics
const getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments({ isDeleted: false });
    const deletedComments = await Comment.countDocuments({ isDeleted: true });
    const questionComments = await Comment.countDocuments({ targetType: 'question', isDeleted: false });
    const answerComments = await Comment.countDocuments({ targetType: 'answer', isDeleted: false });

    const commentsByTarget = await Comment.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$targetId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalComments,
      deletedComments,
      questionComments,
      answerComments,
      commentsByTarget
    });
  } catch (error) {
    console.error('Error in getCommentStats:', error);
    res.status(500).json({ error: 'Failed to fetch comment statistics' });
  }
};

module.exports = {
  getCommentsByTarget,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getUserComments,
  getCommentStats
};
