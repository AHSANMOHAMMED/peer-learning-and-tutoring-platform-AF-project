const express = require('express');
const router = express.Router();
const GroupService = require('../services/GroupService');
const GroupRoom = require('../models/GroupRoom');
const auth = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

/**
 * @route   POST /api/groups
 * @desc    Create a new group room
 * @access  Private
 */
router.post('/', [
  auth,
  body('title').notEmpty().trim().withMessage('Room title is required'),
  body('description').notEmpty().trim().withMessage('Room description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required'),
  body('maxCapacity').optional().isInt({ min: 3, max: 50 }),
  body('tags').optional().isArray(),
  body('type').optional().isIn(['study_group', 'homework_help', 'exam_prep', 'project_collaboration', 'general_discussion']),
  body('requiresApproval').optional().isBoolean(),
  body('schedule').optional().isObject()
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

    const groupRoom = await GroupService.createGroupRoom({
      host: req.user._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Group room created successfully',
      data: { groupRoom }
    });

  } catch (error) {
    console.error('Error creating group room:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating group room',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/groups
 * @desc    Get list of available group rooms
 * @access  Public (with optional auth for personalized results)
 */
router.get('/', [
  query('subject').optional().notEmpty(),
  query('grade').optional().notEmpty(),
  query('tags').optional().isString(),
  query('type').optional().isIn(['study_group', 'homework_help', 'exam_prep', 'project_collaboration', 'general_discussion']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const filters = {
      ...req.query,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await GroupService.getGroupRooms(filters);

    res.json({
      success: true,
      message: 'Group rooms retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error getting group rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving group rooms',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/groups/:id
 * @desc    Get detailed information about a specific group room
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const groupRoom = await GroupService.getGroupRoomDetails(id, req.user._id);

    res.json({
      success: true,
      message: 'Group room details retrieved successfully',
      data: { groupRoom }
    });

  } catch (error) {
    console.error('Error getting group room details:', error);
    
    if (error.message === 'Group room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Access denied to private room') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while retrieving group room details',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/groups/:id/join
 * @desc    Join a group room
 * @access  Private
 */
router.post('/:id/join', [
  auth,
  body('message').optional().isString().trim()
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

    const result = await GroupService.joinGroupRoom(id, req.user._id, message);

    res.json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error('Error joining group room:', error);
    
    if (error.message === 'Group room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Group room is not active' || 
        error.message === 'Group room is full' || 
        error.message === 'User is already a participant') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while joining group room',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/groups/:id/leave
 * @desc    Leave a group room
 * @access  Private
 */
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const groupRoom = await GroupService.leaveGroupRoom(id, req.user._id);

    res.json({
      success: true,
      message: 'Left group room successfully',
      data: { groupRoom }
    });

  } catch (error) {
    console.error('Error leaving group room:', error);
    
    if (error.message === 'Group room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'User is not a participant' || 
        error.message === 'Host must transfer ownership or close the room before leaving') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while leaving group room',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/groups/:id/approve
 * @desc    Approve or reject pending participant
 * @access  Private (Host only)
 */
router.put('/:id/approve', [
  auth,
  body('participantId').isMongoId().withMessage('Valid participant ID is required'),
  body('approve').isBoolean().withMessage('Approve flag is required')
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
    const { participantId, approve } = req.body;

    const groupRoom = await GroupService.handlePendingParticipant(
      id, 
      req.user._id, 
      participantId, 
      approve
    );

    res.json({
      success: true,
      message: `Participant ${approve ? 'approved' : 'rejected'} successfully`,
      data: { groupRoom }
    });

  } catch (error) {
    console.error('Error handling pending participant:', error);
    
    if (error.message === 'Group room not found' || 
        error.message === 'Only host can approve participants' || 
        error.message === 'Pending participant not found' || 
        error.message === 'Room is now full') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while handling pending participant',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/groups/:id/chat
 * @desc    Add message to group room chat
 * @access  Private
 */
router.post('/:id/chat', [
  auth,
  body('message').notEmpty().trim().withMessage('Message is required'),
  body('type').optional().isIn(['text', 'file'])
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
    const { message, type = 'text' } = req.body;

    const addedMessage = await GroupService.addChatMessage(id, req.user._id, message, type);

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: { message: addedMessage }
    });

  } catch (error) {
    console.error('Error adding chat message:', error);
    
    if (error.message === 'Group room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'User is not a participant') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding chat message',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/groups/:id/settings
 * @desc    Update room settings
 * @access  Private (Host and moderators)
 */
router.put('/:id/settings', [
  auth,
  body('allowScreenShare').optional().isBoolean(),
  body('allowFileShare').optional().isBoolean(),
  body('allowVoiceChat').optional().isBoolean(),
  body('allowVideoChat').optional().isBoolean(),
  body('recordSession').optional().isBoolean(),
  body('enableWhiteboard').optional().isBoolean()
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

    const groupRoom = await GroupService.updateRoomSettings(id, req.user._id, req.body);

    res.json({
      success: true,
      message: 'Room settings updated successfully',
      data: { groupRoom }
    });

  } catch (error) {
    console.error('Error updating room settings:', error);
    
    if (error.message === 'Group room not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Only host or moderators can update settings') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating room settings',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/groups/my-rooms
 * @desc    Get user's group rooms
 * @access  Private
 */
router.get('/my-rooms', [
  auth,
  query('status').optional().isIn(['active', 'inactive']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const filters = {
      ...req.query,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await GroupService.getUserGroupRooms(req.user._id, filters);

    res.json({
      success: true,
      message: 'User group rooms retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error getting user group rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving user group rooms',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete/close a group room
 * @access  Private (Host only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const groupRoom = await GroupRoom.findById(id);
    
    if (!groupRoom) {
      return res.status(404).json({
        success: false,
        message: 'Group room not found'
      });
    }

    if (!groupRoom.isHost(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only host can delete the group room'
      });
    }

    // Soft delete by setting isActive to false
    groupRoom.isActive = false;
    await groupRoom.save();

    res.json({
      success: true,
      message: 'Group room closed successfully',
      data: { groupRoom }
    });

  } catch (error) {
    console.error('Error deleting group room:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting group room',
      error: error.message
    });
  }
});

module.exports = router;
