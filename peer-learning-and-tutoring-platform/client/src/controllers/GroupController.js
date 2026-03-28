import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

class GroupController {
  constructor() {
    this.state = {
      groupRooms: [],
      currentRoom: null,
      userRooms: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    };
    
    this.listeners = new Map();
  }

  /**
   * Create a new group room
   * @param {Object} roomData - Room creation data
   * @returns {Promise<Object>} Created group room
   */
  async createGroupRoom(roomData) {
    try {
      this.setLoading(true);
      
      const response = await api.post('/api/groups', roomData);
      
      if (response.data.success) {
        const newRoom = response.data.data.groupRoom;
        this.setState(prev => ({
          groupRooms: [newRoom, ...prev.groupRooms],
          userRooms: [newRoom, ...prev.userRooms]
        }));
        toast.success('Group room created successfully!');
        return newRoom;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error creating group room:', error);
      toast.error(error.response?.data?.message || 'Failed to create group room');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get list of available group rooms
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Group rooms with pagination
   */
  async getGroupRooms(filters = {}) {
    try {
      this.setLoading(true);
      
      const response = await api.get('/api/groups', { params: filters });
      
      if (response.data.success) {
        const { groupRooms, pagination } = response.data.data;
        this.setState({ 
          groupRooms,
          pagination: {
            ...this.state.pagination,
            ...pagination
          }
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error getting group rooms:', error);
      toast.error(error.response?.data?.message || 'Failed to get group rooms');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get detailed information about a specific group room
   * @param {String} roomId - Room ID
   * @returns {Promise<Object>} Group room details
   */
  async getGroupRoomDetails(roomId) {
    try {
      this.setLoading(true);
      
      const response = await api.get(`/api/groups/${roomId}`);
      
      if (response.data.success) {
        const room = response.data.data.groupRoom;
        this.setState({ currentRoom: room });
        return room;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error getting group room details:', error);
      toast.error(error.response?.data?.message || 'Failed to get room details');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Join a group room
   * @param {String} roomId - Room ID
   * @param {String} message - Optional join message
   * @returns {Promise<Object>} Join result
   */
  async joinGroupRoom(roomId, message = '') {
    try {
      this.setLoading(true);
      
      const response = await api.post(`/api/groups/${roomId}/join`, { message });
      
      if (response.data.success) {
        const { groupRoom, status } = response.data.data;
        
        if (status === 'joined') {
          this.updateRoomInState(groupRoom);
          this.setState(prev => ({
            userRooms: prev.userRooms.some(room => room._id === roomId)
              ? prev.userRooms
              : [...prev.userRooms, groupRoom]
          }));
          toast.success('Joined group room successfully!');
        } else {
          toast.info('Join request sent to host for approval');
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error joining group room:', error);
      toast.error(error.response?.data?.message || 'Failed to join group room');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Leave a group room
   * @param {String} roomId - Room ID
   * @returns {Promise<Object>} Updated group room
   */
  async leaveGroupRoom(roomId) {
    try {
      this.setLoading(true);
      
      const response = await api.delete(`/api/groups/${roomId}/leave`);
      
      if (response.data.success) {
        const updatedRoom = response.data.data.groupRoom;
        this.updateRoomInState(updatedRoom);
        this.setState(prev => ({
          userRooms: prev.userRooms.filter(room => room._id !== roomId),
          currentRoom: prev.currentRoom?._id === roomId ? null : prev.currentRoom
        }));
        toast.success('Left group room successfully');
        return updatedRoom;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error leaving group room:', error);
      toast.error(error.response?.data?.message || 'Failed to leave group room');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Approve or reject pending participant
   * @param {String} roomId - Room ID
   * @param {String} participantId - Participant ID
   * @param {Boolean} approve - Approve or reject
   * @returns {Promise<Object>} Updated group room
   */
  async handlePendingParticipant(roomId, participantId, approve = true) {
    try {
      this.setLoading(true);
      
      const response = await api.put(`/api/groups/${roomId}/approve`, {
        participantId,
        approve
      });
      
      if (response.data.success) {
        const updatedRoom = response.data.data.groupRoom;
        this.updateRoomInState(updatedRoom);
        toast.success(`Participant ${approve ? 'approved' : 'rejected'} successfully`);
        return updatedRoom;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error handling pending participant:', error);
      toast.error(error.response?.data?.message || 'Failed to handle participant request');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Add message to group room chat
   * @param {String} roomId - Room ID
   * @param {String} message - Message content
   * @param {String} type - Message type
   * @returns {Promise<Object>} Added message
   */
  async addChatMessage(roomId, message, type = 'text') {
    try {
      const response = await api.post(`/api/groups/${roomId}/chat`, {
        message,
        type
      });
      
      if (response.data.success) {
        const addedMessage = response.data.data.message;
        this.addMessageToCurrentRoom(addedMessage);
        return addedMessage;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding chat message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      throw error;
    }
  }

  /**
   * Update room settings
   * @param {String} roomId - Room ID
   * @param {Object} settings - New settings
   * @returns {Promise<Object>} Updated group room
   */
  async updateRoomSettings(roomId, settings) {
    try {
      this.setLoading(true);
      
      const response = await api.put(`/api/groups/${roomId}/settings`, settings);
      
      if (response.data.success) {
        const updatedRoom = response.data.data.groupRoom;
        this.updateRoomInState(updatedRoom);
        toast.success('Room settings updated successfully');
        return updatedRoom;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating room settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update room settings');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's group rooms
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} User's group rooms
   */
  async getUserGroupRooms(filters = {}) {
    try {
      this.setLoading(true);
      
      const response = await api.get('/api/groups/my-rooms', { params: filters });
      
      if (response.data.success) {
        const { groupRooms, pagination } = response.data.data;
        this.setState({ 
          userRooms: groupRooms,
          pagination: {
            ...this.state.pagination,
            ...pagination
          }
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error getting user group rooms:', error);
      toast.error(error.response?.data?.message || 'Failed to get user group rooms');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Delete/close a group room
   * @param {String} roomId - Room ID
   * @returns {Promise<Object>} Updated group room
   */
  async deleteGroupRoom(roomId) {
    try {
      this.setLoading(true);
      
      const response = await api.delete(`/api/groups/${roomId}`);
      
      if (response.data.success) {
        const updatedRoom = response.data.data.groupRoom;
        this.updateRoomInState(updatedRoom);
        this.setState(prev => ({
          userRooms: prev.userRooms.filter(room => room._id !== roomId),
          currentRoom: prev.currentRoom?._id === roomId ? null : prev.currentRoom
        }));
        toast.success('Group room closed successfully');
        return updatedRoom;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting group room:', error);
      toast.error(error.response?.data?.message || 'Failed to close group room');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Filter group rooms by criteria
   * @param {Array} rooms - Array of rooms
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered rooms
   */
  filterGroupRooms(rooms, filters) {
    return rooms.filter(room => {
      if (filters.subject && room.subject !== filters.subject) return false;
      if (filters.grade && room.grade !== filters.grade) return false;
      if (filters.type && room.type !== filters.type) return false;
      if (filters.isPublic !== undefined && room.isPublic !== filters.isPublic) return false;
      if (filters.minCapacity && room.maxCapacity < filters.minCapacity) return false;
      if (filters.maxCapacity && room.maxCapacity > filters.maxCapacity) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return room.title.toLowerCase().includes(searchLower) || 
               room.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }

  /**
   * Sort group rooms by criteria
   * @param {Array} rooms - Array of rooms
   * @param {String} sortBy - Sort criteria
   * @param {String} order - Sort order
   * @returns {Array} Sorted rooms
   */
  sortGroupRooms(rooms, sortBy = 'createdAt', order = 'desc') {
    return [...rooms].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'participants':
          comparison = a.participants.length - b.participants.length;
          break;
        case 'capacity':
          comparison = a.maxCapacity - b.maxCapacity;
          break;
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get room type display text
   * @param {String} type - Room type
   * @returns {String} Display text
   */
  getRoomTypeText(type) {
    const types = {
      study_group: 'Study Group',
      homework_help: 'Homework Help',
      exam_prep: 'Exam Preparation',
      project_collaboration: 'Project Collaboration',
      general_discussion: 'General Discussion'
    };
    
    return types[type] || 'Study Group';
  }

  /**
   * Get room type color
   * @param {String} type - Room type
   * @returns {String} Color class
   */
  getRoomTypeColor(type) {
    const colors = {
      study_group: 'bg-blue-100 text-blue-800',
      homework_help: 'bg-green-100 text-green-800',
      exam_prep: 'bg-purple-100 text-purple-800',
      project_collaboration: 'bg-yellow-100 text-yellow-800',
      general_discussion: 'bg-gray-100 text-gray-800'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Check if user is host of room
   * @param {Object} room - Room object
   * @param {String} userId - User ID
   * @returns {Boolean} Is host
   */
  isHost(room, userId) {
    return room.host?._id === userId || room.host === userId;
  }

  /**
   * Check if user is moderator of room
   * @param {Object} room - Room object
   * @param {String} userId - User ID
   * @returns {Boolean} Is moderator
   */
  isModerator(room, userId) {
    return this.isHost(room, userId) || 
           room.participants.some(p => p.user._id === userId && p.role === 'moderator');
  }

  /**
   * Update room in state
   * @param {Object} updatedRoom - Updated room
   */
  updateRoomInState(updatedRoom) {
    this.setState(prev => ({
      groupRooms: prev.groupRooms.map(room => 
        room._id === updatedRoom._id ? updatedRoom : room
      ),
      userRooms: prev.userRooms.map(room => 
        room._id === updatedRoom._id ? updatedRoom : room
      ),
      currentRoom: prev.currentRoom?._id === updatedRoom._id 
        ? updatedRoom 
        : prev.currentRoom
    }));
  }

  /**
   * Add message to current room
   * @param {Object} message - Message object
   */
  addMessageToCurrentRoom(message) {
    this.setState(prev => ({
      currentRoom: prev.currentRoom ? {
        ...prev.currentRoom,
        chat: [...prev.currentRoom.chat, message]
      } : null
    }));
  }

  /**
   * Set loading state
   * @param {Boolean} loading - Loading state
   */
  setLoading(loading) {
    this.setState({ loading });
  }

  /**
   * Set error state
   * @param {String} error - Error message
   */
  setError(error) {
    this.setState({ error });
  }

  /**
   * Update state
   * @param {Object} newState - New state
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Subscribe to state changes
   * @param {String} key - Listener key
   * @param {Function} callback - Callback function
   */
  subscribe(key, callback) {
    this.listeners.set(key, callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {String} key - Listener key
   */
  unsubscribe(key) {
    this.listeners.delete(key);
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }

  /**
   * Clear all data
   */
  clear() {
    this.setState({
      groupRooms: [],
      currentRoom: null,
      userRooms: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    });
  }
}

// Create singleton instance
const groupController = new GroupController();

export default groupController;
