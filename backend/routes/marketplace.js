const express = require('express');
const router = express.Router();
const CourseMarketplaceService = require('../services/CourseMarketplaceService');
const { authenticate } = require('../middleware/auth');
const { query, body, param, validationResult } = require('express-validator');

/**
 * @route   GET /api/marketplace/featured
 * @desc    Get featured courses
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const courses = await CourseMarketplaceService.getFeaturedCourses(limit);

    res.json({
      success: true,
      message: 'Featured courses retrieved',
      data: { courses }
    });

  } catch (error) {
    console.error('Error getting featured courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured courses',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/new-arrivals
 * @desc    Get new course arrivals
 * @access  Public
 */
router.get('/new-arrivals', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const courses = await CourseMarketplaceService.getNewArrivals(limit);

    res.json({
      success: true,
      message: 'New arrivals retrieved',
      data: { courses }
    });

  } catch (error) {
    console.error('Error getting new arrivals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get new arrivals',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/trending
 * @desc    Get trending courses
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const courses = await CourseMarketplaceService.getTrendingCourses(limit);

    res.json({
      success: true,
      message: 'Trending courses retrieved',
      data: { courses }
    });

  } catch (error) {
    console.error('Error getting trending courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending courses',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/search
 * @desc    Search courses with filters
 * @access  Public
 */
router.get('/search', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minPrice').optional().isInt({ min: 0 }),
  query('maxPrice').optional().isInt({ min: 0 }),
  query('rating').optional().isFloat({ min: 1, max: 5 })
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

    const {
      q: query,
      subject,
      grade,
      minPrice,
      maxPrice,
      rating,
      sortBy,
      page,
      limit
    } = req.query;

    const result = await CourseMarketplaceService.searchCourses({
      query,
      subject,
      grade,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      sortBy,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12
    });

    res.json({
      success: true,
      message: 'Search results retrieved',
      data: result
    });

  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search courses',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/categories
 * @desc    Get course categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await CourseMarketplaceService.getCategories();

    res.json({
      success: true,
      message: 'Categories retrieved',
      data: { categories }
    });

  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/price-ranges
 * @desc    Get price range statistics
 * @access  Public
 */
router.get('/price-ranges', async (req, res) => {
  try {
    const ranges = await CourseMarketplaceService.getPriceRanges();

    res.json({
      success: true,
      message: 'Price ranges retrieved',
      data: { ranges }
    });

  } catch (error) {
    console.error('Error getting price ranges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price ranges',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/recommended
 * @desc    Get recommended courses for user
 * @access  Private
 */
router.get('/recommended', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const courses = await CourseMarketplaceService.getRecommendedCourses(
      req.user._id,
      limit
    );

    res.json({
      success: true,
      message: 'Recommended courses retrieved',
      data: { courses }
    });

  } catch (error) {
    console.error('Error getting recommended courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/tutor/courses
 * @desc    Get tutor's marketplace courses
 * @access  Private (Tutors)
 */
router.get('/tutor/courses', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can access this endpoint'
      });
    }

    const result = await CourseMarketplaceService.getTutorMarketplaceCourses(
      req.user._id
    );

    res.json({
      success: true,
      message: 'Tutor courses retrieved',
      data: result
    });

  } catch (error) {
    console.error('Error getting tutor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tutor courses',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/marketplace/tutor/courses/:id/publish
 * @desc    Publish course to marketplace
 * @access  Private (Tutors)
 */
router.post('/tutor/courses/:id/publish', [
  authenticate,
  param('id').isMongoId()
], async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can publish courses'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const course = await CourseMarketplaceService.publishCourse(id, req.user._id);

    res.json({
      success: true,
      message: 'Course published successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Error publishing course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish course',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/marketplace/tutor/courses/:id/unpublish
 * @desc    Unpublish course from marketplace
 * @access  Private (Tutors)
 */
router.post('/tutor/courses/:id/unpublish', [
  authenticate,
  param('id').isMongoId()
], async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can unpublish courses'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const course = await CourseMarketplaceService.unpublishCourse(id, req.user._id);

    res.json({
      success: true,
      message: 'Course unpublished successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Error unpublishing course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unpublish course',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/marketplace/courses/:id/purchase
 * @desc    Initiate course purchase
 * @access  Private
 */
router.post('/courses/:id/purchase', [
  authenticate,
  param('id').isMongoId()
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
    const { paymentMethod } = req.body;

    const paymentIntent = await CourseMarketplaceService.purchaseCourse(
      id,
      req.user._id,
      paymentMethod
    );

    res.json({
      success: true,
      message: 'Payment initiated',
      data: paymentIntent
    });

  } catch (error) {
    console.error('Error initiating purchase:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate purchase',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/marketplace/analytics
 * @desc    Get marketplace analytics (Admin)
 * @access  Private (Admin)
 */
router.get('/analytics', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { timeRange = '30d' } = req.query;

    const analytics = await CourseMarketplaceService.getMarketplaceAnalytics(timeRange);

    res.json({
      success: true,
      message: 'Marketplace analytics retrieved',
      data: analytics
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

module.exports = router;
