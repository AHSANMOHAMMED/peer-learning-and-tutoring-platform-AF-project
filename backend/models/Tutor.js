const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjects: [{ type: String, required: true }],
  bio: { type: String, required: true },
  education: [{
    institution: String,
    university: { type: String }, // e.g., 'University of Moratuwa'
    degree: String,
    year: Number
  }],
  alStream: { 
    type: String, 
    enum: [
      'Combined Mathematics', 
      'Biological Sciences', 
      'Commercial Stream', 
      'Physical Sciences', 
      'Arts Stream', 
      'Technology Stream', 
      'O/L General',
      'London A/L', 
      'Other'
    ],
    required: true
  },
  experience: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  hourlyRate: { type: Number, required: true },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Tutor', tutorSchema);
