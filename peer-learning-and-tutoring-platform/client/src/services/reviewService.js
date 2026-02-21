import { apiService } from './api';

export const reviewService = {
  // Get all reviews
  async getReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/reviews?${queryString}`);
  },

  // Get review by ID
  async getReviewById(reviewId) {
    return await apiService.get(`/api/reviews/${reviewId}`);
  },

  // Create review
  async createReview(reviewData) {
    return await apiService.post('/api/reviews', reviewData);
  },

  // Update review
  async updateReview(reviewId, reviewData) {
    return await apiService.put(`/api/reviews/${reviewId}`, reviewData);
  },

  // Delete review
  async deleteReview(reviewId) {
    return await apiService.delete(`/api/reviews/${reviewId}`);
  },

  // Get tutor reviews with stats
  async getTutorReviews(tutorId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/reviews/tutor/${tutorId}?${queryString}`);
  },

  // Add tutor response to review
  async addTutorResponse(reviewId, comment) {
    return await apiService.post(`/api/reviews/${reviewId}/response`, { comment });
  },

  // Mark review as helpful
  async markHelpful(reviewId) {
    return await apiService.post(`/api/reviews/${reviewId}/helpful`);
  },

  // Report review
  async reportReview(reviewId, reason) {
    return await apiService.post(`/api/reviews/${reviewId}/report`, { reason });
  }
};
