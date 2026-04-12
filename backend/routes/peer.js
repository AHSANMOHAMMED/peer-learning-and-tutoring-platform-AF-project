const express = require('express');
const router = express.Router();
const MatchingService = require('../services/MatchingService');
const PeerSession = require('../models/PeerSession');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

/**
 * @route   POST /api/peer/match
 * @desc    Quick AI-driven peer matching (Neural Synchronizer)
 * @access  Private
 */
router.post('/match', authenticate, async (req, res) => {
  try {
    const { stream } = req.body;
    
    // Convert stream to subject/grade context
    const matches = await MatchingService.findPeerMatches({
      userId: req.user._id,
      subject: stream || 'Combined Maths',
      grade: req.user.profile?.grade || 'Grade 12',
      topic: 'General Discussion',
      scheduledAt: new Date(),
      duration: 60
    });

    res.json({
      success: true,
      message: 'Neural resonance matches found',
      data: matches.map(m => ({
        id: m.user._id,
        name: m.user.name || m.user.username,
        univ: m.user.profile?.education || 'National Academy',
        rating: m.reputation?.averageRating || 4.9,
        location: m.user.profile?.location || 'Western Province',
        subjects: m.user.profile?.subjects || []
      }))
    });
  } catch (error) {
    console.error('Error in quick match:', error);
    res.status(500).json({ success: false, message: 'Matching engine failure' });
  }
});

/**
 * @route   POST /api/peer/request-help
 * @desc    Request peer help and get potential matches
 * @access  Private
 */
router.post('/request-help', [
  authenticate,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled time is required'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15-180 minutes'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('tags').optional().isArray()
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

    const { subject, grade, topic, description, scheduledAt, duration, difficulty, tags } = req.body;

    // Get potential matches
    const matches = await MatchingService.findPeerMatches({
      userId: req.user._id,
      subject,
      grade,
      topic,
      description,
      scheduledAt: new Date(scheduledAt),
      duration,
      difficulty,
      tags
    });

    res.json({
      success: true,
      message: 'Potential peer matches found',
      data: {
        matches,
        request: {
          subject,
          grade,
          topic,
          description,
          scheduledAt,
          duration,
          difficulty,
          tags
        }
      }
    });

  } catch (error) {
    console.error('Error requesting peer help:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding peer matches',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/peer/matches
 * @desc    Get peer matches for a help request
 * @access  Private
 */
router.get('/matches', [
  authenticate,
  query('subject').notEmpty().withMessage('Subject is required'),
  query('grade').notEmpty().withMessage('Grade is required'),
  query('topic').notEmpty().withMessage('Topic is required'),
  query('scheduledAt').isISO8601().withMessage('Valid scheduled time is required'),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
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

    const { subject, grade, topic, scheduledAt, difficulty, tags } = req.query;

    const matches = await MatchingService.findPeerMatches({
      userId: req.user._id,
      subject,
      grade,
      topic,
      description: '', // Optional for GET request
      scheduledAt: new Date(scheduledAt),
      duration: 30, // Default duration
      difficulty,
      tags: tags ? tags.split(',') : []
    });

    res.json({
      success: true,
      message: 'Peer matches retrieved successfully',
      data: { matches }
    });

  } catch (error) {
    console.error('Error getting peer matches:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving peer matches',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/peer/sessions
 * @desc    Create a peer session with matched helper
 * @access  Private
 */
router.post('/sessions', [
  authenticate,
  body('helperId').isMongoId().withMessage('Valid helper ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled time is required'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15-180 minutes'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('tags').optional().isArray()
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

    const { helperId, subject, grade, topic, description, scheduledAt, duration, difficulty, tags } = req.body;

    // Check if helper exists and is available
    const helper = await User.findById(helperId);
    if (!helper) {
      return res.status(404).json({
        success: false,
        message: 'Helper not found'
      });
    }

    // Check if helper is available at the requested time
    const isAvailable = await MatchingService.checkHelperAvailability(
      helperId, 
      new Date(scheduledAt)
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Helper is not available at the requested time'
      });
    }

    // Create peer session
    const peerSession = await MatchingService.createPeerSession(
      req.user._id,
      helperId,
      {
        subject,
        grade,
        topic,
        description,
        scheduledAt: new Date(scheduledAt),
        duration,
        difficulty,
        tags,
        status: 'matched'
      }
    );

    // Populate session details
    await peerSession.populate([
      { path: 'initiator', select: 'name email profile' },
      { path: 'matchedPeer', select: 'name email profile' },
      { path: 'participants.user', select: 'name email profile' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Peer session created successfully',
      data: { peerSession }
    });

  } catch (error) {
    console.error('Error creating peer session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating peer session',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/peer/sessions/:id/accept
 * @desc    Accept a peer session request
 * @access  Private
 */
router.put('/sessions/:id/accept', [
  authenticate,
  body('message').optional().isString()
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

    const { id } = req.params;
    const { message } = req.body;

    const peerSession = await PeerSession.findById(id);
    
    if (!peerSession) {
      return res.status(404).json({
        success: false,
        message: 'Peer session not found'
      });
    }

    // Check if user is the matched peer
    if (peerSession.matchedPeer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the matched peer can accept this session'
      });
    }

    if (peerSession.status !== 'matched') {
      return res.status(400).json({
        success: false,
        message: 'Session cannot be accepted in current status'
      });
    }

    // Update session status
    peerSession.status = 'active';
    
    // Add acceptance message if provided
    if (message) {
      peerSession.description += `\n\nHelper's message: ${message}`;
    }

    await peerSession.save();

    // Populate for response
    await peerSession.populate([
      { path: 'initiator', select: 'name email profile' },
      { path: 'matchedPeer', select: 'name email profile' },
      { path: 'participants.user', select: 'name email profile' }
    ]);

    res.json({
      success: true,
      message: 'Peer session accepted successfully',
      data: { peerSession }
    });

  } catch (error) {
    console.error('Error accepting peer session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting peer session',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/peer/sessions/:id/complete
 * @desc    Complete a peer session
 * @access  Private
 */
router.put('/sessions/:id/complete', [
  authenticate,
  body('feedback').optional().isObject(),
  body('feedback.rating').optional().isInt({ min: 1, max: 5 }),
  body('feedback.comment').optional().isString()
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

    const { id } = req.params;
    const { feedback } = req.body;

    const peerSession = await PeerSession.findById(id);
    
    if (!peerSession) {
      return res.status(404).json({
        success: false,
        message: 'Peer session not found'
      });
    }

    // Check if user is a participant
    if (!peerSession.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only participants can complete this session'
      });
    }

    if (peerSession.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active sessions can be completed'
      });
    }

    // Update session status
    peerSession.status = 'completed';
    peerSession.completedAt = new Date();

    // Add feedback if provided
    if (feedback) {
      // Check if user already provided feedback
      const existingFeedback = peerSession.feedback.find(
        f => f.user.toString() === req.user._id.toString()
      );

      if (!existingFeedback) {
        peerSession.feedback.push({
          user: req.user._id,
          rating: feedback.rating,
          comment: feedback.comment,
          helpful: feedback.helpful || false
        });

        // Update reputation based on feedback
        await this.updateReputationFromFeedback(peerSession, feedback);
      }
    }

    await peerSession.save();

    res.json({
      success: true,
      message: 'Peer session completed successfully',
      data: { peerSession }
    });

  } catch (error) {
    console.error('Error completing peer session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing peer session',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/peer/sessions
 * @desc    Get user's peer sessions
 * @access  Private
 */
router.get('/sessions', [
  authenticate,
  query('status').optional().isIn(['pending', 'matched', 'active', 'completed', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      'participants.user': req.user._id
    };

    if (status) {
      query.status = status;
    }

    const sessions = await PeerSession.find(query)
      .populate('initiator', 'name email profile')
      .populate('matchedPeer', 'name email profile')
      .populate('participants.user', 'name email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PeerSession.countDocuments(query);

    res.json({
      success: true,
      message: 'Peer sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting peer sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving peer sessions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/peer/sessions/:id
 * @desc    Get specific peer session details
 * @access  Private
 */
router.get('/sessions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const peerSession = await PeerSession.findById(id)
      .populate('initiator', 'name email profile')
      .populate('matchedPeer', 'name email profile')
      .populate('participants.user', 'name email profile')
      .populate('feedback.user', 'name email');

    if (!peerSession) {
      return res.status(404).json({
        success: false,
        message: 'Peer session not found'
      });
    }

    // Check if user is a participant
    if (!peerSession.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Peer session retrieved successfully',
      data: { peerSession }
    });

  } catch (error) {
    console.error('Error getting peer session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving peer session',
      error: error.message
    });
  }
});

/**
 * Helper function to update user reputation from feedback
 */
async function updateReputationFromFeedback(peerSession, feedback) {
  try {
    const { rating } = feedback;
    
    // Calculate reputation change based on rating
    let reputationChange = 0;
    if (rating >= 4) {
      reputationChange = 10; // Positive feedback
    } else if (rating >= 3) {
      reputationChange = 5;  // Neutral feedback
    } else {
      reputationChange = -5; // Negative feedback
    }

    // Update both participants' reputation
    await User.updateMany(
      { _id: { $in: [peerSession.initiator, peerSession.matchedPeer] } },
      { 
        $inc: { 'profile.reputation': reputationChange },
        $push: { 
          'profile.recentSessions': {
            sessionId: peerSession._id,
            rating: rating,
            completedAt: new Date()
          }
        }
      }
    );

  } catch (error) {
    console.error('Error updating reputation:', error);
  }
}

module.exports = router;
