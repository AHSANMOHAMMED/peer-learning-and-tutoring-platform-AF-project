/**
 * QAService - Manages Q&A queue for lectures and sessions
 * Handles question submission, upvoting, and moderation
 */
class QAService {
  constructor() {
    this.questionQueues = new Map(); // sessionId -> questions[]
    this.answeredQuestions = new Map(); // sessionId -> questions[]
  }

  /**
   * Submit a new question
   * @param {string} sessionId - Session ID
   * @param {Object} questionData - Question data
   * @param {string} userId - Asking user ID
   * @returns {Object} Created question
   */
  async submitQuestion(sessionId, questionData, userId) {
    const { text, isAnonymous = false } = questionData;

    const question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      text,
      askedBy: isAnonymous ? null : userId,
      isAnonymous,
      upvotes: 0,
      upvotedBy: [],
      isAnswered: false,
      isHighlighted: false,
      isPinned: false,
      askedAt: new Date(),
      answeredAt: null,
      answeredBy: null,
      answer: null,
      reactions: {}
    };

    if (!this.questionQueues.has(sessionId)) {
      this.questionQueues.set(sessionId, []);
    }

    this.questionQueues.get(sessionId).push(question);
    
    // Sort by upvotes (most popular first)
    this.sortQuestions(sessionId);

    return question;
  }

  /**
   * Upvote a question
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @param {string} userId - User upvoting
   */
  async upvoteQuestion(sessionId, questionId, userId) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) throw new Error('Session not found');

    const question = questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    if (question.upvotedBy.includes(userId)) {
      throw new Error('You have already upvoted this question');
    }

    question.upvotes++;
    question.upvotedBy.push(userId);

    // Re-sort after upvote
    this.sortQuestions(sessionId);

    return question;
  }

  /**
   * Mark question as answered
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @param {string} answeredBy - User who answered
   * @param {string} answer - Answer text
   */
  async markAnswered(sessionId, questionId, answeredBy, answer) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) throw new Error('Session not found');

    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Question not found');

    const question = questions[questionIndex];
    question.isAnswered = true;
    question.answeredAt = new Date();
    question.answeredBy = answeredBy;
    question.answer = answer;

    // Move to answered queue
    if (!this.answeredQuestions.has(sessionId)) {
      this.answeredQuestions.set(sessionId, []);
    }
    this.answeredQuestions.get(sessionId).push(question);

    // Remove from active queue
    questions.splice(questionIndex, 1);

    return question;
  }

  /**
   * Highlight a question (for speaker attention)
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   */
  async highlightQuestion(sessionId, questionId) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) throw new Error('Session not found');

    const question = questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    // Unhighlight all others
    questions.forEach(q => q.isHighlighted = false);
    
    question.isHighlighted = true;
    return question;
  }

  /**
   * Pin a question to the top
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   */
  async pinQuestion(sessionId, questionId) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) throw new Error('Session not found');

    const question = questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    // Unpin all others
    questions.forEach(q => q.isPinned = false);
    
    question.isPinned = true;
    return question;
  }

  /**
   * Get questions for a session
   * @param {string} sessionId - Session ID
   * @param {Object} filters - Filter options
   */
  async getQuestions(sessionId, filters = {}) {
    const { 
      status = 'all', // all, unanswered, answered
      sortBy = 'upvotes', // upvotes, newest, oldest
      limit = 50 
    } = filters;

    let questions = [];

    if (status === 'unanswered' || status === 'all') {
      questions = [...(this.questionQueues.get(sessionId) || [])];
    }

    if (status === 'answered' || status === 'all') {
      const answered = this.answeredQuestions.get(sessionId) || [];
      questions = [...questions, ...answered];
    }

    // Sort
    if (sortBy === 'upvotes') {
      questions.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'newest') {
      questions.sort((a, b) => b.askedAt - a.askedAt);
    } else if (sortBy === 'oldest') {
      questions.sort((a, b) => a.askedAt - b.askedAt);
    }

    return questions.slice(0, limit);
  }

  /**
   * Get top questions by upvotes
   * @param {string} sessionId - Session ID
   * @param {number} count - Number of questions
   */
  async getTopQuestions(sessionId, count = 5) {
    const questions = this.questionQueues.get(sessionId) || [];
    return questions
      .filter(q => !q.isAnswered)
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, count);
  }

  /**
   * Delete a question
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @param {string} userId - User requesting deletion
   * @param {boolean} isModerator - Whether user is moderator
   */
  async deleteQuestion(sessionId, questionId, userId, isModerator = false) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) throw new Error('Session not found');

    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Question not found');

    const question = questions[questionIndex];

    // Only asker or moderator can delete
    if (!isModerator && question.askedBy !== userId) {
      throw new Error('Permission denied');
    }

    questions.splice(questionIndex, 1);
    return { success: true };
  }

  /**
   * Add reaction to question
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @param {string} userId - User reacting
   * @param {string} reaction - Reaction type
   */
  async addReaction(sessionId, questionId, userId, reaction) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) throw new Error('Session not found');

    const question = questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    if (!question.reactions[reaction]) {
      question.reactions[reaction] = [];
    }

    if (question.reactions[reaction].includes(userId)) {
      // Remove reaction if already present (toggle)
      question.reactions[reaction] = question.reactions[reaction].filter(
        id => id !== userId
      );
    } else {
      question.reactions[reaction].push(userId);
    }

    return question;
  }

  /**
   * Get Q&A statistics for a session
   * @param {string} sessionId - Session ID
   */
  async getStats(sessionId) {
    const active = this.questionQueues.get(sessionId) || [];
    const answered = this.answeredQuestions.get(sessionId) || [];

    const totalQuestions = active.length + answered.length;
    const answeredCount = answered.length;
    const unansweredCount = active.filter(q => !q.isAnswered).length;

    const avgUpvotes = totalQuestions > 0 
      ? [...active, ...answered].reduce((sum, q) => sum + q.upvotes, 0) / totalQuestions 
      : 0;

    const topAsker = this.getTopAsker([...active, ...answered]);

    return {
      totalQuestions,
      answeredCount,
      unansweredCount,
      avgUpvotes: Math.round(avgUpvotes * 10) / 10,
      topAsker,
      engagementRate: totalQuestions > 0 ? (answeredCount / totalQuestions * 100).toFixed(1) : 0
    };
  }

  /**
   * Export Q&A for session recording
   * @param {string} sessionId - Session ID
   */
  async exportQA(sessionId) {
    const active = this.questionQueues.get(sessionId) || [];
    const answered = this.answeredQuestions.get(sessionId) || [];
    const allQuestions = [...active, ...answered];

    return {
      sessionId,
      exportedAt: new Date(),
      questions: allQuestions.map(q => ({
        question: q.text,
        askedAt: q.askedAt,
        askedBy: q.isAnonymous ? 'Anonymous' : q.askedBy,
        upvotes: q.upvotes,
        answer: q.answer,
        answeredAt: q.answeredAt,
        answeredBy: q.answeredBy
      }))
    };
  }

  /**
   * Sort questions by upvotes and pin status
   */
  sortQuestions(sessionId) {
    const questions = this.questionQueues.get(sessionId);
    if (!questions) return;

    questions.sort((a, b) => {
      // Pinned questions always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by upvotes
      return b.upvotes - a.upvotes;
    });
  }

  /**
   * Get top asker in session
   */
  getTopAsker(questions) {
    const askerCounts = {};
    questions.forEach(q => {
      const asker = q.askedBy || 'Anonymous';
      askerCounts[asker] = (askerCounts[asker] || 0) + 1;
    });

    const sorted = Object.entries(askerCounts)
      .sort(([, a], [, b]) => b - a);
    
    return sorted.length > 0 ? { userId: sorted[0][0], count: sorted[0][1] } : null;
  }

  /**
   * Clear all questions for a session
   * @param {string} sessionId - Session ID
   */
  async clearSession(sessionId) {
    this.questionQueues.delete(sessionId);
    this.answeredQuestions.delete(sessionId);
    return { success: true };
  }

  /**
   * Get popular questions across all sessions
   * @param {number} limit - Number of questions
   */
  async getPopularQuestions(limit = 10) {
    const allQuestions = [];
    
    for (const [sessionId, questions] of this.questionQueues) {
      allQuestions.push(...questions);
    }

    return allQuestions
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit);
  }
}

module.exports = new QAService();
