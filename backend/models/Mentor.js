const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: [{ type: String, required: true }],
  bio: { type: String, required: true },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experienceYears: { type: Number, default: 0 },
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
  isAvailable: { type: Boolean, default: true },
  mentorshipAreas: [{
    type: String,
    enum: ['academic', 'career', 'personal', 'technical']
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);
