import { apiService } from './api';

export const materialService = {
  // Get all materials with filters and pagination
  async getMaterials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/materials?${queryString}`);
  },

  // Get material by ID
  async getMaterialById(materialId) {
    return await apiService.get(`/api/materials/${materialId}`);
  },

  // Create new material
  async createMaterial(materialData) {
    return await apiService.post('/api/materials', materialData);
  },

  // Update material
  async updateMaterial(materialId, materialData) {
    return await apiService.put(`/api/materials/${materialId}`, materialData);
  },

  // Delete material
  async deleteMaterial(materialId) {
    return await apiService.delete(`/api/materials/${materialId}`);
  },

  // Download material
  async downloadMaterial(materialId) {
    return await apiService.get(`/api/materials/${materialId}/download`);
  },

  // Get materials by subject
  async getMaterialsBySubject(subject, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/materials/subject/${subject}?${queryString}`);
  },

  // Get my materials (for logged in user)
  async getMyMaterials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/materials/my-materials?${queryString}`);
  },

  // Search materials
  async searchMaterials(searchParams) {
    return await apiService.post('/api/materials/search', searchParams);
  },

  // Rate material
  async rateMaterial(materialId, rating) {
    return await apiService.post(`/api/materials/${materialId}/rate`, { rating });
  },

  // Approve material (moderator only)
  async approveMaterial(materialId, data = {}) {
    return await apiService.post(`/api/materials/${materialId}/approve`, data);
  },

  // Reject material (moderator only)
  async rejectMaterial(materialId, data = {}) {
    return await apiService.post(`/api/materials/${materialId}/reject`, data);
  },

  // Get pending materials (moderator only)
  async getPendingMaterials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/materials/pending?${queryString}`);
  }
};
