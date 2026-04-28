const User = require('../models/User');
const UserGamification = require('../models/UserGamification');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const Tutor = require('../models/Tutor');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// =============================================================
//  REGISTER
// =============================================================
exports.registerUser = async (req, res) => {
  try {
    let { username, email, password, role, profile, district, stream, grade, language, subjects, university } = req.body;
    console.log('Registering user:', { username, email, role });
    
    if (!username) {
       username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    }
    
    username = username.toLowerCase().trim();
    email = email.toLowerCase().trim();

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const message = userExists.email === email ? 'Email already registered' : 'Username already taken';
      return res.status(400).json({ message });
    }

    // Handle school code if provided
    let schoolId = null;
    if (req.body.schoolCode) {
      const School = require('../models/School');
      const school = await School.findOne({ code: req.body.schoolCode.toUpperCase() });
      if (school) {
        schoolId = school._id;
      }
    }

    // Parse subjects if it's a comma-separated string
    let parsedSubjects = [];
    if (subjects && typeof subjects === 'string') {
      parsedSubjects = subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    const user = await User.create({ 
      username, email, password, role, profile, 
      district, stream, grade, school: schoolId,
      language: language || 'English', subjects: parsedSubjects, university,
      authProvider: 'local' 
    });

    // Initialize gamification profile for all new users (including demo)
    await UserGamification.create({
      user: user._id,
      points: { total: 0, earnedThisMonth: 0, earnedThisWeek: 0, lifetime: 0 },
      level: { current: 1, title: 'Beginner', progress: 0, pointsToNextLevel: 1000 },
      badges: [],
      streaks: { current: 0, longest: 0, lastActivity: null, streakType: 'daily' },
      stats: {
        totalSessions: 0,
        peerSessions: 0,
        groupSessions: 0,
        lectureSessions: 0,
        totalHours: 0,
        coursesCompleted: 0,
        coursesInProgress: 0,
        studentsHelped: 0,
        hoursTutored: 0,
        averageRating: 0,
        totalReviews: 0
      },
      preferences: {
        showBadgesOnProfile: true,
        streakNotifications: true,
        levelUpNotifications: true,
        shareAchievements: true
      }
    });

    // Send OTP for email verification
    const otp = generateOTP();
    
    // Account is already initially saved via User.create above
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Use findOneAndUpdate or updateOne to avoid re-triggering the full 'save' hook 
    // which might be expensive or crash-prone if hashing overlaps
    await User.updateOne({ _id: user._id }, { 
      otpCode: user.otpCode, 
      otpExpiry: user.otpExpiry 
    });

    // Log OTP to console for easy development testing
    console.log(`\n======================================================`);
    console.log(`🔑 DEVELOPMENT OTP CODE FOR ${email}: ${otp}`);
    console.log(`======================================================\n`);

    // Attempt to send email, catch and log if it fails due to Google Auth but don't block registration
    try {
       await emailService.sendOTPEmail(email, otp, 'verify');
    } catch (emailError) {
       console.error('\n⚠️ EMAIL DELIVERY FAILED:', emailError.message);
       console.error('If you are using Gmail, please ensure you use an APP PASSWORD (16 chars) instead of your regular password in the .env file.\n');
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      message: 'Account created. Please verify your email with the OTP sent.'
    });
  } catch (error) {
    console.error('CRITICAL Registration Error:', {
      message: error.message,
      stack: error.stack,
      body: req.body ? { ...req.body, password: '[REDACTED]' } : 'empty'
    });
    res.status(500).json({ 
      message: 'Registration failed internal server error.', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// =============================================================
//  LOGIN
// =============================================================
exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email. Please register first.' });
    }

    if (user.authProvider === 'google') {
      return res.status(401).json({ message: 'This account uses Google Sign-In. Please use the Google button to log in.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Try again or use OTP login.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact support.' });
    }

    // New: Strict Tutor Access Control (Flagging status instead of blocking login)
    let isPendingApproval = false;
    let verificationStatus = 'approved';

    if (user.role === 'tutor') {
      const tutorProfile = await Tutor.findOne({ userId: user._id });
      
      if (!tutorProfile || tutorProfile.verificationStatus !== 'approved') {
        isPendingApproval = true;
        verificationStatus = tutorProfile?.verificationStatus || 'not_created';
      }
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      authProvider: user.authProvider,
      profile: user.profile,
      gamification: user.gamification,
      token: generateToken(user._id),
      isPendingApproval,
      verificationStatus
    });
  } catch (error) {
    console.error('CRITICAL Login Error:', {
      message: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    
    // Return detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ 
        message: 'Internal Server Error during login', 
        error: error.message,
        stack: error.stack 
      });
    }
    
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

// =============================================================
//  GET PROFILE
// =============================================================
exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
       return res.status(401).json({ message: 'Not authorized, no user data found in request' });
    }
    
    const user = await User.findById(req.user._id);
    if (user) {
      const publicUser = user.toPublicJSON ? user.toPublicJSON() : user;
      
      // New: Include tutor verification status
      if (user.role === 'tutor') {
        const Tutor = require('../models/Tutor');
        const tutorProfile = await Tutor.findOne({ userId: user._id });
        publicUser.isPendingApproval = !tutorProfile || tutorProfile.verificationStatus !== 'approved';
        publicUser.verificationStatus = tutorProfile?.verificationStatus || 'not_created';
      }

      res.json(publicUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

// =============================================================
//  UPDATE PROFILE
// =============================================================
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (!user.profile) user.profile = {};
    if (req.body.profile) {
      Object.assign(user.profile, req.body.profile);
    }

    user.district = req.body.district || user.district;
    user.stream = req.body.stream || user.stream;
    user.grade = req.body.grade || user.grade;

    if (req.body.password && user.authProvider === 'local') {
      user.password = req.body.password;
    }

    const updated = await user.save();
    
    const userData = updated.toPublicJSON ? updated.toPublicJSON() : {
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      role: updated.role
    };

    res.json({ 
      success: true,
      data: userData, 
      token: generateToken(updated._id) 
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// =============================================================
//  SEND OTP
// =============================================================
exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    // Rate limiting: max 3 OTPs per 15 minutes
    if (user.otpAttempts >= 3 && user.otpExpiry && user.otpExpiry > new Date()) {
      const minutesLeft = Math.ceil((user.otpExpiry - Date.now()) / 60000);
      return res.status(429).json({ message: `Too many requests. Try again in ${minutesLeft} minute(s).` });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await user.save();

    await emailService.sendOTPEmail(email, otp, purpose);

    res.json({ 
      success: true, 
      message: `OTP sent to ${email}. Valid for 10 minutes.`
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// =============================================================
//  VERIFY OTP
// =============================================================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'login' } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP requested. Please request a new OTP.' });
    }

    if (user.otpExpiry < new Date()) {
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP is valid - clear it
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;

    if (purpose === 'verify') {
      user.isVerified = true;
    }

    // New: Strict Tutor Access Control (Flagging status instead of blocking login)
    let isPendingApproval = false;
    let verificationStatus = 'approved';

    if (user.role === 'tutor') {
      const Tutor = require('../models/Tutor');
      const tutorProfile = await Tutor.findOne({ userId: user._id });
      
      if (!tutorProfile || tutorProfile.verificationStatus !== 'approved') {
        isPendingApproval = true;
        verificationStatus = tutorProfile?.verificationStatus || 'not_created';
      }
    }

    user.lastLogin = new Date();
    await user.save();

    // NEW: Auto-join academic groups for students
    if (user.role === 'student' && (purpose === 'verify' || purpose === 'login')) {
      try {
        const { autoJoinGroupsForStudent } = require('../services/groupAutoJoinService');
        autoJoinGroupsForStudent(user).catch(err => console.error('AutoJoin Error:', err));
      } catch (err) {
        console.error('Failed to initiate AutoJoin service:', err);
      }
    }

    res.json({
      success: true,
      message: purpose === 'verify' ? 'Email verified successfully!' : 'OTP verified. Login successful.',
      token: generateToken(user._id),
      user: user.toPublicJSON ? user.toPublicJSON() : { _id: user._id, email: user.email, role: user.role },
      isPendingApproval,
      verificationStatus
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// =============================================================
//  FORGOT PASSWORD
// =============================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    // Always respond success to prevent user enumeration
    if (!user || user.authProvider === 'google') {
      return res.json({ message: 'If an account exists, a reset link was sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(email, resetURL);

    res.json({ message: 'If an account exists, a reset link was sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
};

// =============================================================
//  RESET PASSWORD
// =============================================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

// =============================================================
//  CHANGE PASSWORD (authenticated)
// =============================================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'Google OAuth users cannot change password here.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Password change failed', error: error.message });
  }
};
