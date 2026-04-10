import { useState, useCallback } from 'react';
import api from '../services/api';
import { Report } from '../models/Report';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reports');
      setReports(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/reports', reportData);
      setReports((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateReport = useCallback(async (id: string, status: string, moderatorAction?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch(`/reports/${id}/status`, { status, moderatorAction });
      setReports((prev) => prev.map((r) => (r._id === id ? data : r)));
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update report status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, loading, error, fetchReports, createReport, moderateReport };
};
