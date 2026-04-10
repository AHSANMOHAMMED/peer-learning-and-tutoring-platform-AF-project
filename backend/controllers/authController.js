const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  let { username, email, password, role, profile, district, stream, grade } = req.body;
  username = username.toLowerCase().trim();
  email = email.toLowerCase().trim();

  try {
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      const message = userExists.email === email ? 'Email already registered' : 'Username already taken';
      return res.status(400).json({ message });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      profile,
      district,
      stream,
      grade
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });
    console.log(`Login attempt: ${email} - User found: ${!!user}`);

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.warn(`Login failed for: ${email} - Reason: ${user ? 'Invalid Password' : 'User Not Found'}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      gamification: user.gamification
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      
      // Ensure profile object exists
      if (!user.profile) {
        user.profile = {};
      }

      // Update profile nested object
      if (req.body.profile) {
        user.profile.firstName = req.body.profile.firstName || user.profile.firstName;
        user.profile.lastName = req.body.profile.lastName || user.profile.lastName;
        user.profile.bio = req.body.profile.bio || user.profile.bio;
        user.profile.avatar = req.body.profile.avatar || user.profile.avatar;
      }

      // Update localized fields
      user.district = req.body.district || user.district;
      user.stream = req.body.stream || user.stream;
      user.grade = req.body.grade || user.grade;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
        district: updatedUser.district,
        stream: updatedUser.stream,
        grade: updatedUser.grade,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile. Please ensure all data is valid.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};
