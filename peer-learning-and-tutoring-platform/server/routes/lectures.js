const express = require('express');
const router = express.Router();
const LectureService = require('../services/LectureService');
const LectureCourse = require('../models/LectureCourse');
const auth = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

/**
 * @route   POST /api/lectures/courses
 * @desc    Create a new lecture course
 * @access  Private (Instructors/Admins)
 */
router.post('/courses', [
  auth,
  body('title').notEmpty().trim().withMessage('Course title is required'),
  body('description').notEmpty().trim().withMessage('Course description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required'),
  body('sessions').isArray({ min: 1 }).withMessage('At least one session is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('capacity').optional().isInt({ min: 3, max: 200 }),
  body('price').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is instructor or admin
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can create courses'
      });
    }

    const course = await LectureService.createCourse({
      instructor: req.user._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Lecture course created successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Error creating lecture course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lecture course',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/lectures/courses
 * @desc    Get list of available lecture courses
 * @access  Public
 */
router.get('/courses', [
  query('subject').optional().notEmpty(),
  query('grade').optional().notEmpty(),
  query('instructor').optional().isMongoId(),
  query('isFree').optional().isBoolean(),
  query('search').optional().isString(),
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'active']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const filters = {
      ...req.query,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    if (req.query.isFree) {
      filters.isFree = req.query.isFree === 'true';
    }

    const result = await LectureService.getCourses(filters);

    res.json({
      success: true,
      message: 'Lecture courses retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error getting lecture courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving lecture courses',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/lectures/courses/:id
 * @desc    Get detailed information about a specific course
 * @access  Private
 */
router.get('/courses/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await LectureService.getCourseDetails(id, req.user._id);

    res.json({
      success: true,
      message: 'Course details retrieved successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Error getting course details:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while retrieving course details',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lectures/courses/:id/enroll
 * @desc    Enroll in a course
 * @access  Private
 */
router.post('/courses/:id/enroll', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await LectureService.enrollInCourse(id, req.user._id);

    res.json({
      success: true,
      message: result.status === 'pending_approval' 
        ? 'Enrollment request sent for approval'
        : 'Successfully enrolled in course',
      data: result
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Course is not active' || 
        error.message === 'Course is full' || 
        error.message === 'Already enrolled in this course' ||
        error.message === 'Course has already started') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while enrolling in course',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/lectures/courses/:id/enroll
 * @desc    Unenroll from a course
 * @access  Private
 */
router.delete('/courses/:id/enroll', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await LectureService.unenrollFromCourse(id, req.user._id);

    res.json({
      success: true,
      message: 'Successfully unenrolled from course',
      data: { course }
    });

  } catch (error) {
    console.error('Error unenrolling from course:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Not enrolled in this course') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while unenrolling from course',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/lectures/courses/:id/sessions/:sessionId
 * @desc    Get specific session details
 * @access  Private (Enrolled students or instructor)
 */
router.get('/courses/:id/sessions/:sessionId', auth, async (req, res) => {
  try {
    const { id, sessionId } = req.params;

    const session = await LectureService.getSessionDetails(id, sessionId, req.user._id);

    res.json({
      success: true,
      message: 'Session details retrieved successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Error getting session details:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Must be enrolled to view session details') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while retrieving session details',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/lectures/courses/:id/sessions/:sessionId/start
 * @desc    Start a live lecture session
 * @access  Private (Instructor only)
 */
router.put('/courses/:id/sessions/:sessionId/start', auth, async (req, res) => {
  try {
    const { id, sessionId } = req.params;

    const session = await LectureService.startLiveSession(id, sessionId, req.user._id);

    // Emit socket event
    if (global.io) {
      global.io.to(`lecture_course_${id}`).emit('sessionStarted', {
        courseId: id,
        sessionId,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Live session started successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Error starting live session:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Only instructor can start session' ||
        error.message === 'Session is already live' ||
        error.message === 'Session has already completed') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while starting live session',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/lectures/courses/:id/sessions/:sessionId/end
 * @desc    End a live lecture session
 * @access  Private (Instructor only)
 */
router.put('/courses/:id/sessions/:sessionId/end', auth, async (req, res) => {
  try {
    const { id, sessionId } = req.params;

    const session = await LectureService.endLiveSession(id, sessionId, req.user._id);

    // Emit socket event
    if (global.io) {
      global.io.to(`lecture_course_${id}`).emit('sessionEnded', {
        courseId: id,
        sessionId,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Live session ended successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Error ending live session:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Only instructor can end session' ||
        error.message === 'Session is not live') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while ending live session',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lectures/courses/:id/sessions/:sessionId/polls
 * @desc    Create a poll in a session
 * @access  Private (Instructor only)
 */
router.post('/courses/:id/sessions/:sessionId/polls', [
  auth,
  body('question').notEmpty().withMessage('Question is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('correctAnswer').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id, sessionId } = req.params;

    const poll = await LectureService.createPoll(id, sessionId, req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: { poll }
    });

  } catch (error) {
    console.error('Error creating poll:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Only instructor can create polls') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating poll',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lectures/courses/:id/sessions/:sessionId/polls/:pollId/respond
 * @desc    Submit poll response
 * @access  Private (Enrolled students)
 */
router.post('/courses/:id/sessions/:sessionId/polls/:pollId/respond', [
  auth,
  body('answer').isInt().withMessage('Answer index is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id, sessionId, pollId } = req.params;
    const { answer } = req.body;

    const poll = await LectureService.submitPollResponse(id, sessionId, pollId, req.user._id, answer);

    res.json({
      success: true,
      message: 'Poll response submitted successfully',
      data: { poll }
    });

  } catch (error) {
    console.error('Error submitting poll response:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found' || error.message === 'Poll not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Must be enrolled to participate' || error.message === 'Poll is not active') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while submitting poll response',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lectures/courses/:id/sessions/:sessionId/questions
 * @desc    Add question to Q&A queue
 * @access  Private (Enrolled students)
 */
router.post('/courses/:id/sessions/:sessionId/questions', [
  auth,
  body('question').notEmpty().trim().withMessage('Question is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id, sessionId } = req.params;
    const { question } = req.body;

    const addedQuestion = await LectureService.addQuestionToQueue(id, sessionId, req.user._id, question);

    res.status(201).json({
      success: true,
      message: 'Question added to queue successfully',
      data: { question: addedQuestion }
    });

  } catch (error) {
    console.error('Error adding question:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Must be enrolled to ask questions') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding question',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/lectures/courses/:id/sessions/:sessionId/questions/:questionId/answer
 * @desc    Answer question in Q&A queue
 * @access  Private (Instructor only)
 */
router.put('/courses/:id/sessions/:sessionId/questions/:questionId/answer', [
  auth,
  body('answer').notEmpty().trim().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id, sessionId, questionId } = req.params;
    const { answer } = req.body;

    const updatedQuestion = await LectureService.answerQuestion(id, sessionId, questionId, req.user._id, answer);

    res.json({
      success: true,
      message: 'Question answered successfully',
      data: { question: updatedQuestion }
    });

  } catch (error) {
    console.error('Error answering question:', error);
    
    if (error.message === 'Course not found' || error.message === 'Session not found' || error.message === 'Question not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Only instructor can answer questions') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while answering question',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/lectures/my-courses
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my-courses', [
  auth,
  query('status').optional().isIn(['active', 'completed', 'dropped']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const filters = {
      ...req.query,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await LectureService.getUserCourses(req.user._id, filters);

    res.json({
      success: true,
      message: 'User courses retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error getting user courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving user courses',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lectures/courses/:id/reviews
 * @desc    Add course review
 * @access  Private (Enrolled students)
 */
router.post('/courses/:id/reviews', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const course = await LectureService.addReview(id, req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Error adding review:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Must be enrolled to review' || error.message === 'Already reviewed this course') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding review',
      error: error.message
    });
  }
});

module.exports = router;
