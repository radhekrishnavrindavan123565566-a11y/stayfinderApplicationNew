import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

describe('Authentication API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('User Registration', () => {
    test('should create a new user with hashed password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'tenant',
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password);
      expect(user.role).toBe('tenant');
    });

    test('should not allow duplicate email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'tenant',
      };

      await User.create(userData);

      // Try to create another user with same email
      await expect(
        User.create({
          ...userData,
          username: 'different',
        })
      ).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        username: 'testuser3',
        email: 'invalid-email',
        password: await bcrypt.hash('password123', 10),
        role: 'tenant',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should verify password correctly', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('User Roles', () => {
    test('should accept valid roles', async () => {
      const roles = ['tenant', 'owner', 'admin'];

      for (const role of roles) {
        const user = await User.create({
          username: `user-${role}`,
          email: `${role}@example.com`,
          password: await bcrypt.hash('password123', 10),
          role,
        });

        expect(user.role).toBe(role);
      }
    });

    test('should reject invalid roles', async () => {
      await expect(
        User.create({
          username: 'invalidrole',
          email: 'invalid@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'superuser', // Invalid role
        })
      ).rejects.toThrow();
    });
  });
});
