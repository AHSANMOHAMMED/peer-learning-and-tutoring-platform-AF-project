import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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

export default api;
