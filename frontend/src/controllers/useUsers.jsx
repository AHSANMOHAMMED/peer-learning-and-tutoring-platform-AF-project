import { useState, useCallback } from 'react';
import { adminApi } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllUsers(filters);
      if (data.success) {
        setUsers(data.data.users || []);
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } else {
        setUsers(data || []);
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
      const data = await adminApi.toggleUserStatus(id, { isActive, reason });
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
      const data = await adminApi.changeUserRole(id, { role, reason });
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
      const data = await adminApi.bulkOperations({ userIds, operation, data: extraData });
      if (data.success) {
        await fetchUsers(pagination);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform bulk action');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, pagination]);

  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.createUser(userData);
      if (data.success) {
        setUsers(prev => [data.data.user, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUserById(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.updateUser(id, updateData);
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, ...data.data.user } : u));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.deleteUser(id);
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    users, 
    pagination, 
    loading, 
    error, 
    fetchUsers, 
    toggleUserStatus, 
    changeUserRole, 
    bulkAction,
    createUser,
    getUserById,
    updateUser,
    deleteUser
  };
};
