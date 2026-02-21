import { apiService } from './api';

export const bookingService = {
  // Get all bookings with filters and pagination
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings?${queryString}`);
  },

  // Get booking by ID
  async getBookingById(bookingId) {
    return await apiService.get(`/api/bookings/${bookingId}`);
  },

  // Create new booking
  async createBooking(bookingData) {
    return await apiService.post('/api/bookings', bookingData);
  },

  // Update booking
  async updateBooking(bookingId, bookingData) {
    return await apiService.put(`/api/bookings/${bookingId}`, bookingData);
  },

  // Delete booking
  async deleteBooking(bookingId) {
    return await apiService.delete(`/api/bookings/${bookingId}`);
  },

  // Confirm booking
  async confirmBooking(bookingId) {
    return await apiService.post(`/api/bookings/${bookingId}/confirm`);
  },

  // Cancel booking
  async cancelBooking(bookingId, reason = '') {
    return await apiService.post(`/api/bookings/${bookingId}/cancel`, { reason });
  },

  // Complete booking
  async completeBooking(bookingId) {
    return await apiService.post(`/api/bookings/${bookingId}/complete`);
  },

  // Get student bookings
  async getStudentBookings(studentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/student/${studentId}?${queryString}`);
  },

  // Get tutor bookings
  async getTutorBookings(tutorId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/tutor/${tutorId}?${queryString}`);
  },

  // Get upcoming bookings
  async getUpcomingBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/upcoming?${queryString}`);
  },

  // Get past bookings
  async getPastBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/past?${queryString}`);
  },

  // Get booking statistics
  async getBookingStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/stats?${queryString}`);
  },

  // Check availability for booking
  async checkAvailability(tutorId, date, startTime, duration) {
    return await apiService.post('/api/bookings/check-availability', {
      tutorId,
      date,
      startTime,
      duration
    });
  },

  // Get available time slots for a tutor on a specific date
  async getAvailableSlots(tutorId, date) {
    return await apiService.get(`/api/bookings/available-slots/${tutorId}?date=${date}`);
  },

  // Reschedule booking
  async rescheduleBooking(bookingId, newDate, newStartTime) {
    return await apiService.post(`/api/bookings/${bookingId}/reschedule`, {
      newDate,
      newStartTime
    });
  },

  // Add note to booking
  async addBookingNote(bookingId, note) {
    return await apiService.post(`/api/bookings/${bookingId}/notes`, { note });
  },

  // Get booking history
  async getBookingHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/history?${queryString}`);
  },

  // Export bookings
  async exportBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/bookings/export?${queryString}`);
  }
};
