import { useState, useCallback } from 'react';
import { tutorApi } from '../services/api';


export const useTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tutorApi.getAll();
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
      const data = await tutorApi.getAllAdmin();
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
      const data = await tutorApi.register(tutorData);
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
      const data = await tutorApi.getProfile(id);
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
      const data = await tutorApi.getByUserId(userId);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get tutor by User ID');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateTutor = useCallback(async (id, status, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await tutorApi.moderate(id, { status, verificationStatus: status, reason });
      setTutors((prev) => prev.map((t) => t._id === id ? data : t));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to moderate tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

   const updateTutorProfile = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tutorApi.updateProfile(id, data);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tutor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { tutors, loading, error, fetchTutors, fetchAllTutors, registerTutor, getTutorProfile, getTutorByUserId, updateTutorProfile, moderateTutor };
};
