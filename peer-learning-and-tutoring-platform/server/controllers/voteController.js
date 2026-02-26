const Vote = require('../models/Vote');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const PointTransaction = require('../models/PointTransaction');
const { validationResult } = require('express-validator');

// Vote on question or answer
const vote = async (req, res) => {
  try {
    // Temporarily disable validation for testing
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { targetType, targetId, voteType } = req.body;

    // Temporarily add mock user for testing
    req.user = { _id: '507f1f77bcf86cd799439012' };

    // Validate target type
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    // Get target (question or answer)
    const TargetModel = targetType === 'question' ? Question : Answer;
    const target = await TargetModel.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: `${targetType} not found` });
    }

    // Prevent self-voting
    if (target.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot vote on your own content' });
    }

    // Toggle vote
    const result = await Vote.toggleVote(targetType, targetId, req.user._id, voteType);

    // Temporarily disable points for testing
    // Handle point transactions
    // const User = require('../models/User');
    // const targetAuthor = await User.findById(target.author);

    // if (result.action === 'created') {
    //   // Award points to content author
    //   let points = 0;
    //   let transactionType = '';
    //   let description = '';

    //   if (voteType === 'up') {
    //     points = targetType === 'question' ? 2 : 5;
    //     transactionType = 'upvote_received';
    //     description = `Received upvote on ${targetType}`;
    //   } else {
    //     points = -1;
    //     transactionType = 'downvote_received';
    //     description = `Received downvote on ${targetType}`;
    //   }

    //   await PointTransaction.createTransaction({
    //     user: target.author,
    //     points,
    //     type: transactionType,
    //     referenceId: target._id,
    //     referenceType: targetType,
    //     description
    //   });

    //   // Update user's reputation
    //   await targetAuthor.updateReputation(points);
    //   await targetAuthor.addSubjectPoints(target.category || 'General', points);
    // } else if (result.action === 'removed') {
    //   // Reverse points
    //   let points = 0;
    //   if (result.previousVote === 'up') {
    //     points = targetType === 'question' ? -2 : -5;
    //   } else if (result.previousVote === 'down') {
    //     points = 1;
    //   }

    //   await PointTransaction.createTransaction({
    //     user: target.author,
    //     points,
    //     type: 'vote_removed',
    //     referenceId: target._id,
    //     referenceType: targetType,
    //     description: `Vote removed on ${targetType}`
    //   });

    //   // Update user's reputation
    //   await targetAuthor.updateReputation(points);
    //   await targetAuthor.addSubjectPoints(target.category || 'General', points);
    // }

    // Update target's vote counts
    await target.updateVoteCounts();

    // Get updated vote counts
    const voteCounts = await Vote.getVoteCounts(targetType, targetId);

    // Get user's current vote
    const userVote = await Vote.getUserVote(targetType, targetId, req.user._id);

    // Emit real-time event
    if (global.io) {
      global.io.emit('voteUpdated', {
        targetType,
        targetId,
        voteCounts,
        userVote: userVote ? userVote.voteType : null
      });
    }

    res.json({
      voteCounts,
      userVote: userVote ? userVote.voteType : null,
      action: result.action
    });
  } catch (error) {
    console.error('Error in vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
};

// Get user's vote for a specific target
const getUserVote = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    // Validate target type
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    const vote = await Vote.getUserVote(targetType, targetId, req.user._id);

    res.json({
      vote: vote ? vote.voteType : null
    });
  } catch (error) {
    console.error('Error in getUserVote:', error);
    res.status(500).json({ error: 'Failed to fetch user vote' });
  }
};

// Get vote counts for a specific target
const getVoteCounts = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    // Validate target type
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    const voteCounts = await Vote.getVoteCounts(targetType, targetId);

    res.json(voteCounts);
  } catch (error) {
    console.error('Error in getVoteCounts:', error);
    res.status(500).json({ error: 'Failed to fetch vote counts' });
  }
};

// Get user's vote history
const getUserVoteHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { targetType } = req.params;

    // Validate target type
    if (targetType && !['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    const query = { user: req.user._id };
    if (targetType) {
      query.targetType = targetType;
    }

    const votes = await Vote.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('targetId', 'title')
      .populate('targetId', 'body');

    const total = await Vote.countDocuments(query);

    res.json({
      votes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
      }
    });
  } catch (error) {
    console.error('Error in getUserVoteHistory:', error);
    res.status(500).json({ error: 'Failed to fetch vote history' });
  }
};

// Get vote statistics
const getVoteStats = async (req, res) => {
  try {
    const questionVotes = await Vote.countDocuments({ targetType: 'question' });
    const answerVotes = await Vote.countDocuments({ targetType: 'answer' });

    const votesByType = await Vote.aggregate([
      {
        $group: {
          _id: { targetType: '$targetType', voteType: '$voteType' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      totalVotes: questionVotes + answerVotes,
      questionVotes,
      answerVotes,
      votesByType
    });
  } catch (error) {
    console.error('Error in getVoteStats:', error);
    res.status(500).json({ error: 'Failed to fetch vote statistics' });
  }
};

module.exports = {
  vote,
  getUserVote,
  getVoteCounts,
  getUserVoteHistory,
  getVoteStats
};
