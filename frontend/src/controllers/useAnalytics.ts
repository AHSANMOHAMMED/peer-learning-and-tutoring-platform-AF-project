import { useState, useCallback } from 'react';
import api from '../services/api';

export interface SystemAnalytics {
  summary: {
    totalUsers: number;
    totalTutors: number;
    totalBookings: number;
    totalMaterials: number;
    totalRevenue: number;
    avgSessionPrice: number;
  };
  roleDistribution: { name: string; value: number; color: string }[];
  timeSeriesData: { name: string; sessions: number; amount: number; revenue: number; fullDate: string }[];
  recentBookings: any[];
  systemStatus: string;
  serverUptime: number;
  memoryUsage: any;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/system/analytics');
      setAnalytics(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch global analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analytics, loading, error, fetchAnalytics };
};
