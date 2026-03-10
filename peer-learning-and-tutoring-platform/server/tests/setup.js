// Test setup file
const mongoose = require('mongoose');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/peerlearn_test';

// Global test timeout
jest.setTimeout(10000);

// Connect to test database before all tests
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error);
  }
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: console.error // Keep error logging
// };

// Mock external services
global.mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn()
  },
  customers: {
    create: jest.fn()
  }
};

global.mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

// Helper functions for tests
global.createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'student'
  };
  
  return await User.create({ ...defaultUser, ...userData });
};

global.generateAuthToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Custom matchers
expect.extend({
  toBeValidObjectId(received) {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    const pass = objectIdPattern.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false
      };
    }
  },
  
  toBeISODateString(received) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO date string`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO date string`,
        pass: false
      };
    }
  }
});

// Export for use in test files
module.exports = {
  createTestUser: global.createTestUser,
  generateAuthToken: global.generateAuthToken
};
