const GroupRoom = require('../models/GroupRoom');
const User = require('../models/User');

class GroupService {
  constructor() {
    this.defaultCapacity = 10;
    this.maxCapacity = 50;
  }

  /**
   * Create a new group room
   * @param {Object} roomData - Room creation data
   * @param {String} roomData.host - Host user ID
   * @param {String} roomData.title - Room title
   * @param {String} roomData.description - Room description
   * @param {String} roomData.subject - Subject
   * @param {String} roomData.grade - Grade level
   * @param {Number} roomData.maxCapacity - Maximum capacity
   * @param {Array} roomData.tags - Tags
   * @param {Object} roomData.schedule - Schedule details
   * @returns {Object} Created group room
   */
  async createGroupRoom(roomData) {
    try {
      const { host, title, description, subject, grade, maxCapacity, tags, schedule, type } = roomData;

      // Validate host
      const hostUser = await User.findById(host);
      if (!hostUser) {
        throw new Error('Host user not found');
      }

      // Validate capacity
      const capacity = Math.min(maxCapacity || this.defaultCapacity, this.maxCapacity);
      if (capacity < 3) {
        throw new Error('Group room must have minimum capacity of 3');
      }

      const groupRoom = new GroupRoom({
        host,
        title: title.trim(),
        description: description.trim(),
        subject,
        grade,
        maxCapacity: capacity,
        tags: tags || [],
        schedule: schedule || {},
        type: type || 'study_group',
        participants: [{ user: host, role: 'host' }]
      });

      await groupRoom.save();
      
      // Populate host details for response
      await groupRoom.populate('host', 'name email profile');
      
      return groupRoom;

    } catch (error) {
      console.error('Error creating group room:', error);
      throw error;
    }
  }

  /**
   * Get list of available group rooms with filters
   * @param {Object} filters - Search filters
   * @param {String} filters.subject - Filter by subject
   * @param {String} filters.grade - Filter by grade
   * @param {Array} filters.tags - Filter by tags
   * @param {String} filters.type - Filter by room type
   * @param {Number} filters.page - Page number
   * @param {Number} filters.limit - Results per page
   * @returns {Object} Paginated list of group rooms
   */
  async getGroupRooms(filters = {}) {
    try {
      const {
        subject,
        grade,
        tags,
        type,
        page = 1,
        limit = 20,
        search
      } = filters;

      const query = {
        isActive: true,
        isPublic: true
      };

      // Apply filters
      if (subject) query.subject = subject;
      if (grade) query.grade = grade;
      if (type) query.type = type;
      if (tags && tags.length > 0) query.tags = { $in: tags };
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const groupRooms = await GroupRoom.find(query)
        .populate('host', 'name email profile')
        .populate('participants.user', 'name email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await GroupRoom.countDocuments(query);

      return {
        groupRooms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting group rooms:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific group room
   * @param {String} roomId - Room ID
   * @param {String} userId - User ID requesting details
   * @returns {Object} Group room details
   */
  async getGroupRoomDetails(roomId, userId) {
    try {
      const groupRoom = await GroupRoom.findById(roomId)
        .populate('host', 'name email profile')
        .populate('participants.user', 'name email profile')
        .populate('pendingParticipants.user', 'name email profile');

      if (!groupRoom) {
        throw new Error('Group room not found');
      }

      // Check if room is accessible to user
      if (!groupRoom.isPublic && !groupRoom.isParticipant(userId) && !groupRoom.isHost(userId)) {
        throw new Error('Access denied to private room');
      }

      return groupRoom;

    } catch (error) {
      console.error('Error getting group room details:', error);
      throw error;
    }
  }

  /**
   * Join a group room
   * @param {String} roomId - Room ID
   * @param {String} userId - User ID joining
   * @param {String} message - Optional join message
   * @returns {Object} Updated group room
   */
  async joinGroupRoom(roomId, userId, message = '') {
    try {
      const groupRoom = await GroupRoom.findById(roomId);
      
      if (!groupRoom) {
        throw new Error('Group room not found');
      }

      if (!groupRoom.isActive) {
        throw new Error('Group room is not active');
      }

      if (groupRoom.isFull()) {
        throw new Error('Group room is full');
      }

      if (groupRoom.isParticipant(userId)) {
        throw new Error('User is already a participant');
      }

      // Check if approval is required
      if (groupRoom.requiresApproval && !groupRoom.isHost(userId)) {
        // Add to pending participants
        groupRoom.pendingParticipants.push({
          user: userId,
          message
        });
        
        await groupRoom.save();
        
        return {
          groupRoom,
          status: 'pending_approval',
          message: 'Join request sent to host for approval'
        };
      }

      // Add participant directly
      const added = groupRoom.addParticipant(userId);
      if (!added) {
        throw new Error('Failed to add participant');
      }

      // Add system message to chat
      const user = await User.findById(userId, 'name');
      groupRoom.addMessage(
        `${user.name} joined the group room`,
        userId,
        'system'
      );

      await groupRoom.save();
      
      // Populate for response
      await groupRoom.populate('participants.user', 'name email profile');
      
      return {
        groupRoom,
        status: 'joined',
        message: 'Successfully joined group room'
      };

    } catch (error) {
      console.error('Error joining group room:', error);
      throw error;
    }
  }

  /**
   * Leave a group room
   * @param {String} roomId - Room ID
   * @param {String} userId - User ID leaving
   * @returns {Object} Updated group room
   */
  async leaveGroupRoom(roomId, userId) {
    try {
      const groupRoom = await GroupRoom.findById(roomId);
      
      if (!groupRoom) {
        throw new Error('Group room not found');
      }

      if (!groupRoom.isParticipant(userId)) {
        throw new Error('User is not a participant');
      }

      // Host cannot leave if there are other participants (must transfer or close)
      if (groupRoom.isHost(userId) && groupRoom.participants.length > 1) {
        throw new Error('Host must transfer ownership or close the room before leaving');
      }

      const removed = groupRoom.removeParticipant(userId);
      if (!removed) {
        throw new Error('Failed to remove participant');
      }

      // Add system message
      const user = await User.findById(userId, 'name');
      groupRoom.addMessage(
        `${user.name} left the group room`,
        userId,
        'system'
      );

      // If host left and was the only participant, deactivate the room
      if (groupRoom.isHost(userId) && groupRoom.participants.length === 0) {
        groupRoom.isActive = false;
      }

      await groupRoom.save();
      
      return groupRoom;

    } catch (error) {
      console.error('Error leaving group room:', error);
      throw error;
    }
  }

  /**
   * Approve or reject pending participant
   * @param {String} roomId - Room ID
   * @param {String} hostId - Host user ID
   * @param {String} participantId - Participant user ID
   * @param {Boolean} approve - Approve or reject
   * @returns {Object} Updated group room
   */
  async handlePendingParticipant(roomId, hostId, participantId, approve = true) {
    try {
      const groupRoom = await GroupRoom.findById(roomId);
      
      if (!groupRoom) {
        throw new Error('Group room not found');
      }

      if (!groupRoom.isHost(hostId)) {
        throw new Error('Only host can approve participants');
      }

      const pendingIndex = groupRoom.pendingParticipants.findIndex(
        p => p.user.toString() === participantId
      );

      if (pendingIndex === -1) {
        throw new Error('Pending participant not found');
      }

      const pendingParticipant = groupRoom.pendingParticipants[pendingIndex];
      
      if (approve) {
        // Check if room is still available
        if (groupRoom.isFull()) {
          throw new Error('Room is now full');
        }

        // Add participant
        const added = groupRoom.addParticipant(participantId);
        if (!added) {
          throw new Error('Failed to add participant');
        }

        // Add system message
        const user = await User.findById(participantId, 'name');
        groupRoom.addMessage(
          `${user.name} was approved and joined the group room`,
          hostId,
          'system'
        );
      }

      // Remove from pending
      groupRoom.pendingParticipants.splice(pendingIndex, 1);
      
      await groupRoom.save();
      
      return groupRoom;

    } catch (error) {
      console.error('Error handling pending participant:', error);
      throw error;
    }
  }

  /**
   * Add message to group room chat
   * @param {String} roomId - Room ID
   * @param {String} userId - User ID sending message
   * @param {String} message - Message content
   * @param {String} type - Message type (text, file, system)
   * @returns {Object} Added message
   */
  async addChatMessage(roomId, userId, message, type = 'text') {
    try {
      const groupRoom = await GroupRoom.findById(roomId);
      
      if (!groupRoom) {
        throw new Error('Group room not found');
      }

      if (!groupRoom.isParticipant(userId)) {
        throw new Error('User is not a participant');
      }

      const addedMessage = groupRoom.addMessage(message, userId, type);
      await groupRoom.save();
      
      return addedMessage;

    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  }

  /**
   * Update room settings
   * @param {String} roomId - Room ID
   * @param {String} userId - User ID making changes
   * @param {Object} settings - New settings
   * @returns {Object} Updated group room
   */
  async updateRoomSettings(roomId, userId, settings) {
    try {
      const groupRoom = await GroupRoom.findById(roomId);
      
      if (!groupRoom) {
        throw new Error('Group room not found');
      }

      if (!groupRoom.isModerator(userId)) {
        throw new Error('Only host or moderators can update settings');
      }

      // Update allowed settings
      const allowedSettings = [
        'allowScreenShare', 'allowFileShare', 'allowVoiceChat', 
        'allowVideoChat', 'recordSession', 'enableWhiteboard'
      ];

      allowedSettings.forEach(setting => {
        if (settings.hasOwnProperty(setting)) {
          groupRoom.settings[setting] = settings[setting];
        }
      });

      await groupRoom.save();
      
      return groupRoom;

    } catch (error) {
      console.error('Error updating room settings:', error);
      throw error;
    }
  }

  /**
   * Get user's group rooms
   * @param {String} userId - User ID
   * @param {Object} filters - Filters
   * @returns {Object} User's group rooms
   */
  async getUserGroupRooms(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status = 'active' } = filters;
      const skip = (page - 1) * limit;

      const query = {
        'participants.user': userId
      };

      if (status === 'active') {
        query.isActive = true;
      }

      const groupRooms = await GroupRoom.find(query)
        .populate('host', 'name email profile')
        .populate('participants.user', 'name email profile')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await GroupRoom.countDocuments(query);

      return {
        groupRooms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting user group rooms:', error);
      throw error;
    }
  }
}

module.exports = new GroupService();
