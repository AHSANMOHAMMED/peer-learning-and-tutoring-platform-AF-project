import { useState, useCallback } from 'react';
import api from '../services/api';


export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
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
      const { data } = await api.post('/bookings', bookingData);
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
      const { data } = await api.put(`/bookings/${id}`, { status });
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
      await api.put(`/bookings/${id}/whiteboard`, { whiteboardData });
    } catch (err) {
      console.error('Failed to update whiteboard:', err);
    }
  }, []);

  return { bookings, loading, error, fetchBookings, createBooking, updateBookingStatus, updateWhiteboard };
};