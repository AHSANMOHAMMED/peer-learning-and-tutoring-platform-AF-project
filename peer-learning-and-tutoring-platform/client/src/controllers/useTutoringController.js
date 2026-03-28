import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingService } from '../services/bookingService';
import { tutorService } from '../services/tutorService';
import { reviewService } from '../services/reviewService';
import { Booking } from '../models/Booking';
import toast from 'react-hot-toast';

/**
 * useTutoringController - Controller hook for peer tutoring CRUD
 * Handles session scheduling, management, video calls, and feedback
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useTutoringController = () => {
  // State
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalHours: 0,
    averageRating: 0,
    totalEarnings: 0,
    thisWeekEarnings: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    subject: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isInSession, setIsInSession] = useState(false);
  
  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);

  // Fetch all sessions with filters
  const fetchSessions = useCallback(async (page = 1, customFilters = null) => {
    const activeFilters = customFilters || filters;
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        status: activeFilters.status,
        subject: activeFilters.subject,
        dateFrom: activeFilters.dateFrom,
        dateTo: activeFilters.dateTo
      };
      
      const response = await bookingService.getBookings(params);
      
      if (response.success) {
        const sessionsData = response.data?.bookings || response.data || [];
        const paginationData = response.data?.pagination || {};
        
        const bookings = sessionsData.map(s => new Booking(s));
        setSessions(bookings);
        
        // Categorize sessions
        const now = new Date();
        setUpcomingSessions(bookings.filter(b => 
          ['pending', 'confirmed'].includes(b.status) && new Date(b.date) >= now
        ));
        setPastSessions(bookings.filter(b => 
          ['completed', 'cancelled'].includes(b.status) || new Date(b.date) < now
        ));
        
        setPagination({
          page,
          limit: pagination.limit,
          total: paginationData.total || sessionsData.length,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / pagination.limit)
        });
      } else {
        setError(response.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  // Fetch pending requests (for tutors)
  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await bookingService.getBookings({ status: 'pending' });
      
      if (response.success) {
        const sessionsData = response.data?.bookings || response.data || [];
        setPendingRequests(sessionsData.map(s => new Booking(s)));
      } else {
        setError(response.message || 'Failed to fetch pending requests');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single session by ID
  const fetchSessionById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await bookingService.getBookingById(id);
      
      if (response.success) {
        const session = new Booking(response.data);
        setCurrentSession(session);
        return session;
      } else {
        setError(response.message || 'Failed to fetch session');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tutor availability
  const fetchAvailability = useCallback(async (tutorId) => {
    setIsLoading(true);
    
    try {
      const response = await tutorService.getTutorAvailability(tutorId);
      
      if (response.success) {
        setAvailability(response.data?.availability || []);
      }
    } catch (err) {
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch available tutors
  const fetchTutors = useCallback(async (params = {}) => {
    setIsLoading(true);
    
    try {
      const response = await tutorService.getTutors({ ...params, status: 'approved' });
      
      if (response.success) {
        const tutorsData = response.data?.tutors || response.data || [];
        setTutors(tutorsData);
      }
    } catch (err) {
      toast.error('Failed to load tutors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tutoring stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await bookingService.getBookingStats();
      
      if (response.success) {
        setStats(response.data || {
          totalSessions: 0,
          completedSessions: 0,
          totalHours: 0,
          averageRating: 0,
          totalEarnings: 0,
          thisWeekEarnings: 0
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Schedule new session (student)
  const scheduleSession = useCallback(async (sessionData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await bookingService.createBooking(sessionData);
      
      if (response.success) {
        const newSession = new Booking(response.data);
        
        // Optimistic update
        setSessions(prev => [newSession, ...prev]);
        setUpcomingSessions(prev => [newSession, ...prev]);
        
        toast.success('Session scheduled successfully!');
        
        // Refresh
        fetchSessions();
        
        return { success: true, data: newSession };
      } else {
        toast.error(response.message || 'Failed to schedule session');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to schedule session');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchSessions]);

  // Accept session (tutor)
  const acceptSession = useCallback(async (sessionId) => {
    setIsSubmitting(true);
    
    try {
      const response = await bookingService.confirmBooking(sessionId);
      
      if (response.success) {
        // Update local state
        const updateSession = (session) => {
          if (session.id === sessionId) {
            return new Booking({ ...session, status: 'confirmed' });
          }
          return session;
        };
        
        setPendingRequests(prev => prev.filter(s => s.id !== sessionId));
        setSessions(prev => prev.map(updateSession));
        setUpcomingSessions(prev => prev.map(updateSession));
        
        toast.success('Session accepted!');
        
        // Refresh
        fetchPendingRequests();
        fetchSessions();
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to accept session');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept session');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchPendingRequests, fetchSessions]);

  // Reject session (tutor)
  const rejectSession = useCallback(async (sessionId, reason = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await bookingService.cancelBooking(sessionId, reason);
      
      if (response.success) {
        // Remove from pending
        setPendingRequests(prev => prev.filter(s => s.id !== sessionId));
        
        toast.success('Session declined');
        
        // Refresh
        fetchPendingRequests();
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to decline session');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to decline session');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchPendingRequests]);

  // Cancel session (both)
  const cancelSession = useCallback(async (sessionId, reason = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await bookingService.cancelBooking(sessionId, reason);
      
      if (response.success) {
        // Update local state
        const updateSession = (session) => {
          if (session.id === sessionId) {
            return new Booking({ ...session, status: 'cancelled' });
          }
          return session;
        };
        
        setSessions(prev => prev.map(updateSession));
        setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId));
        setPendingRequests(prev => prev.filter(s => s.id !== sessionId));
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(prev => ({ ...prev, status: 'cancelled' }));
        }
        
        toast.success('Session cancelled');
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to cancel session');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel session');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSession]);

  // Reschedule session
  const rescheduleSession = useCallback(async (sessionId, newDate, newStartTime) => {
    setIsSubmitting(true);
    
    try {
      const response = await bookingService.rescheduleBooking(sessionId, newDate, newStartTime);
      
      if (response.success) {
        // Update local state
        const updateSession = (session) => {
          if (session.id === sessionId) {
            return new Booking({
              ...session,
              date: newDate,
              startTime: newStartTime,
              status: 'pending' // Reset to pending for tutor approval
            });
          }
          return session;
        };
        
        setSessions(prev => prev.map(updateSession));
        setUpcomingSessions(prev => prev.map(updateSession));
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(updateSession(currentSession));
        }
        
        toast.success('Session rescheduled! Awaiting tutor confirmation.');
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to reschedule');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reschedule');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSession]);

  // Complete session (tutor)
  const completeSession = useCallback(async (sessionId, notes = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await bookingService.completeBooking(sessionId);
      
      if (response.success) {
        // Update local state
        const updateSession = (session) => {
          if (session.id === sessionId) {
            return new Booking({
              ...session,
              status: 'completed',
              tutorNotes: notes
            });
          }
          return session;
        };
        
        setSessions(prev => prev.map(updateSession));
        setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId));
        setPastSessions(prev => [updateSession(prev.find(s => s.id === sessionId) || {}), ...prev]);
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(updateSession(currentSession));
        }
        
        toast.success('Session marked as complete!');
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to complete session');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete session');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSession]);

  // Submit feedback (student)
  const submitFeedback = useCallback(async (sessionId, rating, comment) => {
    setIsSubmitting(true);
    
    try {
      const response = await reviewService.createReview({
        bookingId: sessionId,
        rating,
        comment
      });
      
      if (response.success) {
        // Update local state
        const updateSession = (session) => {
          if (session.id === sessionId) {
            return new Booking({
              ...session,
              rating,
              feedback: comment
            });
          }
          return session;
        };
        
        setSessions(prev => prev.map(updateSession));
        setPastSessions(prev => prev.map(updateSession));
        
        toast.success('Feedback submitted! Thank you.');
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to submit feedback');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Join video session
  const joinSession = useCallback((session) => {
    if (session.sessionUrl) {
      setIsInSession(true);
      return { success: true, url: session.sessionUrl };
    }
    
    // Generate Jitsi URL if not set
    const jitsiUrl = `https://meet.jit.si/peerlearn-${session.id}`;
    return { success: true, url: jitsiUrl };
  }, []);

  // Leave session
  const leaveSession = useCallback(() => {
    setIsInSession(false);
  }, []);

  // Update tutor availability
  const updateAvailability = useCallback(async (newAvailability) => {
    setIsSubmitting(true);
    
    try {
      const response = await tutorService.updateAvailability(newAvailability);
      
      if (response.success) {
        setAvailability(newAvailability);
        toast.success('Availability updated!');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to update availability');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update availability');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      subject: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  // Auto-refresh setup
  const startAutoRefresh = useCallback((intervalMs = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      fetchSessions(pagination.page);
      fetchPendingRequests();
    }, intervalMs);
  }, [fetchSessions, fetchPendingRequests, pagination.page]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSessions();
    fetchStats();
    
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Refresh when filters change
  useEffect(() => {
    fetchSessions(1);
  }, [filters.status, filters.subject]);

  return {
    // State
    sessions,
    upcomingSessions,
    pastSessions,
    pendingRequests,
    currentSession,
    availability,
    tutors,
    stats,
    filters,
    pagination,
    isLoading,
    isSubmitting,
    error,
    isInSession,
    
    // Actions
    fetchSessions,
    fetchPendingRequests,
    fetchSessionById,
    fetchAvailability,
    fetchTutors,
    fetchStats,
    scheduleSession,
    acceptSession,
    rejectSession,
    cancelSession,
    rescheduleSession,
    completeSession,
    submitFeedback,
    joinSession,
    leaveSession,
    updateAvailability,
    updateFilters,
    clearFilters,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Pagination helpers
    goToPage: (page) => fetchSessions(page),
    nextPage: () => fetchSessions(Math.min(pagination.totalPages, pagination.page + 1)),
    prevPage: () => fetchSessions(Math.max(1, pagination.page - 1))
  };
};

export default useTutoringController;
