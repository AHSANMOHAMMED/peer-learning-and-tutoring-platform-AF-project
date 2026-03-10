/**
 * Unit Tests for BreakoutRoomService
 * Tests breakout room creation, management, and participant tracking
 */

const BreakoutRoomService = require('../../server/services/BreakoutRoomService');

describe('BreakoutRoomService', () => {
  beforeEach(() => {
    // Clear all rooms before each test
    BreakoutRoomService.breakoutRooms.clear();
    BreakoutRoomService.userAssignments.clear();
  });

  describe('createBreakoutRooms', () => {
    test('should create specified number of rooms', async () => {
      const config = {
        roomCount: 3,
        participants: [
          { userId: 'user1' }, { userId: 'user2' }, { userId: 'user3' },
          { userId: 'user4' }, { userId: 'user5' }, { userId: 'user6' }
        ],
        assignmentType: 'manual'
      };

      const rooms = await BreakoutRoomService.createBreakoutRooms('session1', config);

      expect(rooms).toHaveLength(3);
      rooms.forEach((room, index) => {
        expect(room.name).toBe(`Room ${index + 1}`);
        expect(room.sessionId).toBe('session1');
        expect(room.isActive).toBe(false);
        expect(room.id).toContain('breakout_session1_');
      });
    });

    test('should distribute participants evenly for manual assignment', async () => {
      const config = {
        roomCount: 2,
        participants: [
          { userId: 'user1' }, { userId: 'user2' },
          { userId: 'user3' }, { userId: 'user4' }
        ],
        assignmentType: 'manual'
      };

      const rooms = await BreakoutRoomService.createBreakoutRooms('session1', config);

      expect(rooms[0].participants).toHaveLength(2);
      expect(rooms[1].participants).toHaveLength(2);
    });

    test('should randomly assign participants when type is random', async () => {
      const config = {
        roomCount: 2,
        participants: [
          { userId: 'user1' }, { userId: 'user2' },
          { userId: 'user3' }, { userId: 'user4' }
        ],
        assignmentType: 'random'
      };

      const rooms = await BreakoutRoomService.createBreakoutRooms('session1', config);

      // Check all participants are assigned
      const totalAssigned = rooms.reduce((sum, r) => sum + r.participants.length, 0);
      expect(totalAssigned).toBe(4);
      
      // Check user assignments are recorded
      config.participants.forEach(p => {
        expect(BreakoutRoomService.userAssignments.has(p.userId)).toBe(true);
      });
    });

    test('should assign by ability level when specified', async () => {
      const config = {
        roomCount: 2,
        participants: [
          { userId: 'user1', level: 5 },
          { userId: 'user2', level: 4 },
          { userId: 'user3', level: 3 },
          { userId: 'user4', level: 2 }
        ],
        assignmentType: 'ability'
      };

      const rooms = await BreakoutRoomService.createBreakoutRooms('session1', config);

      // High ability should be distributed across rooms
      expect(rooms[0].participants).toHaveLength(2);
      expect(rooms[1].participants).toHaveLength(2);
    });

    test('should set maxParticipants based on participant count', async () => {
      const config = {
        roomCount: 3,
        participants: [
          { userId: 'user1' }, { userId: 'user2' }, { userId: 'user3' },
          { userId: 'user4' }, { userId: 'user5' }, { userId: 'user6' }
        ]
      };

      const rooms = await BreakoutRoomService.createBreakoutRooms('session1', config);

      expect(rooms[0].maxParticipants).toBe(2); // ceil(6/3)
    });
  });

  describe('startBreakoutRooms', () => {
    test('should activate all rooms and set first participant as host', async () => {
      const config = {
        roomCount: 2,
        participants: [
          { userId: 'user1' }, { userId: 'user2' },
          { userId: 'user3' }, { userId: 'user4' }
        ]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);

      const rooms = await BreakoutRoomService.startBreakoutRooms('session1');

      rooms.forEach(room => {
        expect(room.isActive).toBe(true);
        expect(room.startedAt).toBeInstanceOf(Date);
        expect(room.host).toBeDefined();
      });
    });

    test('should throw error if no rooms exist for session', async () => {
      await expect(BreakoutRoomService.startBreakoutRooms('nonexistent'))
        .rejects.toThrow('No breakout rooms found for this session');
    });
  });

  describe('endBreakoutRooms', () => {
    test('should return summary of all rooms', async () => {
      const config = {
        roomCount: 2,
        participants: [
          { userId: 'user1' }, { userId: 'user2' }
        ]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      await BreakoutRoomService.startBreakoutRooms('session1');
      
      // Add a message to a room
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      rooms[0].messages.push({ text: 'Hello', sender: 'user1' });

      const summary = await BreakoutRoomService.endBreakoutRooms('session1');

      expect(summary).toHaveLength(2);
      expect(summary[0].participantCount).toBe(1);
      expect(summary[0].messages).toHaveLength(1);
      expect(summary[0].duration).toBeGreaterThanOrEqual(0);
    });

    test('should clear user assignments', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }, { userId: 'user2' }],
        assignmentType: 'random'
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);

      expect(BreakoutRoomService.userAssignments.size).toBeGreaterThan(0);

      await BreakoutRoomService.endBreakoutRooms('session1');

      expect(BreakoutRoomService.userAssignments.size).toBe(0);
    });

    test('should mark rooms as inactive', async () => {
      const config = {
        roomCount: 1,
        participants: [{ userId: 'user1' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      await BreakoutRoomService.startBreakoutRooms('session1');

      await BreakoutRoomService.endBreakoutRooms('session1');

      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      expect(rooms[0].isActive).toBe(false);
      expect(rooms[0].endedAt).toBeInstanceOf(Date);
    });
  });

  describe('getUserRoom', () => {
    test('should return room for assigned user', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }, { userId: 'user2' }],
        assignmentType: 'manual'
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);

      const room = await BreakoutRoomService.getUserRoom('user1');

      expect(room).toBeDefined();
      expect(room.participants.some(p => p.userId === 'user1')).toBe(true);
    });

    test('should return null for unassigned user', async () => {
      const room = await BreakoutRoomService.getUserRoom('unassigned');
      expect(room).toBeNull();
    });
  });

  describe('moveParticipant', () => {
    test('should move user between rooms', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }, { userId: 'user2' }],
        assignmentType: 'manual'
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      const targetRoomId = rooms[1].id;

      const room = await BreakoutRoomService.moveParticipant('session1', 'user1', targetRoomId);

      expect(room.id).toBe(targetRoomId);
      expect(room.participants.some(p => p.userId === 'user1')).toBe(true);
      
      // Original room should no longer have user
      expect(rooms[0].participants.some(p => p.userId === 'user1')).toBe(false);
    });

    test('should update user assignment', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }, { userId: 'user2' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      const originalRoomId = rooms[0].id;
      const targetRoomId = rooms[1].id;

      expect(BreakoutRoomService.userAssignments.get('user1')).toBe(originalRoomId);

      await BreakoutRoomService.moveParticipant('session1', 'user1', targetRoomId);

      expect(BreakoutRoomService.userAssignments.get('user1')).toBe(targetRoomId);
    });

    test('should throw error for non-existent session', async () => {
      await expect(BreakoutRoomService.moveParticipant('nonexistent', 'user1', 'room1'))
        .rejects.toThrow('No breakout rooms found');
    });
  });

  describe('broadcastToAll', () => {
    test('should add message to all rooms', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);

      const message = { text: 'Hello everyone', sender: 'host' };
      await BreakoutRoomService.broadcastToAll('session1', message);

      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      expect(rooms[0].messages).toHaveLength(1);
      expect(rooms[1].messages).toHaveLength(1);
      expect(rooms[0].messages[0].isBroadcast).toBe(true);
    });
  });

  describe('sendRoomMessage', () => {
    test('should add message to specific room', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      const roomId = rooms[0].id;

      const message = { text: 'Room specific message' };
      await BreakoutRoomService.sendRoomMessage(roomId, message);

      expect(rooms[0].messages).toHaveLength(1);
      expect(rooms[1].messages).toHaveLength(0);
    });

    test('should throw error for non-existent room', async () => {
      await expect(BreakoutRoomService.sendRoomMessage('nonexistent', { text: 'test' }))
        .rejects.toThrow('Room not found');
    });
  });

  describe('addWhiteboardStroke', () => {
    test('should add stroke to room whiteboard', async () => {
      const config = {
        roomCount: 1,
        participants: [{ userId: 'user1' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      const roomId = rooms[0].id;

      const stroke = { x: 10, y: 20, color: '#000' };
      await BreakoutRoomService.addWhiteboardStroke(roomId, stroke);

      expect(rooms[0].whiteboard).toHaveLength(1);
      expect(rooms[0].whiteboard[0]).toMatchObject(stroke);
    });
  });

  describe('getBreakoutStats', () => {
    test('should return comprehensive statistics', async () => {
      const config = {
        roomCount: 2,
        participants: [
          { userId: 'user1' }, { userId: 'user2' },
          { userId: 'user3' }
        ]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      await BreakoutRoomService.startBreakoutRooms('session1');

      // Add messages
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      rooms[0].messages.push({ text: 'Hello' });
      rooms[0].messages.push({ text: 'Hi' });

      const stats = await BreakoutRoomService.getBreakoutStats('session1');

      expect(stats.totalRooms).toBe(2);
      expect(stats.activeRooms).toBe(2);
      expect(stats.totalParticipants).toBe(3);
      expect(stats.totalMessages).toBe(2);
      expect(stats.rooms).toHaveLength(2);
    });

    test('should return null for non-existent session', async () => {
      const stats = await BreakoutRoomService.getBreakoutStats('nonexistent');
      expect(stats).toBeNull();
    });
  });

  describe('closeBreakoutRoom', () => {
    test('should close specific room and return moved participants', async () => {
      const config = {
        roomCount: 2,
        participants: [{ userId: 'user1' }, { userId: 'user2' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      
      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      const roomId = rooms[0].id;

      const result = await BreakoutRoomService.closeBreakoutRoom('session1', roomId);

      expect(result.success).toBe(true);
      expect(result.movedParticipants).toHaveLength(1);
      expect(rooms[0].isActive).toBe(false);
    });

    test('should remove user assignments', async () => {
      const config = {
        roomCount: 1,
        participants: [{ userId: 'user1' }]
      };
      await BreakoutRoomService.createBreakoutRooms('session1', config);
      
      expect(BreakoutRoomService.userAssignments.has('user1')).toBe(true);

      const rooms = BreakoutRoomService.breakoutRooms.get('session1');
      await BreakoutRoomService.closeBreakoutRoom('session1', rooms[0].id);

      expect(BreakoutRoomService.userAssignments.has('user1')).toBe(false);
    });
  });
});
