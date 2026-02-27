import apiService from './api';

/**
 * MaterialService - Handles all material/resource-related API calls
 */
export const materialService = {
  /**
   * Get all materials with optional filters
   * @param {Object} filters - Filter parameters (subject, grade, type, page, limit)
   * @returns {Promise} Materials data with pagination
   */
  async getMaterials(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiService.get(`/api/materials${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Get material by ID
   * @param {string} materialId - Material ID
   * @returns {Promise} Material data
   */
  async getMaterialById(materialId) {
    return await apiService.get(`/api/materials/${materialId}`);
  },

  /**
   * Upload a new material
   * @param {FormData} formData - Form data containing file and metadata
   * @returns {Promise} Uploaded material data
   */
  async uploadMaterial(formData) {
    return await apiService.post('/api/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Update material metadata
   * @param {string} materialId - Material ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated material data
   */
  async updateMaterial(materialId, updateData) {
    return await apiService.put(`/api/materials/${materialId}`, updateData);
  },

  /**
   * Delete a material
   * @param {string} materialId - Material ID
   * @returns {Promise} Response data
   */
  async deleteMaterial(materialId) {
    return await apiService.delete(`/api/materials/${materialId}`);
  },

  /**
   * Get materials by tutor
   * @param {string} tutorId - Tutor ID
   * @param {Object} filters - Optional filters
   * @returns {Promise} Materials data
   */
  async getMaterialsByTutor(tutorId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiService.get(`/api/materials/tutor/${tutorId}${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Download a material
   * @param {string} materialId - Material ID
   * @returns {Promise} Download URL or blob
   */
  async downloadMaterial(materialId) {
    return await apiService.get(`/api/materials/${materialId}/download`);
  },

  /**
   * Get material categories/types
   * @returns {Promise} Available categories
   */
  async getCategories() {
    return await apiService.get('/api/materials/categories');
  },

  /**
   * Search materials
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  async searchMaterials(query, filters = {}) {
    return await apiService.get('/api/materials/search', {
      params: { query, ...filters }
    });
  },

  /**
   * Share material with students
   * @param {string} materialId - Material ID
   * @param {Array} studentIds - Array of student IDs
   * @returns {Promise} Response data
   */
  async shareMaterial(materialId, studentIds) {
    return await apiService.post(`/api/materials/${materialId}/share`, { studentIds });
  },

  /**
   * Get shared materials for current user
   * @returns {Promise} Shared materials
   */
  async getSharedMaterials() {
    return await apiService.get('/api/materials/shared');
  }
};

export default materialService;
