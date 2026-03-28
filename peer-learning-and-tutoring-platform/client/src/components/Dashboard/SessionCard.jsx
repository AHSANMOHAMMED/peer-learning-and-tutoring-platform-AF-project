import React from 'react';
import { FiCalendar, FiClock, FiUser, FiVideo, FiCheck, FiX } from 'react-icons/fi';

/**
 * SessionCard - Card displaying session/booking information
 * 
 * MVC Pattern: View (Pure UI Component)
 */
const SessionCard = ({ booking, userRole, showActions = false }) => {
  const isStudent = userRole === 'student';
  const isTutor = userRole === 'tutor';
  
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const displayName = isStudent 
    ? booking.tutor?.displayName || 'Tutor'
    : booking.student?.displayName || 'Student';

  const displayRole = isStudent ? 'Tutor' : 'Student';

  const handleJoinSession = () => {
    if (booking.sessionUrl) {
      window.open(booking.sessionUrl, '_blank');
    }
  };

  const handleAccept = () => {
    // Handled by parent controller
  };

  const handleDecline = () => {
    // Handled by parent controller
  };

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{booking.subject}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <FiUser className="w-4 h-4 mr-1" />
            <span>{displayRole}: {displayName}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-1" />
              {formattedDate}
            </span>
            <span className="flex items-center">
              <FiClock className="w-4 h-4 mr-1" />
              {booking.startTime} - {booking.endTime}
            </span>
          </div>

          {booking.notes && (
            <p className="mt-2 text-sm text-gray-600 italic">"{booking.notes}"</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {booking.status === 'confirmed' && booking.sessionUrl && (
            <button
              onClick={handleJoinSession}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiVideo className="w-4 h-4 mr-2" />
              Join
            </button>
          )}

          {showActions && booking.status === 'pending' && isTutor && (
            <>
              <button
                onClick={handleAccept}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <FiCheck className="w-4 h-4 mr-2" />
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <FiX className="w-4 h-4 mr-2" />
                Decline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
