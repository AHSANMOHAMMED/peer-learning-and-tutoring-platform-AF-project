const rateLimit = require('express-rate-limit');

/**
 * General rate limiter - 15 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for auth endpoints - 5 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  },
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Password reset limiter - 3 attempts per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Sign up limiter - 3 accounts per IP per day
 */
const signupLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: 'Too many accounts created from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * API endpoint limiter - 60 requests per 10 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Middleware to validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Middleware to sanitize user input
 */
const sanitizeInput = (obj) => {
  if (typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remove special HTML characters
      sanitized[key] = value
        .replace(/[<>]/g, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
};

/**
 * Validation middleware for password strength
 */
const validatePasswordStrength = (password) => {
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };

  return validations;
};

/**
 * Get password strength score
 */
const getPasswordStrength = (password) => {
  const validations = validatePasswordStrength(password);
  const score = Object.values(validations).filter(Boolean).length;
  
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  signupLimiter,
  apiLimiter,
  validateEmail,
  sanitizeInput,
  corsOptions,
  validatePasswordStrength,
  getPasswordStrength
};
