import { useState, useCallback } from 'react';
import api from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const { data } = await api.get(`/admin/users?${params.toString()}`);
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (id, isActive, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/admin/users/${id}/status`, { isActive, reason });
      if (data.success) {
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive } : u));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changeUserRole = useCallback(async (id, role, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/admin/users/${id}/role`, { role, reason });
      if (data.success) {
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change user role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkAction = useCallback(async (userIds, operation, extraData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/admin/users/bulk', { userIds, operation, data: extraData });
      if (data.success) {
        await fetchUsers(pagination); // Refresh current view
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform bulk action');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, pagination]);

  return { 
    users, 
    pagination, 
    loading, 
    error, 
    fetchUsers, 
    toggleUserStatus, 
    changeUserRole, 
    bulkAction 
  };
};
