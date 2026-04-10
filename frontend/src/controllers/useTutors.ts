import { useState, useCallback } from 'react';
import api from '../services/api';
import { Tutor } from '../models/Tutor';

export const useTutors = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tutors');
      setTutors(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tutors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerTutor = useCallback(async (tutorData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/tutors', tutorData);
      setTutors((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTutorProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/tutors/${id}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get tutor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateTutor = useCallback(async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/tutors/${id}/moderate`, { status });
      setTutors((prev) => prev.map((t) => (t._id === id ? data : t)));
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to moderate tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { tutors, loading, error, fetchTutors, registerTutor, getTutorProfile, moderateTutor };
};
