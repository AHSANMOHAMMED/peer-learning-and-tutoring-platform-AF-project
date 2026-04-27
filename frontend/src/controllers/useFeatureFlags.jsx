import { useState, useCallback } from 'react';
import { featureFlagApi } from '../services/api';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await featureFlagApi.getAll();
      if (data.success) {
        setFlags(data.data.flags || []);
      } else {
        setFlags(data || []);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch feature flags');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFlag = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await featureFlagApi.toggle(id);
      if (data.success) {
        setFlags((prev) => prev.map((f) => f._id === id ? { ...f, enabled: !f.enabled } : f));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle flag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFlag = useCallback(async (flagData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await featureFlagApi.create(flagData);
      if (data.success) {
        setFlags((prev) => [...prev, data.data.flag]);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create flag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFlag = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await featureFlagApi.delete(id);
      if (data.success) {
        setFlags((prev) => prev.filter((f) => f._id !== id));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete flag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    flags, 
    loading, 
    error, 
    fetchFlags, 
    toggleFlag, 
    createFlag, 
    deleteFlag
  };
};
