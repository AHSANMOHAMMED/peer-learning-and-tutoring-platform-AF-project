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
  isReviewed: { type: Boolean, default: false },
  
  // Session management fields (used by sessionController)
  session: {
    roomId: { type: String },
    joinUrl: { type: String },
    startedAt: { type: Date },
    endedAt: { type: Date },
    roomConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    participants: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date },
      leftAt: { type: Date },
      connectionQuality: { type: String }
    }],
    recording: {
      isRecording: { type: Boolean, default: false },
      recordingId: { type: String },
      recordingStartedAt: { type: Date },
      recordingUrl: { type: String },
      recordingDuration: { type: Number },
      recordingSize: { type: Number }
    },
    analytics: { type: mongoose.Schema.Types.Mixed, default: {} },
    technicalIssues: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      issueType: { type: String },
      reportedAt: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true });

// Check if session can be started (tutor can start within 15 min window)
bookingSchema.methods.canStartSession = function() {
  if (this.status !== 'confirmed') return false;
  const now = new Date();
  const sessionDate = new Date(this.date);
  const [hours, mins] = this.startTime.split(':').map(Number);
  sessionDate.setHours(hours, mins, 0, 0);
  const diffMs = now - sessionDate;
  const diffMins = diffMs / (1000 * 60);
  return diffMins >= -15 && diffMins <= 30; // Can start 15 min early to 30 min late
};

// Start video session
bookingSchema.methods.startVideoSession = function(roomId, joinUrl, config) {
  if (this.session && this.session.roomId) return false; // Already started
  this.session = this.session || {};
  this.session.roomId = roomId;
  this.session.joinUrl = joinUrl;
  this.session.startedAt = new Date();
  this.session.roomConfig = config || {};
  this.session.participants = [];
  this.status = 'in_progress';
  return true;
};

// Join video session
bookingSchema.methods.joinVideoSession = async function(userId) {
  if (!this.session) this.session = {};
  if (!this.session.participants) this.session.participants = [];
  const existing = this.session.participants.find(
    p => p.userId && p.userId.toString() === userId.toString()
  );
  if (!existing) {
    this.session.participants.push({ userId, joinedAt: new Date() });
    await this.save();
  }
};

// Check if user can join session
bookingSchema.methods.canJoinSession = function(userId) {
  if (this.status !== 'in_progress') return false;
  const isStudent = this.studentId.toString() === userId.toString();
  const isTutor = this.tutorId?.userId ? 
    this.tutorId.userId.toString() === userId.toString() : 
    this.tutorId.toString() === userId.toString();
  return isStudent || isTutor;
};

// Leave video session
bookingSchema.methods.leaveVideoSession = async function(userId, connectionQuality) {
  if (!this.session?.participants) return;
  const participant = this.session.participants.find(
    p => p.userId && p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.leftAt = new Date();
    participant.connectionQuality = connectionQuality || 'unknown';
    await this.save();
  }
};

// Complete booking
bookingSchema.methods.complete = function() {
  if (this.status !== 'in_progress') return false;
  this.status = 'completed';
  this.session = this.session || {};
  this.session.endedAt = new Date();
  return true;
};

// Get session duration in minutes
bookingSchema.methods.getSessionDuration = function() {
  if (!this.session?.startedAt) return 0;
  const end = this.session.endedAt || new Date();
  return Math.round((end - this.session.startedAt) / (1000 * 60));
};

// Update session analytics
bookingSchema.methods.updateSessionAnalytics = async function(analytics) {
  this.session = this.session || {};
  this.session.analytics = { ...this.session.analytics, ...analytics };
  await this.save();
};

// Start recording
bookingSchema.methods.startRecording = async function(recordingId) {
  this.session = this.session || {};
  this.session.recording = this.session.recording || {};
  this.session.recording.isRecording = true;
  this.session.recording.recordingId = recordingId;
  this.session.recording.recordingStartedAt = new Date();
  await this.save();
};

// Stop recording
bookingSchema.methods.stopRecording = async function(url, duration, size) {
  this.session = this.session || {};
  this.session.recording = this.session.recording || {};
  this.session.recording.isRecording = false;
  this.session.recording.recordingUrl = url;
  this.session.recording.recordingDuration = duration;
  this.session.recording.recordingSize = size;
  await this.save();
};

// Add technical issue
bookingSchema.methods.addTechnicalIssue = async function(userId, issueType) {
  this.session = this.session || {};
  if (!this.session.technicalIssues) this.session.technicalIssues = [];
  this.session.technicalIssues.push({ userId, issueType, reportedAt: new Date() });
  await this.save();
};

// Static method to get session history
bookingSchema.statics.getHistory = async function(userId, userType, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const query = userType === 'tutor' ? { tutorId: userId } : { studentId: userId };
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    this.find(query)
      .populate('studentId', 'profile.firstName profile.lastName username profile.avatar')
      .populate('tutorId', 'userId subjects bio')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);
  
  return {
    bookings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

module.exports = mongoose.model('Booking', bookingSchema);

