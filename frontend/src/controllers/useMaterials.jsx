import { useState, useCallback } from 'react';
import { materialApi } from '../services/api';

export const useMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await materialApi.getAll();
      setMaterials(data || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch materials');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMaterial = useCallback(async (materialData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await materialApi.upload(materialData);
      setMaterials((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload material');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMaterial = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await materialApi.delete(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateMaterial = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = status === 'approved' 
        ? await materialApi.approve(id)
        : await materialApi.reject(id, '');
      setMaterials((prev) => prev.map((m) => m._id === id ? data : m));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to moderate material');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { materials, loading, error, fetchMaterials, uploadMaterial, deleteMaterial, moderateMaterial };
};