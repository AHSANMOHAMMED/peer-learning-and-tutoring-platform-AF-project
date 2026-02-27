const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

/**
 * AuthService - Handles all authentication and user-related business logic
 * This separates authentication logic from the data model and controllers
 */
class AuthService {
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate a JWT token for a user
   * @param {ObjectId} userId - User's ID
   * @param {string} role - User's role (optional, for additional claims)
   * @returns {string} JWT token
   */
  static generateToken(userId, role = null) {
    const payload = { userId };
    if (role) {
      payload.role = role;
    }

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
  }

  /**
   * Verify a JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate a password reset token
   * @param {Object} user - User object
   * @returns {Promise<string>} Reset token
   */
  static async generateResetToken(user) {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before storing in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token and expiry on user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Return unhashed token to send to user
    return resetToken;
  }

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} User object if token is valid
   */
  static async verifyResetToken(token) {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    
    return user;
  }

  /**
   * Generate email verification token
   * @param {Object} user - User object
   * @returns {Promise<string>} Verification token
   */
  static async generateVerificationToken(user) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    user.emailVerificationToken = hashedToken;
    await user.save();
    
    return verificationToken;
  }

  /**
   * Verify email verification token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} User object if token is valid
   */
  static async verifyEmailToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken
    });
    
    if (!user) {
      throw new Error('Invalid verification token');
    }
    
    return user;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and token
   */
  static async registerUser(userData) {
    const { username, email, password, role, profile } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Create new user (password hashing is handled by pre-save hook)
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      profile
    });
    
    await user.save();
    
    // Generate token
    const token = this.generateToken(user._id, user.role);
    
    return {
      user: user.toPublicJSON(),
      token
    };
  }

  /**
   * Authenticate user login
   * @param {string} identifier - Email or username
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} User and token if authentication successful
   */
  static async loginUser(identifier, password) {
    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = this.generateToken(user._id, user.role);
    
    return {
      user: user.toPublicJSON(),
      token
    };
  }

  /**
   * Reset user password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} User object
   */
  static async resetPassword(token, newPassword) {
    // Verify token and get user
    const user = await this.verifyResetToken(token);
    
    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    return user;
  }

  /**
   * Change user password (when user is logged in)
   * @param {ObjectId} userId - User's ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} User object
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await this.comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    return user;
  }

  /**
   * Verify user email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} User object
   */
  static async verifyUserEmail(token) {
    const user = await this.verifyEmailToken(token);
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    
    await user.save();
    
    return user;
  }

  /**
   * Refresh JWT token
   * @param {string} oldToken - Current token
   * @returns {string} New JWT token
   */
  static refreshToken(oldToken) {
    const decoded = this.verifyToken(oldToken);
    return this.generateToken(decoded.userId, decoded.role);
  }
}

module.exports = AuthService;
