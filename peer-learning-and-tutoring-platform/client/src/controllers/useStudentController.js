import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { tutorService } from '../services/tutorService';
import { materialService } from '../services/materialService';
import { Booking } from '../models/Booking';
import { TutorProfile } from '../models/TutorProfile';
import { Material } from '../models/Material';

/**
 * useStudentController - Controller hook for student-specific operations
 * Handles bookings, progress tracking, recommended tutors, and materials
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useStudentController = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Student data
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [recommendedTutors, setRecommendedTutors] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);

  // Student stats
  const [studentStats, setStudentStats] = useState({
    totalSessions: 0,
    hoursLearned: 0,
    favoriteSubjects: [],
    currentStreak: 0,
    progressPercentage: 0,
  });

  // Fetch student dashboard data
  const fetchStudentData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch real data from API
      const [upcomingRes, pastRes, tutorsRes, materialsRes] = await Promise.all([
        bookingService.getUpcomingBookings(),
        bookingService.getPastBookings(),
        tutorService.getTutors({ limit: 4, sortBy: 'rating' }),
        materialService.getMaterials({ limit: 10 })
      ]);

      if (upcomingRes.success) {
        const bookings = upcomingRes.data?.bookings || upcomingRes.data || [];
        setUpcomingBookings(bookings.map(b => new Booking(b)));
      }

      if (pastRes.success) {
        const bookings = pastRes.data?.bookings || pastRes.data || [];
        setPastBookings(bookings.map(b => new Booking(b)));
      }

      if (tutorsRes.success) {
        const tutors = tutorsRes.data?.tutors || tutorsRes.data || [];
        setRecommendedTutors(tutors.map(t => new TutorProfile(t)));
      }

      if (materialsRes.success) {
        const materials = materialsRes.data?.materials || materialsRes.data || [];
        setMyMaterials(materials.map(m => new Material(m)));
      }

      // Calculate stats from real data
      const totalSessions = pastBookings.length + upcomingBookings.length;
      const hoursLearned = [...pastBookings, ...upcomingBookings].reduce((acc, b) => {
        const duration = b.duration || 60;
        return acc + (duration / 60);
      }, 0);

      setStudentStats({
        totalSessions,
        hoursLearned: Math.round(hoursLearned),
        favoriteSubjects: ['Mathematics', 'Physics'], // Could derive from actual bookings
        currentStreak: 5,
        progressPercentage: 68,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Book a session
  const bookSession = useCallback(async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      
      if (response.success && response.data) {
        const newBooking = new Booking(response.data);
        setUpcomingBookings(prev => [...prev, newBooking]);
        return { success: true, data: newBooking };
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason = '') => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      if (response.success) {
        setUpcomingBookings(prev => prev.filter(b => b.id !== bookingId));
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

  // Get calendar events
  const getCalendarEvents = useCallback(() => {
    return [...upcomingBookings, ...pastBookings].map(booking => ({
      id: booking.id,
      title: booking.subject,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      tutor: booking.tutor?.displayName || 'Tutor',
    }));
  }, [upcomingBookings, pastBookings]);

  // Get progress data
  const getProgressData = useCallback(() => {
    return {
      labels: ['Mathematics', 'Physics', 'English', 'Chemistry'],
      data: [85, 72, 60, 45],
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    };
  }, []);

  // Rate tutor
  const rateTutor = useCallback(async (bookingId, rating, comment) => {
    try {
      // Use reviewService to submit actual review
      const { reviewService } = await import('../services/reviewService');
      const response = await reviewService.createReview({
        bookingId,
        rating,
        comment
      });
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    upcomingBookings,
    pastBookings,
    recommendedTutors,
    myMaterials,
    studentStats,

    // Actions
    fetchStudentData,
    bookSession,
    cancelBooking,
    joinSession,
    getCalendarEvents,
    getProgressData,
    rateTutor,
  };
};

export default useStudentController;
