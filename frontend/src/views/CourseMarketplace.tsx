import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ShoppingCart, Star, Clock, Users, 
  ChevronDown, Grid, List, Heart, Share2, BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Course {
  _id: string;
  title: string;
  subject: string;
  thumbnail?: string;
  description?: string;
  isFree?: boolean;
  price?: number;
  duration?: string;
  instructor?: {
    name: string;
    profile?: { avatar?: string };
  };
  stats?: {
    averageRating?: number;
    totalEnrollments?: number;
  };
}

interface Category {
  name: string;
  courseCount: number;
}

const CourseMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [featured, setFeatured] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    query: '',
    subject: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sortBy: 'popular'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    searchCourses();
  }, [filters, pagination.current]);

  const fetchInitialData = async () => {
    try {
      const [featuredRes, categoriesRes] = await Promise.all([
        api.get('/api/marketplace/featured?limit=8'),
        api.get('/api/marketplace/categories')
      ]);

      if (featuredRes.data.success) {
        setFeatured(featuredRes.data.data.courses);
      }
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const searchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.query) params.append('q', filters.query);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('page', pagination.current.toString());

      const response = await api.get(`/api/marketplace/search?${params.toString()}`);
      
      if (response.data.success) {
        setCourses(response.data.data.courses);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await api.post(`/api/marketplace/courses/${courseId}/purchase`);
      if (response.data.success) {
        toast.success('Redirecting to payment...');
        // Handle Stripe checkout redirect
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const CourseCard = ({ course, featured: isFeatured = false }: { course: Course; featured?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all ${
        isFeatured ? 'border-blue-200' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {isFeatured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
        
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {course.subject}
          </span>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium">
              {course.stats?.averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description || 'No description available'}
        </p>

        {/* Instructor */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
            {course.instructor?.profile?.avatar ? (
              <img
                src={course.instructor.profile.avatar}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-xs font-medium">
                {course.instructor?.name?.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-700">{course.instructor?.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {course.stats?.totalEnrollments || 0} students
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {course.duration || 4} weeks
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            {course.isFree ? (
              <span className="text-xl font-bold text-green-600">Free</span>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                LKR {course.price?.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate(`/lectures/${course._id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Course Marketplace</h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover expert-led courses from top tutors
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses, subjects, or tutors..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Courses */}
        {featured.length > 0 && !filters.query && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((course) => (
                <CourseCard key={course._id} course={course} featured />
              ))}
            </div>
          </div>
        )}

        {/* Filters & Results */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4"
            >
              <span className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </span>
              <ChevronDown className={`w-5 h-5 transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${showFilters ? 'block' : 'hidden'} md:block bg-white rounded-xl shadow-sm p-6`}>
              <h3 className="font-semibold mb-4">Filters</h3>

              {/* Subject Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">All Subjects</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.courseCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">All Grades</option>
                  {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (LKR)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-1/2 border border-gray-300 rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-1/2 border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({
                  query: '',
                  subject: '',
                  grade: '',
                  minPrice: '',
                  maxPrice: '',
                  rating: '',
                  sortBy: 'popular'
                })}
                className="w-full py-2 text-blue-600 hover:text-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            {/* Sort & View Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination.count} courses found
              </p>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : courses.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No courses found matching your filters</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, current: page })}
                    className={`w-10 h-10 rounded-lg ${
                      pagination.current === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMarketplace;
