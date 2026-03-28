import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { tutorService } from '../services/tutorService';
import { reviewService } from '../services/reviewService';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';

/**
 * useTutorController - Controller hook for tutor-specific operations
 * Handles sessions, availability, earnings, and reviews
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useTutorController = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Session management
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);

  // Tutor profile stats
  const [tutorStats, setTutorStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    totalEarnings: 0,
    thisWeekEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    completionRate: 0,
  });

  // Reviews
  const [reviews, setReviews] = useState([]);

  // Availability
  const [availability, setAvailability] = useState([]);

  // Fetch tutor dashboard data
  const fetchTutorData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch real data from API
      const [bookingsRes, reviewsRes, profileRes] = await Promise.all([
        bookingService.getBookings({ status: 'all' }),
        reviewService.getReviews({ limit: 10 }),
        tutorService.getCurrentTutorProfile()
      ]);

      if (bookingsRes.success) {
        const bookings = bookingsRes.data?.bookings || bookingsRes.data || [];
        const pending = bookings.filter(b => b.status === 'pending');
        const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) > new Date());
        const past = bookings.filter(b => b.status === 'completed' || new Date(b.date) < new Date());
        
        setPendingRequests(pending.map(b => new Booking(b)));
        setUpcomingSessions(upcoming.map(b => new Booking(b)));
        setPastSessions(past.map(b => new Booking(b)));
      }

      if (reviewsRes.success) {
        const reviewData = reviewsRes.data?.reviews || reviewsRes.data || [];
        setReviews(reviewData.map(r => new Review(r)));
      }

      if (profileRes.success) {
        const profile = profileRes.data || {};
        setTutorStats({
          totalSessions: profile.totalSessions || 0,
          totalStudents: profile.totalStudents || 0,
          totalEarnings: profile.totalEarnings || 0,
          thisWeekEarnings: profile.thisWeekEarnings || 0,
          averageRating: profile.averageRating || 0,
          totalReviews: profile.totalReviews || 0,
          completionRate: profile.completionRate || 98,
        });
        setAvailability(profile.availability || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Accept session request
  const acceptRequest = useCallback(async (bookingId) => {
    try {
      const response = await bookingService.confirmBooking(bookingId);
      
      if (response.success) {
        setPendingRequests(prev => prev.filter(r => r.id !== bookingId));
        
        // Refresh upcoming sessions
        const bookingsRes = await bookingService.getUpcomingBookings();
        if (bookingsRes.success) {
          const bookings = bookingsRes.data?.bookings || bookingsRes.data || [];
          setUpcomingSessions(bookings.map(b => new Booking(b)));
        }
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Decline session request
  const declineRequest = useCallback(async (bookingId, reason = '') => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      if (response.success) {
        setPendingRequests(prev => prev.filter(r => r.id !== bookingId));
      }
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Cancel upcoming session
  const cancelSession = useCallback(async (bookingId, reason = '') => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      if (response.success) {
        setUpcomingSessions(prev => prev.filter(s => s.id !== bookingId));
      }
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Join session
  const joinSession = useCallback((sessionUrl) => {
    if (sessionUrl) {
      window.open(sessionUrl, '_blank');
      return { success: true };
    }
    return { success: false, error: 'No session URL available' };
  }, []);

  // Update availability
  const updateAvailability = useCallback(async (newAvailability) => {
    try {
      const response = await tutorService.updateAvailability(newAvailability);
      if (response.success) {
        setAvailability(newAvailability);
      }
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Calculate earnings
  const calculateEarnings = useCallback((period = 'week') => {
    switch (period) {
      case 'week':
        return tutorStats.thisWeekEarnings;
      case 'month':
        return tutorStats.thisWeekEarnings * 4;
      case 'total':
        return tutorStats.totalEarnings;
      default:
        return tutorStats.thisWeekEarnings;
    }
  }, [tutorStats]);

  return {
    // State
    isLoading,
    error,
    pendingRequests,
    upcomingSessions,
    pastSessions,
    tutorStats,
    reviews,
    availability,

    // Actions
    fetchTutorData,
    acceptRequest,
    declineRequest,
    cancelSession,
    joinSession,
    updateAvailability,
    calculateEarnings,
  };
};

export default useTutorController;
