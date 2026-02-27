import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as materialService from '../services/materialService';

/**
 * Material Controller Hook
 * Handles: Create, Read, Update, Delete, Approve, Reject materials
 * Returns: data state, loading, error, and CRUD functions
 */
export const useMaterialController = () => {
  const [data, setData] = useState({
    materials: [],      // List view
    material: null,     // Detail view
    pending: [],        // Moderator: pending approvals
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all materials with optional filters
   * @param {Object} filters - { subject, tags, status, search }
   */
  const list = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterials(filters);
      if (response.success) {
        setData(prev => ({ ...prev, materials: response.data?.materials || [] }));
        return response.data?.materials || [];
      } else {
        throw new Error(response.message || 'Failed to fetch materials');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching materials';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single material by ID
   * @param {string} id
   */
  const getById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterialById(id);
      if (response.success) {
        setData(prev => ({ ...prev, material: response.data?.material || null }));
        return response.data?.material || null;
      } else {
        throw new Error(response.message || 'Failed to fetch material');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching material';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new material with file upload
   * @param {FormData} formData - { file, title, description, tags, category }
   */
  const create = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // formData is already FormData object
      const response = await materialService.createMaterial(formData);
      if (response.success) {
        const newMaterial = response.data?.material;
        setData(prev => ({
          ...prev,
          materials: [newMaterial, ...prev.materials],
        }));
        toast.success('Material uploaded successfully!');
        return newMaterial;
      } else {
        throw new Error(response.message || 'Failed to upload material');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error uploading material';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update material (title, description, tags, category)
   * @param {string} id
   * @param {Object} updateData - { title, description, tags, category }
   */
  const update = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.updateMaterial(id, updateData);
      if (response.success) {
        const updated = response.data?.material;
        setData(prev => ({
          ...prev,
          materials: prev.materials.map(m => m._id === id ? updated : m),
          material: prev.material?._id === id ? updated : prev.material,
        }));
        toast.success('Material updated!');
        return updated;
      } else {
        throw new Error(response.message || 'Failed to update material');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error updating material';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete material (owner or moderator)
   * @param {string} id
   */
  const deleteMaterial = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.deleteMaterial(id);
      if (response.success) {
        setData(prev => ({
          ...prev,
          materials: prev.materials.filter(m => m._id !== id),
          material: prev.material?._id === id ? null : prev.material,
        }));
        toast.success('Material deleted!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete material');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error deleting material';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Approve pending material
   * @param {string} id
   */
  const approve = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.approveMaterial(id);
      if (response.success) {
        const approved = response.data?.material;
        setData(prev => ({
          ...prev,
          materials: prev.materials.map(m => m._id === id ? approved : m),
          pending: prev.pending.filter(m => m._id !== id),
        }));
        toast.success('Material approved!');
        return approved;
      } else {
        throw new Error(response.message || 'Failed to approve material');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error approving material';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Reject pending material
   * @param {string} id
   * @param {string} reason
   */
  const reject = async (id, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.rejectMaterial(id, reason);
      if (response.success) {
        setData(prev => ({
          ...prev,
          pending: prev.pending.filter(m => m._id !== id),
        }));
        toast.success('Material rejected!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to reject material');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error rejecting material';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch pending materials (moderator only)
   */
  const listPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getPendingMaterials();
      if (response.success) {
        setData(prev => ({ ...prev, pending: response.data?.materials || [] }));
        return response.data?.materials || [];
      } else {
        throw new Error(response.message || 'Failed to fetch pending materials');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching pending';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    materials: data.materials,
    material: data.material,
    pending: data.pending,
    loading,
    error,
    
    // Functions
    list,
    getById,
    create,
    update,
    delete: deleteMaterial,
    approve,
    reject,
    listPending,
  };
};
