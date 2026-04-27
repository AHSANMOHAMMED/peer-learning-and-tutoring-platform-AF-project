import { useState, useCallback } from 'react';
import { bookingApi } from '../services/api';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getAll();
      setBookings(data || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.create(bookingData);
      setBookings((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.updateStatus(id, { status });
      setBookings((prev) => prev.map((b) => b._id === id ? data : b));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWhiteboard = useCallback(async (id, whiteboardData) => {
    try {
      await bookingApi.updateWhiteboard(id, { whiteboardData });
    } catch (err) {
      console.error('Failed to update whiteboard:', err);
    }
  }, []);

  return { bookings, loading, error, fetchBookings, createBooking, updateBookingStatus, updateWhiteboard };
};