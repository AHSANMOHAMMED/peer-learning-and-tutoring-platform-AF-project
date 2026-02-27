const Tutor = require('../models/Tutor');

/**
 * TutorService - Handles all business logic related to tutors
 * This separates business logic from the data model
 */
class TutorService {
  /**
   * Update tutor rating with new review scores
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {Object} newRating - Rating object with overall, teaching, knowledge, communication, punctuality
   * @returns {Promise<Object>} Updated tutor
   */
  static async updateRating(tutorId, newRating) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    const oldCount = tutor.rating.count;
    const newCount = oldCount + 1;
    
    // Update average overall rating
    tutor.rating.average = ((tutor.rating.average * oldCount) + newRating.overall) / newCount;
    
    // Update breakdown ratings
    tutor.rating.breakdown.teaching = ((tutor.rating.breakdown.teaching * oldCount) + newRating.teaching) / newCount;
    tutor.rating.breakdown.knowledge = ((tutor.rating.breakdown.knowledge * oldCount) + newRating.knowledge) / newCount;
    tutor.rating.breakdown.communication = ((tutor.rating.breakdown.communication * oldCount) + newRating.communication) / newCount;
    tutor.rating.breakdown.punctuality = ((tutor.rating.breakdown.punctuality * oldCount) + newRating.punctuality) / newCount;
    
    tutor.rating.count = newCount;
    
    await tutor.save();
    return tutor;
  }

  /**
   * Update tutor statistics after a session
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {Object} sessionData - Session data containing duration, studentId, etc.
   * @returns {Promise<Object>} Updated tutor
   */
  static async updateStats(tutorId, sessionData) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    tutor.stats.totalSessions += 1;
    tutor.stats.totalHours += sessionData.duration / 60; // Convert minutes to hours
    
    // Update unique students count
    if (sessionData.studentId) {
      // Initialize studentIds array if it doesn't exist
      if (!tutor.stats.studentIds) {
        tutor.stats.studentIds = [];
      }
      
      // Only increment if this is a new student
      if (!tutor.stats.studentIds.includes(sessionData.studentId.toString())) {
        tutor.stats.totalStudents += 1;
        tutor.stats.studentIds.push(sessionData.studentId.toString());
      }
    }
    
    await tutor.save();
    return tutor;
  }

  /**
   * Search for tutors with filters and pagination
   * @param {Object} searchParams - Search parameters including subject, grade, minRating, etc.
   * @returns {Promise<Object>} Object containing tutors array and pagination info
   */
  static async searchTutors(searchParams) {
    const {
      subject,
      grade,
      minRating,
      maxRate,
      language,
      isVerified,
      availability,
      search,
      page = 1,
      limit = 10
    } = searchParams;

    let query = {};

    // Build search query based on provided parameters
    if (subject) {
      query['subjects.name'] = { $regex: subject, $options: 'i' };
    }

    if (grade) {
      query['subjects.gradeLevels'] = { $in: [parseInt(grade)] };
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxRate) {
      query['subjects.hourlyRate'] = { $lte: parseFloat(maxRate) };
    }

    if (language) {
      query.languages = { $in: [language] };
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true' || isVerified === true;
    }

    // Text search across bio, teaching style, and subjects
    if (search) {
      query.$or = [
        { bio: { $regex: search, $options: 'i' } },
        { teachingStyle: { $regex: search, $options: 'i' } },
        { 'subjects.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [tutors, total] = await Promise.all([
      Tutor.find(query)
        .populate('user', 'profile.firstName profile.lastName profile.avatar username')
        .sort({ featured: -1, 'rating.average': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Tutor.countDocuments(query)
    ]);

    return {
      tutors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get featured tutors (verified and marked as featured)
   * @param {number} limit - Maximum number of tutors to return
   * @returns {Promise<Array>} Array of featured tutors
   */
  static async getFeaturedTutors(limit = 10) {
    return Tutor.find({ featured: true, isVerified: true })
      .populate('user', 'profile.firstName profile.lastName profile.avatar username')
      .sort({ 'rating.average': -1 })
      .limit(parseInt(limit))
      .exec();
  }

  /**
   * Get top-rated tutors (verified with at least one review)
   * @param {number} limit - Maximum number of tutors to return
   * @returns {Promise<Array>} Array of top-rated tutors
   */
  static async getTopRatedTutors(limit = 10) {
    return Tutor.find({ isVerified: true, 'rating.count': { $gt: 0 } })
      .populate('user', 'profile.firstName profile.lastName profile.avatar username')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(parseInt(limit))
      .exec();
  }

  /**
   * Calculate aggregate statistics for a tutor
   * @param {ObjectId} tutorId - The tutor's ID
   * @returns {Promise<Object>} Statistics object
   */
  static async calculateStats(tutorId) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    return {
      totalSessions: tutor.stats.totalSessions,
      totalHours: tutor.stats.totalHours,
      totalStudents: tutor.stats.totalStudents,
      averageRating: tutor.rating.average,
      totalReviews: tutor.rating.count,
      ratingBreakdown: tutor.rating.breakdown,
      responseTime: tutor.stats.responseTime
    };
  }

  /**
   * Add a new subject to tutor's offerings
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {Object} subjectData - Subject information including name, gradeLevels, hourlyRate
   * @returns {Promise<Object>} Updated tutor
   */
  static async addSubject(tutorId, subjectData) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    // Check if subject already exists
    const existingSubject = tutor.subjects.find(s => s.name === subjectData.name);
    if (existingSubject) {
      throw new Error('Subject already exists for this tutor');
    }

    tutor.subjects.push(subjectData);
    await tutor.save();
    return tutor;
  }

  /**
   * Remove a subject from tutor's offerings
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {ObjectId} subjectId - The subject's ID to remove
   * @returns {Promise<Object>} Updated tutor
   */
  static async removeSubject(tutorId, subjectId) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    tutor.subjects = tutor.subjects.filter(s => s._id.toString() !== subjectId.toString());
    await tutor.save();
    return tutor;
  }

  /**
   * Add availability slot for tutor
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {Object} availabilityData - Availability information including dayOfWeek, startTime, endTime
   * @returns {Promise<Object>} Updated tutor
   */
  static async addAvailability(tutorId, availabilityData) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    tutor.availability.push(availabilityData);
    await tutor.save();
    return tutor;
  }

  /**
   * Remove availability slot from tutor
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {ObjectId} availabilityId - The availability slot's ID to remove
   * @returns {Promise<Object>} Updated tutor
   */
  static async removeAvailability(tutorId, availabilityId) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    tutor.availability = tutor.availability.filter(a => a._id.toString() !== availabilityId.toString());
    await tutor.save();
    return tutor;
  }

  /**
   * Check if tutor is available at a specific time
   * @param {ObjectId} tutorId - The tutor's ID
   * @param {Date} startTime - Start time of the desired session
   * @param {number} duration - Duration in minutes
   * @returns {Promise<boolean>} True if available, false otherwise
   */
  static async checkAvailability(tutorId, startTime, duration) {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    const date = new Date(startTime);
    const dayOfWeek = date.getDay();
    const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    // Check if tutor has availability for this day and time
    const hasAvailability = tutor.availability.some(slot => {
      if (slot.dayOfWeek !== dayOfWeek) return false;
      
      // Check if time falls within availability slot
      return timeString >= slot.startTime && timeString <= slot.endTime;
    });

    return hasAvailability;
  }
}

module.exports = TutorService;
