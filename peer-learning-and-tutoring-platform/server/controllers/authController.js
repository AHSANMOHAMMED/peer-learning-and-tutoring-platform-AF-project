const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuthService = require('../services/authService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, role, profile } = req.body;

    // Use AuthService to register user
    const result = await AuthService.registerUser({ username, email, password, role, profile });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Registration error:', error);
    const statusCode = error.message.includes('already exists') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use AuthService to authenticate user
    const result = await AuthService.loginUser(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.message.includes('Invalid credentials') || error.message.includes('deactivated') ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed',
      error: error.message
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // In a stateless JWT implementation, we don't need to do anything server-side
    // The client should remove the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Use AuthService to change password
    await AuthService.changePassword(req.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    const statusCode = error.message.includes('incorrect') ? 400 : error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to change password',
      error: error.message
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use AuthService to generate reset token
    const resetToken = await AuthService.generateResetToken(user);

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email',
      error: error.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Use AuthService to reset password
    await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    const statusCode = error.message.includes('Invalid') || error.message.includes('expired') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to reset password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
};
