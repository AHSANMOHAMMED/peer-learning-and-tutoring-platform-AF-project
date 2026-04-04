import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.DEV) {
  console.debug('API base URL:', API_BASE_URL);
}

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
      error.message = `Network error. Please check your connection or the API at ${API_BASE_URL}.`;
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = (response) => {
  // Backend already returns {success, data, message} structure
  // Just return it directly without double wrapping
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data;
  }
  
  // Fallback for responses that don't follow the standard structure
  return {
    success: true,
    data: response.data,
    message: response.data.message || 'Success'
  };
};

// Helper function to handle API errors
const handleError = (error) => {
  // If backend returns {success: false, message}, use that
  if (error.response?.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
    return error.response.data;
  }
  
  // Otherwise construct error response
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
    return apiService.get(`/api/questions${queryString ? `?${queryString}` : ''}`);
  },

  async getQuestionById(id) {
    return apiService.get(`/api/questions/${id}`);
  },

  async createQuestion(questionData) {
    return apiService.post('/api/questions', questionData);
  },

  async updateQuestion(id, questionData) {
    return apiService.put(`/api/questions/${id}`, questionData);
  },

  async deleteQuestion(id) {
    return apiService.delete(`/api/questions/${id}`);
  },

  // Answers
  async getAnswersByQuestionId(questionId) {
    return apiService.get(`/api/answers/question/${questionId}`);
  },

  async createAnswer(answerData) {
    const { questionId, ...payload } = answerData || {};
    if (!questionId) {
      return {
        success: false,
        message: 'questionId is required to create an answer'
      };
    }
    return apiService.post(`/api/answers/question/${questionId}`, payload);
  },

  async updateAnswer(id, answerData) {
    return apiService.put(`/api/answers/${id}`, answerData);
  },

  async deleteAnswer(id) {
    return apiService.delete(`/api/answers/${id}`);
  },

  async acceptAnswer(id, questionId) {
    return {
      success: false,
      message: 'Accept answer endpoint is not available in current backend routes.'
    };
  },

  // Voting
  async vote(targetType, targetId, value) {
    return apiService.post('/api/votes', { targetType, targetId, value });
  },

  // Leaderboard
  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/api/gamification/leaderboard${queryString ? `?${queryString}` : ''}`);
  },

  async getCategoryLeaderboard(category, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/api/gamification/leaderboard${queryString ? `?${queryString}` : ''}`);
  },

  async getUserRank(userId) {
    return apiService.get('/api/gamification/leaderboard/nearby');
  },

  // Notifications
  async getNotifications(unreadOnly = false) {
    const params = unreadOnly ? { unreadOnly: true } : {};
    return apiService.get('/api/notifications', { params });
  },

  async markNotificationAsRead(id) {
    return apiService.put(`/api/notifications/${id}/read`);
  },

  async markAllNotificationsAsRead() {
    return apiService.put('/api/notifications/read-all');
  },

  // User Points
  async getUserPoints(userId) {
    return apiService.get('/api/gamification/profile');
  },

  async getUserPointHistory(userId, limit = 10) {
    return {
      success: false,
      message: 'User point history endpoint is not available in current backend routes.'
    };
  }
};

export default api;
