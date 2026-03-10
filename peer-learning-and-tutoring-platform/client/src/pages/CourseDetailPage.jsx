import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Star, Calendar, Clock, ChevronLeft, Play,
  CheckCircle, Lock, Unlock, MessageCircle, FileText, Award,
  BarChart3, User, ChevronRight, Video, Download
} from 'lucide-react';
import lectureController from '../controllers/LectureController';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(lectureController.getState());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleStateChange = (newState) => {
      setState(newState);
    };

    lectureController.subscribe('courseDetail', handleStateChange);
    
    if (id) {
      lectureController.getCourseDetails(id);
    }

    return () => {
      lectureController.unsubscribe('courseDetail');
    };
  }, [id]);

  const handleEnroll = async () => {
    try {
      await lectureController.enrollInCourse(id);
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const course = state.currentCourse;

  if (state.loading && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Course not found</p>
        </div>
      </div>
    );
  }

  const status = lectureController.getCourseStatus(course);
  const isEnrolled = course.isEnrolled;
  const isInstructor = course.isInstructor;
  const progress = course.userEnrollment?.progress || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/lectures')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Courses
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${lectureController.getCourseStatusColor(status)} bg-white/20`}>
                {lectureController.getCourseStatusText(status)}
              </span>
              {course.isFree && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
                  Free
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-blue-100 mb-6 max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>Instructor: {course.instructor?.name}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                <span>{course.averageRating?.toFixed(1) || '0.0'} ({course.stats?.totalReviews || 0} reviews)</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{course.enrollmentCount || 0} students enrolled</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{new Date(course.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="flex border-b border-gray-200">
                {['overview', 'curriculum', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-center font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {course.learningOutcomes?.map((outcome, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6">
                      {course.prerequisites?.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'curriculum' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">Course Curriculum</h3>
                    <div className="space-y-4">
                      {course.sessions?.map((session, index) => {
                        const isCompleted = progress >= ((index + 1) / course.totalSessions) * 100;
                        const isLocked = !isEnrolled && !isInstructor;
                        
                        return (
                          <div
                            key={session._id}
                            className={`border rounded-lg p-4 ${
                              isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                ) : isLocked ? (
                                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                                ) : (
                                  <Play className="w-5 h-5 text-blue-500 mr-3" />
                                )}
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    Session {index + 1}: {session.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {session.description}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {session.duration} minutes
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {new Date(session.scheduledAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isEnrolled && (
                                <button
                                  onClick={() => navigate(`/courses/${course._id}/sessions/${session._id}`)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                  {session.status === 'live' ? 'Join Live' : 'View Session'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">Student Reviews</h3>
                    <div className="space-y-4">
                      {course.reviews?.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-medium">{review.user?.name}</span>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                      
                      {(!course.reviews || course.reviews.length === 0) && (
                        <p className="text-gray-500 text-center py-8">
                          No reviews yet. Be the first to review!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {isEnrolled ? (
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Your Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{progress.toFixed(0)}% complete</p>
                  </div>

                  <button
                    onClick={() => {
                      const nextSession = course.sessions?.find(s => s.status !== 'completed');
                      if (nextSession) {
                        navigate(`/courses/${course._id}/sessions/${nextSession._id}`);
                      }
                    }}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-3"
                  >
                    Continue Learning
                  </button>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium mb-3">Course Resources</h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left">
                        <FileText className="w-4 h-4 mr-2" />
                        Course Materials
                      </button>
                      <button className="w-full flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Discussion Forum
                      </button>
                      <button className="w-full flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left">
                        <Award className="w-4 h-4 mr-2" />
                        Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    {course.isFree ? (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-green-600">Free</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-900">{course.price} {course.currency}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={course.isFull || status === 'completed'}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
                  >
                    {course.isFull ? 'Course Full' : status === 'completed' ? 'Course Ended' : 'Enroll Now'}
                  </button>

                  <div className="text-center text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrollmentCount || 0} students enrolled
                    </div>
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.totalSessions} sessions ({course.duration} hours)
                    </div>
                    <div className="flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {course.grade} level
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
