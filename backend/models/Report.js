const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be User, Material, or Booking
  targetType: { type: String, enum: ['User', 'Material', 'Booking'], required: true },
  reason: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatorAction: { 
    type: String, 
    enum: ['none', 'deleted', 'banned', 'warned', 'suspended'] 
  },
  suspicionScore: { type: Number, default: 0 } // Mock AI suspiscion score
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
