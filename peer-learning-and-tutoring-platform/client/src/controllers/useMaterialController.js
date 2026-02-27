import { useState, useEffect, useCallback, useRef } from 'react';
import { materialService } from '../services/materialService';
import { Material } from '../models/Material';
import toast from 'react-hot-toast';

/**
 * useMaterialController - Controller hook for study materials CRUD
 * Handles all material operations with auto-refresh and optimistic updates
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useMaterialController = () => {
  // State
  const [materials, setMaterials] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [categories] = useState([
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'History', 'Computer Science', 'Economics', 'Art', 'Music'
  ]);
  const [filters, setFilters] = useState({
    subject: '',
    search: '',
    sortBy: 'newest', // newest, mostDownloaded, highestRated
    status: 'approved' // approved, pending, rejected, all
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);

  // Fetch all materials with filters
  const fetchMaterials = useCallback(async (page = 1, customFilters = null) => {
    const activeFilters = customFilters || filters;
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        subject: activeFilters.subject,
        search: activeFilters.search,
        sortBy: activeFilters.sortBy,
        status: activeFilters.status
      };
      
      const response = await materialService.getMaterials(params);
      
      if (response.success) {
        const materialsData = response.data?.materials || response.data || [];
        const paginationData = response.data?.pagination || {};
        
        setMaterials(materialsData.map(m => new Material(m)));
        setPagination({
          page,
          limit: pagination.limit,
          total: paginationData.total || materialsData.length,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / pagination.limit)
        });
      } else {
        setError(response.message || 'Failed to fetch materials');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch materials');
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  // Fetch current user's materials
  const fetchMyMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await materialService.getMyMaterials();
      
      if (response.success) {
        const materialsData = response.data?.materials || response.data || [];
        setMyMaterials(materialsData.map(m => new Material(m)));
      } else {
        setError(response.message || 'Failed to fetch your materials');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your materials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch pending materials (moderator only)
  const fetchPendingMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await materialService.getMaterials({ status: 'pending' });
      
      if (response.success) {
        const materialsData = response.data?.materials || response.data || [];
        setPendingMaterials(materialsData.map(m => new Material(m)));
      } else {
        setError(response.message || 'Failed to fetch pending materials');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending materials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get single material by ID
  const fetchMaterialById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await materialService.getMaterialById(id);
      
      if (response.success) {
        const material = new Material(response.data);
        setCurrentMaterial(material);
        return material;
      } else {
        setError(response.message || 'Failed to fetch material');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch material');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new material
  const createMaterial = useCallback(async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await materialService.createMaterial(formData);
      
      if (response.success) {
        const newMaterial = new Material(response.data);
        
        // Optimistic update
        setMaterials(prev => [newMaterial, ...prev]);
        setMyMaterials(prev => [newMaterial, ...prev]);
        
        toast.success('Material uploaded successfully!');
        
        // Refresh to get server state
        fetchMaterials();
        fetchMyMaterials();
        
        return { success: true, data: newMaterial };
      } else {
        toast.error(response.message || 'Failed to upload material');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload material');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchMaterials, fetchMyMaterials]);

  // Update material
  const updateMaterial = useCallback(async (id, updateData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await materialService.updateMaterial(id, updateData);
      
      if (response.success) {
        const updatedMaterial = new Material(response.data);
        
        // Optimistic update in all lists
        setMaterials(prev => prev.map(m => m.id === id ? updatedMaterial : m));
        setMyMaterials(prev => prev.map(m => m.id === id ? updatedMaterial : m));
        setPendingMaterials(prev => prev.map(m => m.id === id ? updatedMaterial : m));
        
        if (currentMaterial?.id === id) {
          setCurrentMaterial(updatedMaterial);
        }
        
        toast.success('Material updated successfully!');
        return { success: true, data: updatedMaterial };
      } else {
        toast.error(response.message || 'Failed to update material');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update material');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentMaterial]);

  // Delete material
  const deleteMaterial = useCallback(async (id) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await materialService.deleteMaterial(id);
      
      if (response.success) {
        // Remove from all lists
        setMaterials(prev => prev.filter(m => m.id !== id));
        setMyMaterials(prev => prev.filter(m => m.id !== id));
        setPendingMaterials(prev => prev.filter(m => m.id !== id));
        
        if (currentMaterial?.id === id) {
          setCurrentMaterial(null);
        }
        
        toast.success('Material deleted successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete material');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete material');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentMaterial]);

  // Approve material (moderator)
  const approveMaterial = useCallback(async (id, notes = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await materialService.approveMaterial(id, { notes });
      
      if (response.success) {
        // Move from pending to approved
        setPendingMaterials(prev => prev.filter(m => m.id !== id));
        
        toast.success('Material approved!');
        
        // Refresh lists
        fetchMaterials();
        fetchPendingMaterials();
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to approve material');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve material');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchMaterials, fetchPendingMaterials]);

  // Reject material (moderator)
  const rejectMaterial = useCallback(async (id, reason = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await materialService.rejectMaterial(id, { reason });
      
      if (response.success) {
        // Remove from pending
        setPendingMaterials(prev => prev.filter(m => m.id !== id));
        
        toast.success('Material rejected');
        
        // Refresh lists
        fetchPendingMaterials();
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to reject material');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject material');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchPendingMaterials]);

  // Search materials
  const searchMaterials = useCallback(async (searchQuery, searchFilters = {}) => {
    setIsLoading(true);
    
    try {
      const response = await materialService.searchMaterials({
        query: searchQuery,
        ...searchFilters
      });
      
      if (response.success) {
        const materialsData = response.data?.materials || response.data || [];
        return materialsData.map(m => new Material(m));
      } else {
        return [];
      }
    } catch (err) {
      toast.error('Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rate material
  const rateMaterial = useCallback(async (id, rating) => {
    try {
      const response = await materialService.rateMaterial(id, rating);
      
      if (response.success) {
        // Update rating in local state
        const updateRating = (material) => {
          if (material.id === id) {
            return new Material({
              ...material,
              averageRating: response.data?.averageRating || rating,
              ratings: [...(material.ratings || []), rating]
            });
          }
          return material;
        };
        
        setMaterials(prev => prev.map(updateRating));
        setMyMaterials(prev => prev.map(updateRating));
        
        toast.success('Rating submitted!');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to rate material');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to rate material');
      return { success: false, error: err.message };
    }
  }, []);

  // Download material
  const downloadMaterial = useCallback(async (id) => {
    try {
      const response = await materialService.downloadMaterial(id);
      
      if (response.success && response.data?.url) {
        // Trigger download
        window.open(response.data.url, '_blank');
        
        // Update download count optimistically
        const incrementDownloads = (material) => {
          if (material.id === id) {
            return new Material({
              ...material,
              downloads: (material.downloads || 0) + 1
            });
          }
          return material;
        };
        
        setMaterials(prev => prev.map(incrementDownloads));
        setMyMaterials(prev => prev.map(incrementDownloads));
        
        return { success: true };
      } else {
        toast.error('Download failed');
        return { success: false, error: 'Download failed' };
      }
    } catch (err) {
      toast.error(err.message || 'Download failed');
      return { success: false, error: err.message };
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      subject: '',
      search: '',
      sortBy: 'newest',
      status: 'approved'
    });
  }, []);

  // Auto-refresh setup
  const startAutoRefresh = useCallback((intervalMs = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      fetchMaterials(pagination.page);
    }, intervalMs);
  }, [fetchMaterials, pagination.page]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMaterials();
    
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Refresh when filters change
  useEffect(() => {
    fetchMaterials(1);
  }, [filters.subject, filters.sortBy, filters.status]);

  return {
    // State
    materials,
    myMaterials,
    pendingMaterials,
    currentMaterial,
    categories,
    filters,
    pagination,
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    fetchMaterials,
    fetchMyMaterials,
    fetchPendingMaterials,
    fetchMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    approveMaterial,
    rejectMaterial,
    searchMaterials,
    rateMaterial,
    downloadMaterial,
    updateFilters,
    clearFilters,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Pagination helpers
    goToPage: (page) => fetchMaterials(page),
    nextPage: () => fetchMaterials(Math.min(pagination.totalPages, pagination.page + 1)),
    prevPage: () => fetchMaterials(Math.max(1, pagination.page - 1))
  };
};

export default useMaterialController;
