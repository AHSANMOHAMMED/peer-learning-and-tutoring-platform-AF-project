import materialService from '../services/materialService';

/**
 * MaterialViewModel - Manages material/resource state and business logic
 * Follows Observer pattern for reactive state updates
 */
export class MaterialViewModel {
  constructor() {
    this.materials = [];
    this.currentMaterial = null;
    this.isLoading = false;
    this.error = null;
    this.uploadProgress = 0;
    this.filters = {
      subject: null,
      grade: null,
      type: null,
      search: ''
    };
    this.pagination = {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    };
    this.categories = [];
    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Get current state
  getState() {
    return {
      materials: this.materials,
      currentMaterial: this.currentMaterial,
      isLoading: this.isLoading,
      error: this.error,
      uploadProgress: this.uploadProgress,
      filters: this.filters,
      pagination: this.pagination,
      categories: this.categories
    };
  }

  // Set loading state
  setLoading(loading) {
    this.isLoading = loading;
    this.error = null;
    this.notify();
  }

  // Set error state
  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notify();
  }

  // Set materials
  setMaterials(materials, pagination = null) {
    this.materials = materials;
    if (pagination) {
      this.pagination = pagination;
    }
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Set current material
  setCurrentMaterial(material) {
    this.currentMaterial = material;
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Set upload progress
  setUploadProgress(progress) {
    this.uploadProgress = progress;
    this.notify();
  }

  // Update filters
  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.pagination.page = 1; // Reset to first page when filters change
    this.notify();
  }

  // Clear filters
  clearFilters() {
    this.filters = {
      subject: null,
      grade: null,
      type: null,
      search: ''
    };
    this.pagination.page = 1;
    this.notify();
  }

  // Fetch materials
  async fetchMaterials(filters = {}) {
    this.setLoading(true);
    try {
      const queryFilters = {
        ...this.filters,
        ...filters,
        page: this.pagination.page,
        limit: this.pagination.limit
      };

      const response = await materialService.getMaterials(queryFilters);
      if (response.success) {
        this.setMaterials(response.data.materials, response.data.pagination);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to load materials');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to load materials');
      return { success: false, message: error.message };
    }
  }

  // Fetch material by ID
  async fetchMaterialById(materialId) {
    this.setLoading(true);
    try {
      const response = await materialService.getMaterialById(materialId);
      if (response.success) {
        this.setCurrentMaterial(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to load material');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to load material');
      return { success: false, message: error.message };
    }
  }

  // Upload material
  async uploadMaterial(file, metadata = {}) {
    this.setLoading(true);
    this.setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata fields
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await materialService.uploadMaterial(formData);
      
      if (response.success) {
        // Add new material to the list
        this.materials = [response.data, ...this.materials];
        this.setUploadProgress(100);
        this.isLoading = false;
        this.notify();
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to upload material');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to upload material');
      return { success: false, message: error.message };
    }
  }

  // Update material
  async updateMaterial(materialId, updateData) {
    this.setLoading(true);
    try {
      const response = await materialService.updateMaterial(materialId, updateData);
      if (response.success) {
        // Update material in the list
        this.materials = this.materials.map(m => 
          m._id === materialId ? response.data : m
        );
        
        if (this.currentMaterial && this.currentMaterial._id === materialId) {
          this.currentMaterial = response.data;
        }
        
        this.isLoading = false;
        this.notify();
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to update material');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to update material');
      return { success: false, message: error.message };
    }
  }

  // Delete material
  async deleteMaterial(materialId) {
    this.setLoading(true);
    try {
      const response = await materialService.deleteMaterial(materialId);
      if (response.success) {
        // Remove material from the list
        this.materials = this.materials.filter(m => m._id !== materialId);
        
        if (this.currentMaterial && this.currentMaterial._id === materialId) {
          this.currentMaterial = null;
        }
        
        this.isLoading = false;
        this.notify();
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to delete material');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to delete material');
      return { success: false, message: error.message };
    }
  }

  // Download material
  async downloadMaterial(materialId) {
    try {
      const response = await materialService.downloadMaterial(materialId);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Fetch categories
  async fetchCategories() {
    try {
      const response = await materialService.getCategories();
      if (response.success) {
        this.categories = response.data;
        this.notify();
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Search materials
  async searchMaterials(query) {
    this.setLoading(true);
    try {
      const response = await materialService.searchMaterials(query, this.filters);
      if (response.success) {
        this.setMaterials(response.data.materials, response.data.pagination);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Search failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Search failed');
      return { success: false, message: error.message };
    }
  }

  // Share material
  async shareMaterial(materialId, studentIds) {
    this.setLoading(true);
    try {
      const response = await materialService.shareMaterial(materialId, studentIds);
      if (response.success) {
        this.isLoading = false;
        this.notify();
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to share material');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to share material');
      return { success: false, message: error.message };
    }
  }

  // Get shared materials
  async fetchSharedMaterials() {
    this.setLoading(true);
    try {
      const response = await materialService.getSharedMaterials();
      if (response.success) {
        this.setMaterials(response.data.materials, response.data.pagination);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to load shared materials');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to load shared materials');
      return { success: false, message: error.message };
    }
  }

  // Get materials by tutor
  async fetchMaterialsByTutor(tutorId, filters = {}) {
    this.setLoading(true);
    try {
      const response = await materialService.getMaterialsByTutor(tutorId, filters);
      if (response.success) {
        this.setMaterials(response.data.materials, response.data.pagination);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to load tutor materials');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to load tutor materials');
      return { success: false, message: error.message };
    }
  }

  // Change page
  setPage(page) {
    this.pagination.page = page;
    this.notify();
  }

  // Next page
  nextPage() {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page += 1;
      this.notify();
      return true;
    }
    return false;
  }

  // Previous page
  previousPage() {
    if (this.pagination.page > 1) {
      this.pagination.page -= 1;
      this.notify();
      return true;
    }
    return false;
  }

  // Cleanup
  cleanup() {
    this.listeners = [];
  }
}

export default MaterialViewModel;
