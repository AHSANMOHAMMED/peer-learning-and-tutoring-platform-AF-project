import { useState, useCallback } from 'react';
import { systemApi } from '../services/api';


export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemApi.getAnalytics();
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch global analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPulse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemApi.getPulse();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pulse stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analytics, loading, error, fetchAnalytics, fetchPulse };
};