import { useState, useCallback } from 'react';
import api from '../services/api';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchTutor = useCallback(async (matchData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/ai/match', matchData);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to match tutors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionInsights = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/ai/session-insights/${sessionId}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch session insights');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, matchTutor, getSessionInsights };
};
