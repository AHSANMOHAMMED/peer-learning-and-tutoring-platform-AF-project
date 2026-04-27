import { useState, useCallback } from 'react';
import { schoolApi } from '../services/api';

export const useSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchools = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.getAll(params);
      if (data.success) {
        setSchools(data.data.schools);
      } else {
        setSchools(data || []);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schools');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchoolById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.getById(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchool = useCallback(async (schoolData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.create(schoolData);
      if (data.success) {
        setSchools((prev) => [data.data.school, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to provision school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchool = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.update(id, updateData);
      if (data.success) {
        setSchools((prev) => 
          prev.map((s) => s._id === id ? data.data.school : s)
        );
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchool = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.delete(id);
      if (data.success) {
        setSchools((prev) => prev.filter((s) => s._id !== id));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decommission school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSchoolUsers = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.getSchoolUsers(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch school users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addUserToSchool = useCallback(async (id, userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.addUserToSchool(id, userId);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user to school');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    fetchSchoolById,
    createSchool,
    updateSchool,
    deleteSchool,
    getSchoolUsers,
    addUserToSchool
  };
};
