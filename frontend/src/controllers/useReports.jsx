import { useState, useCallback } from 'react';
import { reportApi } from '../services/api';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getAll();
      setReports(data || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.create(reportData);
      setReports((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateReport = useCallback(async (id, status, moderatorAction) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.moderate(id, { status, moderatorAction });
      setReports((prev) => prev.map((r) => r._id === id ? data : r));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, loading, error, fetchReports, createReport, moderateReport };
};