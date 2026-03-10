/**
 * API Integration Tests for Polling Routes
 * Tests the full request/response cycle for poll endpoints
 */

const request = require('supertest');
const express = require('express');
const pollRoutes = require('../../routes/polls');
const { authenticate } = require('../../middleware/auth');

// Mock middleware and service
jest.mock('../../middleware/auth');
jest.mock('../../services/PollingService', () => ({
  createPoll: jest.fn(),
  startPoll: jest.fn(),
  endPoll: jest.fn(),
  submitVote: jest.fn(),
  getPollResults: jest.fn(),
  getActivePolls: jest.fn(),
  getPollHistory: jest.fn(),
  deletePoll: jest.fn()
}));

const PollingService = require('../../services/PollingService');

describe('Polling API Integration Tests', () => {
  let app;
  let mockIo;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockIo = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn()
      })
    };
    app.set('io', mockIo);

    authenticate.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123', name: 'Test User' };
      next();
    });

    app.use('/api/lectures', pollRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/lectures/:sessionId/polls', () => {
    test('should create a new poll', async () => {
      const mockPoll = {
        id: 'poll123',
        question: 'Test question?',
        options: [{ id: 'opt1', text: 'Yes' }, { id: 'opt2', text: 'No' }],
        isActive: false
      };
      PollingService.createPoll.mockResolvedValue(mockPoll);

      const response = await request(app)
        .post('/api/lectures/session123/polls')
        .send({
          question: 'Test question?',
          options: ['Yes', 'No'],
          type: 'single_choice',
          duration: 60
        })
        .expect(201);

      expect(response.body.id).toBe('poll123');
      expect(PollingService.createPoll).toHaveBeenCalledWith('session123', expect.any(Object));
      expect(mockIo.to).toHaveBeenCalledWith('session_session123');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/lectures/session123/polls')
        .send({
          options: ['Yes'] // Missing question
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should require at least 2 options', async () => {
      const response = await request(app)
        .post('/api/lectures/session123/polls')
        .send({
          question: 'Test?',
          options: ['Only one']
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/lectures/polls/:pollId/start', () => {
    test('should start a poll', async () => {
      const mockPoll = { id: 'poll123', isActive: true, lectureId: 'session123' };
      PollingService.startPoll.mockResolvedValue(mockPoll);

      const response = await request(app)
        .post('/api/lectures/polls/poll123/start')
        .expect(200);

      expect(response.body.isActive).toBe(true);
      expect(mockIo.to).toHaveBeenCalledWith('session_session123');
    });

    test('should handle non-existent poll', async () => {
      PollingService.startPoll.mockRejectedValue(new Error('Poll not found'));

      const response = await request(app)
        .post('/api/lectures/polls/nonexistent/start')
        .expect(500);

      expect(response.body.message).toContain('Poll not found');
    });
  });

  describe('POST /api/lectures/polls/:pollId/end', () => {
    test('should end a poll and return results', async () => {
      const mockPoll = { id: 'poll123', isActive: false, lectureId: 'session123' };
      const mockResults = {
        id: 'poll123',
        question: 'Test?',
        results: [{ id: 'opt1', votes: 5, percentage: '50' }]
      };
      
      PollingService.endPoll.mockResolvedValue(mockPoll);
      PollingService.getPollResults.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/lectures/polls/poll123/end')
        .expect(200);

      expect(response.body.results).toHaveLength(1);
      expect(mockIo.to).toHaveBeenCalled();
    });
  });

  describe('POST /api/lectures/polls/:pollId/vote', () => {
    test('should record a vote', async () => {
      const mockResults = {
        totalVotes: 1,
        results: [{ id: 'opt1', votes: 1, percentage: '100' }]
      };
      PollingService.submitVote.mockResolvedValue(mockResults);
      PollingService.getPollResults.mockResolvedValue({
        isAnonymous: true,
        lectureId: 'session123'
      });

      const response = await request(app)
        .post('/api/lectures/polls/poll123/vote')
        .send({
          optionIds: ['opt1']
        })
        .expect(200);

      expect(response.body.totalVotes).toBe(1);
      expect(PollingService.submitVote).toHaveBeenCalledWith('poll123', 'user123', ['opt1']);
    });

    test('should require at least one option', async () => {
      const response = await request(app)
        .post('/api/lectures/polls/poll123/vote')
        .send({
          optionIds: []
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should handle vote errors', async () => {
      PollingService.submitVote.mockRejectedValue(new Error('Already voted'));

      const response = await request(app)
        .post('/api/lectures/polls/poll123/vote')
        .send({
          optionIds: ['opt1']
        })
        .expect(400);

      expect(response.body.message).toContain('Already voted');
    });
  });

  describe('GET /api/lectures/:sessionId/polls', () => {
    test('should return active and history polls', async () => {
      const activePolls = [{ id: 'poll1', isActive: true }];
      const historyPolls = [{ id: 'poll2', isActive: false }];
      
      PollingService.getActivePolls.mockResolvedValue(activePolls);
      PollingService.getPollHistory.mockResolvedValue(historyPolls);

      const response = await request(app)
        .get('/api/lectures/session123/polls')
        .expect(200);

      expect(response.body.active).toHaveLength(1);
      expect(response.body.history).toHaveLength(1);
    });
  });

  describe('GET /api/lectures/polls/:pollId/results', () => {
    test('should return poll results', async () => {
      const mockResults = {
        id: 'poll123',
        question: 'Test?',
        totalVotes: 10,
        results: [
          { id: 'opt1', text: 'Yes', votes: 7, percentage: '70' },
          { id: 'opt2', text: 'No', votes: 3, percentage: '30' }
        ]
      };
      PollingService.getPollResults.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/lectures/polls/poll123/results')
        .expect(200);

      expect(response.body.totalVotes).toBe(10);
      expect(response.body.results).toHaveLength(2);
    });

    test('should handle non-existent poll', async () => {
      PollingService.getPollResults.mockRejectedValue(new Error('Poll not found'));

      const response = await request(app)
        .get('/api/lectures/polls/nonexistent/results')
        .expect(500);

      expect(response.body.message).toContain('Poll not found');
    });
  });

  describe('DELETE /api/lectures/polls/:pollId', () => {
    test('should delete a poll', async () => {
      PollingService.deletePoll.mockResolvedValue({ success: true });

      const response = await request(app)
        .delete('/api/lectures/polls/poll123')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle delete errors', async () => {
      PollingService.deletePoll.mockRejectedValue(new Error('Poll not found'));

      const response = await request(app)
        .delete('/api/lectures/polls/nonexistent')
        .expect(500);

      expect(response.body.message).toContain('Poll not found');
    });
  });
});
