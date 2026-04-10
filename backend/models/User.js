const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'tutor', 'admin', 'superadmin', 'moderator'], 
    default: 'student' 
  },
  district: { 
    type: String, 
    enum: [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
      'Moneragala', 'Ratnapura', 'Kegalle'
    ]
  },
  stream: { 
    type: String, 
    enum: ['Combined Maths', 'Biology', 'Commerce', 'Arts', 'Tech', 'O/L', 'Other'] 
  },
  grade: { type: String }, // e.g., 'Grade 11', 'A/L 2025'
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    phoneNumber: String,
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String
    }
  },
  gamification: {
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    badges: [{ type: String }],
    level: { type: Number, default: 1 }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
