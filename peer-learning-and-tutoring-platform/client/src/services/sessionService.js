import apiService from './api';

/**
 * SessionService - Handles all session-related API calls
 */
export const sessionService = {
  /**
   * Get session details by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise} Session data
   */
  async getSessionDetails(sessionId) {
    return await apiService.get(`/api/sessions/${sessionId}`);
  },

  /**
   * Start a new session
   * @param {string} sessionId - Session ID
   * @param {Object} config - Session configuration
   * @returns {Promise} Updated session data
   */
  async startSession(sessionId, config = {}) {
    return await apiService.post(`/api/sessions/${sessionId}/start`, { config });
  },

  /**
   * Join an existing session
   * @param {string} sessionId - Session ID
   * @returns {Promise} Updated session data
   */
  async joinSession(sessionId) {
    return await apiService.post(`/api/sessions/${sessionId}/join`);
  },

  /**
   * Leave a session
   * @param {string} sessionId - Session ID
   * @param {string} connectionQuality - Connection quality rating
   * @returns {Promise} Response data
   */
  async leaveSession(sessionId, connectionQuality = 'good') {
    return await apiService.post(`/api/sessions/${sessionId}/leave`, { 
      connectionQuality 
    });
  },

  /**
   * End a session
   * @param {string} sessionId - Session ID
   * @param {Object} analytics - Session analytics data
   * @returns {Promise} Response data
   */
  async endSession(sessionId, analytics = {}) {
    return await apiService.post(`/api/sessions/${sessionId}/end`, { analytics });
  },

  /**
   * Start recording a session
   * @param {string} sessionId - Session ID
   * @returns {Promise} Response data
   */
  async startRecording(sessionId) {
    return await apiService.post(`/api/sessions/${sessionId}/recording/start`);
  },

  /**
   * Stop recording a session
   * @param {string} sessionId - Session ID
   * @returns {Promise} Response data
   */
  async stopRecording(sessionId) {
    return await apiService.post(`/api/sessions/${sessionId}/recording/stop`);
  },

  /**
   * Report a technical issue during session
   * @param {string} sessionId - Session ID
   * @param {string} issueType - Type of technical issue
   * @returns {Promise} Response data
   */
  async reportIssue(sessionId, issueType) {
    return await apiService.post(`/api/sessions/${sessionId}/issues`, { 
      issueType 
    });
  },

  /**
   * Submit session feedback
   * @param {string} sessionId - Session ID
   * @param {Object} feedback - Feedback data
   * @returns {Promise} Response data
   */
  async submitFeedback(sessionId, feedback) {
    return await apiService.post(`/api/sessions/${sessionId}/feedback`, feedback);
  },

  /**
   * Get session recording
   * @param {string} sessionId - Session ID
   * @returns {Promise} Recording data
   */
  async getRecording(sessionId) {
    return await apiService.get(`/api/sessions/${sessionId}/recording`);
  },

  /**
   * Update session analytics
   * @param {string} sessionId - Session ID
   * @param {Object} analytics - Analytics data to update
   * @returns {Promise} Response data
   */
  async updateAnalytics(sessionId, analytics) {
    return await apiService.patch(`/api/sessions/${sessionId}/analytics`, analytics);
  },

  /**
   * Send chat message in session
   * @param {string} sessionId - Session ID
   * @param {string} message - Message content
   * @returns {Promise} Response data
   */
  async sendChatMessage(sessionId, message) {
    return await apiService.post(`/api/sessions/${sessionId}/chat`, { message });
  },

  /**
   * Get session chat messages
   * @param {string} sessionId - Session ID
   * @returns {Promise} Chat messages
   */
  async getChatMessages(sessionId) {
    return await apiService.get(`/api/sessions/${sessionId}/chat`);
  }
};

export default sessionService;
