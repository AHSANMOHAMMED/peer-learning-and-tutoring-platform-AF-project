const mongoose = require('mongoose');

const groupRoomSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['host', 'moderator', 'participant'], default: 'participant' },
    isMuted: { type: Boolean, default: false },
    isHandRaised: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now }
  }],
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  maxCapacity: { type: Number, required: true, default: 10, min: 3, max: 50 },
  currentCapacity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: false },
  pendingParticipants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date, default: Date.now },
    message: String
  }],
  tags: [String],
  roomId: { type: String, unique: true },
  type: { 
    type: String, 
    enum: ['study_group', 'homework_help', 'exam_prep', 'project_collaboration', 'general_discussion'], 
    default: 'study_group' 
  },
  schedule: {
    isRecurring: { type: Boolean, default: false },
    startTime: Date,
    endTime: Date,
    recurringDays: [String], // ['monday', 'tuesday', etc]
    timezone: { type: String, default: 'UTC' }
  },
  resources: [{
    name: String,
    url: String,
    type: { type: String, enum: ['link', 'file', 'video', 'document'] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  whiteboard: {
    data: mongoose.Schema.Types.Mixed,
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  chat: [{
    message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
    reactions: [{
      emoji: String,
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  }],
  settings: {
    allowScreenShare: { type: Boolean, default: true },
    allowFileShare: { type: Boolean, default: true },
    allowVoiceChat: { type: Boolean, default: true },
    allowVideoChat: { type: Boolean, default: true },
    recordSession: { type: Boolean, default: false },
    enableWhiteboard: { type: Boolean, default: true }
  },
  stats: {
    totalMessages: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Indexes for performance
// groupRoomSchema.index({ isActive: 1, isPublic: 1 });
// groupRoomSchema.index({ subject: 1, grade: 1 });
// groupRoomSchema.index({ host: 1, isActive: 1 });
// groupRoomSchema.index({ 'participants.user': 1 });
// groupRoomSchema.index({ tags: 1 });

// Virtual for checking if room is full
groupRoomSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.maxCapacity;
});

// Virtual for available spots
groupRoomSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxCapacity - this.participants.length);
});

// Method to check if user is participant
groupRoomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to check if user is host
groupRoomSchema.methods.isHost = function(userId) {
  return this.host.toString() === userId.toString();
};

// Method to check if user is moderator or host
groupRoomSchema.methods.isModerator = function(userId) {
  return this.isHost(userId) || this.participants.some(p => 
    p.user.toString() === userId.toString() && p.role === 'moderator'
  );
};

// Method to add participant
groupRoomSchema.methods.addParticipant = function(userId, role = 'participant') {
  if (!this.isParticipant(userId) && this.participants.length < this.maxCapacity) {
    this.participants.push({ user: userId, role });
    this.currentCapacity = this.participants.length;
    this.stats.totalParticipants = Math.max(this.stats.totalParticipants, this.currentCapacity);
    return true;
  }
  return false;
};

// Method to remove participant
groupRoomSchema.methods.removeParticipant = function(userId) {
  const index = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (index > -1) {
    this.participants.splice(index, 1);
    this.currentCapacity = this.participants.length;
    return true;
  }
  return false;
};

// Method to add message to chat
groupRoomSchema.methods.addMessage = function(message, senderId, type = 'text') {
  this.chat.push({ message, sender: senderId, type });
  this.stats.totalMessages += 1;
  this.stats.lastActivity = new Date();
  return this.chat[this.chat.length - 1];
};

// Pre-save middleware to generate room ID if not exists
groupRoomSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Pre-save middleware to update current capacity
groupRoomSchema.pre('save', function(next) {
  this.currentCapacity = this.participants.length;
  next();
});

module.exports = mongoose.model('GroupRoom', groupRoomSchema);
