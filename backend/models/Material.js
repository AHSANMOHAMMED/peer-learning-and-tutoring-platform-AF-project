const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'ppt', 'txt', 'image', 'jpg', 'jpeg', 'png', 'application/pdf', 'image/jpeg', 'image/png'], required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { 
    type: String, 
    required: true,
    enum: [
      'Combined Mathematics', 
      'Biological Sciences', 
      'Commercial Stream', 
      'Physical Sciences', 
      'Arts Stream', 
      'Technology Stream', 
      'O/L General',
      'Mathematics',
      'Science',
      'ICT',
      'Accounting',
      'Other'
    ]
  },
  grade: { type: String, required: true },
  price: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  tags: [String],
  downloads: { type: Number, default: 0 },
  trustScore: { type: Number, default: 0 },
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
