const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String, // Format: HH:mm (e.g. 14:30)
    required: true
  },
  endTime: {
    type: String, 
    required: true
  },
  type: {
    type: String,
    enum: ['class', 'tutoring', 'study', 'free'],
    default: 'class'
  },
  description: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  color: {
    type: String, // UI color tag
    default: '#3b82f6'
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
