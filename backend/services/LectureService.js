const LectureCourse = require('../models/LectureCourse');
const User = require('../models/User');

class LectureService {
  constructor() {
    this.defaultCapacity = 30;
    this.maxCapacity = 200;
  }

  /**
   * Create a new lecture course
   * @param {Object} courseData - Course creation data
   * @param {String} courseData.instructor - Instructor user ID
   * @returns {Object} Created lecture course
   */
  async createCourse(courseData) {
    try {
      const {
        instructor,
        title,
        description,
        subject,
        grade,
        sessions,
        capacity,
        price,
        prerequisites,
        learningOutcomes,
        tags,
        startDate,
        endDate,
        schedule,
        settings = {}
      } = courseData;

      // Validate instructor
      const instructorUser = await User.findById(instructor);
      if (!instructorUser) {
        throw new Error('Instructor not found');
      }

      // Validate sessions
      if (!sessions || sessions.length === 0) {
        throw new Error('At least one session is required');
      }

      // Add order to sessions
      const orderedSessions = sessions.map((session, index) => ({
        ...session,
        order: index + 1
      }));

      // Validate capacity
      const courseCapacity = Math.min(capacity || this.defaultCapacity, this.maxCapacity);

      const lectureCourse = new LectureCourse({
        instructor,
        title: title.trim(),
        description: description.trim(),
        subject,
        grade,
        sessions: orderedSessions,
        capacity: courseCapacity,
        price: price || 0,
        prerequisites: prerequisites || [],
        learningOutcomes: learningOutcomes || [],
        tags: tags || [],
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        schedule: schedule || {},
        isPublic: settings.isPublic !== undefined ? settings.isPublic : true,
        requiresApproval: settings.requiresApproval || false,
        autoRecord: settings.autoRecord !== undefined ? settings.autoRecord : true,
        enableBreakoutRooms: settings.enableBreakoutRooms !== undefined ? settings.enableBreakoutRooms : true,
        enableWhiteboard: settings.enableWhiteboard !== undefined ? settings.enableWhiteboard : true,
        enableQaQueue: settings.enableQaQueue !== undefined ? settings.enableQaQueue : true,
        enablePolls: settings.enablePolls !== undefined ? settings.enablePolls : true
      });

      await lectureCourse.save();
      
      // Populate for response
      await lectureCourse.populate('instructor', 'name email profile');
      
      return lectureCourse;

    } catch (error) {
      console.error('Error creating lecture course:', error);
      throw error;
    }
  }

  /**
   * Get list of available lecture courses
   * @param {Object} filters - Search filters
   * @returns {Object} Paginated list of courses
   */
  async getCourses(filters = {}) {
    try {
      const {
        subject,
        grade,
        instructor,
        isFree,
        search,
        page = 1,
        limit = 20,
        status = 'active'
      } = filters;

      const query = {
        isActive: true
      };

      if (status === 'upcoming') {
        query.startDate = { $gt: new Date() };
      } else if (status === 'ongoing') {
        query.startDate = { $lte: new Date() };
        query.endDate = { $gte: new Date() };
      } else if (status === 'completed') {
        query.endDate = { $lt: new Date() };
      }

      if (subject) query.subject = subject;
      if (grade) query.grade = grade;
      if (instructor) query.instructor = instructor;
      if (isFree !== undefined) query.isFree = isFree;
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (page - 1) * limit;

      const courses = await LectureCourse.find(query)
        .populate('instructor', 'name email profile')
        .select('-enrolledStudents -reviews -forum') // Exclude sensitive data
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await LectureCourse.countDocuments(query);

      return {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting lecture courses:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific course
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID requesting details (for enrollment status)
   * @returns {Object} Course details
   */
  async getCourseDetails(courseId, userId = null) {
    try {
      const course = await LectureCourse.findById(courseId)
        .populate('instructor', 'name email profile')
        .populate('enrolledStudents.user', 'name email profile')
        .populate('reviews.user', 'name');

      if (!course) {
        throw new Error('Course not found');
      }

      // Check if user is enrolled
      const isEnrolled = userId ? course.isEnrolled(userId) : false;
      const isInstructor = userId ? course.isInstructor(userId) : false;

      // Calculate average rating
      const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;

      return {
        ...course.toObject(),
        isEnrolled,
        isInstructor,
        averageRating: avgRating,
        enrollmentCount: course.enrolledStudents.filter(e => e.status === 'active').length
      };

    } catch (error) {
      console.error('Error getting course details:', error);
      throw error;
    }
  }

  /**
   * Enroll student in a course
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID to enroll
   * @returns {Object} Enrollment result
   */
  async enrollInCourse(courseId, userId) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isActive) {
        throw new Error('Course is not active');
      }

      if (course.isFull) {
        throw new Error('Course is full');
      }

      if (course.isEnrolled(userId)) {
        throw new Error('Already enrolled in this course');
      }

      // Check if course has started (can't enroll if already started)
      if (new Date() > course.startDate && !course.requiresApproval) {
        throw new Error('Course has already started');
      }

      const enrolled = course.enrollStudent(userId);
      if (!enrolled) {
        throw new Error('Failed to enroll student');
      }

      await course.save();
      
      await course.populate('enrolledStudents.user', 'name email profile');
      
      return {
        course,
        status: course.requiresApproval ? 'pending_approval' : 'enrolled'
      };

    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  /**
   * Unenroll student from a course
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID to unenroll
   * @returns {Object} Updated course
   */
  async unenrollFromCourse(courseId, userId) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isEnrolled(userId)) {
        throw new Error('Not enrolled in this course');
      }

      const unenrolled = course.unenrollStudent(userId);
      if (!unenrolled) {
        throw new Error('Failed to unenroll student');
      }

      await course.save();
      
      return course;

    } catch (error) {
      console.error('Error unenrolling from course:', error);
      throw error;
    }
  }

  /**
   * Get specific session details
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} userId - User ID
   * @returns {Object} Session details
   */
  async getSessionDetails(courseId, sessionId, userId) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if user is enrolled or instructor
      if (!course.isEnrolled(userId) && !course.isInstructor(userId)) {
        throw new Error('Must be enrolled to view session details');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      await course.populate('sessions.attendance.user', 'name');

      return session;

    } catch (error) {
      console.error('Error getting session details:', error);
      throw error;
    }
  }

  /**
   * Start a live lecture session
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} userId - Instructor user ID
   * @returns {Object} Updated session
   */
  async startLiveSession(courseId, sessionId, userId) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isInstructor(userId)) {
        throw new Error('Only instructor can start session');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status === 'live') {
        throw new Error('Session is already live');
      }

      if (session.status === 'completed') {
        throw new Error('Session has already completed');
      }

      session.status = 'live';
      session.stats.startedAt = new Date();
      
      await course.save();
      
      return session;

    } catch (error) {
      console.error('Error starting live session:', error);
      throw error;
    }
  }

  /**
   * End a live lecture session
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} userId - Instructor user ID
   * @returns {Object} Updated session
   */
  async endLiveSession(courseId, sessionId, userId) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isInstructor(userId)) {
        throw new Error('Only instructor can end session');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'live') {
        throw new Error('Session is not live');
      }

      session.status = 'completed';
      session.stats.endedAt = new Date();
      
      // Calculate session statistics
      session.stats.totalParticipants = session.attendance.length;
      session.stats.averageEngagement = this.calculateEngagement(session);
      
      await course.save();
      
      return session;

    } catch (error) {
      console.error('Error ending live session:', error);
      throw error;
    }
  }

  /**
   * Create a poll in a session
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} userId - Instructor ID
   * @param {Object} pollData - Poll data
   * @returns {Object} Created poll
   */
  async createPoll(courseId, sessionId, userId, pollData) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isInstructor(userId)) {
        throw new Error('Only instructor can create polls');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const poll = {
        question: pollData.question,
        options: pollData.options,
        correctAnswer: pollData.correctAnswer,
        isActive: pollData.isActive || false,
        responses: []
      };

      session.polls.push(poll);
      await course.save();
      
      return session.polls[session.polls.length - 1];

    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Submit poll response
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} pollId - Poll ID
   * @param {String} userId - User ID
   * @param {Number} answer - Selected answer index
   * @returns {Object} Updated poll
   */
  async submitPollResponse(courseId, sessionId, pollId, userId, answer) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isEnrolled(userId)) {
        throw new Error('Must be enrolled to participate');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const poll = session.polls.id(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      if (!poll.isActive) {
        throw new Error('Poll is not active');
      }

      // Check if user already responded
      const existingResponse = poll.responses.find(r => r.user.toString() === userId);
      if (existingResponse) {
        existingResponse.answer = answer;
        existingResponse.answeredAt = new Date();
      } else {
        poll.responses.push({ user: userId, answer });
      }

      await course.save();
      
      return poll;

    } catch (error) {
      console.error('Error submitting poll response:', error);
      throw error;
    }
  }

  /**
   * Add question to Q&A queue
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} userId - User ID
   * @param {String} question - Question text
   * @returns {Object} Added question
   */
  async addQuestionToQueue(courseId, sessionId, userId, question) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isEnrolled(userId)) {
        throw new Error('Must be enrolled to ask questions');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const qaItem = {
        question,
        askedBy: userId,
        answered: false
      };

      session.qaQueue.push(qaItem);
      await course.save();
      
      return session.qaQueue[session.qaQueue.length - 1];

    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  /**
   * Answer question in Q&A queue
   * @param {String} courseId - Course ID
   * @param {String} sessionId - Session ID
   * @param {String} questionId - Question ID
   * @param {String} userId - Instructor ID
   * @param {String} answer - Answer text
   * @returns {Object} Updated question
   */
  async answerQuestion(courseId, sessionId, questionId, userId, answer) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isInstructor(userId)) {
        throw new Error('Only instructor can answer questions');
      }

      const session = course.sessions.id(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const question = session.qaQueue.id(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      question.answered = true;
      question.answer = answer;
      question.answeredAt = new Date();

      await course.save();
      
      return question;

    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    }
  }

  /**
   * Get user's enrolled courses
   * @param {String} userId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Object} User's courses
   */
  async getUserCourses(userId, filters = {}) {
    try {
      const { status = 'active', page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const query = {
        'enrolledStudents.user': userId,
        'enrolledStudents.status': status
      };

      const courses = await LectureCourse.find(query)
        .populate('instructor', 'name email profile')
        .select('-sessions.chat -sessions.whiteboard -reviews -forum')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await LectureCourse.countDocuments(query);

      return {
        courses: courses.map(course => ({
          ...course.toObject(),
          userEnrollment: course.enrolledStudents.find(e => e.user.toString() === userId)
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting user courses:', error);
      throw error;
    }
  }

  /**
   * Add course review
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID
   * @param {Object} reviewData - Review data
   * @returns {Object} Updated course
   */
  async addReview(courseId, userId, reviewData) {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if user is enrolled
      if (!course.isEnrolled(userId)) {
        throw new Error('Must be enrolled to review');
      }

      // Check if user already reviewed
      const existingReview = course.reviews.find(r => r.user.toString() === userId);
      if (existingReview) {
        throw new Error('Already reviewed this course');
      }

      course.reviews.push({
        user: userId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });

      // Update average rating
      course.stats.totalReviews = course.reviews.length;
      course.stats.averageRating = course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length;

      await course.save();
      
      return course;

    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  /**
   * Calculate session engagement score
   * @param {Object} session - Session object
   * @returns {Number} Engagement score 0-100
   */
  calculateEngagement(session) {
    if (!session.attendance || session.attendance.length === 0) return 0;

    const totalAttendees = session.attendance.length;
    const pollParticipation = session.polls.reduce((sum, poll) => sum + poll.responses.length, 0);
    const qaParticipation = session.qaQueue.length;
    const chatMessages = session.chat?.length || 0;

    // Weight factors
    const attendanceWeight = 0.4;
    const pollWeight = 0.3;
    const qaWeight = 0.2;
    const chatWeight = 0.1;

    const attendanceScore = Math.min((totalAttendees / 30) * 100, 100); // Assume 30 is good attendance
    const pollScore = session.polls.length > 0 
      ? (pollParticipation / (totalAttendees * session.polls.length)) * 100 
      : 0;
    const qaScore = Math.min((qaParticipation / totalAttendees) * 100, 100);
    const chatScore = Math.min((chatMessages / totalAttendees) * 10, 100);

    return Math.round(
      attendanceScore * attendanceWeight +
      pollScore * pollWeight +
      qaScore * qaWeight +
      chatScore * chatWeight
    );
  }
}

module.exports = new LectureService();
