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
      const reportList = data.data?.reports || data.reports || data.data || data || [];
      setReports(Array.isArray(reportList) ? reportList : []);
      return reportList;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      setReports([]);
      return [];
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
      const action = status === 'dismissed' ? 'dismiss' : 'resolve';
      const data = await reportApi.moderate(id, action, moderatorAction);
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
