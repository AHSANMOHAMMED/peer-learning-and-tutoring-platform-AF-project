const mongoose = require('mongoose');

const peerSessionSchema = new mongoose.Schema({
  participants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['initiator', 'helper'], required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedPeer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['pending', 'matched', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, default: 30 }, // minutes
  cost: { type: Number, default: 0 }, // free for peer sessions
  roomId: { type: String, unique: true },
  tags: [String],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  maxParticipants: { type: Number, default: 2 },
  isPublic: { type: Boolean, default: true },
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  feedback: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    helpful: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  reputationChange: {
    initiator: { type: Number, default: 0 },
    helper: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
peerSessionSchema.index({ status: 1, scheduledAt: 1 });
peerSessionSchema.index({ subject: 1, grade: 1 });
peerSessionSchema.index({ initiator: 1, status: 1 });
peerSessionSchema.index({ 'participants.user': 1 });

// Virtual for checking if session is full
peerSessionSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.maxParticipants;
});

// Method to check if user is participant
peerSessionSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to add participant
peerSessionSchema.methods.addParticipant = function(userId, role = 'helper') {
  if (!this.isParticipant(userId) && this.participants.length < this.maxParticipants) {
    this.participants.push({ user: userId, role });
    return true;
  }
  return false;
};

// Method to remove participant
peerSessionSchema.methods.removeParticipant = function(userId) {
  const index = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (index > -1) {
    this.participants.splice(index, 1);
    return true;
  }
  return false;
};

// Pre-save middleware to generate room ID if not exists
peerSessionSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `peer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('PeerSession', peerSessionSchema);
