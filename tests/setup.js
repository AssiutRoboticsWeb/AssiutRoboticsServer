/**
 * Test setup file
 * This file runs after the test environment is set up
 */

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestMember: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    committee: 'Software',
    gender: 'male',
    phoneNumber: '01234567890',
    ...overrides
  }),

  // Generate test JWT token
  generateTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { email: 'test@example.com', ...payload },
      process.env.SECRET,
      { expiresIn: '1h' }
    );
  },

  // Mock request object
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    url: '/test',
    originalUrl: '/test',
    ip: '127.0.0.1',
    user: null,
    decoded: null,
    ...overrides
  }),

  // Mock response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn().mockReturnValue(null);
    return res;
  },

  // Mock next function
  mockNext: jest.fn(),

  // Clean up function
  cleanup: () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  }
};

// Global test matchers
expect.extend({
  toBeValidObjectId(received) {
    const pass = typeof received === 'string' && /^[0-9a-fA-F]{24}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  }
});

// Global test teardown
afterEach(() => {
  testUtils.cleanup();
});

// Global test timeout
jest.setTimeout(10000);
