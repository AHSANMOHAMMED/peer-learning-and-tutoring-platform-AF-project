/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Create Redis client for rate limiting
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 1 // Use separate DB for rate limiting
});

// General API rate limiter
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please slow down.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 login attempts per hour
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for matching algorithm (resource intensive)
const matchingLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:matching:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 matching requests per minute
  message: {
    success: false,
    message: 'Matching requests limited. Please try again in a minute.'
  }
});

// Rate limiter for AI endpoints (OpenAI API costs)
const aiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute
  message: {
    success: false,
    message: 'AI service rate limit exceeded. Please try again later.'
  }
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached. Maximum 10 files per hour.'
  }
});

// Rate limiter for WebSocket connections
const wsConnectionLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ws:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 connection attempts per minute
  message: {
    success: false,
    message: 'Too many connection attempts.'
  }
});

// Custom rate limiter factory
const createCustomLimiter = (options) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: `rl:${options.prefix}:`
    }),
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: {
      success: false,
      message: options.message || 'Rate limit exceeded.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// IP whitelist middleware (for admin/internal endpoints)
const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied: IP not whitelisted'
      });
    }
  };
};

// Export all limiters
module.exports = {
  generalLimiter,
  authLimiter,
  matchingLimiter,
  aiLimiter,
  uploadLimiter,
  wsConnectionLimiter,
  createCustomLimiter,
  ipWhitelist,
  redisClient
};
