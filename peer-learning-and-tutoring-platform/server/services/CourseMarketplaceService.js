const LectureCourse = require('../models/LectureCourse');
const User = require('../models/User');
const PaymentService = require('./PaymentService');

class CourseMarketplaceService {
  constructor() {
    this.platformFeePercent = 10; // 10% platform fee
    this.minCoursePrice = 500; // LKR 500 minimum
    this.maxCoursePrice = 50000; // LKR 50,000 maximum
  }

  /**
   * Get featured courses for marketplace
   */
  async getFeaturedCourses(limit = 8) {
    try {
      const courses = await LectureCourse.find({
        status: 'published',
        isFree: false,
        price: { $gte: this.minCoursePrice }
      })
        .sort({ 'stats.totalEnrollments': -1, 'stats.averageRating': -1 })
        .limit(limit)
        .populate('instructor', 'name profile.avatar')
        .select('title description thumbnail price rating stats instructor subject grade');

      return courses;
    } catch (error) {
      console.error('Error getting featured courses:', error);
      throw error;
    }
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit = 8) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const courses = await LectureCourse.find({
        status: 'published',
        createdAt: { $gte: thirtyDaysAgo }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('instructor', 'name profile.avatar');

      return courses;
    } catch (error) {
      console.error('Error getting new arrivals:', error);
      throw error;
    }
  }

  /**
   * Get trending courses
   */
  async getTrendingCourses(limit = 8) {
    try {
      // Get courses with most enrollments in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const courses = await LectureCourse.aggregate([
        {
          $match: {
            status: 'published',
            'enrolledStudents.enrolledAt': { $gte: sevenDaysAgo }
          }
        },
        {
          $addFields: {
            recentEnrollments: {
              $size: {
                $filter: {
                  input: '$enrolledStudents',
                  as: 'student',
                  cond: { $gte: ['$$student.enrolledAt', sevenDaysAgo] }
                }
              }
            }
          }
        },
        { $sort: { recentEnrollments: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'instructor.user',
            foreignField: '_id',
            as: 'instructor'
          }
        }
      ]);

      return courses;
    } catch (error) {
      console.error('Error getting trending courses:', error);
      throw error;
    }
  }

  /**
   * Search courses with filters
   */
  async searchCourses(filters = {}) {
    try {
      const {
        query,
        subject,
        grade,
        minPrice,
        maxPrice,
        rating,
        sortBy = 'relevance',
        page = 1,
        limit = 12
      } = filters;

      const searchQuery = {
        status: 'published',
        isFree: false
      };

      // Text search
      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { subject: { $regex: query, $options: 'i' } }
        ];
      }

      // Filters
      if (subject) searchQuery.subject = subject;
      if (grade) searchQuery.grade = grade;
      if (minPrice !== undefined || maxPrice !== undefined) {
        searchQuery.price = {};
        if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
        if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
      }
      if (rating) {
        searchQuery['stats.averageRating'] = { $gte: rating };
      }

      // Sorting
      let sortOption = {};
      switch (sortBy) {
        case 'price-low':
          sortOption = { price: 1 };
          break;
        case 'price-high':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { 'stats.averageRating': -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'popular':
          sortOption = { 'stats.totalEnrollments': -1 };
          break;
        default:
          sortOption = { 'stats.totalEnrollments': -1 };
      }

      const skip = (page - 1) * limit;

      const [courses, total] = await Promise.all([
        LectureCourse.find(searchQuery)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .populate('instructor', 'name profile.avatar profile.bio'),
        LectureCourse.countDocuments(searchQuery)
      ]);

      return {
        courses,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  /**
   * Get course categories/subjects
   */
  async getCategories() {
    try {
      const categories = await LectureCourse.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$subject',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$stats.averageRating' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return categories.map(cat => ({
        name: cat._id,
        courseCount: cat.count,
        averagePrice: Math.round(cat.avgPrice),
        averageRating: cat.avgRating.toFixed(1)
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get price range statistics
   */
  async getPriceRanges() {
    try {
      const ranges = [
        { min: 0, max: 1000, label: 'Under LKR 1,000' },
        { min: 1000, max: 5000, label: 'LKR 1,000 - 5,000' },
        { min: 5000, max: 10000, label: 'LKR 5,000 - 10,000' },
        { min: 10000, max: 20000, label: 'LKR 10,000 - 20,000' },
        { min: 20000, max: Infinity, label: 'Over LKR 20,000' }
      ];

      const results = await Promise.all(
        ranges.map(async range => {
          const query = { status: 'published', price: {} };
          if (range.min > 0) query.price.$gte = range.min;
          if (range.max !== Infinity) query.price.$lte = range.max;

          const count = await LectureCourse.countDocuments(query);
          return { ...range, count };
        })
      );

      return results;
    } catch (error) {
      console.error('Error getting price ranges:', error);
      throw error;
    }
  }

  /**
   * Get tutor's courses for marketplace
   */
  async getTutorMarketplaceCourses(tutorId) {
    try {
      const courses = await LectureCourse.find({
        'instructor.user': tutorId,
        status: { $in: ['published', 'draft'] }
      })
        .sort({ createdAt: -1 })
        .populate('instructor', 'name profile.avatar');

      const stats = await this.getTutorStats(tutorId);

      return {
        courses,
        stats
      };
    } catch (error) {
      console.error('Error getting tutor courses:', error);
      throw error;
    }
  }

  /**
   * Get tutor marketplace stats
   */
  async getTutorStats(tutorId) {
    try {
      const stats = await LectureCourse.aggregate([
        { $match: { 'instructor.user': new require('mongoose').Types.ObjectId(tutorId) } },
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            publishedCourses: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
            },
            totalEnrollments: { $sum: '$stats.totalEnrollments' },
            totalRevenue: {
              $sum: {
                $multiply: ['$stats.totalEnrollments', '$price']
              }
            },
            averageRating: { $avg: '$stats.averageRating' }
          }
        }
      ]);

      return stats[0] || {
        totalCourses: 0,
        publishedCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    } catch (error) {
      console.error('Error getting tutor stats:', error);
      throw error;
    }
  }

  /**
   * Publish course to marketplace
   */
  async publishCourse(courseId, tutorId) {
    try {
      const course = await LectureCourse.findOne({
        _id: courseId,
        'instructor.user': tutorId
      });

      if (!course) {
        throw new Error('Course not found or access denied');
      }

      if (course.status === 'published') {
        throw new Error('Course is already published');
      }

      // Validation
      if (!course.price || course.price < this.minCoursePrice) {
        throw new Error(`Price must be at least LKR ${this.minCoursePrice}`);
      }

      if (course.price > this.maxCoursePrice) {
        throw new Error(`Price cannot exceed LKR ${this.maxCoursePrice}`);
      }

      if (!course.sessions || course.sessions.length === 0) {
        throw new Error('Course must have at least one session');
      }

      course.status = 'published';
      course.publishedAt = new Date();
      await course.save();

      return course;
    } catch (error) {
      console.error('Error publishing course:', error);
      throw error;
    }
  }

  /**
   * Unpublish course from marketplace
   */
  async unpublishCourse(courseId, tutorId) {
    try {
      const course = await LectureCourse.findOne({
        _id: courseId,
        'instructor.user': tutorId
      });

      if (!course) {
        throw new Error('Course not found or access denied');
      }

      if (course.enrolledStudents.length > 0) {
        throw new Error('Cannot unpublish course with enrolled students');
      }

      course.status = 'draft';
      await course.save();

      return course;
    } catch (error) {
      console.error('Error unpublishing course:', error);
      throw error;
    }
  }

  /**
   * Get marketplace analytics (Admin)
   */
  async getMarketplaceAnalytics(timeRange = '30d') {
    try {
      const days = parseInt(timeRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analytics = await Promise.all([
        // Total revenue
        LectureCourse.aggregate([
          {
            $match: {
              'enrolledStudents.enrolledAt': { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $size: '$enrolledStudents' },
                    '$price'
                  ]
                }
              },
              totalEnrollments: { $sum: { $size: '$enrolledStudents' } }
            }
          }
        ]),

        // Revenue by subject
        LectureCourse.aggregate([
          {
            $match: {
              'enrolledStudents.enrolledAt': { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$subject',
              revenue: {
                $sum: {
                  $multiply: [
                    { $size: '$enrolledStudents' },
                    '$price'
                  ]
                }
              },
              enrollments: { $sum: { $size: '$enrolledStudents' } }
            }
          },
          { $sort: { revenue: -1 } }
        ]),

        // Top performing tutors
        LectureCourse.aggregate([
          {
            $match: {
              'enrolledStudents.enrolledAt': { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$instructor.user',
              revenue: {
                $sum: {
                  $multiply: [
                    { $size: '$enrolledStudents' },
                    '$price'
                  ]
                }
              },
              courseCount: { $sum: 1 },
              totalStudents: { $sum: { $size: '$enrolledStudents' } }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'tutor'
            }
          }
        ]),

        // Daily sales trend
        LectureCourse.aggregate([
          { $unwind: '$enrolledStudents' },
          {
            $match: {
              'enrolledStudents.enrolledAt': { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$enrolledStudents.enrolledAt'
                }
              },
              revenue: { $sum: '$price' },
              sales: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      return {
        overview: analytics[0][0] || { totalRevenue: 0, totalEnrollments: 0 },
        revenueBySubject: analytics[1],
        topTutors: analytics[2],
        dailyTrend: analytics[3]
      };
    } catch (error) {
      console.error('Error getting marketplace analytics:', error);
      throw error;
    }
  }

  /**
   * Process course purchase
   */
  async purchaseCourse(courseId, userId, paymentMethod = 'stripe') {
    try {
      const course = await LectureCourse.findById(courseId);
      
      if (!course || course.status !== 'published') {
        throw new Error('Course not available');
      }

      if (course.isFree) {
        throw new Error('Course is free, use enrollment endpoint instead');
      }

      // Check if already enrolled
      const isEnrolled = course.enrolledStudents.some(
        e => e.user.toString() === userId.toString()
      );

      if (isEnrolled) {
        throw new Error('Already enrolled in this course');
      }

      // Check if course is full
      if (course.maxStudents && course.enrolledStudents.length >= course.maxStudents) {
        throw new Error('Course is full');
      }

      // Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent(
        courseId,
        userId
      );

      return paymentIntent;
    } catch (error) {
      console.error('Error processing course purchase:', error);
      throw error;
    }
  }

  /**
   * Get recommended courses for user
   */
  async getRecommendedCourses(userId, limit = 8) {
    try {
      const user = await User.findById(userId).select('profile.subjects profile.grade enrolledCourses');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's enrolled course IDs
      const enrolledCourseIds = user.enrolledCourses?.map(c => c.course.toString()) || [];

      // Find courses matching user's interests
      const recommended = await LectureCourse.find({
        status: 'published',
        _id: { $nin: enrolledCourseIds },
        $or: [
          { subject: { $in: user.profile?.subjects || [] } },
          { grade: user.profile?.grade }
        ]
      })
        .sort({ 'stats.averageRating': -1, 'stats.totalEnrollments': -1 })
        .limit(limit)
        .populate('instructor', 'name profile.avatar');

      // If not enough recommendations, fill with popular courses
      if (recommended.length < limit) {
        const additionalNeeded = limit - recommended.length;
        const additional = await LectureCourse.find({
          status: 'published',
          _id: { 
            $nin: [...enrolledCourseIds, ...recommended.map(r => r._id)] 
          }
        })
          .sort({ 'stats.totalEnrollments': -1 })
          .limit(additionalNeeded)
          .populate('instructor', 'name profile.avatar');

        recommended.push(...additional);
      }

      return recommended;
    } catch (error) {
      console.error('Error getting recommended courses:', error);
      throw error;
    }
  }
}

module.exports = new CourseMarketplaceService();
