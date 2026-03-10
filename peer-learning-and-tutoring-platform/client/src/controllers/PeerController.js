import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

class PeerController {
  constructor() {
    this.state = {
      matches: [],
      sessions: [],
      currentSession: null,
      loading: false,
      error: null
    };
    
    this.listeners = new Map();
  }

  /**
   * Request peer help and get potential matches
   * @param {Object} requestData - Help request data
   * @returns {Promise<Array>} Array of potential matches
   */
  async requestHelp(requestData) {
    try {
      this.setLoading(true);
      
      const response = await api.post('/api/peer/request-help', requestData);
      
      if (response.data.success) {
        this.setState({ matches: response.data.data.matches });
        toast.success('Found potential peer matches!');
        return response.data.data.matches;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error requesting peer help:', error);
      toast.error(error.response?.data?.message || 'Failed to find peer matches');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get peer matches for a help request
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Array of matches
   */
  async getMatches(filters) {
    try {
      this.setLoading(true);
      
      const response = await api.get('/api/peer/matches', { params: filters });
      
      if (response.data.success) {
        this.setState({ matches: response.data.data.matches });
        return response.data.data.matches;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error getting peer matches:', error);
      toast.error(error.response?.data?.message || 'Failed to get peer matches');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Create a peer session with matched helper
   * @param {Object} sessionData - Session creation data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      this.setLoading(true);
      
      const response = await api.post('/api/peer/sessions', sessionData);
      
      if (response.data.success) {
        const newSession = response.data.data.peerSession;
        this.setState(prev => ({
          sessions: [...prev.sessions, newSession],
          currentSession: newSession
        }));
        toast.success('Peer session created successfully!');
        return newSession;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error creating peer session:', error);
      toast.error(error.response?.data?.message || 'Failed to create peer session');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Accept a peer session request
   * @param {String} sessionId - Session ID
   * @param {String} message - Optional acceptance message
   * @returns {Promise<Object>} Updated session
   */
  async acceptSession(sessionId, message = '') {
    try {
      this.setLoading(true);
      
      const response = await api.put(`/api/peer/sessions/${sessionId}/accept`, { message });
      
      if (response.data.success) {
        const updatedSession = response.data.data.peerSession;
        this.updateSessionInState(updatedSession);
        toast.success('Peer session accepted!');
        return updatedSession;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error accepting peer session:', error);
      toast.error(error.response?.data?.message || 'Failed to accept peer session');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Complete a peer session
   * @param {String} sessionId - Session ID
   * @param {Object} feedback - Optional feedback
   * @returns {Promise<Object>} Updated session
   */
  async completeSession(sessionId, feedback = null) {
    try {
      this.setLoading(true);
      
      const response = await api.put(`/api/peer/sessions/${sessionId}/complete`, { feedback });
      
      if (response.data.success) {
        const updatedSession = response.data.data.peerSession;
        this.updateSessionInState(updatedSession);
        toast.success('Peer session completed!');
        return updatedSession;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error completing peer session:', error);
      toast.error(error.response?.data?.message || 'Failed to complete peer session');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's peer sessions
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} User sessions
   */
  async getUserSessions(filters = {}) {
    try {
      this.setLoading(true);
      
      const response = await api.get('/api/peer/sessions', { params: filters });
      
      if (response.data.success) {
        this.setState({ sessions: response.data.data.sessions });
        return response.data.data.sessions;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error getting user sessions:', error);
      toast.error(error.response?.data?.message || 'Failed to get sessions');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get specific peer session details
   * @param {String} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async getSessionDetails(sessionId) {
    try {
      this.setLoading(true);
      
      const response = await api.get(`/api/peer/sessions/${sessionId}`);
      
      if (response.data.success) {
        const session = response.data.data.peerSession;
        this.setState({ currentSession: session });
        return session;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error getting session details:', error);
      toast.error(error.response?.data?.message || 'Failed to get session details');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Filter matches by criteria
   * @param {Array} matches - Array of matches
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered matches
   */
  filterMatches(matches, filters) {
    return matches.filter(match => {
      if (filters.minScore && match.score < filters.minScore) return false;
      if (filters.subject && !match.reputation.subjects.includes(filters.subject)) return false;
      if (filters.grade && match.reputation.grade !== filters.grade) return false;
      if (filters.minReputation && match.reputation.reputation < filters.minReputation) return false;
      if (filters.available !== undefined && match.available !== filters.available) return false;
      
      return true;
    });
  }

  /**
   * Sort matches by criteria
   * @param {Array} matches - Array of matches
   * @param {String} sortBy - Sort criteria (score, reputation, sessions)
   * @param {String} order - Sort order (asc, desc)
   * @returns {Array} Sorted matches
   */
  sortMatches(matches, sortBy = 'score', order = 'desc') {
    return [...matches].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'reputation':
          comparison = a.reputation.reputation - b.reputation.reputation;
          break;
        case 'sessions':
          comparison = a.reputation.totalSessions - b.reputation.totalSessions;
          break;
        case 'rating':
          comparison = a.reputation.averageRating - b.reputation.averageRating;
          break;
        default:
          comparison = a.score - b.score;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Calculate match compatibility score breakdown
   * @param {Object} match - Match object
   * @returns {Object} Detailed breakdown
   */
  getMatchBreakdown(match) {
    return {
      overall: Math.round(match.score * 100),
      subject: Math.round(match.breakdown.subject * 100),
      grade: Math.round(match.breakdown.grade * 100),
      reputation: Math.round(match.breakdown.reputation * 100),
      availability: Math.round(match.breakdown.availability * 100),
      compatibility: Math.round(match.breakdown.compatibility * 100)
    };
  }

  /**
   * Get session status color
   * @param {String} status - Session status
   * @returns {String} Color class
   */
  getSessionStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      matched: 'text-blue-600 bg-blue-100',
      active: 'text-green-600 bg-green-100',
      completed: 'text-gray-600 bg-gray-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Get session status text
   * @param {String} status - Session status
   * @returns {String} Status text
   */
  getSessionStatusText(status) {
    const texts = {
      pending: 'Pending Match',
      matched: 'Matched',
      active: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    
    return texts[status] || 'Unknown';
  }

  /**
   * Update session in state
   * @param {Object} updatedSession - Updated session
   */
  updateSessionInState(updatedSession) {
    this.setState(prev => ({
      sessions: prev.sessions.map(session => 
        session._id === updatedSession._id ? updatedSession : session
      ),
      currentSession: prev.currentSession?._id === updatedSession._id 
        ? updatedSession 
        : prev.currentSession
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
      matches: [],
      sessions: [],
      currentSession: null,
      loading: false,
      error: null
    });
  }
}

// Create singleton instance
const peerController = new PeerController();

export default peerController;
