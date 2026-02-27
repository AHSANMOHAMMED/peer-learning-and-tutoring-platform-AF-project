import { useState, useCallback, useEffect } from 'react';
import { Booking } from '../models/Booking';
import { bookingService } from '../services/bookingService';

export class BookingViewModel {
  constructor() {
    this.bookings = [];
    this.currentBooking = null;
    this.isLoading = false;
    this.error = null;
    this.filters = {
      status: '',
      studentId: '',
      tutorId: '',
      dateFrom: '',
      dateTo: ''
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
      bookings: this.bookings,
      currentBooking: this.currentBooking,
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

  // Set bookings list
  setBookings(bookingsData) {
    this.bookings = bookingsData.map(booking => Booking.fromAPI(booking));
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Set current booking
  setCurrentBooking(bookingData) {
    this.currentBooking = bookingData ? Booking.fromAPI(bookingData) : null;
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Add or update booking in the list
  upsertBooking(bookingData) {
    const booking = Booking.fromAPI(bookingData);
    const index = this.bookings.findIndex(b => b.id === booking.id);
    
    if (index >= 0) {
      this.bookings[index] = booking;
    } else {
      this.bookings.unshift(booking);
    }
    
    this.notify();
  }

  // Remove booking from list
  removeBooking(bookingId) {
    this.bookings = this.bookings.filter(b => b.id !== bookingId);
    if (this.currentBooking && this.currentBooking.id === bookingId) {
      this.currentBooking = null;
    }
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

  // Fetch bookings with filters and pagination
  async fetchBookings() {
    this.setLoading(true);
    try {
      const params = {
        ...this.filters,
        page: this.pagination.page,
        limit: this.pagination.limit
      };

      const response = await bookingService.getBookings(params);
      if (response.success) {
        this.setBookings(response.data.bookings);
        this.setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages
        });
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch bookings');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch bookings');
      return { success: false, message: error.message };
    }
  }

  // Fetch single booking by ID
  async fetchBookingById(bookingId) {
    this.setLoading(true);
    try {
      const response = await bookingService.getBookingById(bookingId);
      if (response.success) {
        this.setCurrentBooking(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to fetch booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch booking');
      return { success: false, message: error.message };
    }
  }

  // Create new booking
  async createBooking(bookingData) {
    this.setLoading(true);
    try {
      const response = await bookingService.createBooking(bookingData);
      if (response.success) {
        this.upsertBooking(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to create booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to create booking');
      return { success: false, message: error.message };
    }
  }

  // Update booking
  async updateBooking(bookingId, bookingData) {
    this.setLoading(true);
    try {
      const response = await bookingService.updateBooking(bookingId, bookingData);
      if (response.success) {
        this.upsertBooking(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to update booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to update booking');
      return { success: false, message: error.message };
    }
  }

  // Confirm booking
  async confirmBooking(bookingId) {
    this.setLoading(true);
    try {
      const response = await bookingService.confirmBooking(bookingId);
      if (response.success) {
        this.upsertBooking(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to confirm booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to confirm booking');
      return { success: false, message: error.message };
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, reason = '') {
    this.setLoading(true);
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      if (response.success) {
        this.upsertBooking(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to cancel booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to cancel booking');
      return { success: false, message: error.message };
    }
  }

  // Complete booking
  async completeBooking(bookingId) {
    this.setLoading(true);
    try {
      const response = await bookingService.completeBooking(bookingId);
      if (response.success) {
        this.upsertBooking(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to complete booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to complete booking');
      return { success: false, message: error.message };
    }
  }

  // Delete booking
  async deleteBooking(bookingId) {
    this.setLoading(true);
    try {
      const response = await bookingService.deleteBooking(bookingId);
      if (response.success) {
        this.removeBooking(bookingId);
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to delete booking');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to delete booking');
      return { success: false, message: error.message };
    }
  }

  // Get bookings for student
  async getStudentBookings(studentId) {
    this.updateFilters({ studentId });
    return await this.fetchBookings();
  }

  // Get bookings for tutor
  async getTutorBookings(tutorId) {
    this.updateFilters({ tutorId });
    return await this.fetchBookings();
  }

  // Set page
  setPage(page) {
    this.pagination.page = page;
    this.notify();
  }

  // Clear current booking
  clearCurrentBooking() {
    this.currentBooking = null;
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
      status: '',
      studentId: '',
      tutorId: '',
      dateFrom: '',
      dateTo: ''
    };
    this.pagination.page = 1;
    this.notify();
  }
}

// Create singleton instance
export const bookingViewModel = new BookingViewModel();

// Custom hook for using BookingViewModel in React components
export function useBookingViewModel() {
  const [state, setState] = useState(bookingViewModel.getState());

  const updateState = useCallback(() => {
    setState(bookingViewModel.getState());
  }, []);

  // Subscribe to booking view model changes
  useEffect(() => {
    const unsubscribe = bookingViewModel.subscribe(updateState);
    return unsubscribe;
  }, [updateState]);

  return {
    ...state,
    fetchBookings: bookingViewModel.fetchBookings.bind(bookingViewModel),
    fetchBookingById: bookingViewModel.fetchBookingById.bind(bookingViewModel),
    createBooking: bookingViewModel.createBooking.bind(bookingViewModel),
    updateBooking: bookingViewModel.updateBooking.bind(bookingViewModel),
    confirmBooking: bookingViewModel.confirmBooking.bind(bookingViewModel),
    cancelBooking: bookingViewModel.cancelBooking.bind(bookingViewModel),
    completeBooking: bookingViewModel.completeBooking.bind(bookingViewModel),
    deleteBooking: bookingViewModel.deleteBooking.bind(bookingViewModel),
    getStudentBookings: bookingViewModel.getStudentBookings.bind(bookingViewModel),
    getTutorBookings: bookingViewModel.getTutorBookings.bind(bookingViewModel),
    updateFilters: bookingViewModel.updateFilters.bind(bookingViewModel),
    setPage: bookingViewModel.setPage.bind(bookingViewModel),
    clearCurrentBooking: bookingViewModel.clearCurrentBooking.bind(bookingViewModel),
    clearError: bookingViewModel.clearError.bind(bookingViewModel),
    resetFilters: bookingViewModel.resetFilters.bind(bookingViewModel)
  };
}
