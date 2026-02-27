import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiBook, FiDollarSign, FiCalendar } from 'react-icons/fi';

/**
 * TutorCard - Card displaying tutor information
 * 
 * MVC Pattern: View (Pure UI Component)
 */
const TutorCard = ({ tutor, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {tutor.user?.profile?.avatar ? (
            <img 
              src={tutor.user.profile.avatar} 
              alt={tutor.user.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            tutor.user?.displayName?.charAt(0) || 'T'
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{tutor.user?.displayName || 'Tutor'}</h4>
          <p className="text-sm text-gray-500 truncate">{tutor.subjectsText || tutor.subjects?.join(', ')}</p>
          <div className="flex items-center mt-1">
            <FiStar className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm font-medium text-gray-700 ml-1">{tutor.ratingDisplay || tutor.rating}</span>
            <span className="text-xs text-gray-400 ml-1">({tutor.totalReviews} reviews)</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-emerald-600">${tutor.hourlyRate}/hr</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      {/* Content */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {tutor.user?.profile?.avatar ? (
                <img 
                  src={tutor.user.profile.avatar} 
                  alt={tutor.user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                tutor.user?.displayName?.charAt(0) || 'T'
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{tutor.user?.displayName || 'Tutor'}</h3>
          <p className="text-gray-600 mt-1 line-clamp-2">{tutor.bio}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center text-amber-500">
              <FiStar className="w-5 h-5 fill-current" />
              <span className="ml-1 font-semibold text-gray-900">{tutor.ratingDisplay || tutor.rating}</span>
              <span className="ml-1 text-gray-500">({tutor.totalReviews})</span>
            </div>
            <div className="flex items-center text-gray-500">
              <FiBook className="w-4 h-4" />
              <span className="ml-1">{tutor.totalSessions || 0} sessions</span>
            </div>
          </div>

          {/* Subjects */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tutor.subjects?.slice(0, 3).map((subject, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {subject}
              </span>
            ))}
            {tutor.subjects?.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{tutor.subjects.length - 3} more
              </span>
            )}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div>
              <span className="text-2xl font-bold text-emerald-600">${tutor.hourlyRate}</span>
              <span className="text-gray-500">/hr</span>
            </div>
            <Link
              to={`/browse-tutors/${tutor.id}`}
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiCalendar className="w-4 h-4 mr-2" />
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
