import { useState, useCallback } from 'react';
import api from '../services/api';


export const useTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tutors');
      setTutors(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tutors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTutors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tutors/all');
      setTutors(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch all tutors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerTutor = useCallback(async (tutorData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/tutors', tutorData);
      setTutors((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTutorProfile = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/tutors/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get tutor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTutorByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/tutors/user/${userId}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get tutor by User ID');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateTutor = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/tutors/${id}/moderate`, { status });
      setTutors((prev) => prev.map((t) => t._id === id ? data : t));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to moderate tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { tutors, loading, error, fetchTutors, fetchAllTutors, registerTutor, getTutorProfile, getTutorByUserId, moderateTutor };
};