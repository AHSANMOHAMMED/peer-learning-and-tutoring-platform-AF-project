import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiClock, FiUser, FiBook, FiMessageSquare,
  FiChevronRight, FiCheck, FiLoader, FiSearch, FiStar,
  FiDollarSign, FiArrowLeft
} from 'react-icons/fi';
import { useTutoringController } from '../../controllers/useTutoringController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * ScheduleSession - Multi-step session scheduling view
 * 
 * MVC Pattern: View (Pure UI - Logic in useTutoringController)
 */
const ScheduleSession = () => {
  const navigate = useNavigate();
  const { user } = useAuthViewModel();
  const { 
    tutors, 
    availability,
    isLoading, 
    isSubmitting,
    fetchTutors,
    fetchAvailability,
    scheduleSession 
  } = useTutoringController();

  const [step, setStep] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'History', 'Computer Science', 'Economics', 'Art', 'Music'
  ];

  const durations = [30, 45, 60, 90, 120];

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  useEffect(() => {
    if (selectedTutor) {
      fetchAvailability(selectedTutor.id || selectedTutor._id);
    }
  }, [selectedTutor, fetchAvailability]);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = !tutorSearch || 
      tutor.user?.displayName?.toLowerCase().includes(tutorSearch.toLowerCase()) ||
      tutor.subjects?.some(s => s.toLowerCase().includes(tutorSearch.toLowerCase()));
    
    const matchesSubject = !subjectFilter || 
      tutor.subjects?.includes(subjectFilter);
    
    return matchesSearch && matchesSubject;
  });

  const generateTimeSlots = () => {
    if (!selectedDate || !availability.length) return [];
    
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability) return [];
    
    return dayAvailability.slots || [];
  };

  const timeSlots = generateTimeSlots();

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setStep(2);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setStep(3);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleSubmit = async () => {
    if (!selectedTutor || !selectedSubject || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sessionData = {
      tutorId: selectedTutor.id || selectedTutor._id,
      subject: selectedSubject,
      topic,
      date: selectedDate,
      startTime: selectedTime,
      duration,
      notes,
      price: selectedTutor.hourlyRate * (duration / 60)
    };

    const result = await scheduleSession(sessionData);
    
    if (result.success) {
      navigate('/dashboard/student/sessions');
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 py-2">{day}</div>
          ))}
          {days.map((day, index) => {
            if (!day) return <div key={index} />;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = today.getDate() === day;
            const isPast = new Date(year, month, day) < new Date(today.setHours(0, 0, 0, 0));
            
            return (
              <button
                key={day}
                onClick={() => !isPast && handleDateSelect(dateStr)}
                disabled={isPast}
                className={`
                  py-2 rounded-lg text-sm font-medium transition-colors
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
                  ${!isSelected && !isToday && !isPast ? 'hover:bg-gray-100' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStars = (rating) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Session</h1>
        <p className="text-gray-600">Book a tutoring session with an expert</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map((s, index) => (
          <React.Fragment key={s}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {step > s ? <FiCheck /> : s}
            </div>
            {index < 3 && (
              <div className={`
                w-20 h-1 mx-2
                ${step > s ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Tutor */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutors by name or subject..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tutors found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTutors.map(tutor => (
                <div
                  key={tutor.id || tutor._id}
                  onClick={() => handleTutorSelect(tutor)}
                  className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-2xl">
                      {tutor.user?.profile?.avatar ? (
                        <img src={tutor.user.profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <FiUser className="text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{tutor.user?.displayName || 'Tutor'}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(tutor.averageRating || 4.5)}
                        <span className="text-sm text-gray-500">({tutor.totalReviews || 0} reviews)</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(tutor.subjects || []).slice(0, 3).map(subject => (
                          <span key={subject} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {subject}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold text-emerald-600">
                          <FiDollarSign className="inline" />
                          {tutor.hourlyRate || 30}/hr
                        </span>
                        <span className="text-sm text-gray-500">
                          {tutor.experience || 0} years exp.
                        </span>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Subject */}
      {step === 2 && selectedTutor && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected Tutor</p>
              <p className="font-semibold text-gray-900">{selectedTutor.user?.displayName}</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
            >
              Change
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">Select Subject</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(selectedTutor.subjects || subjects).map(subject => (
              <button
                key={subject}
                onClick={() => handleSubjectSelect(subject)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${selectedSubject === subject 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <FiBook className="w-6 h-6 text-blue-600 mb-2" />
                <span className="font-medium text-gray-900">{subject}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Topic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Calculus Derivatives"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 3: Select Date & Time */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedTutor?.user?.displayName}</p>
                <p className="text-sm text-gray-600">{selectedSubject}</p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
              >
                Change
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
              {renderCalendar()}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Times {selectedDate && `for ${new Date(selectedDate).toLocaleDateString()}`}
              </h3>
              
              {!selectedDate ? (
                <p className="text-gray-500">Please select a date first</p>
              ) : timeSlots.length === 0 ? (
                <p className="text-gray-500">No available slots for this date</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        p-3 rounded-lg border-2 text-center transition-all
                        ${selectedTime === time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                        }
                      `}
                    >
                      <FiClock className="w-4 h-4 mx-auto mb-1" />
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Duration</h3>
            <div className="flex flex-wrap gap-3">
              {durations.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`
                    px-6 py-3 rounded-lg border-2 font-medium transition-all
                    ${duration === d
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedDate && selectedTime && setStep(4)}
            disabled={!selectedDate || !selectedTime}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Review
          </button>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Review Your Booking</h3>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <FiUser className="text-2xl text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tutor</p>
                <p className="font-semibold text-gray-900">{selectedTutor?.user?.displayName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-medium text-gray-900">{selectedSubject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Topic</p>
                <p className="font-medium text-gray-900">{topic || 'General'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">{selectedTime}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium text-gray-900">{duration} minutes</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">Total Price</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${(selectedTutor?.hourlyRate || 30) * (duration / 60)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMessageSquare className="inline mr-2" />
              Notes for Tutor (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics you'd like to cover..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="inline mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSession;
