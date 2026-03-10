import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Users, Star, Calendar, Clock,
  ChevronRight, Play, CheckCircle, DollarSign, GraduationCap
} from 'lucide-react';
import lectureController from '../controllers/LectureController';

const LectureCatalogPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(lectureController.getState());
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    status: '',
    isFree: '',
    search: '',
    sortBy: 'startDate',
    sortOrder: 'asc'
  });

  useEffect(() => {
    const handleStateChange = (newState) => {
      setState(newState);
    };

    lectureController.subscribe('lectureCatalog', handleStateChange);
    lectureController.getCourses();

    return () => {
      lectureController.unsubscribe('lectureCatalog');
    };
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const filtered = lectureController.filterCourses(state.courses, newFilters);
    const sorted = lectureController.sortCourses(filtered, newFilters.sortBy, newFilters.sortOrder);
    
    lectureController.setState({ courses: sorted });
  };

  const handleEnroll = async (courseId) => {
    try {
      await lectureController.enrollInCourse(courseId);
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'IT'];
  const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];

  const filteredCourses = lectureController.sortCourses(
    lectureController.filterCourses(state.courses, filters),
    filters.sortBy,
    filters.sortOrder
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lecture Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join structured learning programs with expert instructors
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Find Courses
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            <select
              value={filters.isFree}
              onChange={(e) => handleFilterChange('isFree', e.target.value === '' ? '' : e.target.value === 'true')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Prices</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="startDate">Start Date</option>
                  <option value="title">Title</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>

                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No courses found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredCourses.map((course, index) => {
              const status = lectureController.getCourseStatus(course);
              const isEnrolled = course.isEnrolled;
              
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Course Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>

                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${lectureController.getCourseStatusColor(status)}`}>
                        {lectureController.getCourseStatusText(status)}
                      </span>
                      
                      {course.isFree ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Free
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {course.price} {course.currency}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                        <GraduationCap className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-700">{course.instructor?.name}</span>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(course.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.totalSessions} sessions
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.enrollmentCount || 0}/{course.capacity}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {course.averageRating?.toFixed(1) || '0.0'}
                      </div>
                    </div>

                    {/* Subject & Grade */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {course.subject}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {course.grade}
                      </span>
                    </div>

                    {/* Action Button */}
                    {isEnrolled ? (
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={course.isFull || status === 'completed'}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {course.isFull ? 'Course Full' : status === 'completed' ? 'Course Ended' : 'Enroll Now'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureCatalogPage;
