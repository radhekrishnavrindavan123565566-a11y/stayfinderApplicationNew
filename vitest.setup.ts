// Global test setup
import { beforeAll, afterAll, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nestora-test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

beforeAll(() => {
  // Setup code before all tests
});

afterAll(() => {
  // Cleanup code after all tests
});

afterEach(() => {
  // Cleanup after each test
});
