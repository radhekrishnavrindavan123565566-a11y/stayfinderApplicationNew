import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import RentAgreement from '@/models/RentAgreement';
import User from '@/models/User';
import Property from '@/models/Property';
import bcrypt from 'bcryptjs';

describe('Agreement API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let tenantId: string;
  let ownerId: string;
  let propertyId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test users
    const tenant = await User.create({
      username: 'tenant',
      email: 'tenant@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'tenant',
    });
    tenantId = tenant._id.toString();

    const owner = await User.create({
      username: 'owner',
      email: 'owner@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'owner',
    });
    ownerId = owner._id.toString();

    // Create test property
    const property = await Property.create({
      title: 'Test Property',
      description: 'A test property',
      price: 10000,
      location: {
        address: '123 Test St',
        city: 'Allahabad',
        state: 'UP',
        country: 'India',
      },
      images: ['image1.jpg'],
      amenities: ['WiFi'],
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      ownerId: owner._id,
      isAvailable: true,
    });
    propertyId = property._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up agreements before each test
    await RentAgreement.deleteMany({});
  });

  describe('Agreement Creation', () => {
    test('should create agreement with all required fields', async () => {
      const agreementData = {
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement text',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      };

      const agreement = await RentAgreement.create(agreementData);

      expect(agreement).toBeDefined();
      expect(agreement.propertyId.toString()).toBe(propertyId);
      expect(agreement.tenantId.toString()).toBe(tenantId);
      expect(agreement.ownerId.toString()).toBe(ownerId);
      expect(agreement.status).toBe('draft');
    });

    test('should create agreement without bookingId (optional)', async () => {
      const agreementData = {
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement text',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      };

      const agreement = await RentAgreement.create(agreementData);

      expect(agreement).toBeDefined();
      expect(agreement.bookingId).toBeUndefined();
    });
  });

  describe('Agreement Status Transitions', () => {
    test('should transition from draft to pending_tenant', async () => {
      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      agreement.status = 'pending_tenant';
      await agreement.save();

      expect(agreement.status).toBe('pending_tenant');
    });

    test('should transition from pending_tenant to pending_owner after tenant signs', async () => {
      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'pending_tenant',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      agreement.tenantSignature = 'John Doe';
      agreement.tenantSignedAt = new Date();
      agreement.status = 'pending_owner';
      await agreement.save();

      expect(agreement.status).toBe('pending_owner');
      expect(agreement.tenantSignature).toBe('John Doe');
      expect(agreement.tenantSignedAt).toBeDefined();
    });

    test('should transition to fully_signed after both parties sign', async () => {
      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'pending_owner',
        tenantSignature: 'John Doe',
        tenantSignedAt: new Date(),
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      agreement.ownerSignature = 'Jane Smith';
      agreement.ownerSignedAt = new Date();
      agreement.status = 'fully_signed';
      await agreement.save();

      expect(agreement.status).toBe('fully_signed');
      expect(agreement.ownerSignature).toBe('Jane Smith');
      expect(agreement.ownerSignedAt).toBeDefined();
    });
  });

  describe('Agreement Validation', () => {
    test('should require propertyId', async () => {
      await expect(
        RentAgreement.create({
          tenantId,
          ownerId,
          agreementText: 'Test agreement',
          status: 'draft',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
        })
      ).rejects.toThrow();
    });

    test('should require tenantId', async () => {
      await expect(
        RentAgreement.create({
          propertyId,
          ownerId,
          agreementText: 'Test agreement',
          status: 'draft',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
        })
      ).rejects.toThrow();
    });

    test('should require ownerId', async () => {
      await expect(
        RentAgreement.create({
          propertyId,
          tenantId,
          agreementText: 'Test agreement',
          status: 'draft',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
        })
      ).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      await expect(
        RentAgreement.create({
          propertyId,
          tenantId,
          ownerId,
          agreementText: 'Test agreement',
          status: 'invalid_status' as any,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
        })
      ).rejects.toThrow();
    });
  });

  describe('Agreement Queries', () => {
    test('should find agreements by tenant', async () => {
      await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement 1',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement 2',
        status: 'pending_tenant',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      const agreements = await RentAgreement.find({ tenantId });
      expect(agreements).toHaveLength(2);
    });

    test('should find agreements by status', async () => {
      await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement 1',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement 2',
        status: 'fully_signed',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      const draftAgreements = await RentAgreement.find({ status: 'draft' });
      expect(draftAgreements).toHaveLength(1);

      const signedAgreements = await RentAgreement.find({ status: 'fully_signed' });
      expect(signedAgreements).toHaveLength(1);
    });
  });
});
