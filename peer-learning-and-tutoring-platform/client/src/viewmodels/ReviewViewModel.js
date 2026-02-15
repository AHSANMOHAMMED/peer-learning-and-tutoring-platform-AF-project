import { useState, useCallback } from 'react';
import { Review } from '../models/Review';
import { reviewService } from '../services/reviewService';

export class ReviewViewModel {
  constructor() {
    this.reviews = [];
    this.currentReview = null;
    this.tutorStats = null;
    this.isLoading = false;
    this.error = null;
    this.filters = {
      tutorId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.pagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  getState() {
    return {
      reviews: this.reviews,
      currentReview: this.currentReview,
      tutorStats: this.tutorStats,
      isLoading: this.isLoading,
      error: this.error,
      filters: this.filters,
      pagination: this.pagination
    };
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.error = null;
    this.notify();
  }

  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notify();
  }

  setReviews(reviewsData) {
    this.reviews = reviewsData.map(review => Review.fromAPI(review));
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  setCurrentReview(reviewData) {
    this.currentReview = reviewData ? Review.fromAPI(reviewData) : null;
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  setTutorStats(statsData) {
    this.tutorStats = statsData;
    this.notify();
  }

  setPagination(paginationData) {
    this.pagination = { ...this.pagination, ...paginationData };
    this.notify();
  }

  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.pagination.page = 1;
    this.notify();
  }

  async fetchReviews() {
    this.setLoading(true);
    try {
      const params = {
        ...this.filters,
        page: this.pagination.page,
        limit: this.pagination.limit
      };

      const response = await reviewService.getReviews(params);
      if (response.success) {
        this.setReviews(response.data.reviews);
        this.setPagination(response.data.pagination);
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch reviews');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch reviews');
      return { success: false, message: error.message };
    }
  }

  async fetchTutorReviews(tutorId) {
    this.setLoading(true);
    this.updateFilters({ tutorId });
    try {
      const response = await reviewService.getTutorReviews(tutorId, {
        page: this.pagination.page,
        limit: this.pagination.limit
      });
      if (response.success) {
        this.setReviews(response.data.reviews);
        this.setTutorStats(response.data.stats);
        this.setPagination(response.data.pagination);
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch tutor reviews');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch tutor reviews');
      return { success: false, message: error.message };
    }
  }

  async createReview(reviewData) {
    this.setLoading(true);
    try {
      const response = await reviewService.createReview(reviewData);
      if (response.success) {
        const newReview = Review.fromAPI(response.data);
        this.reviews.unshift(newReview);
        this.notify();
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to create review');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to create review');
      return { success: false, message: error.message };
    }
  }

  async addTutorResponse(reviewId, comment) {
    this.setLoading(true);
    try {
      const response = await reviewService.addTutorResponse(reviewId, comment);
      if (response.success) {
        if (this.currentReview && this.currentReview.id === reviewId) {
          this.setCurrentReview(response.data);
        }
        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index >= 0) {
          this.reviews[index] = Review.fromAPI(response.data);
          this.notify();
        }
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to add response');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to add response');
      return { success: false, message: error.message };
    }
  }

  async markHelpful(reviewId) {
    try {
      const response = await reviewService.markHelpful(reviewId);
      if (response.success) {
        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index >= 0) {
          this.reviews[index].helpful.count = response.data.helpfulCount;
          this.notify();
        }
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  setPage(page) {
    this.pagination.page = page;
    this.notify();
  }

  clearCurrentReview() {
    this.currentReview = null;
    this.notify();
  }

  clearError() {
    this.error = null;
    this.notify();
  }

  resetFilters() {
    this.filters = {
      tutorId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.pagination.page = 1;
    this.notify();
  }
}

export const reviewViewModel = new ReviewViewModel();

export function useReviewViewModel() {
  const [state, setState] = useState(reviewViewModel.getState());

  const updateState = useCallback(() => {
    setState(reviewViewModel.getState());
  }, []);

  useState(() => {
    const unsubscribe = reviewViewModel.subscribe(updateState);
    return unsubscribe;
  });

  return {
    ...state,
    fetchReviews: reviewViewModel.fetchReviews.bind(reviewViewModel),
    fetchTutorReviews: reviewViewModel.fetchTutorReviews.bind(reviewViewModel),
    createReview: reviewViewModel.createReview.bind(reviewViewModel),
    addTutorResponse: reviewViewModel.addTutorResponse.bind(reviewViewModel),
    markHelpful: reviewViewModel.markHelpful.bind(reviewViewModel),
    setPage: reviewViewModel.setPage.bind(reviewViewModel),
    clearCurrentReview: reviewViewModel.clearCurrentReview.bind(reviewViewModel),
    clearError: reviewViewModel.clearError.bind(reviewViewModel),
    resetFilters: reviewViewModel.resetFilters.bind(reviewViewModel)
  };
}
