import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as sessionService from '../services/sessionService';

/**
 * Tutoring Controller Hook
 * Handles: Schedule sessions, accept/reject requests, join meetings, submit feedback
 * Returns: data state, loading, error, and session management functions
 */
export const useTutoringController = () => {
  const [data, setData] = useState({
    sessions: [],        // My sessions (student/tutor)
    session: null,       // Current session detail
    requests: [],        // Tutor: incoming requests
    upcomingSessions: [],// Quick stats
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all sessions for current user
   * @param {Object} filters - { status, role, subject, date }
   */
  const list = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.getSessions(filters);
      if (response.success) {
        setData(prev => ({ ...prev, sessions: response.data?.sessions || [] }));
        return response.data?.sessions || [];
      } else {
        throw new Error(response.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching sessions';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single session by ID
   * @param {string} id
   */
  const getById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.getSessionById(id);
      if (response.success) {
        setData(prev => ({ ...prev, session: response.data?.session || null }));
        return response.data?.session || null;
      } else {
        throw new Error(response.message || 'Failed to fetch session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching session';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * STUDENT: Schedule/request new tutoring session
   * @param {Object} bookingData - { tutorId, subject, date, startTime, endTime, description }
   */
  const schedule = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.createSession(bookingData);
      if (response.success) {
        const newSession = response.data?.session;
        setData(prev => ({
          ...prev,
          sessions: [newSession, ...prev.sessions],
        }));
        toast.success('Session requested! Waiting for tutor confirmation.');
        return newSession;
      } else {
        throw new Error(response.message || 'Failed to schedule session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error scheduling session';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * TUTOR: Get incoming session requests (status = pending)
   */
  const getRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.getSessionRequests();
      if (response.success) {
        setData(prev => ({ ...prev, requests: response.data?.requests || [] }));
        return response.data?.requests || [];
      } else {
        throw new Error(response.message || 'Failed to fetch requests');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching requests';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * TUTOR: Accept session request
   * @param {string} id
   */
  const acceptRequest = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.acceptSession(id);
      if (response.success) {
        const accepted = response.data?.session;
        setData(prev => ({
          ...prev,
          requests: prev.requests.filter(r => r._id !== id),
          sessions: [accepted, ...prev.sessions],
        }));
        toast.success('Session accepted!');
        return accepted;
      } else {
        throw new Error(response.message || 'Failed to accept session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error accepting session';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * TUTOR: Reject session request
   * @param {string} id
   * @param {string} reason
   */
  const rejectRequest = async (id, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.rejectSession(id, reason);
      if (response.success) {
        setData(prev => ({
          ...prev,
          requests: prev.requests.filter(r => r._id !== id),
        }));
        toast.success('Session rejected!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to reject session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error rejecting session';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * BOTH: Start joining session - updates room status to "in_progress"
   * @param {string} id
   */
  const joinSession = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.joinSession(id);
      if (response.success) {
        const updated = response.data?.session;
        setData(prev => ({
          ...prev,
          session: updated,
          sessions: prev.sessions.map(s => s._id === id ? updated : s),
        }));
        toast.success('Joined session!');
        return updated;
      } else {
        throw new Error(response.message || 'Failed to join session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error joining session';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit feedback/rating after session ends
   * @param {string} id
   * @param {Object} feedback - { rating, comment }
   */
  const submitFeedback = async (id, feedback) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.submitFeedback(id, feedback);
      if (response.success) {
        const updated = response.data?.session;
        setData(prev => ({
          ...prev,
          session: updated,
          sessions: prev.sessions.map(s => s._id === id ? updated : s),
        }));
        toast.success('Feedback submitted! Thank you.');
        return updated;
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error submitting feedback';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * End session - updates status to "completed"
   * @param {string} id
   */
  const endSession = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.endSession(id);
      if (response.success) {
        const updated = response.data?.session;
        setData(prev => ({
          ...prev,
          session: updated,
          sessions: prev.sessions.map(s => s._id === id ? updated : s),
        }));
        toast.success('Session ended!');
        return updated;
      } else {
        throw new Error(response.message || 'Failed to end session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error ending session';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel session (student only, before accepted)
   * @param {string} id
   */
  const cancelSession = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.cancelSession(id);
      if (response.success) {
        setData(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => s._id !== id),
          session: prev.session?._id === id ? null : prev.session,
        }));
        toast.success('Session cancelled!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to cancel session');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error cancelling session';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch upcoming sessions (for dashboard widget)
   */
  const getUpcoming = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.getUpcomingsessions();
      if (response.success) {
        setData(prev => ({
          ...prev,
          upcomingSessions: response.data?.sessions || [],
        }));
        return response.data?.sessions || [];
      } else {
        throw new Error(response.message || 'Failed to fetch upcoming sessions');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching upcoming');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    sessions: data.sessions,
    session: data.session,
    requests: data.requests,
    upcomingSessions: data.upcomingSessions,
    loading,
    error,
    
    // Functions
    list,
    getById,
    schedule,
    getRequests,
    acceptRequest,
    rejectRequest,
    joinSession,
    submitFeedback,
    endSession,
    cancelSession,
    getUpcoming,
  };
};
