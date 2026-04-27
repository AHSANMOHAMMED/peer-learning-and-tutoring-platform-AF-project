import { useState, useCallback } from 'react';
import { aiApi } from '../services/api';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const matchTutor = useCallback(async (matchData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.matchTutor(matchData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to match tutors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionInsights = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.getSessionInsights(sessionId);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch session insights');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHomeworkHelp = useCallback(async (homeworkData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.homeworkHelp(homeworkData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get homework help');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendations = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.getRecommendations(params);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, matchTutor, getSessionInsights, getHomeworkHelp, getRecommendations };
};