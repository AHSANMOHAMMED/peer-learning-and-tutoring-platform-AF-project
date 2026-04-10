const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // Format: 'HH:mm'
  endTime: { type: String, required: true }, // Format: 'HH:mm'
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'in_progress'], 
    default: 'pending' 
  },
  subject: { type: String, required: true },
  meetingUrl: { type: String },
  price: { type: Number, required: true }, // In LKR
  currency: { type: String, default: 'LKR' },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  whiteboardData: { type: String }, // Store fabric.js JSON or a reference
  isReviewed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
