import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
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
  getCatalog: () => api.get('/gamification/catalog').then((res) => res.data),
  submitAttempt: (data) => api.post('/gamification/attempt', data).then((res) => res.data),
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }).then((res) => res.data)
};

export const breakTimeGamesApi = {
  getActiveGames: () => api.get('/games').then((res) => res.data)
};

export const adminGamesApi = {
  getAll: () => api.get('/admin/games').then((res) => res.data),
  getById: (id) => api.get(`/admin/games/${id}`).then((res) => res.data),
  updateTimer: (id, timerSeconds) => api.put(`/admin/games/${id}/timer`, { timerSeconds }).then((res) => res.data),
  updateStatus: (id, isActive) => api.put(`/admin/games/${id}/status`, { isActive }).then((res) => res.data),
  delete: (id) => api.delete(`/admin/games/${id}`).then((res) => res.data)
};

export const notificationApi = {
  getNotifications: (params) => api.get('/notifications', { params }).then((res) => res.data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: () => api.put('/notifications/read-all').then((res) => res.data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`).then((res) => res.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then((res) => res.data)
};

export const userManagementApi = {
  getAllUsers: (params) => api.get('/admin/users', { params }).then((res) => res.data),
  updateRole: (id, role, reason) => api.put(`/admin/users/${id}/role`, { role, reason }).then((res) => res.data),
  updateStatus: (id, isActive, reason) => api.put(`/admin/users/${id}/status`, { isActive, reason }).then((res) => res.data),
  bulkOperations: (data) => api.post('/admin/users/bulk', data).then((res) => res.data)
};

export const timetableApi = {
  getSchedule: () => api.get('/timetable').then((res) => res.data),
  addTimeSlot: (data) => api.post('/timetable', data).then((res) => res.data),
  updateTimeSlot: (id, data) => api.put(`/timetable/${id}`, data).then((res) => res.data),
  deleteTimeSlot: (id) => api.delete(`/timetable/${id}`).then((res) => res.data)
};

export const parentApi = {
  getLinkedStudents: () => api.get('/parent/students').then((res) => res.data),
  linkStudent: (data) => api.post('/parent/link-student', data).then((res) => res.data),
  getStudentSummary: (id) => api.get(`/parent/student/${id}/summary`).then((res) => res.data),
  getStudentProgress: (id, params) => api.get(`/parent/student/${id}/progress`, { params }).then((res) => res.data),
  getAlerts: () => api.get('/parent/alerts').then((res) => res.data),
  updatePermissions: (linkId, permissions) => api.put(`/parent/link/${linkId}/permissions`, { permissions }).then((res) => res.data),
  removeLink: (linkId) => api.delete(`/parent/link/${linkId}`).then((res) => res.data),
  nudgeStudent: (studentId, type) => api.post(`/parent/student/${studentId}/nudge`, { type }).then((res) => res.data)
};

export const homeworkApi = {
  submit: (data) => api.post('/homework/submit', data).then((res) => res.data),
  uploadFiles: (formData) => api.post('/homework/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((res) => res.data),
  getStudentHistory: () => api.get('/homework/student/history').then((res) => res.data),
  getTutorPending: () => api.get('/homework/tutor/pending').then((res) => res.data),
  grade: (id, data) => api.put(`/homework/grade/${id}`, data).then((res) => res.data)
};

export const fileApi = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((res) => res.data)
};

export const groupsApi = {
  getAll: (params) => api.get('/groups', { params }).then((res) => res.data),
  getMyRooms: () => api.get('/groups/my-rooms').then((res) => res.data),
  getById: (id) => api.get(`/groups/${id}`).then((res) => res.data),
  create: (data) => api.post('/groups', data).then((res) => res.data),
  join: (id) => api.post(`/groups/${id}/join`).then((res) => res.data),
  leave: (id) => api.delete(`/groups/${id}/leave`).then((res) => res.data),
  sendMessage: (id, data) => api.post(`/groups/${id}/chat`, data).then((res) => res.data)
};

export const messageApi = {
  getConversations: () => api.get('/messages/conversations').then((res) => res.data),
  getOrCreateConversation: (data) => api.post('/messages/conversations', data).then((res) => res.data),
  getMessages: (id) => api.get(`/messages/conversations/${id}/messages`).then((res) => res.data),
  sendMessage: (id, data) => api.post(`/messages/conversations/${id}/messages`, data).then((res) => res.data),
  markMessageAsRead: (id) => api.put(`/messages/messages/${id}/read`).then((res) => res.data),
  deleteMessage: (id) => api.delete(`/messages/messages/${id}`).then((res) => res.data),
  getUnreadCount: () => api.get('/messages/unread-count').then((res) => res.data),
  archiveConversation: (id) => api.post(`/messages/conversations/${id}/archive`).then((res) => res.data),
  deleteConversation: (id) => api.delete(`/messages/conversations/${id}`).then((res) => res.data)
};

export const socialApi = {
  getFeed: (params) => api.get('/social/feed', { params }).then((res) => res.data),
  createPost: (data) => api.post('/social/post', data).then((res) => res.data),
  follow: (userId) => api.post(`/social/follow/${userId}`).then((res) => res.data),
  unfollow: (userId) => api.post(`/social/unfollow/${userId}`).then((res) => res.data),
  like: (postId) => api.post(`/social/like/${postId}`).then((res) => res.data),
  getRecommendations: () => api.get('/social/recommendations').then((res) => res.data)
};

export const schoolApi = {
  verifySchoolCode: (code) => api.get(`/schools/verify/${code}`).then((res) => res.data),
  getAll: (params) => api.get('/schools', { params }).then((res) => res.data),
  getById: (id) => api.get(`/schools/${id}`).then((res) => res.data),
  create: (data) => api.post('/schools', data).then((res) => res.data),
  update: (id, data) => api.put(`/schools/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/schools/${id}`).then((res) => res.data)
};

export default api;
