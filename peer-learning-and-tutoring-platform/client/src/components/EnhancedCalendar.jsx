import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TimezoneSelect from 'react-timezone-select';
import { toast } from 'react-hot-toast';

const EnhancedCalendar = ({ 
  onDateSelect, 
  onTimeSelect, 
  availableSlots = [], 
  bookedSlots = [],
  selectedDate = null,
  selectedTime = null,
  mode = 'select', // 'select' or 'availability'
  tutorAvailability = []
}) => {
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [viewDate, setViewDate] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [duration, setDuration] = useState(60); // minutes

  // Time slots for booking
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  useEffect(() => {
    if (selectedDate) {
      setShowTimeSlots(true);
    }
  }, [selectedDate]);

  // Function to check if a date has available slots
  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dateStr = date.toDateString();
    const hasAvailable = availableSlots.some(slot => 
      new Date(slot.date).toDateString() === dateStr
    );
    const hasBooked = bookedSlots.some(slot => 
      new Date(slot.date).toDateString() === dateStr
    );

    if (hasAvailable && hasBooked) {
      return (
        <div className="flex justify-center space-x-1 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      );
    } else if (hasAvailable) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      );
    } else if (hasBooked) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      );
    }

    return null;
  };

  // Function to check if a date is disabled
  const isTileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // If in select mode, only enable dates with available slots
    if (mode === 'select') {
      const dateStr = date.toDateString();
      const hasAvailable = availableSlots.some(slot => 
        new Date(slot.date).toDateString() === dateStr
      );
      return !hasAvailable;
    }

    return false;
  };

  // Function to get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];

    const dateStr = selectedDate.toDateString();
    const daySlots = availableSlots.filter(slot => 
      new Date(slot.date).toDateString() === dateStr
    );

    // Convert to user's timezone
    return timeSlots.map(time => {
      const slotDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${time}`);
      const isBooked = bookedSlots.some(slot => {
        const bookedDateTime = new Date(`${new Date(slot.date).toISOString().split('T')[0]}T${slot.startTime}`);
        return bookedDateTime.getTime() === slotDateTime.getTime();
      });

      const isAvailable = daySlots.some(slot => {
        const availableDateTime = new Date(`${new Date(slot.date).toISOString().split('T')[0]}T${slot.startTime}`);
        return availableDateTime.getTime() === slotDateTime.getTime();
      });

      return {
        time,
        available: mode === 'availability' ? true : isAvailable,
        booked: isBooked
      };
    });
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowTimeSlots(true);
    onDateSelect && onDateSelect(date);
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    onTimeSelect && onTimeSelect(time, selectedDate, duration);
  };

  // Handle custom time input
  const handleCustomTimeSubmit = () => {
    if (!customTime) {
      toast.error('Please enter a valid time');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(customTime)) {
      toast.error('Please enter time in HH:MM format');
      return;
    }

    handleTimeSelect(customTime);
    setCustomTime('');
  };

  // Format time for display
  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {mode === 'select' ? 'Select Session Time' : 'Set Availability'}
        </h2>
        
        {/* Timezone Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <TimezoneSelect
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            className="w-full"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '38px',
                border: '1px solid #d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af'
                }
              })
            }}
          />
        </div>

        {/* Duration Selector */}
        {mode === 'select' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)}
          tileContent={getTileContent}
          tileDisabled={isTileDisabled}
          className="w-full"
          calendarType="gregory"
          showNeighboringMonth={false}
          minDate={new Date()}
        />
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Booked</span>
        </div>
      </div>

      {/* Time Slots */}
      {showTimeSlots && selectedDate && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {mode === 'select' ? 'Available Time Slots' : 'Time Slots'} - {selectedDate.toLocaleDateString()}
          </h3>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {getAvailableTimeSlots().map((slot) => (
              <button
                key={slot.time}
                onClick={() => handleTimeSelect(slot.time)}
                disabled={mode === 'select' && (!slot.available || slot.booked)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedTime === slot.time
                    ? 'bg-blue-600 text-white'
                    : mode === 'select' && (!slot.available || slot.booked)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {formatTimeDisplay(slot.time)}
                {slot.booked && <span className="block text-xs">Booked</span>}
              </button>
            ))}
          </div>

          {/* Custom Time Input */}
          {mode === 'availability' && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="Custom time (HH:MM)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCustomTimeSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Time
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Info */}
      {selectedDate && selectedTime && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Selected:</h4>
          <p className="text-blue-800">
            {selectedDate.toLocaleDateString()} at {formatTimeDisplay(selectedTime)} ({selectedTimezone})
          </p>
          {mode === 'select' && (
            <p className="text-blue-800">Duration: {duration} minutes</p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">
          {mode === 'select' ? 'How to book:' : 'How to set availability:'}
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Select a date from the calendar</li>
          <li>Choose an available time slot</li>
          {mode === 'select' && <li>Set your preferred session duration</li>}
          <li>Confirm your selection</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedCalendar;
