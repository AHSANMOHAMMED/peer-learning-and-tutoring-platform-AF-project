import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useTutoringController } from '../../controllers/useTutoringController';
import * as userService from '../../services/userService';
import toast from 'react-hot-toast';

/**
 * ScheduleSessionPage
 * Students schedule/request tutoring sessions with tutors
 */
const ScheduleSessionPage = () => {
  const navigate = useNavigate();
  const { schedule, loading, error } = useTutoringController();

  const [tutors, setTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [formData, setFormData] = useState({
    tutorId: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tutors on mount
  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await userService.getTutors();
      if (response.success) {
        setTutors(response.data?.tutors || []);
      }
    } catch (err) {
      toast.error('Failed to fetch tutors');
    } finally {
      setLoadingTutors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.tutorId ||
      !formData.subject ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check time order
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    const result = await schedule(formData);
    setIsSubmitting(false);

    if (result) {
      // Reset form
      setFormData({
        tutorId: '',
        subject: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
      });
      // Redirect
      setTimeout(() => {
        navigate('/sessions/my-sessions');
      }, 1500);
    }
  };

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Computer Science',
  ];

  const selectedTutor = tutors.find(t => t._id === formData.tutorId);

  return (
    <DashboardLayout pageTitle="Schedule Tutoring Session">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Session Details</h2>

            <div className="space-y-6">
              {/* Select Tutor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tutor *
                </label>
                {loadingTutors ? (
                  <p className="text-gray-600">Loading tutors...</p>
                ) : (
                  <select
                    name="tutorId"
                    value={formData.tutorId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Select a tutor --</option>
                    {tutors.map((tutor) => (
                      <option key={tutor._id} value={tutor._id}>
                        {tutor.profile?.firstName} {tutor.profile?.lastName} (
                        {tutor.subjects?.length} subjects)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Select subject --</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Time Slot */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What do you need help with?"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {isSubmitting || loading ? 'Scheduling...' : 'Request Session'}
              </button>
            </div>
          </div>

          {/* Tutor Info Card (Right Side) */}
          {selectedTutor && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-bold mb-4">Tutor Details</h3>

                <div className="mb-4">
                  <p className="text-2xl mb-2">
                    {selectedTutor.profile?.firstName} {selectedTutor.profile?.lastName}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="text-sm text-gray-600">
                      ({selectedTutor.qualifications?.ratings?.count || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-sm border-t pt-4">
                  <div>
                    <p className="text-gray-600">Hourly Rate</p>
                    <p className="font-semibold">
                      $
                      {selectedTutor.subjects?.[0]?.hourlyRate || 'Contact for pricing'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTutor.subjects?.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {s}
                        </span>
                      ))}
                      {selectedTutor.subjects?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{selectedTutor.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Experience</p>
                    <p className="font-semibold">
                      {selectedTutor.qualifications?.experience || 'Not specified'} years
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedTutor.profile?.bio ||
                      'No bio available. Click on their profile for more info.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleSessionPage;
