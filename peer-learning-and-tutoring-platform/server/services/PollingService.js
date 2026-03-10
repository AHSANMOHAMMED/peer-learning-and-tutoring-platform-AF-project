/**
 * PollingService - Real-time polling for group lectures
 * Handles creation, management, and results of interactive polls
 */
class PollingService {
  constructor() {
    this.activePolls = new Map(); // lectureId -> poll data
    this.pollResults = new Map(); // pollId -> results
  }

  /**
   * Create a new poll for a lecture
   * @param {string} lectureId - Lecture session ID
   * @param {Object} pollData - Poll configuration
   * @returns {Object} Created poll
   */
  async createPoll(lectureId, pollData) {
    const poll = {
      id: `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lectureId,
      question: pollData.question,
      options: pollData.options.map((opt, idx) => ({
        id: `opt_${idx}`,
        text: opt,
        votes: 0
      })),
      type: pollData.type || 'single_choice', // single_choice, multiple_choice, rating
      isActive: false,
      isAnonymous: pollData.isAnonymous !== false,
      duration: pollData.duration || 60, // seconds
      createdAt: new Date(),
      createdBy: pollData.createdBy,
      totalVotes: 0,
      participants: new Set()
    };

    this.activePolls.set(poll.id, poll);
    return poll;
  }

  /**
   * Start a poll
   * @param {string} pollId - Poll ID
   */
  async startPoll(pollId) {
    const poll = this.activePolls.get(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    poll.isActive = true;
    poll.startedAt = new Date();

    // Auto-close poll after duration
    if (poll.duration > 0) {
      setTimeout(() => {
        this.endPoll(pollId);
      }, poll.duration * 1000);
    }

    return poll;
  }

  /**
   * End a poll
   * @param {string} pollId - Poll ID
   */
  async endPoll(pollId) {
    const poll = this.activePolls.get(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    poll.isActive = false;
    poll.endedAt = new Date();

    // Store final results
    this.pollResults.set(pollId, {
      ...poll,
      participants: Array.from(poll.participants)
    });

    return poll;
  }

  /**
   * Submit a vote
   * @param {string} pollId - Poll ID
   * @param {string} userId - User ID
   * @param {Array<string>} optionIds - Selected option IDs
   */
  async submitVote(pollId, userId, optionIds) {
    const poll = this.activePolls.get(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (!poll.isActive) {
      throw new Error('Poll is not active');
    }

    // Check if user already voted (for single choice)
    if (poll.type === 'single_choice' && poll.participants.has(userId)) {
      throw new Error('You have already voted in this poll');
    }

    // Validate options
    const validOptionIds = poll.options.map(o => o.id);
    for (const optionId of optionIds) {
      if (!validOptionIds.includes(optionId)) {
        throw new Error(`Invalid option: ${optionId}`);
      }
    }

    // Record votes
    for (const optionId of optionIds) {
      const option = poll.options.find(o => o.id === optionId);
      option.votes++;
    }

    poll.participants.add(userId);
    poll.totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

    return this.getPollResults(pollId);
  }

  /**
   * Get poll results
   * @param {string} pollId - Poll ID
   * @returns {Object} Poll results
   */
  async getPollResults(pollId) {
    const poll = this.activePolls.get(pollId) || this.pollResults.get(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const totalVotes = poll.totalVotes;
    const results = poll.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0
    }));

    return {
      id: poll.id,
      question: poll.question,
      isActive: poll.isActive,
      isAnonymous: poll.isAnonymous,
      totalVotes,
      participantCount: poll.participants.size,
      results,
      createdAt: poll.createdAt,
      startedAt: poll.startedAt,
      endedAt: poll.endedAt
    };
  }

  /**
   * Get active polls for a lecture
   * @param {string} lectureId - Lecture ID
   * @returns {Array} Active polls
   */
  async getActivePolls(lectureId) {
    const polls = [];
    for (const [id, poll] of this.activePolls) {
      if (poll.lectureId === lectureId && poll.isActive) {
        polls.push(this.getPollResults(id));
      }
    }
    return polls;
  }

  /**
   * Get poll history for a lecture
   * @param {string} lectureId - Lecture ID
   * @returns {Array} All polls
   */
  async getPollHistory(lectureId) {
    const polls = [];
    
    // Check active polls
    for (const [id, poll] of this.activePolls) {
      if (poll.lectureId === lectureId) {
        polls.push(await this.getPollResults(id));
      }
    }

    // Check completed polls
    for (const [id, result] of this.pollResults) {
      if (result.lectureId === lectureId && !polls.find(p => p.id === id)) {
        polls.push(await this.getPollResults(id));
      }
    }

    return polls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Delete a poll
   * @param {string} pollId - Poll ID
   */
  async deletePoll(pollId) {
    this.activePolls.delete(pollId);
    this.pollResults.delete(pollId);
    return { success: true };
  }

  /**
   * Get real-time updates for a poll
   * @param {string} pollId - Poll ID
   * @param {Function} callback - Callback for updates
   */
  subscribeToPoll(pollId, callback) {
    const interval = setInterval(async () => {
      try {
        const results = await this.getPollResults(pollId);
        callback(null, results);
      } catch (error) {
        callback(error, null);
        clearInterval(interval);
      }
    }, 2000); // Update every 2 seconds

    return {
      unsubscribe: () => clearInterval(interval)
    };
  }
}

module.exports = new PollingService();
