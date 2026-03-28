const MatchingService = require('../services/MatchingService');
const User = require('../models/User');
const PeerSession = require('../models/PeerSession');

// Mock data
const mockTutors = [
  {
    _id: 'tutor1',
    name: 'Expert Math Tutor',
    profile: {
      expertise: ['Mathematics', 'Algebra'],
      grades: ['9', '10', '11', '12'],
      reputation: 4.8,
      completedSessions: 50
    },
    availability: {
      schedule: [
        { day: 'Monday', startTime: '16:00', endTime: '20:00' }
      ]
    }
  },
  {
    _id: 'tutor2',
    name: 'Science Specialist',
    profile: {
      expertise: ['Physics', 'Chemistry'],
      grades: ['10', '11', '12'],
      reputation: 4.5,
      completedSessions: 30
    },
    availability: {
      schedule: [
        { day: 'Tuesday', startTime: '17:00', endTime: '21:00' }
      ]
    }
  },
  {
    _id: 'tutor3',
    name: 'New Math Tutor',
    profile: {
      expertise: ['Mathematics'],
      grades: ['9', '10'],
      reputation: 0,
      completedSessions: 0
    },
    availability: {
      schedule: [
        { day: 'Monday', startTime: '16:00', endTime: '20:00' }
      ]
    }
  }
];

describe('MatchingService', () => {
  describe('calculateMatchScore', () => {
    it('should calculate high score for perfect match', () => {
      const helpRequest = {
        subject: 'Mathematics',
        grade: '10',
        preferredTime: new Date('2024-01-15T16:30:00') // Monday 4:30 PM
      };

      const score = MatchingService.calculateMatchScore(helpRequest, mockTutors[0]);
      
      expect(score).toBeGreaterThan(70); // Should be high for perfect match
    });

    it('should calculate lower score for partial match', () => {
      const helpRequest = {
        subject: 'Mathematics',
        grade: '10',
        preferredTime: new Date('2024-01-15T16:30:00')
      };

      const score = MatchingService.calculateMatchScore(helpRequest, mockTutors[2]);
      
      expect(score).toBeLessThan(MatchingService.calculateMatchScore(helpRequest, mockTutors[0]));
    });

    it('should return 0 for no subject match', () => {
      const helpRequest = {
        subject: 'Biology',
        grade: '10'
      };

      const score = MatchingService.calculateMatchScore(helpRequest, mockTutors[0]);
      
      expect(score).toBe(0);
    });

    it('should return 0 for no grade match', () => {
      const helpRequest = {
        subject: 'Mathematics',
        grade: '13' // Beyond tutor's grades
      };

      const score = MatchingService.calculateMatchScore(helpRequest, mockTutors[0]);
      
      expect(score).toBe(0);
    });
  });

  describe('checkAvailability', () => {
    it('should return true when tutor is available', () => {
      const preferredTime = new Date('2024-01-15T16:30:00'); // Monday 4:30 PM
      
      const isAvailable = MatchingService.checkAvailability(mockTutors[0], preferredTime);
      
      expect(isAvailable).toBe(true);
    });

    it('should return false when tutor is not available', () => {
      const preferredTime = new Date('2024-01-15T15:00:00'); // Monday 3:00 PM - before schedule
      
      const isAvailable = MatchingService.checkAvailability(mockTutors[0], preferredTime);
      
      expect(isAvailable).toBe(false);
    });

    it('should return false on different day', () => {
      const preferredTime = new Date('2024-01-16T16:30:00'); // Tuesday
      
      const isAvailable = MatchingService.checkAvailability(mockTutors[0], preferredTime);
      
      expect(isAvailable).toBe(false);
    });
  });

  describe('findMatches', () => {
    it('should return matches sorted by score', async () => {
      // Mock User.find
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockTutors)
      });

      const helpRequest = {
        studentId: 'student1',
        subject: 'Mathematics',
        grade: '10'
      };

      const matches = await MatchingService.findMatches(helpRequest);
      
      expect(matches).toBeDefined();
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[matches.length - 1].score);
    });

    it('should exclude tutors already in active sessions', async () => {
      // Mock PeerSession.find
      PeerSession.find = jest.fn().mockResolvedValue([
        { participants: [{ user: 'tutor1' }], status: 'active' }
      ]);

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockTutors)
      });

      const helpRequest = {
        studentId: 'student1',
        subject: 'Mathematics',
        grade: '10'
      };

      const matches = await MatchingService.findMatches(helpRequest);
      
      const tutor1Match = matches.find(m => m.tutor._id === 'tutor1');
      expect(tutor1Match).toBeUndefined();
    });
  });

  describe('scoring weights', () => {
    it('should weigh subject match heavily', () => {
      const exactSubjectScore = MatchingService.calculateMatchScore(
        { subject: 'Mathematics', grade: '10' },
        mockTutors[0]
      );

      const relatedSubjectScore = MatchingService.calculateMatchScore(
        { subject: 'Algebra', grade: '10' },
        mockTutors[0]
      );

      expect(exactSubjectScore).toBeGreaterThan(relatedSubjectScore);
    });

    it('should consider reputation in scoring', () => {
      const scoreWithHighRep = MatchingService.calculateMatchScore(
        { subject: 'Mathematics', grade: '10' },
        mockTutors[0] // reputation 4.8
      );

      const scoreWithNoRep = MatchingService.calculateMatchScore(
        { subject: 'Mathematics', grade: '10' },
        mockTutors[2] // reputation 0
      );

      expect(scoreWithHighRep).toBeGreaterThan(scoreWithNoRep);
    });
  });
});
