const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gradeLevels: [{
    type: Number,
    min: 6,
    max: 13
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  }
}, { _id: true });

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  specificDate: {
    type: Date
  }
}, { _id: true });

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Note: index removed as explicit index below covers userId queries
  },
  subjects: [subjectSchema],
  availability: [availabilitySchema],
  qualifications: {
    education: {
      type: String,
      trim: true
    },
    certifications: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      maxlength: 1000
    },
    documents: [{
      type: String // URLs to uploaded documents
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    breakdown: {
      teaching: { type: Number, default: 0 },
      knowledge: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      punctuality: { type: Number, default: 0 }
    }
  },
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number, // in minutes
      default: 0
    }
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  teachingStyle: {
    type: String,
    maxlength: 1000
  },
  languages: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String // URLs to verification documents
  }],
  featured: {
    type: Boolean,
    default: false
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tutorSchema.index({ userId: 1 });
tutorSchema.index({ featured: 1, 'rating.average': -1 });
tutorSchema.index({ 'subjects.name': 1 });
tutorSchema.index({ 'subjects.gradeLevels': 1 });
tutorSchema.index({ isVerified: 1 });
tutorSchema.index({ createdAt: -1 });

// Virtual for getting user details
tutorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for calculating overall average rating
tutorSchema.virtual('calculatedRating').get(function() {
  if (this.rating.count === 0) return 0;
  return this.rating.average.toFixed(1);
});

// Method to update rating
tutorSchema.methods.updateRating = function(newRating) {
  const oldCount = this.rating.count;
  const newCount = oldCount + 1;
  
  // Update average
  this.rating.average = ((this.rating.average * oldCount) + newRating.overall) / newCount;
  
  // Update breakdown
  this.rating.breakdown.teaching = ((this.rating.breakdown.teaching * oldCount) + newRating.teaching) / newCount;
  this.rating.breakdown.knowledge = ((this.rating.breakdown.knowledge * oldCount) + newRating.knowledge) / newCount;
  this.rating.breakdown.communication = ((this.rating.breakdown.communication * oldCount) + newRating.communication) / newCount;
  this.rating.breakdown.punctuality = ((this.rating.breakdown.punctuality * oldCount) + newRating.punctuality) / newCount;
  
  this.rating.count = newCount;
};

// Method to add availability
tutorSchema.methods.addAvailability = function(availabilityData) {
  this.availability.push(availabilityData);
};

// Method to remove availability
tutorSchema.methods.removeAvailability = function(availabilityId) {
  this.availability = this.availability.filter(a => a._id.toString() !== availabilityId);
};

// Method to add subject
tutorSchema.methods.addSubject = function(subjectData) {
  this.subjects.push(subjectData);
};

// Method to remove subject
tutorSchema.methods.removeSubject = function(subjectId) {
  this.subjects = this.subjects.filter(s => s._id.toString() !== subjectId);
};

// Method to update stats
tutorSchema.methods.updateStats = function(sessionData) {
  this.stats.totalSessions += 1;
  this.stats.totalHours += sessionData.duration / 60;
  
  // Update unique students count
  if (sessionData.studentId && !this.stats.studentIds?.includes(sessionData.studentId)) {
    this.stats.totalStudents += 1;
    if (!this.stats.studentIds) this.stats.studentIds = [];
    this.stats.studentIds.push(sessionData.studentId);
  }
};

// Static method to search tutors
tutorSchema.statics.search = async function(searchParams) {
  const {
    subject,
    grade,
    minRating,
    maxRate,
    language,
    isVerified,
    availability,
    search,
    page = 1,
    limit = 10
  } = searchParams;

  let query = {};

  // Build search query
  if (subject) {
    query['subjects.name'] = { $regex: subject, $options: 'i' };
  }

  if (grade) {
    query['subjects.gradeLevels'] = { $in: [parseInt(grade)] };
  }

  if (minRating) {
    query['rating.average'] = { $gte: parseFloat(minRating) };
  }

  if (maxRate) {
    query['subjects.hourlyRate'] = { $lte: parseFloat(maxRate) };
  }

  if (language) {
    query.languages = { $in: [language] };
  }

  if (isVerified !== undefined) {
    query.isVerified = isVerified === 'true' || isVerified === true;
  }

  if (search) {
    query.$or = [
      { bio: { $regex: search, $options: 'i' } },
      { teachingStyle: { $regex: search, $options: 'i' } },
      { 'subjects.name': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [tutors, total] = await Promise.all([
    this.find(query)
      .populate('user', 'profile.firstName profile.lastName profile.avatar username')
      .sort({ featured: -1, 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);

  return {
    tutors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get featured tutors
tutorSchema.statics.getFeatured = async function(limit = 10) {
  return this.find({ featured: true, isVerified: true })
    .populate('user', 'profile.firstName profile.lastName profile.avatar username')
    .sort({ 'rating.average': -1 })
    .limit(parseInt(limit))
    .exec();
};

// Static method to get top rated tutors
tutorSchema.statics.getTopRated = async function(limit = 10) {
  return this.find({ isVerified: true, 'rating.count': { $gt: 0 } })
    .populate('user', 'profile.firstName profile.lastName profile.avatar username')
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(parseInt(limit))
    .exec();
};

module.exports = mongoose.model('Tutor', tutorSchema);
