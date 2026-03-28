import sessionService from '../services/sessionService';

/**
 * SessionViewModel - Manages session state and business logic
 * Follows Observer pattern for reactive state updates
 */
export class SessionViewModel {
  constructor() {
    this.session = null;
    this.isLoading = false;
    this.error = null;
    this.isInSession = false;
    this.isRecording = false;
    this.connectionQuality = 'good';
    this.sessionTime = 0;
    this.technicalIssues = [];
    this.chatMessages = [];
    this.listeners = [];
    this.sessionTimer = null;
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Get current state
  getState() {
    return {
      session: this.session,
      isLoading: this.isLoading,
      error: this.error,
      isInSession: this.isInSession,
      isRecording: this.isRecording,
      connectionQuality: this.connectionQuality,
      sessionTime: this.sessionTime,
      technicalIssues: this.technicalIssues,
      chatMessages: this.chatMessages
    };
  }

  // Set loading state
  setLoading(loading) {
    this.isLoading = loading;
    this.error = null;
    this.notify();
  }

  // Set error state
  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notify();
  }

  // Set session data
  setSession(sessionData) {
    this.session = sessionData;
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Update session partially
  updateSession(partialData) {
    this.session = { ...this.session, ...partialData };
    this.notify();
  }

  // Start session timer
  startTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    
    this.sessionTimer = setInterval(() => {
      if (this.isInSession) {
        this.sessionTime += 1;
        this.notify();
      }
    }, 1000);
  }

  // Stop session timer
  stopTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Fetch session details
  async fetchSessionDetails(sessionId) {
    this.setLoading(true);
    try {
      const response = await sessionService.getSessionDetails(sessionId);
      if (response.success) {
        this.setSession(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to load session');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to load session');
      return { success: false, message: error.message };
    }
  }

  // Start session
  async startSession(sessionId, config = {}) {
    this.setLoading(true);
    try {
      const response = await sessionService.startSession(sessionId, config);
      if (response.success) {
        this.updateSession(response.data);
        this.isInSession = true;
        this.isLoading = false;
        this.startTimer();
        this.notify();
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to start session');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to start session');
      return { success: false, message: error.message };
    }
  }

  // Join session
  async joinSession(sessionId) {
    this.setLoading(true);
    try {
      const response = await sessionService.joinSession(sessionId);
      if (response.success) {
        this.updateSession(response.data);
        this.isInSession = true;
        this.isLoading = false;
        this.startTimer();
        this.notify();
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to join session');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to join session');
      return { success: false, message: error.message };
    }
  }

  // Leave session
  async leaveSession(sessionId) {
    this.setLoading(true);
    try {
      const response = await sessionService.leaveSession(sessionId, this.connectionQuality);
      if (response.success) {
        this.isInSession = false;
        this.stopTimer();
        this.isLoading = false;
        this.notify();
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to leave session');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to leave session');
      return { success: false, message: error.message };
    }
  }

  // End session
  async endSession(sessionId) {
    this.setLoading(true);
    try {
      const analytics = {
        totalDuration: this.sessionTime,
        chatMessagesCount: this.chatMessages.length,
        connectionIssues: this.technicalIssues.length
      };

      const response = await sessionService.endSession(sessionId, analytics);
      if (response.success) {
        this.isInSession = false;
        this.stopTimer();
        this.isLoading = false;
        this.notify();
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to end session');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to end session');
      return { success: false, message: error.message };
    }
  }

  // Toggle recording
  async toggleRecording(sessionId) {
    this.setLoading(true);
    try {
      const response = this.isRecording
        ? await sessionService.stopRecording(sessionId)
        : await sessionService.startRecording(sessionId);

      if (response.success) {
        this.isRecording = !this.isRecording;
        this.isLoading = false;
        this.notify();
        return { success: true, isRecording: this.isRecording };
      } else {
        this.setError(response.message || 'Failed to toggle recording');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to toggle recording');
      return { success: false, message: error.message };
    }
  }

  // Report technical issue
  async reportTechnicalIssue(sessionId, issueType) {
    try {
      const response = await sessionService.reportIssue(sessionId, issueType);
      if (response.success) {
        if (!this.technicalIssues.includes(issueType)) {
          this.technicalIssues.push(issueType);
          this.notify();
        }
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update connection quality
  setConnectionQuality(quality) {
    this.connectionQuality = quality;
    this.notify();
  }

  // Send chat message
  async sendChatMessage(sessionId, message) {
    try {
      const response = await sessionService.sendChatMessage(sessionId, message);
      if (response.success) {
        this.chatMessages.push({
          message,
          timestamp: new Date(),
          sender: 'me'
        });
        this.notify();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Fetch chat messages
  async fetchChatMessages(sessionId) {
    try {
      const response = await sessionService.getChatMessages(sessionId);
      if (response.success) {
        this.chatMessages = response.data;
        this.notify();
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Submit session feedback
  async submitFeedback(sessionId, feedback) {
    this.setLoading(true);
    try {
      const response = await sessionService.submitFeedback(sessionId, feedback);
      if (response.success) {
        this.isLoading = false;
        this.notify();
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to submit feedback');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to submit feedback');
      return { success: false, message: error.message };
    }
  }

  // Format session time
  formatTime() {
    const hours = Math.floor(this.sessionTime / 3600);
    const minutes = Math.floor((this.sessionTime % 3600) / 60);
    const seconds = this.sessionTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Cleanup
  cleanup() {
    this.stopTimer();
    this.listeners = [];
  }
}

export default SessionViewModel;
