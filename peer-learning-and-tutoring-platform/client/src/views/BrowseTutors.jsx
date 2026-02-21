import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTutorViewModel } from '../viewmodels/TutorViewModel';

const BrowseTutors = () => {
  const { 
    tutors, 
    isLoading, 
    error, 
    filters, 
    fetchTutors, 
    updateFilters,
    resetFilters
  } = useTutorViewModel();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
    fetchTutors();
  };

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology'];
  const grades = [6, 7, 8, 9, 10, 11, 12, 13];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Tutor</h1>
          <p className="mt-2 text-gray-600">
            Browse qualified tutors and book your learning sessions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search tutors by name, subject, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 input-field"
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select 
                value={filters.subject}
                onChange={(e) => updateFilters({ subject: e.target.value })}
                className="input-field"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <select 
                value={filters.grade}
                onChange={(e) => updateFilters({ grade: e.target.value })}
                className="input-field"
              >
                <option value="">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <select 
                value={filters.minRating}
                onChange={(e) => updateFilters({ minRating: e.target.value })}
                className="input-field"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => {
                  resetFilters();
                  setSearchQuery('');
                  fetchTutors();
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tutors Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Tutor Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {tutor.user?.profile?.avatar ? (
                        <img 
                          src={tutor.user.profile.avatar} 
                          alt={tutor.displayName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{tutor.displayName}</h3>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">
                          {tutor.averageRating} ({tutor.totalSessions} sessions)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Subjects:</span> {tutor.subjectList}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Grades:</span> {tutor.gradeLevels.join(', ')}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {tutor.bio || 'No bio available'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-lg font-semibold text-primary-600">
                      ${tutor.hourlyRate || tutor.subjects[0]?.hourlyRate || 0}/hr
                    </div>
                    <Link
                      to={`/tutors/${tutor.id}`}
                      className="btn-primary"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && tutors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tutors found matching your criteria</p>
            <button 
              onClick={() => {
                resetFilters();
                setSearchQuery('');
                fetchTutors();
              }}
              className="mt-4 btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTutors;
