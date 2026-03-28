/**
 * Unit Tests for PollingService
 * Tests poll creation, voting, and management functionality
 */

const PollingService = require('../../services/PollingService');

describe('PollingService', () => {
  beforeEach(() => {
    // Reset the service state before each test
    PollingService.activePolls.clear();
    PollingService.pollResults.clear();
  });

  describe('createPoll', () => {
    test('should create a new poll with valid data', async () => {
      const pollData = {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5'],
        type: 'single_choice',
        createdBy: 'user123'
      };

      const poll = await PollingService.createPoll('session1', pollData);

      expect(poll).toHaveProperty('id');
      expect(poll.question).toBe(pollData.question);
      expect(poll.options).toHaveLength(3);
      expect(poll.isActive).toBe(false);
      expect(poll.lectureId).toBe('session1');
    });

    test('should assign unique IDs to options', async () => {
      const pollData = {
        question: 'Test question',
        options: ['A', 'B', 'C']
      };

      const poll = await PollingService.createPoll('session1', pollData);

      poll.options.forEach((option, index) => {
        expect(option.id).toBe(`opt_${index}`);
        expect(option.votes).toBe(0);
      });
    });

    test('should set default values when not provided', async () => {
      const pollData = {
        question: 'Test',
        options: ['Yes', 'No']
      };

      const poll = await PollingService.createPoll('session1', pollData);

      expect(poll.type).toBe('single_choice');
      expect(poll.duration).toBe(60);
      expect(poll.isAnonymous).toBe(true);
    });
  });

  describe('startPoll', () => {
    test('should activate poll and set start time', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);

      const startedPoll = await PollingService.startPoll(poll.id);

      expect(startedPoll.isActive).toBe(true);
      expect(startedPoll.startedAt).toBeInstanceOf(Date);
    });

    test('should throw error for non-existent poll', async () => {
      await expect(PollingService.startPoll('nonexistent'))
        .rejects.toThrow('Poll not found');
    });

    test('should auto-close poll after duration', async () => {
      jest.useFakeTimers();
      
      const pollData = {
        question: 'Test',
        options: ['A', 'B'],
        duration: 1 // 1 second
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);

      jest.advanceTimersByTime(1100);

      const endedPoll = await PollingService.getPollResults(poll.id);
      expect(endedPoll.isActive).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('submitVote', () => {
    test('should record vote for single choice poll', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);

      const results = await PollingService.submitVote(poll.id, 'user1', ['opt_0']);

      expect(results.totalVotes).toBe(1);
      expect(results.results[0].votes).toBe(1);
    });

    test('should prevent double voting for single choice', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B'],
        type: 'single_choice'
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);

      await PollingService.submitVote(poll.id, 'user1', ['opt_0']);

      await expect(PollingService.submitVote(poll.id, 'user1', ['opt_1']))
        .rejects.toThrow('You have already voted in this poll');
    });

    test('should allow multiple votes for multiple choice poll', async () => {
      const pollData = {
        question: 'Select all that apply',
        options: ['A', 'B', 'C'],
        type: 'multiple_choice'
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);

      await PollingService.submitVote(poll.id, 'user1', ['opt_0']);
      
      // Should not throw for multiple choice
      const results = await PollingService.submitVote(poll.id, 'user1', ['opt_1']);
      expect(results.totalVotes).toBe(2);
    });

    test('should throw error for invalid option', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);

      await expect(PollingService.submitVote(poll.id, 'user1', ['invalid_option']))
        .rejects.toThrow('Invalid option');
    });

    test('should throw error for inactive poll', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);
      // Don't start the poll

      await expect(PollingService.submitVote(poll.id, 'user1', ['opt_0']))
        .rejects.toThrow('Poll is not active');
    });
  });

  describe('getPollResults', () => {
    test('should return correct vote percentages', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);

      await PollingService.submitVote(poll.id, 'user1', ['opt_0']);
      await PollingService.submitVote(poll.id, 'user2', ['opt_0']);
      await PollingService.submitVote(poll.id, 'user3', ['opt_1']);

      const results = await PollingService.getPollResults(poll.id);

      expect(results.results[0].percentage).toBe('66.7');
      expect(results.results[1].percentage).toBe('33.3');
    });

    test('should return zero percentages with no votes', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);

      const results = await PollingService.getPollResults(poll.id);

      expect(results.results[0].percentage).toBe(0);
      expect(results.results[1].percentage).toBe(0);
    });
  });

  describe('endPoll', () => {
    test('should end active poll and store results', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);
      await PollingService.startPoll(poll.id);
      await PollingService.submitVote(poll.id, 'user1', ['opt_0']);

      const endedPoll = await PollingService.endPoll(poll.id);

      expect(endedPoll.isActive).toBe(false);
      expect(endedPoll.endedAt).toBeInstanceOf(Date);
      expect(PollingService.pollResults.has(poll.id)).toBe(true);
    });
  });

  describe('deletePoll', () => {
    test('should remove poll from active polls', async () => {
      const pollData = {
        question: 'Test',
        options: ['A', 'B']
      };
      const poll = await PollingService.createPoll('session1', pollData);

      const result = await PollingService.deletePoll(poll.id);

      expect(result.success).toBe(true);
      expect(PollingService.activePolls.has(poll.id)).toBe(false);
    });
  });

  describe('getActivePolls', () => {
    test('should return only active polls for session', async () => {
      // Create multiple polls
      const poll1 = await PollingService.createPoll('session1', {
        question: 'Active poll',
        options: ['A', 'B']
      });
      await PollingService.startPoll(poll1.id);

      const poll2 = await PollingService.createPoll('session1', {
        question: 'Inactive poll',
        options: ['C', 'D']
      });

      const poll3 = await PollingService.createPoll('session2', {
        question: 'Different session',
        options: ['E', 'F']
      });
      await PollingService.startPoll(poll3.id);

      const activePolls = await PollingService.getActivePolls('session1');

      expect(activePolls).toHaveLength(1);
      expect(activePolls[0].question).toBe('Active poll');
    });
  });

  describe('getPollHistory', () => {
    test('should return all polls including completed', async () => {
      const poll1 = await PollingService.createPoll('session1', {
        question: 'Poll 1',
        options: ['A', 'B']
      });
      await PollingService.startPoll(poll1.id);
      await PollingService.endPoll(poll1.id);

      const poll2 = await PollingService.createPoll('session1', {
        question: 'Poll 2',
        options: ['C', 'D']
      });
      await PollingService.startPoll(poll2.id);

      const history = await PollingService.getPollHistory('session1');

      expect(history).toHaveLength(2);
      expect(history[0].question).toBe('Poll 2'); // Most recent first
    });
  });
});
