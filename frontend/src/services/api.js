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

export const aiApi = {
  matchTutor: (data) => api.post('/peer/match', data).then((res) => res.data),
  getSessionInsights: (sessionId) => api.get(`/ai/session-insights/${sessionId}`).then((res) => res.data),
  homeworkHelp: (data) => api.post('/ai-homework/help', data).then((res) => res.data),
  getRecommendations: (params) => api.get('/recommendations', { params }).then((res) => res.data)
};

export const featureFlagApi = {
  getAll: () => api.get('/feature-flags').then((res) => res.data),
  toggle: (id) => api.post(`/feature-flags/${id}/toggle`).then((res) => res.data),
  create: (data) => api.post('/feature-flags', data).then((res) => res.data),
  delete: (id) => api.delete(`/feature-flags/${id}`).then((res) => res.data)
};

export const parentApi = {
  linkStudent: (data) => api.post('/parent/link-student', data).then((res) => res.data),
  getLinkedStudents: () => api.get('/parent/students').then((res) => res.data),
  getLinkRequests: () => api.get('/parent/link-requests').then((res) => res.data),
  getStudentLinkRequests: () => api.get('/parent/student/link-requests').then((res) => res.data),
  respondToLink: (linkId, data) => api.post(`/parent/student/respond-link/${linkId}`, data).then((res) => res.data),
  getStudentSummary: (id) => api.get(`/parent/student/${id}/summary`).then((res) => res.data),
  getStudentProgress: (id, params) => api.get(`/parent/student/${id}/progress`, { params }).then((res) => res.data),
  getAlerts: () => api.get('/parent/alerts').then((res) => res.data),
  updatePermissions: (linkId, permissions) => api.put(`/parent/link/${linkId}/permissions`, { permissions }).then((res) => res.data),
  removeLink: (linkId) => api.delete(`/parent/link/${linkId}`).then((res) => res.data),
  nudgeStudent: (studentId, type) => api.post(`/parent/student/${studentId}/nudge`, { type }).then((res) => res.data)
};

export const reportApi = {
  getAll: (params) => api.get('/reports', { params }).then((res) => res.data),
  create: (data) => api.post('/reports', data).then((res) => res.data),
  getById: (id) => api.get(`/reports/${id}`).then((res) => res.data),
  moderate: (id, data) => api.patch(`/reports/${id}/status`, data).then((res) => res.data),
  delete: (id) => api.delete(`/reports/${id}`).then((res) => res.data)
};

export const schoolApi = {
  verifySchoolCode: (code) => api.get(`/schools/verify/${code}`).then((res) => res.data),
  getAll: (params) => api.get('/schools', { params }).then((res) => res.data),
  getById: (id) => api.get(`/schools/${id}`).then((res) => res.data),
  create: (data) => api.post('/schools', data).then((res) => res.data),
  update: (id, data) => api.put(`/schools/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/schools/${id}`).then((res) => res.data),
  getSchoolUsers: (id) => api.get(`/schools/${id}/users`).then((res) => res.data),
  addUserToSchool: (id, userId) => api.post(`/schools/${id}/users`, { userId }).then((res) => res.data)
};

export const tutorApi = {
  register: (data) => api.post('/tutors', data).then((res) => res.data),
  getAll: (params) => api.get('/tutors', { params }).then((res) => res.data),
  getAllAdmin: (params) => api.get('/tutors/all', { params }).then((res) => res.data),
  getProfile: (id) => api.get(`/tutors/${id}`).then((res) => res.data),
  getByUserId: (userId) => api.get(`/tutors/user/${userId}`).then((res) => res.data),
  moderate: (id, data) => api.put(`/tutors/${id}/moderate`, data).then((res) => res.data)
};

export const mentorApi = {
  register: (data) => api.post('/mentors', data).then((res) => res.data),
  getAll: (params) => api.get('/mentors', { params }).then((res) => res.data),
  getProfile: (id) => api.get(`/mentors/${id}`).then((res) => res.data),
  updateProfile: (id, data) => api.put(`/mentors/${id}`, data).then((res) => res.data),
  moderate: (id, data) => api.put(`/mentors/${id}/moderate`, data).then((res) => res.data)
};

export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }).then((res) => res.data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }).then((res) => res.data),
  create: (data) => api.post('/bookings', data).then((res) => res.data),
  getById: (id) => api.get(`/bookings/${id}`).then((res) => res.data),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data).then((res) => res.data),
  updateWhiteboard: (id, data) => api.put(`/bookings/${id}/whiteboard`, data).then((res) => res.data),
  delete: (id) => api.delete(`/bookings/${id}`).then((res) => res.data)
};

export const materialApi = {
  getAll: (params) => api.get('/materials', { params }).then((res) => res.data),
  getMyMaterials: (params) => api.get('/materials/my', { params }).then((res) => res.data),
  upload: (data) => api.post('/materials', data).then((res) => res.data),
  getById: (id) => api.get(`/materials/${id}`).then((res) => res.data),
  update: (id, data) => api.put(`/materials/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/materials/${id}`).then((res) => res.data),
  approve: (id) => api.put(`/materials/${id}/approve`).then((res) => res.data),
  reject: (id, reason) => api.put(`/materials/${id}/reject`, { reason }).then((res) => res.data)
};

export const gamificationApi = {
  getProfile: () => api.get('/gamification/profile').then((res) => res.data),
  getBadges: () => api.get('/gamification/badges').then((res) => res.data),
  getMyBadges: () => api.get('/gamification/badges/my').then((res) => res.data),
  markBadgesViewed: () => api.post('/gamification/badges/viewed').then((res) => res.data),
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }).then((res) => res.data),
  getDistrictLeaderboard: () => api.get('/gamification/leaderboard/districts').then((res) => res.data),
  getNearbyLeaderboard: () => api.get('/gamification/leaderboard/nearby').then((res) => res.data),
  getStats: () => api.get('/gamification/stats').then((res) => res.data),
  awardPoints: (data) => api.post('/gamification/award-points', data).then((res) => res.data),
  getCatalog: () => api.get('/gamification/catalog').then((res) => res.data),
  submitAttempt: (data) => api.post('/gamification/attempt', data).then((res) => res.data)
};

export const systemApi = {
  getAnalytics: () => api.get('/system/analytics').then((res) => res.data),
  getPulse: () => api.get('/system/pulse').then((res) => res.data)
};

export const adminApi = {
  getStatistics: () => api.get('/admin/statistics').then((res) => res.data),
  getAllUsers: (params) => api.get('/admin/users', { params }).then((res) => res.data),
  createUser: (data) => api.post('/admin/users', data).then((res) => res.data),
  getUserById: (id) => api.get(`/admin/users/${id}`).then((res) => res.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then((res) => res.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((res) => res.data),
  toggleUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data).then((res) => res.data),
  changeUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data).then((res) => res.data),
  bulkOperations: (data) => api.post('/admin/users/bulk', data).then((res) => res.data),
  getPendingTutors: (params) => api.get('/admin/tutors/pending', { params }).then((res) => res.data),
  approveTutor: (id) => api.put(`/admin/tutors/${id}/approve`).then((res) => res.data),
  rejectTutor: (id) => api.put(`/admin/tutors/${id}/reject`).then((res) => res.data),
  getPendingMaterials: (params) => api.get('/admin/materials/pending', { params }).then((res) => res.data),
  broadcastNotification: (data) => api.post('/admin/broadcast', data).then((res) => res.data),
  rotateAccessKeys: () => api.post('/admin/rotate-keys').then((res) => res.data)
};

export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }).then((res) => res.data),
  getById: (id) => api.get(`/payments/${id}`).then((res) => res.data),
  create: (data) => api.post('/payments', data).then((res) => res.data),
  update: (id, data) => api.put(`/payments/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/payments/${id}`).then((res) => res.data),
  processPayment: (data) => api.post('/payments/process', data).then((res) => res.data),
  getMyPayments: (params) => api.get('/payments/my', { params }).then((res) => res.data)
};

export const peerApi = {
  createSession: (data) => api.post('/peer', data).then((res) => res.data),
  getMySessions: (params) => api.get('/peer/my-sessions', { params }).then((res) => res.data),
  getById: (id) => api.get(`/peer/${id}`).then((res) => res.data),
  update: (id, data) => api.put(`/peer/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/peer/${id}`).then((res) => res.data),
  matchTutor: (data) => api.post('/peer/match', data).then((res) => res.data)
};

export const personalizationApi = {
  getProfile: () => api.get('/personalization').then((res) => res.data),
  updateProfile: (data) => api.put('/personalization', data).then((res) => res.data),
  getRecommendations: (params) => api.get('/personalization/recommendations', { params }).then((res) => res.data),
  updatePreferences: (data) => api.put('/personalization/preferences', data).then((res) => res.data)
};

export const pollsApi = {
  getAll: (params) => api.get('/polls', { params }).then((res) => res.data),
  getById: (id) => api.get(`/polls/${id}`).then((res) => res.data),
  create: (data) => api.post('/polls', data).then((res) => res.data),
  update: (id, data) => api.put(`/polls/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/polls/${id}`).then((res) => res.data),
  vote: (id, data) => api.post(`/polls/${id}/vote`, data).then((res) => res.data)
};

export const qaApi = {
  getAll: (params) => api.get('/qa', { params }).then((res) => res.data),
  getById: (id) => api.get(`/qa/${id}`).then((res) => res.data),
  create: (data) => api.post('/qa', data).then((res) => res.data),
  update: (id, data) => api.put(`/qa/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/qa/${id}`).then((res) => res.data)
};

export const questionApi = {
  getAll: (params) => api.get('/questions', { params }).then((res) => res.data),
  getById: (id) => api.get(`/questions/${id}`).then((res) => res.data),
  create: (data) => api.post('/questions', data).then((res) => res.data),
  update: (id, data) => api.put(`/questions/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/questions/${id}`).then((res) => res.data),
  search: (params) => api.get('/questions/search', { params }).then((res) => res.data)
};

export const answerApi = {
  getAll: (params) => api.get('/answers', { params }).then((res) => res.data),
  getById: (id) => api.get(`/answers/${id}`).then((res) => res.data),
  create: (data) => api.post('/answers', data).then((res) => res.data),
  update: (id, data) => api.put(`/answers/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/answers/${id}`).then((res) => res.data),
  markBest: (id) => api.put(`/answers/${id}/best`).then((res) => res.data)
};

export const commentApi = {
  getAll: (params) => api.get('/comments', { params }).then((res) => res.data),
  getById: (id) => api.get(`/comments/${id}`).then((res) => res.data),
  create: (data) => api.post('/comments', data).then((res) => res.data),
  update: (id, data) => api.put(`/comments/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/comments/${id}`).then((res) => res.data)
};

export const voteApi = {
  vote: (data) => api.post('/votes', data).then((res) => res.data),
  getVotes: (params) => api.get('/votes', { params }).then((res) => res.data),
  removeVote: (id) => api.delete(`/votes/${id}`).then((res) => res.data)
};

export const sessionApi = {
  getAll: (params) => api.get('/sessions', { params }).then((res) => res.data),
  getById: (id) => api.get(`/sessions/${id}`).then((res) => res.data),
  create: (data) => api.post('/sessions', data).then((res) => res.data),
  update: (id, data) => api.put(`/sessions/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/sessions/${id}`).then((res) => res.data),
  join: (id) => api.post(`/sessions/${id}/join`).then((res) => res.data),
  leave: (id) => api.post(`/sessions/${id}/leave`).then((res) => res.data)
};

export const lectureApi = {
  getAll: (params) => api.get('/lectures', { params }).then((res) => res.data),
  getById: (id) => api.get(`/lectures/${id}`).then((res) => res.data),
  create: (data) => api.post('/lectures', data).then((res) => res.data),
  update: (id, data) => api.put(`/lectures/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/lectures/${id}`).then((res) => res.data),
  enroll: (id) => api.post(`/lectures/${id}/enroll`).then((res) => res.data)
};

export const certificateApi = {
  getAll: (params) => api.get('/certificates', { params }).then((res) => res.data),
  getById: (id) => api.get(`/certificates/${id}`).then((res) => res.data),
  create: (data) => api.post('/certificates', data).then((res) => res.data),
  update: (id, data) => api.put(`/certificates/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/certificates/${id}`).then((res) => res.data),
  verify: (code) => api.get(`/certificates/verify/${code}`).then((res) => res.data)
};

export const marketplaceApi = {
  getAll: (params) => api.get('/marketplace', { params }).then((res) => res.data),
  getById: (id) => api.get(`/marketplace/${id}`).then((res) => res.data),
  create: (data) => api.post('/marketplace', data).then((res) => res.data),
  update: (id, data) => api.put(`/marketplace/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/marketplace/${id}`).then((res) => res.data),
  purchase: (id) => api.post(`/marketplace/${id}/purchase`).then((res) => res.data)
};

export const searchApi = {
  globalSearch: (params) => api.get('/search', { params }).then((res) => res.data),
  searchUsers: (params) => api.get('/search/users', { params }).then((res) => res.data),
  searchMaterials: (params) => api.get('/search/materials', { params }).then((res) => res.data),
  searchTutors: (params) => api.get('/search/tutors', { params }).then((res) => res.data)
};

export const videoApi = {
  getAll: (params) => api.get('/video', { params }).then((res) => res.data),
  getById: (id) => api.get(`/video/${id}`).then((res) => res.data),
  create: (data) => api.post('/video', data).then((res) => res.data),
  update: (id, data) => api.put(`/video/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/video/${id}`).then((res) => res.data),
  startStream: (data) => api.post('/video/stream/start', data).then((res) => res.data),
  stopStream: (id) => api.post(`/video/stream/${id}/stop`).then((res) => res.data)
};

export const recommendationApi = {
  getRecommendations: (params) => api.get('/recommendations', { params }).then((res) => res.data),
  getTutorRecommendations: (params) => api.get('/recommendations/tutors', { params }).then((res) => res.data),
  getCourseRecommendations: (params) => api.get('/recommendations/courses', { params }).then((res) => res.data),
  getMaterialRecommendations: (params) => api.get('/recommendations/materials', { params }).then((res) => res.data)
};

export default api;