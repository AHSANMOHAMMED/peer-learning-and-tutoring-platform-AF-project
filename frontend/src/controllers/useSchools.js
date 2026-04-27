import { useState, useCallback } from 'react';
import api from '../services/api';

export const useSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchools = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/schools', { params });
      if (data.success) {
        setSchools(data.data.schools);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schools');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchool = useCallback(async (schoolData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/schools', schoolData);
      if (data.success) {
        setSchools((prev) => [data.data.school, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to provision school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchool = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/schools/${id}`, updateData);
      if (data.success) {
        setSchools((prev) => 
          prev.map((s) => s._id === id ? data.data.school : s)
        );
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchool = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.delete(`/schools/${id}`);
      if (data.success) {
        setSchools((prev) => prev.filter((s) => s._id !== id));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decommission school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool
  };
};
