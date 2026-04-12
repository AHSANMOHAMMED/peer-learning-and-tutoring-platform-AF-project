const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const BreakoutRoomService = require('../services/BreakoutRoomService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST /api/breakout-rooms/:sessionId/create
 * @desc    Create breakout rooms for a session
 * @access  Private (Host only)
 */
router.post('/:sessionId/create', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  body('roomCount').isInt({ min: 1, max: 20 }).withMessage('Room count must be 1-20'),
  body('participants').isArray().withMessage('Participants array required'),
  body('assignmentType').optional().isIn(['manual', 'random', 'ability']),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const config = req.body;

    const rooms = await BreakoutRoomService.createBreakoutRooms(sessionId, config);

    // Notify all participants via WebSocket
    req.app.get('io').to(`session_${sessionId}`).emit('breakout_rooms_created', { rooms });

    res.status(201).json({ success: true, rooms });
  } catch (error) {
    console.error('Error creating breakout rooms:', error);
    res.status(500).json({ message: error.message || 'Failed to create breakout rooms' });
  }
});

/**
 * @route   POST /api/breakout-rooms/:sessionId/start
 * @desc    Start breakout rooms
 * @access  Private (Host only)
 */
router.post('/:sessionId/start', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const rooms = await BreakoutRoomService.startBreakoutRooms(sessionId);

    // Notify all participants with their room assignments
    rooms.forEach(room => {
      room.participants.forEach(participant => {
        req.app.get('io').to(`user_${participant.userId}`).emit('breakout_room_assigned', {
          roomId: room.id,
          roomName: room.name,
          participants: room.participants
        });
      });
    });

    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error starting breakout rooms:', error);
    res.status(500).json({ message: error.message || 'Failed to start breakout rooms' });
  }
});

/**
 * @route   POST /api/breakout-rooms/:sessionId/end
 * @desc    End breakout rooms and return to main session
 * @access  Private (Host only)
 */
router.post('/:sessionId/end', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const summary = await BreakoutRoomService.endBreakoutRooms(sessionId);

    // Notify all participants to return to main session
    req.app.get('io').to(`session_${sessionId}`).emit('breakout_rooms_ended', {
      summary,
      returnToMain: true
    });

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error ending breakout rooms:', error);
    res.status(500).json({ message: error.message || 'Failed to end breakout rooms' });
  }
});

/**
 * @route   GET /api/breakout-rooms/:sessionId
 * @desc    Get all breakout rooms for a session
 * @access  Private
 */
router.get('/:sessionId', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const rooms = await BreakoutRoomService.getBreakoutRooms(sessionId);

    res.json(rooms);
  } catch (error) {
    console.error('Error getting breakout rooms:', error);
    res.status(500).json({ message: 'Failed to get breakout rooms' });
  }
});

/**
 * @route   GET /api/breakout-rooms/my-room/:userId
 * @desc    Get user's assigned breakout room
 * @access  Private
 */
router.get('/my-room/:userId', [
  authenticate,
  param('userId').isString(),
  validate
], async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only check their own room
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const room = await BreakoutRoomService.getUserRoom(userId);

    if (!room) {
      return res.status(404).json({ message: 'No breakout room assigned' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error getting user room:', error);
    res.status(500).json({ message: 'Failed to get room assignment' });
  }
});

/**
 * @route   POST /api/breakout-rooms/:sessionId/move
 * @desc    Move participant between breakout rooms
 * @access  Private (Host only)
 */
router.post('/:sessionId/move', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  body('userId').isString(),
  body('targetRoomId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, targetRoomId } = req.body;

    const room = await BreakoutRoomService.moveParticipant(sessionId, userId, targetRoomId);

    // Notify participant of move
    req.app.get('io').to(`user_${userId}`).emit('moved_to_room', { roomId: targetRoomId });

    res.json({ success: true, room });
  } catch (error) {
    console.error('Error moving participant:', error);
    res.status(500).json({ message: error.message || 'Failed to move participant' });
  }
});

/**
 * @route   POST /api/breakout-rooms/:sessionId/broadcast
 * @desc    Broadcast message to all breakout rooms
 * @access  Private (Host only)
 */
router.post('/:sessionId/broadcast', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  body('message').isObject(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    await BreakoutRoomService.broadcastToAll(sessionId, message);

    // Emit to all breakout room participants
    req.app.get('io').to(`session_${sessionId}`).emit('breakout_broadcast', { message });

    res.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting:', error);
    res.status(500).json({ message: 'Failed to broadcast message' });
  }
});

/**
 * @route   POST /api/breakout-rooms/:roomId/message
 * @desc    Send message to specific breakout room
 * @access  Private
 */
router.post('/:roomId/message', [
  authenticate,
  param('roomId').isString(),
  body('message').isObject(),
  validate
], async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const room = await BreakoutRoomService.sendRoomMessage(roomId, {
      ...message,
      senderId: userId,
      senderName: req.user.name
    });

    // Emit to room participants
    req.app.get('io').to(`breakout_${roomId}`).emit('room_message', {
      message: { ...message, senderId: userId, senderName: req.user.name },
      roomId
    });

    res.json({ success: true, room });
  } catch (error) {
    console.error('Error sending room message:', error);
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
});

/**
 * @route   POST /api/breakout-rooms/:roomId/whiteboard
 * @desc    Add whiteboard stroke to breakout room
 * @access  Private
 */
router.post('/:roomId/whiteboard', [
  authenticate,
  param('roomId').isString(),
  body('stroke').isObject(),
  validate
], async (req, res) => {
  try {
    const { roomId } = req.params;
    const { stroke } = req.body;

    const room = await BreakoutRoomService.addWhiteboardStroke(roomId, {
      ...stroke,
      userId: req.user._id
    });

    // Broadcast to room
    req.app.get('io').to(`breakout_${roomId}`).emit('whiteboard_update', { stroke });

    res.json({ success: true, room });
  } catch (error) {
    console.error('Error adding whiteboard stroke:', error);
    res.status(500).json({ message: error.message || 'Failed to add stroke' });
  }
});

/**
 * @route   GET /api/breakout-rooms/:sessionId/stats
 * @desc    Get breakout room statistics
 * @access  Private (Host only)
 */
router.get('/:sessionId/stats', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stats = await BreakoutRoomService.getBreakoutStats(sessionId);

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

/**
 * @route   DELETE /api/breakout-rooms/:sessionId/:roomId
 * @desc    Close a specific breakout room
 * @access  Private (Host only)
 */
router.delete('/:sessionId/:roomId', [
  authenticate,
  authorize(['tutor', 'admin']),
  param('sessionId').isString(),
  param('roomId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId, roomId } = req.params;

    const result = await BreakoutRoomService.closeBreakoutRoom(sessionId, roomId);

    // Notify affected participants
    result.movedParticipants.forEach(p => {
      req.app.get('io').to(`user_${p.userId}`).emit('room_closed', {
        roomId,
        message: 'Your breakout room has been closed. Returning to main session.'
      });
    });

    res.json(result);
  } catch (error) {
    console.error('Error closing breakout room:', error);
    res.status(500).json({ message: error.message || 'Failed to close room' });
  }
});

module.exports = router;
