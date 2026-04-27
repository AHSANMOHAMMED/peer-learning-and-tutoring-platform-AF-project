const mongoose = require('mongoose');

const breakTimeGameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  icon: {
    type: String,
    required: true,
    maxlength: 40
  },
  description: {
    type: String,
    required: true,
    maxlength: 240
  },
  timerSeconds: {
    type: Number,
    required: true,
    min: 5,
    max: 900
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

breakTimeGameSchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model('BreakTimeGame', breakTimeGameSchema);
