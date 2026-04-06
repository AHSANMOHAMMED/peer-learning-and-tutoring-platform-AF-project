import { apiService, qaApi } from './api';

const normalizeQuestion = (q) => {
  if (!q) return null;
  return {
    ...q,
    id: q._id || q.id,
    body: q.body || q.content || '',
    title: q.title || '',
    type: q.type || 'structured',
    difficulty: q.difficulty || 'Easy',
    points: Number(q.points || 5),
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer || '',
    explanation: q.explanation || '',
  };
};

export const qaForumService = {
  async fetchQuestions({ grade, subject }) {
    const response = await qaApi.getQuestions({
      grade,
      subject,
      limit: 300,
      sortBy: 'newest',
    });

    if (!response.success) {
      return { success: false, message: response.message || 'Failed to fetch questions', data: [] };
    }

    const raw = response.data?.questions || response.data || [];
    const questions = Array.isArray(raw) ? raw.map(normalizeQuestion).filter(Boolean) : [];
    return { success: true, data: questions };
  },

  async fetchQuestionById(questionId) {
    const response = await qaApi.getQuestionById(questionId);
    if (!response.success) {
      return { success: false, message: response.message || 'Failed to fetch question' };
    }

    const question = normalizeQuestion(response.data?.question || response.data);
    return { success: true, data: question };
  },

  async createTutorQuestion(payload) {
    const response = await qaApi.createQuestion({
      title: payload.title,
      body: payload.body,
      content: payload.body,
      subject: payload.subject,
      grade: payload.grade,
      type: payload.type,
      difficulty: payload.difficulty,
      points: payload.points,
      options: payload.options || [],
      correctAnswer: payload.correctAnswer,
      explanation: payload.explanation || '',
      tags: payload.tags || [],
    });

    if (!response.success) {
      return { success: false, message: response.message || 'Failed to create question' };
    }

    return { success: true, data: normalizeQuestion(response.data?.data || response.data) };
  },

  async updateTutorQuestion(questionId, payload) {
    const response = await qaApi.updateQuestion(questionId, {
      title: payload.title,
      body: payload.body,
      content: payload.body,
      subject: payload.subject,
      grade: payload.grade,
      type: payload.type,
      difficulty: payload.difficulty,
      points: payload.points,
      options: payload.options || [],
      correctAnswer: payload.correctAnswer,
      explanation: payload.explanation || '',
      tags: payload.tags || [],
    });

    if (!response.success) {
      return { success: false, message: response.message || 'Failed to update question' };
    }

    return { success: true, data: normalizeQuestion(response.data?.data || response.data) };
  },

  async deleteTutorQuestion(questionId) {
    const response = await qaApi.deleteQuestion(questionId);
    if (!response.success) {
      return { success: false, message: response.message || 'Failed to delete question' };
    }
    return { success: true };
  },

  async submitStudentAnswer(payload) {
    return apiService.post('/api/qa-submissions', payload);
  },

  async fetchTutorReports(grade) {
    return apiService.get('/api/qa-submissions', { params: { grade } });
  },
};

export default qaForumService;
