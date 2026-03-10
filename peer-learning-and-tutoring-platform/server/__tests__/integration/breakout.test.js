/**
 * API Integration Tests for Breakout Room Routes
 * Tests the full request/response cycle with Express server
 */

const request = require('supertest');
const express = require('express');
const breakoutRoutes = require('../server/routes/breakout');
const authenticate = require('../server/middleware/authenticate');
const authorize = require('../server/middleware/authorize');

// Mock middleware
jest.mock('../server/middleware/authenticate');
jest.mock('../server/middleware/authorize');

// Mock BreakoutRoomService
jest.mock('../server/services/BreakoutRoomService', () => ({
  createBreakoutRooms: jest.fn(),
  startBreakoutRooms: jest.fn(),
  endBreakoutRooms: jest.fn(),
  getBreakoutRooms: jest.fn(),
  getUserRoom: jest.fn(),
  moveParticipant: jest.fn(),
  broadcastToAll: jest.fn(),
  sendRoomMessage: jest.fn(),
  addWhiteboardStroke: jest.fn(),
  getBreakoutStats: jest.fn(),
  closeBreakoutRoom: jest.fn()
}));

const BreakoutRoomService = require('../server/services/BreakoutRoomService');

describe('Breakout Room API Integration Tests', () => {
  let app;
  let mockIo;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock io
    mockIo = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn()
      })
    };
    app.set('io', mockIo);

    // Mock authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123', role: 'tutor', name: 'Test User' };
      next();
    });

    authorize.mockImplementation((roles) => (req, res, next) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    });

    app.use('/api/breakout', breakoutRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/breakout/:sessionId/create', () => {
    test('should create breakout rooms successfully', async () => {
      const mockRooms = [
        { id: 'room1', name: 'Room 1', participants: [] },
        { id: 'room2', name: 'Room 2', participants: [] }
      ];
      BreakoutRoomService.createBreakoutRooms.mockResolvedValue(mockRooms);

      const response = await request(app)
        .post('/api/breakout/session123/create')
        .send({
          roomCount: 2,
          participants: [{ userId: 'user1' }, { userId: 'user2' }],
          assignmentType: 'manual'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.rooms).toHaveLength(2);
      expect(BreakoutRoomService.createBreakoutRooms).toHaveBeenCalledWith('session123', expect.any(Object));
      expect(mockIo.to).toHaveBeenCalledWith('session_session123');
    });

    test('should return 400 for invalid room count', async () => {
      const response = await request(app)
        .post('/api/breakout/session123/create')
        .send({
          roomCount: 0,
          participants: []
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should return 400 for missing participants', async () => {
      const response = await request(app)
        .post('/api/breakout/session123/create')
        .send({
          roomCount: 2
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should handle service errors', async () => {
      BreakoutRoomService.createBreakoutRooms.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/breakout/session123/create')
        .send({
          roomCount: 2,
          participants: [{ userId: 'user1' }]
        })
        .expect(500);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/breakout/:sessionId/start', () => {
    test('should start breakout rooms', async () => {
      const mockRooms = [
        { id: 'room1', isActive: true },
        { id: 'room2', isActive: true }
      ];
      BreakoutRoomService.startBreakoutRooms.mockResolvedValue(mockRooms);

      const response = await request(app)
        .post('/api/breakout/session123/start')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockIo.to).toHaveBeenCalledWith('user_user1');
    });

    test('should return 500 if rooms not found', async () => {
      BreakoutRoomService.startBreakoutRooms.mockRejectedValue(new Error('No breakout rooms found'));

      const response = await request(app)
        .post('/api/breakout/session123/start')
        .expect(500);

      expect(response.body.message).toContain('No breakout rooms found');
    });
  });

  describe('POST /api/breakout/:sessionId/end', () => {
    test('should end breakout rooms and return summary', async () => {
      const mockSummary = [
        { roomId: 'room1', participantCount: 5 },
        { roomId: 'room2', participantCount: 3 }
      ];
      BreakoutRoomService.endBreakoutRooms.mockResolvedValue(mockSummary);

      const response = await request(app)
        .post('/api/breakout/session123/end')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toHaveLength(2);
      expect(mockIo.to).toHaveBeenCalledWith('session_session123');
    });
  });

  describe('GET /api/breakout/:sessionId', () => {
    test('should return all rooms for session', async () => {
      const mockRooms = [{ id: 'room1' }, { id: 'room2' }];
      BreakoutRoomService.getBreakoutRooms.mockResolvedValue(mockRooms);

      const response = await request(app)
        .get('/api/breakout/session123')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(BreakoutRoomService.getBreakoutRooms).toHaveBeenCalledWith('session123');
    });
  });

  describe('GET /api/breakout/my-room/:userId', () => {
    test('should return user room assignment', async () => {
      const mockRoom = { id: 'room1', name: 'Room 1' };
      BreakoutRoomService.getUserRoom.mockResolvedValue(mockRoom);

      const response = await request(app)
        .get('/api/breakout/my-room/user123')
        .expect(200);

      expect(response.body.id).toBe('room1');
    });

    test('should return 404 if no room assigned', async () => {
      BreakoutRoomService.getUserRoom.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/breakout/my-room/user123')
        .expect(404);

      expect(response.body.message).toContain('No breakout room assigned');
    });

    test('should deny access to other users rooms', async () => {
      // Simulate different user
      authenticate.mockImplementation((req, res, next) => {
        req.user = { _id: 'differentuser', role: 'student' };
        next();
      });

      const response = await request(app)
        .get('/api/breakout/my-room/user123')
        .expect(403);

      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('POST /api/breakout/:sessionId/move', () => {
    test('should move participant to different room', async () => {
      const mockRoom = { id: 'room2', participants: [{ userId: 'user1' }] };
      BreakoutRoomService.moveParticipant.mockResolvedValue(mockRoom);

      const response = await request(app)
        .post('/api/breakout/session123/move')
        .send({
          userId: 'user1',
          targetRoomId: 'room2'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockIo.to).toHaveBeenCalledWith('user_user1');
    });

    test('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/breakout/session123/move')
        .send({
          userId: 'user1'
          // missing targetRoomId
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/breakout/:sessionId/broadcast', () => {
    test('should broadcast message to all rooms', async () => {
      const response = await request(app)
        .post('/api/breakout/session123/broadcast')
        .send({
          message: { text: 'Hello all rooms' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(BreakoutRoomService.broadcastToAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/breakout/:roomId/message', () => {
    test('should send message to specific room', async () => {
      const mockRoom = { id: 'room1', messages: [] };
      BreakoutRoomService.sendRoomMessage.mockResolvedValue(mockRoom);

      const response = await request(app)
        .post('/api/breakout/room123/message')
        .send({
          message: { text: 'Hello room' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockIo.to).toHaveBeenCalledWith('breakout_room123');
    });
  });

  describe('POST /api/breakout/:roomId/whiteboard', () => {
    test('should add whiteboard stroke', async () => {
      const mockRoom = { id: 'room1', whiteboard: [] };
      BreakoutRoomService.addWhiteboardStroke.mockResolvedValue(mockRoom);

      const response = await request(app)
        .post('/api/breakout/room123/whiteboard')
        .send({
          stroke: { x: 10, y: 20, color: '#000' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/breakout/:sessionId/stats', () => {
    test('should return breakout room statistics', async () => {
      const mockStats = {
        totalRooms: 3,
        activeRooms: 2,
        totalParticipants: 15
      };
      BreakoutRoomService.getBreakoutStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/breakout/session123/stats')
        .expect(200);

      expect(response.body.totalRooms).toBe(3);
    });

    test('should return null for non-existent session', async () => {
      BreakoutRoomService.getBreakoutStats.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/breakout/nonexistent/stats')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('DELETE /api/breakout/:sessionId/:roomId', () => {
    test('should close specific breakout room', async () => {
      const mockResult = {
        success: true,
        movedParticipants: [{ userId: 'user1' }]
      };
      BreakoutRoomService.closeBreakoutRoom.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/api/breakout/session123/room456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockIo.to).toHaveBeenCalledWith('user_user1');
    });

    test('should handle room not found', async () => {
      BreakoutRoomService.closeBreakoutRoom.mockRejectedValue(new Error('Room not found'));

      const response = await request(app)
        .delete('/api/breakout/session123/room456')
        .expect(500);

      expect(response.body.message).toContain('Room not found');
    });
  });
});
