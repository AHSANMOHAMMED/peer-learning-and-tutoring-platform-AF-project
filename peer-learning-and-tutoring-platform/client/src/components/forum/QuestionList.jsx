import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, MessageSquare, Eye, ThumbsUp, Tag } from 'lucide-react';
import { qaApi } from '../../services/api';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    tags: '',
    sortBy: 'newest',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'technical', label: 'Technical' },
    { value: 'career', label: 'Career' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'oldest', label: 'Oldest', icon: Clock },
    { value: 'votes', label: 'Most Votes', icon: ThumbsUp },
    { value: 'views', label: 'Most Views', icon: Eye },
    { value: 'popular', label: 'Popular', icon: TrendingUp },
    { value: 'unanswered', label: 'Unanswered', icon: MessageSquare }
  ];

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.tags) params.tags = filters.tags.split(',').map(tag => tag.trim());
      if (filters.sortBy) {
        // Map frontend sort values to backend values
        const sortMapping = {
          'newest': 'createdAt',
          'oldest': 'createdAt',
          'votes': 'votesCount',
          'views': 'views',
          'popular': 'votesCount'
        };
        params.sortBy = sortMapping[filters.sortBy] || 'createdAt';
        params.sortOrder = filters.sortBy === 'oldest' ? 1 : -1;
      }
      params.page = filters.page;
      params.limit = 20;

      const response = await qaApi.getQuestions(params);
      if (response.success) {
        const payload = response.data?.data || response.data || {};
        setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
        setPagination(payload.pagination || null);
      } else {
        setQuestions([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleVote = async (questionId, value) => {
    try {
      await qaApi.vote('question', questionId, value);
      // Refresh questions to update vote counts
      fetchQuestions();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return diffMins === 0 ? 'just now' : `${diffMins} min ago`;
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Q&A Forum</h1>
            <p className="text-gray-600">Ask questions, share knowledge, and help others learn</p>
          </div>
          <Link
            to="/forum/ask"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Ask Question
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <Link
              to="/forum/ask"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ask Question
            </Link>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="algebra, physics, homework..."
                  value={filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {!Array.isArray(questions) || questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category !== 'all' || filters.tags
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to ask a question!'}
            </p>
            {!filters.search && filters.category === 'all' && !filters.tags && (
              <Link
                to="/forum/ask"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ask First Question
              </Link>
            )}
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Vote Stats */}
                <div className="flex flex-col items-center min-w-16 text-center">
                  <button
                    onClick={() => handleVote(question._id, 1)}
                    className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-medium">{question.upvotes || 0}</span>
                  </button>
                  <div className="text-xs text-gray-500">votes</div>
                  <button
                    onClick={() => handleVote(question._id, -1)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ▼
                  </button>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <Link
                    to={`/forum/question/${question._id}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-2 block"
                  >
                    {question.title}
                  </Link>

                  <div className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {question.body}
                  </div>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.slice(0, 5).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{question.tags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          {question.author?.profile?.firstName?.[0] || 'U'}
                        </div>
                        {question.author?.profile?.firstName} {question.author?.profile?.lastName}
                      </span>
                      <span>{getTimeAgo(question.createdAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {question.answerCount} answers
                      </span>
                      {question.views > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {question.views} views
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {question.category}
                    </span>
                  </div>

                  {/* Accepted Answer Indicator */}
                  {question.hasAcceptedAnswer && (
                    <div className="mt-2 inline-flex items-center gap-1 text-green-600 text-sm">
                      <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Accepted Answer
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Floating Ask Question Button */}
      <div className="fixed bottom-8 right-8">
        <Link
          to="/forum/ask"
          className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 font-semibold"
        >
          Ask Question
        </Link>
      </div>
    </div>
  );
};

export default QuestionList;
