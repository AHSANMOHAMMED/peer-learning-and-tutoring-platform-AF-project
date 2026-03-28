/**
 * BreakoutRoomService - Manages breakout rooms for group lectures
 * Allows instructors to split participants into smaller discussion groups
 */
class BreakoutRoomService {
  constructor() {
    this.breakoutRooms = new Map(); // sessionId -> rooms[]
    this.userAssignments = new Map(); // userId -> roomId
  }

  /**
   * Create breakout rooms for a lecture session
   * @param {string} sessionId - Lecture session ID
   * @param {Object} config - Breakout room configuration
   * @returns {Array} Created rooms
   */
  async createBreakoutRooms(sessionId, config) {
    const { roomCount, participants, assignmentType = 'manual' } = config;
    
    const rooms = [];
    
    for (let i = 0; i < roomCount; i++) {
      const room = {
        id: `breakout_${sessionId}_${i}`,
        sessionId,
        name: `Room ${i + 1}`,
        participants: [],
        maxParticipants: Math.ceil(participants.length / roomCount),
        isActive: false,
        createdAt: new Date(),
        whiteboard: [],
        messages: [],
        host: null
      };
      rooms.push(room);
    }

    // Assign participants based on assignment type
    if (assignmentType === 'random') {
      this.assignRandomly(rooms, participants);
    } else if (assignmentType === 'ability') {
      this.assignByAbility(rooms, participants);
    } else {
      // Manual assignment - host assigns later
      rooms.forEach((room, idx) => {
        const start = idx * room.maxParticipants;
        room.participants = participants.slice(start, start + room.maxParticipants);
      });
    }

    this.breakoutRooms.set(sessionId, rooms);
    return rooms;
  }

  /**
   * Randomly assign participants to rooms
   */
  assignRandomly(rooms, participants) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    rooms.forEach((room, idx) => {
      const start = idx * room.maxParticipants;
      room.participants = shuffled.slice(start, start + room.maxParticipants);
      room.participants.forEach(p => {
        this.userAssignments.set(p.userId, room.id);
      });
    });
  }

  /**
   * Assign participants by ability level
   */
  assignByAbility(rooms, participants) {
    // Sort by some ability metric
    const sorted = [...participants].sort((a, b) => (b.level || 0) - (a.level || 0));
    
    // Distribute evenly across rooms
    sorted.forEach((participant, idx) => {
      const roomIndex = idx % rooms.length;
      rooms[roomIndex].participants.push(participant);
      this.userAssignments.set(participant.userId, rooms[roomIndex].id);
    });
  }

  /**
   * Start breakout rooms
   * @param {string} sessionId - Session ID
   */
  async startBreakoutRooms(sessionId) {
    const rooms = this.breakoutRooms.get(sessionId);
    if (!rooms) {
      throw new Error('No breakout rooms found for this session');
    }

    rooms.forEach(room => {
      room.isActive = true;
      room.startedAt = new Date();
      room.host = room.participants[0]; // First participant as host
    });

    return rooms;
  }

  /**
   * End breakout rooms and return to main session
   * @param {string} sessionId - Session ID
   */
  async endBreakoutRooms(sessionId) {
    const rooms = this.breakoutRooms.get(sessionId);
    if (!rooms) return [];

    const summary = rooms.map(room => ({
      roomId: room.id,
      name: room.name,
      participantCount: room.participants.length,
      duration: room.startedAt ? Date.now() - room.startedAt : 0,
      messages: room.messages,
      whiteboard: room.whiteboard
    }));

    rooms.forEach(room => {
      room.isActive = false;
      room.endedAt = new Date();
    });

    // Clear assignments
    rooms.forEach(room => {
      room.participants.forEach(p => {
        this.userAssignments.delete(p.userId);
      });
    });

    return summary;
  }

  /**
   * Get user's assigned breakout room
   * @param {string} userId - User ID
   * @returns {Object|null} Room assignment
   */
  async getUserRoom(userId) {
    const roomId = this.userAssignments.get(userId);
    if (!roomId) return null;

    for (const [sessionId, rooms] of this.breakoutRooms) {
      const room = rooms.find(r => r.id === roomId);
      if (room) return room;
    }

    return null;
  }

  /**
   * Move a participant between breakout rooms
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @param {string} targetRoomId - Target room ID
   */
  async moveParticipant(sessionId, userId, targetRoomId) {
    const rooms = this.breakoutRooms.get(sessionId);
    if (!rooms) throw new Error('No breakout rooms found');

    // Remove from current room
    rooms.forEach(room => {
      room.participants = room.participants.filter(p => p.userId !== userId);
    });

    // Add to target room
    const targetRoom = rooms.find(r => r.id === targetRoomId);
    if (!targetRoom) throw new Error('Target room not found');

    targetRoom.participants.push({ userId });
    this.userAssignments.set(userId, targetRoomId);

    return targetRoom;
  }

  /**
   * Broadcast message to all breakout rooms
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message to broadcast
   */
  async broadcastToAll(sessionId, message) {
    const rooms = this.breakoutRooms.get(sessionId);
    if (!rooms) return;

    rooms.forEach(room => {
      room.messages.push({
        ...message,
        isBroadcast: true,
        timestamp: new Date()
      });
    });
  }

  /**
   * Send message to specific breakout room
   * @param {string} roomId - Room ID
   * @param {Object} message - Message
   */
  async sendRoomMessage(roomId, message) {
    for (const [sessionId, rooms] of this.breakoutRooms) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        room.messages.push({
          ...message,
          timestamp: new Date()
        });
        return room;
      }
    }
    throw new Error('Room not found');
  }

  /**
   * Add whiteboard stroke to breakout room
   * @param {string} roomId - Room ID
   * @param {Object} stroke - Whiteboard stroke
   */
  async addWhiteboardStroke(roomId, stroke) {
    for (const [sessionId, rooms] of this.breakoutRooms) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        room.whiteboard.push({
          ...stroke,
          timestamp: new Date()
        });
        return room;
      }
    }
    throw new Error('Room not found');
  }

  /**
   * Get all breakout rooms for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} Breakout rooms
   */
  async getBreakoutRooms(sessionId) {
    return this.breakoutRooms.get(sessionId) || [];
  }

  /**
   * Close a specific breakout room
   * @param {string} sessionId - Session ID
   * @param {string} roomId - Room ID
   */
  async closeBreakoutRoom(sessionId, roomId) {
    const rooms = this.breakoutRooms.get(sessionId);
    if (!rooms) throw new Error('No breakout rooms found');

    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) throw new Error('Room not found');

    const room = rooms[roomIndex];
    room.isActive = false;
    room.endedAt = new Date();

    // Move participants back to main session
    room.participants.forEach(p => {
      this.userAssignments.delete(p.userId);
    });

    return { success: true, movedParticipants: room.participants };
  }

  /**
   * Get breakout room statistics
   * @param {string} sessionId - Session ID
   */
  async getBreakoutStats(sessionId) {
    const rooms = this.breakoutRooms.get(sessionId);
    if (!rooms) return null;

    return {
      totalRooms: rooms.length,
      activeRooms: rooms.filter(r => r.isActive).length,
      totalParticipants: rooms.reduce((sum, r) => sum + r.participants.length, 0),
      totalMessages: rooms.reduce((sum, r) => sum + r.messages.length, 0),
      rooms: rooms.map(r => ({
        id: r.id,
        name: r.name,
        participantCount: r.participants.length,
        messageCount: r.messages.length,
        isActive: r.isActive
      }))
    };
  }
}

module.exports = new BreakoutRoomService();
