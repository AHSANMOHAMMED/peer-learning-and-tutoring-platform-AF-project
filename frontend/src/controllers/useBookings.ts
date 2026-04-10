import { useState, useCallback } from 'react';
import api from '../services/api';
import { Booking } from '../models/Booking';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/bookings', bookingData);
      setBookings((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/bookings/${id}`, { status });
      setBookings((prev) => prev.map((b) => (b._id === id ? data : b)));
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update booking status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWhiteboard = useCallback(async (id: string, whiteboardData: string) => {
    try {
      await api.put(`/bookings/${id}/whiteboard`, { whiteboardData });
    } catch (err: any) {
      console.error('Failed to update whiteboard:', err);
    }
  }, []);

  return { bookings, loading, error, fetchBookings, createBooking, updateBookingStatus, updateWhiteboard };
};
