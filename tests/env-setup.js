/**
 * Test environment setup
 * This file runs before all tests to set up the testing environment
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.MONGOURL = 'mongodb://localhost:27017/assiut_robotics_test';
process.env.SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '3001';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.BASE_URL = 'http://localhost:3001';
process.env.REGISTRATION_DEADLINE = '2025-12-31';

// Suppress console logs during tests (unless there's an error)
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleLog(...args);
  }
};

console.info = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleInfo(...args);
  }
};

console.warn = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleWarn(...args);
  }
};

// Keep error logging for debugging
console.error = (...args) => {
  originalConsoleLog('❌ ERROR:', ...args);
};

// Global test timeout
jest.setTimeout(10000);
