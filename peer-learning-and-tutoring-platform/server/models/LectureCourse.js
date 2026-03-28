const mongoose = require('mongoose');

const lectureSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, default: 60 }, // minutes
  recordingUrl: { type: String, default: null },
  isRecorded: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  order: { type: Number, required: true }, // Session number in course
  materials: [{
    name: String,
    url: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'document', 'code'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  attendance: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: Date,
    leftAt: Date,
    duration: Number // minutes attended
  }],
  polls: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, default: null }, // index of correct option
    isActive: { type: Boolean, default: false },
    responses: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      answer: Number, // selected option index
      answeredAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    endedAt: Date
  }],
  qaQueue: [{
    question: { type: String, required: true },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    askedAt: { type: Date, default: Date.now },
    answered: { type: Boolean, default: false },
    answeredAt: Date,
    answer: String,
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  breakoutRooms: [{
    name: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    endedAt: Date
  }],
  chat: [{
    message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['text', 'file', 'system'], default: 'text' }
  }],
  whiteboard: {
    data: mongoose.Schema.Types.Mixed,
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  stats: {
    totalParticipants: { type: Number, default: 0 },
    peakConcurrent: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    pollParticipation: { type: Number, default: 0 },
    averageEngagement: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const lectureCourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  
  // Course structure
  sessions: [lectureSessionSchema],
  totalSessions: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // total hours
  
  // Enrollment settings
  capacity: { type: Number, required: true, default: 30 },
  enrolledStudents: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
    progress: { type: Number, default: 0 }, // percentage
    lastSessionAttended: { type: mongoose.Schema.Types.ObjectId, ref: 'LectureCourse' }
  }],
  
  // Pricing
  price: { type: Number, default: 0 }, // 0 = free
  currency: { type: String, default: 'LKR' },
  isFree: { type: Boolean, default: true },
  
  // Course metadata
  prerequisites: [String],
  learningOutcomes: [String],
  tags: [String],
  language: { type: String, default: 'English' },
  
  // Schedule
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  schedule: {
    daysOfWeek: [String], // ['monday', 'wednesday', 'friday']
    timeOfDay: String, // '18:00'
    timezone: { type: String, default: 'Asia/Colombo' }
  },
  
  // Settings
  isPublic: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: false },
  autoRecord: { type: Boolean, default: true },
  enableBreakoutRooms: { type: Boolean, default: true },
  enableWhiteboard: { type: Boolean, default: true },
  enableQaQueue: { type: Boolean, default: true },
  enablePolls: { type: Boolean, default: true },
  
  // Analytics
  stats: {
    totalEnrollments: { type: Number, default: 0 },
    completedEnrollments: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageAttendance: { type: Number, default: 0 }
  },
  
  // Reviews
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Resources
  resources: [{
    title: String,
    description: String,
    url: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'code', 'document', 'external'] },
    sessionNumber: Number, // which session this belongs to (0 = general)
    isPublic: { type: Boolean, default: false }, // only enrolled students can see
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Forum/Discussion
  forumEnabled: { type: Boolean, default: true },
  forum: [{
    topic: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    replies: [{
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  }]
}, {
  timestamps: true
});

// Indexes for performance
// lectureCourseSchema.index({ isActive: 1, isPublic: 1 });
// lectureCourseSchema.index({ subject: 1, grade: 1 });
// lectureCourseSchema.index({ instructor: 1 });
// lectureCourseSchema.index({ startDate: 1 });
// lectureCourseSchema.index({ tags: 1 });

// Virtual for checking if course is full
lectureCourseSchema.virtual('isFull').get(function() {
  return this.enrolledStudents.filter(s => s.status === 'active').length >= this.capacity;
});

// Virtual for available spots
lectureCourseSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.enrolledStudents.filter(s => s.status === 'active').length);
});

// Virtual for enrollment count
lectureCourseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.filter(s => s.status === 'active').length;
});

// Method to check if user is enrolled
lectureCourseSchema.methods.isEnrolled = function(userId) {
  return this.enrolledStudents.some(
    e => e.user.toString() === userId.toString() && e.status === 'active'
  );
};

// Method to check if user is instructor
lectureCourseSchema.methods.isInstructor = function(userId) {
  return this.instructor.toString() === userId.toString();
};

// Method to enroll student
lectureCourseSchema.methods.enrollStudent = function(userId) {
  if (!this.isEnrolled(userId) && !this.isFull) {
    this.enrolledStudents.push({ user: userId });
    this.stats.totalEnrollments += 1;
    return true;
  }
  return false;
};

// Method to unenroll student
lectureCourseSchema.methods.unenrollStudent = function(userId) {
  const enrollment = this.enrolledStudents.find(
    e => e.user.toString() === userId.toString() && e.status === 'active'
  );
  
  if (enrollment) {
    enrollment.status = 'dropped';
    return true;
  }
  return false;
};

// Method to update student progress
lectureCourseSchema.methods.updateProgress = function(userId, sessionId) {
  const enrollment = this.enrolledStudents.find(
    e => e.user.toString() === userId.toString()
  );
  
  if (enrollment) {
    enrollment.lastSessionAttended = sessionId;
    enrollment.progress = Math.min(
      ((this.sessions.findIndex(s => s._id.toString() === sessionId.toString()) + 1) / this.totalSessions) * 100,
      100
    );
    return true;
  }
  return false;
};

// Pre-save middleware
lectureCourseSchema.pre('save', function(next) {
  // Update total sessions count
  this.totalSessions = this.sessions.length;
  
  // Calculate total duration
  this.duration = this.sessions.reduce((total, session) => total + session.duration, 0) / 60; // in hours
  
  // Update isFree based on price
  this.isFree = this.price === 0;
  
  next();
});

module.exports = mongoose.model('LectureCourse', lectureCourseSchema);
