import { useState, useCallback } from 'react';
import { Tutor } from '../models/Tutor';
import { tutorService } from '../services/tutorService';

export class TutorViewModel {
  constructor() {
    this.tutors = [];
    this.currentTutor = null;
    this.isLoading = false;
    this.error = null;
    this.filters = {
      subject: '',
      grade: '',
      minRating: 0,
      search: ''
    };
    this.pagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    };
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
      tutors: this.tutors,
      currentTutor: this.currentTutor,
      isLoading: this.isLoading,
      error: this.error,
      filters: this.filters,
      pagination: this.pagination
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

  // Set tutors list
  setTutors(tutorsData) {
    this.tutors = tutorsData.map(tutor => Tutor.fromAPI(tutor));
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Set current tutor
  setCurrentTutor(tutorData) {
    this.currentTutor = tutorData ? Tutor.fromAPI(tutorData) : null;
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Set pagination
  setPagination(paginationData) {
    this.pagination = { ...this.pagination, ...paginationData };
    this.notify();
  }

  // Update filters
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.pagination.page = 1; // Reset to first page when filters change
    this.notify();
  }

  // Fetch tutors with filters and pagination
  async fetchTutors() {
    this.setLoading(true);
    try {
      const params = {
        ...this.filters,
        page: this.pagination.page,
        limit: this.pagination.limit
      };

      const response = await tutorService.getTutors(params);
      if (response.success) {
        this.setTutors(response.data.tutors);
        this.setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages
        });
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch tutors');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch tutors');
      return { success: false, message: error.message };
    }
  }

  // Fetch single tutor by ID
  async fetchTutorById(tutorId) {
    this.setLoading(true);
    try {
      const response = await tutorService.getTutorById(tutorId);
      if (response.success) {
        this.setCurrentTutor(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to fetch tutor');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch tutor');
      return { success: false, message: error.message };
    }
  }

  // Create or update tutor profile
  async saveTutorProfile(tutorData) {
    this.setLoading(true);
    try {
      let response;
      if (tutorData.id) {
        response = await tutorService.updateTutor(tutorData.id, tutorData);
      } else {
        response = await tutorService.createTutor(tutorData);
      }

      if (response.success) {
        this.setCurrentTutor(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to save tutor profile');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to save tutor profile');
      return { success: false, message: error.message };
    }
  }

  // Add subject to tutor
  async addSubject(tutorId, subjectData) {
    this.setLoading(true);
    try {
      const response = await tutorService.addSubject(tutorId, subjectData);
      if (response.success) {
        if (this.currentTutor && this.currentTutor.id === tutorId) {
          this.setCurrentTutor(response.data);
        }
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to add subject');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to add subject');
      return { success: false, message: error.message };
    }
  }

  // Remove subject from tutor
  async removeSubject(tutorId, subjectId) {
    this.setLoading(true);
    try {
      const response = await tutorService.removeSubject(tutorId, subjectId);
      if (response.success) {
        if (this.currentTutor && this.currentTutor.id === tutorId) {
          this.setCurrentTutor(response.data);
        }
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to remove subject');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to remove subject');
      return { success: false, message: error.message };
    }
  }

  // Add availability slot
  async addAvailability(tutorId, availabilityData) {
    this.setLoading(true);
    try {
      const response = await tutorService.addAvailability(tutorId, availabilityData);
      if (response.success) {
        if (this.currentTutor && this.currentTutor.id === tutorId) {
          this.setCurrentTutor(response.data);
        }
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to add availability');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to add availability');
      return { success: false, message: error.message };
    }
  }

  // Remove availability slot
  async removeAvailability(tutorId, slotId) {
    this.setLoading(true);
    try {
      const response = await tutorService.removeAvailability(tutorId, slotId);
      if (response.success) {
        if (this.currentTutor && this.currentTutor.id === tutorId) {
          this.setCurrentTutor(response.data);
        }
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to remove availability');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to remove availability');
      return { success: false, message: error.message };
    }
  }

  // Set page
  setPage(page) {
    this.pagination.page = page;
    this.notify();
  }

  // Clear current tutor
  clearCurrentTutor() {
    this.currentTutor = null;
    this.notify();
  }

  // Clear error
  clearError() {
    this.error = null;
    this.notify();
  }

  // Reset filters
  resetFilters() {
    this.filters = {
      subject: '',
      grade: '',
      minRating: 0,
      search: ''
    };
    this.pagination.page = 1;
    this.notify();
  }
}

// Create singleton instance
export const tutorViewModel = new TutorViewModel();

// Custom hook for using TutorViewModel in React components
export function useTutorViewModel() {
  const [state, setState] = useState(tutorViewModel.getState());

  const updateState = useCallback(() => {
    setState(tutorViewModel.getState());
  }, []);

  // Subscribe to tutor view model changes
  useState(() => {
    const unsubscribe = tutorViewModel.subscribe(updateState);
    return unsubscribe;
  });

  return {
    ...state,
    fetchTutors: tutorViewModel.fetchTutors.bind(tutorViewModel),
    fetchTutorById: tutorViewModel.fetchTutorById.bind(tutorViewModel),
    saveTutorProfile: tutorViewModel.saveTutorProfile.bind(tutorViewModel),
    addSubject: tutorViewModel.addSubject.bind(tutorViewModel),
    removeSubject: tutorViewModel.removeSubject.bind(tutorViewModel),
    addAvailability: tutorViewModel.addAvailability.bind(tutorViewModel),
    removeAvailability: tutorViewModel.removeAvailability.bind(tutorViewModel),
    updateFilters: tutorViewModel.updateFilters.bind(tutorViewModel),
    setPage: tutorViewModel.setPage.bind(tutorViewModel),
    clearCurrentTutor: tutorViewModel.clearCurrentTutor.bind(tutorViewModel),
    clearError: tutorViewModel.clearError.bind(tutorViewModel),
    resetFilters: tutorViewModel.resetFilters.bind(tutorViewModel)
  };
}
