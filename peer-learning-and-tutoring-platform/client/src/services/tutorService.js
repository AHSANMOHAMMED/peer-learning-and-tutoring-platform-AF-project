import { apiService } from './api';

export const tutorService = {
  // Get all tutors with filters and pagination
  async getTutors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/tutors?${queryString}`);
  },

  // Get tutor by ID
  async getTutorById(tutorId) {
    return await apiService.get(`/api/tutors/${tutorId}`);
  },

  // Create tutor profile
  async createTutor(tutorData) {
    return await apiService.post('/api/tutors', tutorData);
  },

  // Update tutor profile
  async updateTutor(tutorId, tutorData) {
    return await apiService.put(`/api/tutors/${tutorId}`, tutorData);
  },

  // Delete tutor profile
  async deleteTutor(tutorId) {
    return await apiService.delete(`/api/tutors/${tutorId}`);
  },

  // Add subject to tutor
  async addSubject(tutorId, subjectData) {
    return await apiService.post(`/api/tutors/${tutorId}/subjects`, subjectData);
  },

  // Remove subject from tutor
  async removeSubject(tutorId, subjectId) {
    return await apiService.delete(`/api/tutors/${tutorId}/subjects/${subjectId}`);
  },

  // Update subject
  async updateSubject(tutorId, subjectId, subjectData) {
    return await apiService.put(`/api/tutors/${tutorId}/subjects/${subjectId}`, subjectData);
  },

  // Add availability slot
  async addAvailability(tutorId, availabilityData) {
    return await apiService.post(`/api/tutors/${tutorId}/availability`, availabilityData);
  },

  // Remove availability slot
  async removeAvailability(tutorId, slotId) {
    return await apiService.delete(`/api/tutors/${tutorId}/availability/${slotId}`);
  },

  // Update availability slot
  async updateAvailability(tutorId, slotId, availabilityData) {
    return await apiService.put(`/api/tutors/${tutorId}/availability/${slotId}`, availabilityData);
  },

  // Get tutor availability
  async getTutorAvailability(tutorId) {
    return await apiService.get(`/api/tutors/${tutorId}/availability`);
  },

  // Get tutor subjects
  async getTutorSubjects(tutorId) {
    return await apiService.get(`/api/tutors/${tutorId}/subjects`);
  },

  // Get tutor reviews
  async getTutorReviews(tutorId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/tutors/${tutorId}/reviews?${queryString}`);
  },

  // Get tutor statistics
  async getTutorStats(tutorId) {
    return await apiService.get(`/api/tutors/${tutorId}/stats`);
  },

  // Search tutors
  async searchTutors(searchParams) {
    return await apiService.post('/api/tutors/search', searchParams);
  },

  // Get featured tutors
  async getFeaturedTutors(limit = 10) {
    return await apiService.get(`/api/tutors/featured?limit=${limit}`);
  },

  // Get top-rated tutors
  async getTopRatedTutors(limit = 10) {
    return await apiService.get(`/api/tutors/top-rated?limit=${limit}`);
  },

  // Verify tutor
  async verifyTutor(tutorId) {
    return await apiService.post(`/api/tutors/${tutorId}/verify`);
  },

  // Upload verification documents
  async uploadVerificationDocuments(tutorId, formData) {
    return await apiService.upload(`/api/tutors/${tutorId}/documents`, formData);
  }
};
