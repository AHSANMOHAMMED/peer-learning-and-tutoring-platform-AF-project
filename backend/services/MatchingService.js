const User = require('../models/User');
const PeerSession = require('../models/PeerSession');

class MatchingService {
  constructor() {
    this.subjectWeight = 0.3;
    this.gradeWeight = 0.2;
    this.reputationWeight = 0.25;
    this.availabilityWeight = 0.15;
    this.compatibilityWeight = 0.1;
  }

  /**
   * Find potential peer matches for a help request
   * @param {Object} request - Peer help request
   * @param {String} request.userId - User requesting help
   * @param {String} request.subject - Subject needed
   * @param {String} request.grade - Grade level
   * @param {String} request.topic - Specific topic
   * @param {Array} request.tags - Additional tags
   * @param {String} request.difficulty - Difficulty level
   * @returns {Array} Array of matched peers with scores
   */
  async findPeerMatches(request) {
    const { userId, subject, grade, topic, tags, difficulty } = request;
    
    try {
      // Get user's current grade and profile
      const requestingUser = await User.findById(userId);
      if (!requestingUser) {
        throw new Error('User not found');
      }

      // Find potential helpers (students who can help)
      const potentialHelpers = await User.find({
        _id: { $ne: userId },
        role: 'student',
        isActive: true,
        'profile.subjects': { $in: [subject] },
        'profile.grade': { $gte: grade } // Helper should be in same or higher grade
      }).populate('profile.subjects');

      // Calculate match scores for each potential helper
      const matches = [];
      for (const helper of potentialHelpers) {
        const score = await this.calculateMatchScore(requestingUser, helper, request);
        
        if (score.total > 0.3) { // Minimum threshold
          matches.push({
            user: helper,
            score: score.total,
            breakdown: score.breakdown,
            availability: await this.checkHelperAvailability(helper._id, request.scheduledAt),
            reputation: await this.getPeerReputation(helper._id)
          });
        }
      }

      // Sort by score (highest first)
      matches.sort((a, b) => b.score - a.score);

      // Limit to top 10 matches
      return matches.slice(0, 10);

    } catch (error) {
      console.error('Error finding peer matches:', error);
      throw error;
    }
  }

  /**
   * Calculate match score between requesting user and potential helper
   * @param {Object} requestingUser - User requesting help
   * @param {Object} helper - Potential helper
   * @param {Object} request - Help request details
   * @returns {Object} Score breakdown
   */
  async calculateMatchScore(requestingUser, helper, request) {
    const breakdown = {
      subject: 0,
      grade: 0,
      reputation: 0,
      availability: 0,
      compatibility: 0
    };

    // Subject compatibility (30%)
    breakdown.subject = this.calculateSubjectCompatibility(helper, request.subject);

    // Grade compatibility (20%)
    breakdown.grade = this.calculateGradeCompatibility(helper, request.grade);

    // Reputation score (25%)
    breakdown.reputation = await this.calculateReputationScore(helper._id);

    // Availability (15%)
    breakdown.availability = await this.calculateAvailabilityScore(helper._id, request.scheduledAt);

    // User compatibility (10%)
    breakdown.compatibility = this.calculateUserCompatibility(requestingUser, helper);

    // Calculate weighted total
    const total = 
      breakdown.subject * this.subjectWeight +
      breakdown.grade * this.gradeWeight +
      breakdown.reputation * this.reputationWeight +
      breakdown.availability * this.availabilityWeight +
      breakdown.compatibility * this.compatibilityWeight;

    return { total, breakdown };
  }

  /**
   * Calculate subject compatibility score
   * @param {Object} helper - Helper user
   * @param {String} subject - Requested subject
   * @returns {Number} Score 0-1
   */
  calculateSubjectCompatibility(helper, subject) {
    const helperSubjects = helper.profile?.subjects || [];
    
    if (helperSubjects.includes(subject)) {
      // Check if it's a primary subject (first in list)
      if (helperSubjects[0] === subject) {
        return 1.0;
      }
      return 0.8;
    }
    
    return 0;
  }

  /**
   * Calculate grade compatibility score
   * @param {Object} helper - Helper user
   * @param {String} requestedGrade - Requested grade
   * @returns {Number} Score 0-1
   */
  calculateGradeCompatibility(helper, requestedGrade) {
    const helperGrade = helper.profile?.grade || helper.grade;
    
    if (!helperGrade || !requestedGrade) return 0.5; // Neutral if missing

    const normalize = (g) => {
      if (!g) return 0;
      const match = String(g).match(/\d+/);
      if (match) return parseInt(match[0]);
      if (typeof g === 'string') {
          const lower = g.toLowerCase();
          if (lower.includes('a/l')) return 13;
          if (lower.includes('o/l')) return 11;
      }
      return 0;
    };

    const helperLevel = normalize(helperGrade);
    const requestedLevel = normalize(requestedGrade);

    if (helperLevel === 0 || requestedLevel === 0) return 0.5;

    const difference = helperLevel - requestedLevel;
    
    if (difference === 0) return 1.0; // Same grade
    if (difference >= 1 && difference <= 2) return 0.9; // Slightly higher
    if (difference > 2) return 0.7; // Much higher
    
    return 0.2; // Helper is in lower grade
  }

  /**
   * Calculate reputation score
   * @param {String} userId - User ID
   * @returns {Number} Score 0-1
   */
  async calculateReputationScore(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return 0;

      const reputation = user.profile?.reputation || 0;
      const totalSessions = user.profile?.totalSessions || 0;
      const averageRating = user.profile?.averageRating || 0;

      // Normalize reputation (assuming max reputation of 1000)
      const reputationScore = Math.min(reputation / 1000, 1.0) * 0.4;
      
      // Session experience score
      const sessionScore = Math.min(totalSessions / 50, 1.0) * 0.3;
      
      // Rating score
      const ratingScore = (averageRating / 5) * 0.3;

      return reputationScore + sessionScore + ratingScore;

    } catch (error) {
      console.error('Error calculating reputation score:', error);
      return 0;
    }
  }

  /**
   * Calculate availability score
   * @param {String} userId - User ID
   * @param {Date} scheduledTime - Scheduled time
   * @returns {Number} Score 0-1
   */
  async calculateAvailabilityScore(userId, scheduledTime) {
    try {
      // Check if user has existing sessions at this time
      const conflictingSessions = await PeerSession.find({
        'participants.user': userId,
        status: { $in: ['matched', 'active'] },
        scheduledAt: {
          $lt: new Date(scheduledTime.getTime() + 60 * 60 * 1000), // 1 hour after
          $gt: new Date(scheduledTime.getTime() - 60 * 60 * 1000)  // 1 hour before
        }
      });

      if (conflictingSessions.length > 0) {
        return 0;
      }

      // Check user's availability preferences (if implemented)
      // For now, return 1 if no conflicts
      return 1.0;

    } catch (error) {
      console.error('Error calculating availability score:', error);
      return 0.5; // Default medium score
    }
  }

  /**
   * Calculate user compatibility score
   * @param {Object} requestingUser - User requesting help
   * @param {Object} helper - Potential helper
   * @returns {Number} Score 0-1
   */
  calculateUserCompatibility(requestingUser, helper) {
    // Factors for compatibility:
    // - Similar interests (if available)
    // - Past positive interactions
    // - School/region proximity (if available)
    
    let score = 0.5; // Base score

    // Check for past positive interactions
    // This would require tracking past peer sessions and feedback
    // For now, return base score
    
    return score;
  }

  /**
   * Check helper's availability for specific time
   * @param {String} helperId - Helper user ID
   * @param {Date} scheduledTime - Scheduled time
   * @returns {Boolean} Available or not
   */
  async checkHelperAvailability(helperId, scheduledTime) {
    const conflictingSessions = await PeerSession.find({
      'participants.user': helperId,
      status: { $in: ['matched', 'active'] },
      scheduledAt: {
        $lt: new Date(scheduledTime.getTime() + 60 * 60 * 1000),
        $gt: new Date(scheduledTime.getTime() - 60 * 60 * 1000)
      }
    });

    return conflictingSessions.length === 0;
  }

  /**
   * Get peer's reputation details
   * @param {String} userId - User ID
   * @returns {Object} Reputation details
   */
  async getPeerReputation(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { reputation: 0, totalSessions: 0, averageRating: 0 };
      }

      return {
        reputation: user.profile?.reputation || 0,
        totalSessions: user.profile?.totalSessions || 0,
        averageRating: user.profile?.averageRating || 0,
        subjects: user.profile?.subjects || [],
        grade: user.profile?.grade
      };

    } catch (error) {
      console.error('Error getting peer reputation:', error);
      return { reputation: 0, totalSessions: 0, averageRating: 0 };
    }
  }

  /**
   * Create a peer session with matched helper
   * @param {String} requesterId - User requesting help
   * @param {String} helperId - Matched helper
   * @param {Object} sessionDetails - Session details
   * @returns {Object} Created peer session
   */
  async createPeerSession(requesterId, helperId, sessionDetails) {
    try {
      const peerSession = new PeerSession({
        initiator: requesterId,
        matchedPeer: helperId,
        participants: [
          { user: requesterId, role: 'initiator' },
          { user: helperId, role: 'helper' }
        ],
        ...sessionDetails
      });

      await peerSession.save();
      return peerSession;

    } catch (error) {
      console.error('Error creating peer session:', error);
      throw error;
    }
  }
}

module.exports = new MatchingService();
