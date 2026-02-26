import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_SERVER_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data,
    message: response.data.message || 'Success'
  };
};

// Helper function to handle API errors
const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  return {
    success: false,
    message,
    status: error.response?.status,
    data: error.response?.data
  };
};

// Generic API methods
export const apiService = {
  // GET request
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // File upload
  async upload(url, formData, config = {}) {
    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers,
        },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};

// Q&A Forum API Services
export const qaApi = {
  // Questions
  async getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/api/qa/questions?${queryString}`);
  },

  async getQuestionById(id) {
    return apiService.get(`/api/qa/questions/${id}`);
  },

  async createQuestion(questionData) {
    return apiService.post('/api/qa/questions', questionData);
  },

  async updateQuestion(id, questionData) {
    return apiService.put(`/api/qa/questions/${id}`, questionData);
  },

  async deleteQuestion(id) {
    return apiService.delete(`/api/qa/questions/${id}`);
  },

  // Answers
  async getAnswersByQuestionId(questionId) {
    return apiService.get(`/api/qa/answers/${questionId}`);
  },

  async createAnswer(answerData) {
    return apiService.post('/api/qa/answers', answerData);
  },

  async updateAnswer(id, answerData) {
    return apiService.put(`/api/qa/answers/${id}`, answerData);
  },

  async deleteAnswer(id) {
    return apiService.delete(`/api/qa/answers/${id}`);
  },

  async acceptAnswer(id, questionId) {
    return apiService.post(`/api/qa/answers/${id}/accept`, { questionId });
  },

  // Voting
  async vote(targetType, targetId, value) {
    return apiService.post('/api/qa/vote', { targetType, targetId, value });
  },

  // Leaderboard
  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/api/qa/leaderboard/overall?${queryString}`);
  },

  async getCategoryLeaderboard(category, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/api/qa/leaderboard/${category}?${queryString}`);
  },

  async getUserRank(userId) {
    return apiService.get(`/api/qa/leaderboard/user/${userId}`);
  },

  // Notifications
  async getNotifications(unreadOnly = false) {
    const params = unreadOnly ? { unreadOnly: true } : {};
    return apiService.get('/api/qa/notifications', { params });
  },

  async markNotificationAsRead(id) {
    return apiService.put(`/api/qa/notifications/${id}/read`);
  },

  async markAllNotificationsAsRead() {
    return apiService.put('/api/qa/notifications/read-all');
  },

  // User Points
  async getUserPoints(userId) {
    return apiService.get(`/api/qa/users/${userId}/points`);
  },

  async getUserPointHistory(userId, limit = 10) {
    return apiService.get(`/api/qa/users/${userId}/points/history?limit=${limit}`);
  }
};

export default api;
