import { useState, useEffect, useCallback } from 'react';
import { useAuthViewModel } from '../viewmodels/AuthViewModel';
import { bookingService } from '../services/bookingService';
import { tutorService } from '../services/tutorService';
import { Booking } from '../models/Booking';
import { TutorProfile } from '../models/TutorProfile';

/**
 * useDashboardController - Controller hook for dashboard operations
 * Handles data fetching and state management for all dashboard views
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useDashboardController = () => {
  const { user } = useAuthViewModel();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard stats
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    totalHours: 0,
    rating: 0,
  });

  // Upcoming sessions/bookings
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  // Fetch dashboard data based on user role
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch real data from API
      const upcomingResponse = await bookingService.getUpcomingBookings();
      const statsResponse = await bookingService.getBookingStats();

      if (upcomingResponse.success) {
        const bookings = upcomingResponse.data?.bookings || upcomingResponse.data || [];
        setUpcomingBookings(bookings.map(b => new Booking(b)));
      }

      if (statsResponse.success) {
        const statsData = statsResponse.data || {};
        setStats({
          upcomingSessions: statsData.upcomingSessions || 0,
          completedSessions: statsData.completedSessions || 0,
          totalHours: statsData.totalHours || 0,
          rating: statsData.rating || 0,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Get recommended tutors (for students)
  const getRecommendedTutors = useCallback(async () => {
    try {
      const response = await tutorService.getTutors({ limit: 3, sortBy: 'rating' });
      if (response.success) {
        const tutors = response.data?.tutors || response.data || [];
        return tutors.map(t => new TutorProfile(t));
      }
      return [];
    } catch (err) {
      return [];
    }
  }, []);

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId, reason = '') => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      
      if (response.success) {
        setUpcomingBookings(prev => 
          prev.filter(booking => booking.id !== bookingId)
        );
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Join session
  const joinSession = useCallback((booking) => {
    if (booking.sessionUrl) {
      window.open(booking.sessionUrl, '_blank');
      return { success: true };
    }
    return { success: false, error: 'No session URL available' };
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  return {
    user,
    isLoading,
    error,
    stats,
    upcomingBookings,
    recommendedTutors: getRecommendedTutors(),
    fetchDashboardData,
    cancelBooking,
    joinSession,
  };
};

export default useDashboardController;
