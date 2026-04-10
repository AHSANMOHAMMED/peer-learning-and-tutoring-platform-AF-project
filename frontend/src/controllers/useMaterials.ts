import { useState, useCallback } from 'react';
import api from '../services/api';
import { Material } from '../models/Material';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/materials');
      setMaterials(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch materials');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMaterial = useCallback(async (materialData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/materials', materialData);
      setMaterials((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload material');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMaterial = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete material');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateMaterial = useCallback(async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/materials/${id}/moderate`, { status });
      setMaterials((prev) => prev.map((m) => (m._id === id ? data : m)));
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to moderate material');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { materials, loading, error, fetchMaterials, uploadMaterial, deleteMaterial, moderateMaterial };
};
