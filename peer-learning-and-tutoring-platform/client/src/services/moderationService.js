import { apiService } from './api';

export const moderationService = {
  // Get all reports with filters and pagination
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/moderation/reports?${queryString}`);
  },

  // Get report by ID
  async getReportById(reportId) {
    return await apiService.get(`/api/moderation/reports/${reportId}`);
  },

  // Create a new report
  async createReport(reportData) {
    return await apiService.post('/api/moderation/reports', reportData);
  },

  // Resolve a report with action
  async resolveReport(reportId, data = {}) {
    return await apiService.post(`/api/moderation/reports/${reportId}/resolve`, data);
  },

  // Dismiss a report
  async dismissReport(reportId, data = {}) {
    return await apiService.post(`/api/moderation/reports/${reportId}/dismiss`, data);
  },

  // Get moderation statistics
  async getModerationStats() {
    return await apiService.get('/api/moderation/stats');
  },

  // Get flagged content
  async getFlaggedContent(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/moderation/flagged?${queryString}`);
  },

  // Review flagged content
  async reviewFlaggedContent(contentId, data = {}) {
    return await apiService.post(`/api/moderation/flagged/${contentId}/review`, data);
  }
};
