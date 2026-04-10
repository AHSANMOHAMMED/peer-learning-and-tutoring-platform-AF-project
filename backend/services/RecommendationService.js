const mongoose = require('mongoose');
const User = require('../models/User');
const LectureCourse = require('../models/LectureCourse');
const PeerSession = require('../models/PeerSession');
const GroupRoom = require('../models/GroupRoom');
const HomeworkSession = require('../models/HomeworkSession');

/**
 * RecommendationService - AI-powered personalized recommendations
 * Provides content, peer, and course recommendations based on user behavior and preferences
 */
class RecommendationService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get comprehensive recommendations for a user
   * @param {string} userId - User ID
   * @returns {Object} Personalized recommendations
   */
  async getRecommendations(userId) {
    const cacheKey = `recommendations_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    const [courses, peers, groups, studyMaterials] = await Promise.all([
      this.getCourseRecommendations(userId),
      this.getPeerRecommendations(userId),
      this.getGroupRecommendations(userId),
      this.getStudyMaterialRecommendations(userId)
    ]);

    const recommendations = {
      courses,
      peers,
      groups,
      studyMaterials,
      generatedAt: new Date()
    };

    this.cache.set(cacheKey, { data: recommendations, timestamp: Date.now() });
    return recommendations;
  }

  /**
   * Get personalized course recommendations
   * @param {string} userId - User ID
   * @returns {Array} Recommended courses
   */
  async getCourseRecommendations(userId) {
    const user = await User.findById(userId);
    if (!user) return [];

    const userSubjects = user.profile?.subjects || [];
    const userGrade = user.profile?.grade;
    
    // Get courses matching user's subjects and grade
    let courses = await LectureCourse.find({
      $or: [
        { subject: { $in: userSubjects } },
        { targetGrade: userGrade }
      ],
      status: 'published',
      isPublished: true
    })
    .populate('instructor', 'name profile.avatar')
    .limit(10);

    // Get user's enrolled courses
    const userEnrollments = await PeerSession.find({
      $or: [
        { requester: userId },
        { matchedPeer: userId }
      ]
    }).distinct('course');

    // Filter out already enrolled courses
    courses = courses.filter(c => !userEnrollments.includes(c._id.toString()));

    // Calculate relevance scores
    const scoredCourses = courses.map(course => {
      let score = 0;
      
      // Subject match
      if (userSubjects.includes(course.subject)) score += 30;
      
      // Grade match
      if (course.targetGrade === userGrade) score += 20;
      
      // Popularity (enrollments)
      score += Math.min(course.enrollments?.length * 2 || 0, 20);
      
      // Rating
      score += (course.rating || 0) * 5;
      
      return { ...course.toObject(), relevanceScore: score };
    });

    // Sort by relevance score
    return scoredCourses.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 6);
  }

  /**
   * Get peer recommendations based on learning compatibility
   * @param {string} userId - User ID
   * @returns {Array} Recommended peers
   */
  async getPeerRecommendations(userId) {
    const user = await User.findById(userId);
    if (!user) return [];

    const userSubjects = user.profile?.subjects || [];
    const userGrade = user.profile?.grade;
    const userRole = user.role;

    // Find compatible peers
    const peers = await User.find({
      _id: { $ne: userId },
      role: userRole === 'student' ? 'tutor' : 'student', // Match students with tutors and vice versa
      'profile.subjects': { $in: userSubjects },
      isActive: true
    })
    .select('name role profile subjects profile.grade profile.avatar profile.bio')
    .limit(20);

    // Calculate compatibility scores
    const scoredPeers = peers.map(peer => {
      let score = 0;
      const peerSubjects = peer.profile?.subjects || [];
      
      // Subject overlap
      const commonSubjects = userSubjects.filter(s => peerSubjects.includes(s));
      score += commonSubjects.length * 15;
      
      // Grade proximity (for students)
      if (userGrade && peer.profile?.grade) {
        const gradeDiff = Math.abs(parseInt(userGrade) - parseInt(peer.profile.grade));
        score += Math.max(0, 20 - gradeDiff * 5);
      }
      
      // Reputation bonus
      score += (peer.reputation || 0) * 2;
      
      return { ...peer.toObject(), compatibilityScore: score };
    });

    return scoredPeers.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 8);
  }

  /**
   * Get group study room recommendations
   * @param {string} userId - User ID
   * @returns {Array} Recommended groups
   */
  async getGroupRecommendations(userId) {
    const user = await User.findById(userId);
    if (!user) return [];

    const userSubjects = user.profile?.subjects || [];
    const userGrade = user.profile?.grade;

    // Find active groups matching user interests
    const groups = await GroupRoom.find({
      status: 'active',
      $or: [
        { subject: { $in: userSubjects } },
        { grade: userGrade }
      ],
      participants: { $nin: [userId] }, // Not already joined
      'settings.isPrivate': false // Public groups only
    })
    .populate('host', 'name profile.avatar')
    .populate('participants', 'name')
    .limit(15);

    // Calculate group match scores
    const scoredGroups = groups.map(group => {
      let score = 0;
      
      // Subject match
      if (userSubjects.includes(group.subject)) score += 25;
      
      // Grade match
      if (group.grade === userGrade) score += 20;
      
      // Group activity (participants count)
      score += Math.min(group.participants.length * 3, 15);
      
      // Recency (more recent = higher score)
      const hoursSinceCreated = (Date.now() - group.createdAt) / (1000 * 60 * 60);
      score += Math.max(0, 10 - hoursSinceCreated * 0.5);
      
      return { ...group.toObject(), matchScore: score };
    });

    return scoredGroups.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  }

  /**
   * Get study material recommendations
   * @param {string} userId - User ID
   * @returns {Array} Recommended study materials
   */
  async getStudyMaterialRecommendations(userId) {
    const user = await User.findById(userId);
    if (!user) return [];

    const userSubjects = user.profile?.subjects || [];
    
    // Get user's recent homework sessions to understand interests
    const recentSessions = await HomeworkSession.find({
      user: userId
    })
    .sort({ createdAt: -1 })
    .limit(5);

    const recentSubjects = recentSessions.map(s => s.subject);
    const allSubjects = [...new Set([...userSubjects, ...recentSubjects])];

    // Find popular courses in these subjects
    const materials = await LectureCourse.find({
      subject: { $in: allSubjects },
      status: 'published',
      isPublished: true
    })
    .select('title subject description thumbnail difficultyLevel rating instructor')
    .populate('instructor', 'name')
    .sort({ rating: -1, 'enrollments.length': -1 })
    .limit(8);

    return materials.map(m => ({
      ...m.toObject(),
      type: 'course',
      reason: recentSubjects.includes(m.subject) ? 'Based on recent activity' : 'Recommended for your subjects'
    }));
  }

  /**
   * Get trending content across the platform
   * @returns {Object} Trending items
   */
  async getTrendingContent() {
    const [trendingCourses, activeGroups, topPeers] = await Promise.all([
      this.getTrendingCourses(),
      this.getMostActiveGroups(),
      this.getTopRatedPeers()
    ]);

    return {
      courses: trendingCourses,
      groups: activeGroups,
      peers: topPeers
    };
  }

  /**
   * Get trending courses
   * @returns {Array} Trending courses
   */
  async getTrendingCourses() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return await LectureCourse.find({
      status: 'published',
      isPublished: true,
      createdAt: { $gte: oneWeekAgo }
    })
    .populate('instructor', 'name profile.avatar')
    .sort({ 'enrollments.length': -1, rating: -1 })
    .limit(5);
  }

  /**
   * Get most active group rooms
   * @returns {Array} Active groups
   */
  async getMostActiveGroups() {
    return await GroupRoom.find({
      status: 'active',
      'settings.isPrivate': false
    })
    .populate('host', 'name profile.avatar')
    .sort({ participants: -1, createdAt: -1 })
    .limit(5);
  }

  /**
   * Get top-rated peers
   * @returns {Array} Top peers
   */
  async getTopRatedPeers() {
    return await User.find({
      role: { $in: ['tutor', 'student'] },
      isActive: true,
      reputation: { $gte: 4 }
    })
    .select('name role profile reputation profile.avatar')
    .sort({ reputation: -1 })
    .limit(5);
  }

  /**
   * Record user interaction for better recommendations
   * @param {string} userId - User ID
   * @param {string} itemType - Type of item (course, peer, group)
   * @param {string} itemId - Item ID
   * @param {string} interaction - Type of interaction (view, click, enroll, join)
   */
  async recordInteraction(userId, itemType, itemId, interaction) {
    // This could store interactions in a separate collection
    // for more sophisticated collaborative filtering in the future
    
    // Clear cache to refresh recommendations
    const cacheKey = `recommendations_${userId}`;
    this.cache.delete(cacheKey);
    
    return { success: true };
  }

  /**
   * Get personalized learning path recommendations
   * @param {string} userId - User ID
   * @param {string} subject - Subject to focus on
   * @returns {Object} Learning path
   */
  async getLearningPathRecommendations(userId, subject) {
    const user = await User.findById(userId);
    if (!user) return null;

    const userGrade = user.profile?.grade;
    
    // Find courses in progression order
    const beginnerCourses = await LectureCourse.find({
      subject,
      difficultyLevel: 'beginner',
      targetGrade: { $lte: userGrade },
      status: 'published'
    }).limit(2);

    const intermediateCourses = await LectureCourse.find({
      subject,
      difficultyLevel: 'intermediate',
      targetGrade: userGrade,
      status: 'published'
    }).limit(2);

    const advancedCourses = await LectureCourse.find({
      subject,
      difficultyLevel: 'advanced',
      targetGrade: { $gte: userGrade },
      status: 'published'
    }).limit(1);

    return {
      subject,
      path: [
        { level: 'Beginner', courses: beginnerCourses },
        { level: 'Intermediate', courses: intermediateCourses },
        { level: 'Advanced', courses: advancedCourses }
      ],
      estimatedDuration: this.calculatePathDuration([
        ...beginnerCourses,
        ...intermediateCourses,
        ...advancedCourses
      ])
    };
  }

  /**
   * Calculate estimated duration for a learning path
   * @param {Array} courses - Array of courses
   * @returns {string} Estimated duration
   */
 calculatePathDuration(courses) {
    const totalMinutes = courses.reduce((sum, c) => sum + (c.duration || 60), 0);
    const hours = Math.ceil(totalMinutes / 60);
    
    if (hours < 24) return `${hours} hours`;
    const days = Math.ceil(hours / 24);
    if (days < 7) return `${days} days`;
    const weeks = Math.ceil(days / 7);
    return `${weeks} weeks`;
  }
}

module.exports = new RecommendationService();
