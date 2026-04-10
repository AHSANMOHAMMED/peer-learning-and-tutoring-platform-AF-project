import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const learningGamesApi = {
  getCatalog: () => api.get('/gamification/catalog').then(res => res.data),
  submitAttempt: (data: any) => api.post('/gamification/attempt', data).then(res => res.data),
  getLeaderboard: (params: any) => api.get('/gamification/leaderboard', { params }).then(res => res.data),
};

export default api;

