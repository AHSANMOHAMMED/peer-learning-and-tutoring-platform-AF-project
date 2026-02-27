import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tutorService } from '../services/tutorService';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

const TutorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    subject: '',
    startDate: '',
    startTime: '',
    duration: 1,
    notes: ''
  });

  useEffect(() => {
    fetchTutorDetails();
  }, [id]);

  const fetchTutorDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching tutor with ID:', id);
      const response = await tutorService.getTutorById(id);
      console.log('Tutor response:', response);
      
      if (response.success && response.data) {
        console.log('Setting tutor data:', response.data);
        setTutor(response.data);
        if (response.data.subjects?.length > 0) {
          setBookingData(prev => ({
            ...prev,
            subject: response.data.subjects[0].name
          }));
        }
      } else {
        console.error('Response not successful:', response);
        toast.error(response?.message || 'Failed to load tutor details');
        setTimeout(() => navigate('/browse-tutors'), 2000);
      }
    } catch (error) {
      console.error('Error fetching tutor:', error);
      toast.error('Error loading tutor details: ' + error.message);
      setTimeout(() => navigate('/browse-tutors'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }

    if (!bookingData.startDate || !bookingData.startTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      const response = await bookingService.createBooking({
        tutorId: id,
        studentId: user.id,
        subject: bookingData.subject,
        startDate: bookingData.startDate,
        startTime: bookingData.startTime,
        duration: bookingData.duration,
        notes: bookingData.notes,
        rate: tutor.subjects.find(s => s.name === bookingData.subject)?.hourlyRate || 0
      });

      if (response.success) {
        toast.success('Booking created successfully!');
        navigate('/student-dashboard');
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error creating booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Tutor not found</p>
        </div>
      </div>
    );
  }

  // Get tutor name
  const tutorName = tutor.user?.profile?.firstName 
    ? `${tutor.user.profile.firstName} ${tutor.user.profile.lastName || ''}`
    : `${tutor.subjects?.[0]?.name || 'Tutor'} Expert`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse-tutors')}
          className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Tutors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tutor Profile */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {tutor.user?.profile?.avatar ? (
                    <img
                      src={tutor.user.profile.avatar}
                      alt={tutorName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tutorName}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(tutor.rating?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {tutor.rating?.average?.toFixed(1) || 'N/A'} ({tutor.stats?.totalSessions || 0} sessions)
                    </span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-medium">Total Students:</span> {tutor.stats?.totalStudents || 0}
                  </p>
                </div>
              </div>

              {/* Subjects */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Subjects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.subjects?.map((subject, idx) => (
                    <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Grades:</span> {
                          typeof subject.gradeLevels === 'string' 
                            ? subject.gradeLevels 
                            : subject.gradeLevels?.join(', ')
                        }
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Rate:</span> ${subject.hourlyRate}/hr
                      </p>
                      {subject.description && (
                        <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Qualifications & Experience</h2>
                {tutor.qualifications?.education && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900">Education</p>
                    <p className="text-gray-600">{tutor.qualifications.education}</p>
                  </div>
                )}
                {tutor.qualifications?.certifications?.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900">Certifications</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {tutor.qualifications.certifications.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tutor.qualifications?.experience && (
                  <div>
                    <p className="font-medium text-gray-900">Experience</p>
                    <p className="text-gray-600">{tutor.qualifications.experience}</p>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                {tutor.availability?.length > 0 ? (
                  <div className="space-y-2">
                    {tutor.availability.map((slot, idx) => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <p key={idx} className="text-gray-600">
                          <span className="font-medium">{days[slot.dayOfWeek]}:</span> {slot.startTime} - {slot.endTime}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">Availability not specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Session</h2>

              <form onSubmit={handleBookSession} className="space-y-4">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={bookingData.subject}
                    onChange={(e) => setBookingData({ ...bookingData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {tutor.subjects?.map((subject, idx) => (
                      <option key={idx} value={subject.name}>
                        {subject.name} - ${subject.hourlyRate}/hr
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1">1 hour</option>
                    <option value="1.5">1.5 hours</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any specific topics or requirements..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">
                      ${tutor.subjects?.find(s => s.name === bookingData.subject)?.hourlyRate || 0}/hr
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{bookingData.duration}h</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-indigo-600">
                      ${(tutor.subjects?.find(s => s.name === bookingData.subject)?.hourlyRate || 0) * bookingData.duration}
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Book Session
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetail;
