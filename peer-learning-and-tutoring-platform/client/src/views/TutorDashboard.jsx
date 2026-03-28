import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from '../viewmodels/AuthViewModel';
import { useBookingViewModel } from '../viewmodels/BookingViewModel';

const TutorDashboard = () => {
  const { user } = useAuthViewModel();
  const { bookings, getTutorBookings, isLoading } = useBookingViewModel();

  useEffect(() => {
    if (user?.id) {
      getTutorBookings(user.id);
    }
  }, [user?.id, getTutorBookings]);

  const upcomingBookings = bookings?.filter((booking) => booking.isUpcoming) || [];

  // Mock stats - in real app, these would come from API
  const stats = {
    totalSessions: 0,
    totalStudents: 0,
    totalEarnings: 0,
    rating: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.firstName || 'Tutor'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your tutoring sessions and students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
            <div className="text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-purple-600">${stats.totalEarnings}</div>
            <div className="text-gray-600">Total Earnings</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.rating}</div>
            <div className="text-gray-600">Rating</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/browse-tutors"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Schedule</h3>
                <p className="text-sm text-gray-500">View upcoming sessions</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                <p className="text-sm text-gray-500">Chat with students</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Name:</span> {user?.profile?.firstName} {user?.profile?.lastName}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
