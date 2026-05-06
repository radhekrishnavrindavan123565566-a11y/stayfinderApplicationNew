import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '@/models/User';
import Property from '@/models/Property';
import RentAgreement from '@/models/RentAgreement';
import bcrypt from 'bcryptjs';

describe('Agreement Generation and Signing E2E Flow', () => {
  let mongoServer: MongoMemoryServer;
  let tenantId: string;
  let ownerId: string;
  let propertyId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test tenant
    const tenant = await User.create({
      username: 'tenant_user',
      email: 'tenant@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'tenant',
    });
    tenantId = tenant._id.toString();

    // Create test owner
    const owner = await User.create({
      username: 'owner_user',
      email: 'owner@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'owner',
    });
    ownerId = owner._id.toString();

    // Create test property
    const property = await Property.create({
      title: '2BHK Apartment in Civil Lines',
      description: 'Spacious apartment near college',
      price: 15000,
      location: {
        address: '123 Civil Lines',
        city: 'Allahabad',
        state: 'UP',
        country: 'India',
      },
      images: ['image1.jpg'],
      amenities: ['WiFi', 'Parking'],
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
    await RentAgreement.deleteMany({});
  });

  describe('Complete Agreement Flow', () => {
    test('should complete full agreement lifecycle: generate -> tenant signs -> owner signs', async () => {
      // Step 1: Generate agreement
      const agreementData = {
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'This is a rental agreement between tenant and owner...',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      };

      const agreement = await RentAgreement.create(agreementData);
      expect(agreement.status).toBe('draft');
      expect(agreement.tenantSignature).toBeUndefined();
      expect(agreement.ownerSignature).toBeUndefined();

      // Step 2: Tenant signs agreement
      agreement.status = 'pending_tenant';
      await agreement.save();

      agreement.tenantSignature = 'John Doe';
      agreement.tenantSignedAt = new Date();
      agreement.status = 'pending_owner';
      await agreement.save();

      expect(agreement.status).toBe('pending_owner');
      expect(agreement.tenantSignature).toBe('John Doe');
      expect(agreement.tenantSignedAt).toBeDefined();
      expect(agreement.ownerSignature).toBeUndefined();

      // Step 3: Owner signs agreement
      agreement.ownerSignature = 'Jane Smith';
      agreement.ownerSignedAt = new Date();
      agreement.status = 'fully_signed';
      await agreement.save();

      expect(agreement.status).toBe('fully_signed');
      expect(agreement.ownerSignature).toBe('Jane Smith');
      expect(agreement.ownerSignedAt).toBeDefined();

      // Verify final state
      const finalAgreement = await RentAgreement.findById(agreement._id);
      expect(finalAgreement?.status).toBe('fully_signed');
      expect(finalAgreement?.tenantSignature).toBe('John Doe');
      expect(finalAgreement?.ownerSignature).toBe('Jane Smith');
      expect(finalAgreement?.tenantSignedAt).toBeDefined();
      expect(finalAgreement?.ownerSignedAt).toBeDefined();
    });

    test('should handle agreement rejection flow', async () => {
      // Generate agreement
      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'pending_tenant',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      // Tenant rejects
      agreement.status = 'rejected';
      await agreement.save();

      expect(agreement.status).toBe('rejected');
      expect(agreement.tenantSignature).toBeUndefined();
      expect(agreement.ownerSignature).toBeUndefined();
    });

    test('should track signing timestamps correctly', async () => {
      const beforeTenantSign = new Date();

      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'pending_tenant',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      // Tenant signs
      agreement.tenantSignature = 'John Doe';
      agreement.tenantSignedAt = new Date();
      agreement.status = 'pending_owner';
      await agreement.save();

      const afterTenantSign = new Date();
      const beforeOwnerSign = new Date();

      // Owner signs
      agreement.ownerSignature = 'Jane Smith';
      agreement.ownerSignedAt = new Date();
      agreement.status = 'fully_signed';
      await agreement.save();

      const afterOwnerSign = new Date();

      // Verify timestamps
      expect(agreement.tenantSignedAt!.getTime()).toBeGreaterThanOrEqual(beforeTenantSign.getTime());
      expect(agreement.tenantSignedAt!.getTime()).toBeLessThanOrEqual(afterTenantSign.getTime());
      expect(agreement.ownerSignedAt!.getTime()).toBeGreaterThanOrEqual(beforeOwnerSign.getTime());
      expect(agreement.ownerSignedAt!.getTime()).toBeLessThanOrEqual(afterOwnerSign.getTime());
      expect(agreement.ownerSignedAt!.getTime()).toBeGreaterThanOrEqual(agreement.tenantSignedAt!.getTime());
    });
  });

  describe('Agreement Validation in Flow', () => {
    test('should not allow signing without agreement text', async () => {
      await expect(
        RentAgreement.create({
          propertyId,
          tenantId,
          ownerId,
          status: 'pending_tenant',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
        })
      ).rejects.toThrow();
    });

    test('should not allow invalid status transitions', async () => {
      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      // Try to set invalid status
      agreement.status = 'invalid_status' as any;
      
      await expect(agreement.save()).rejects.toThrow();
    });

    test('should validate date range', async () => {
      const agreement = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Test agreement',
        status: 'draft',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      expect(agreement.validUntil.getTime()).toBeGreaterThan(agreement.validFrom.getTime());
    });
  });

  describe('Multi-Agreement Scenarios', () => {
    test('should handle multiple agreements for same property', async () => {
      // Create first agreement (expired)
      const agreement1 = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'First agreement',
        status: 'fully_signed',
        validFrom: new Date('2023-01-01'),
        validUntil: new Date('2023-12-31'),
        tenantSignature: 'John Doe',
        ownerSignature: 'Jane Smith',
        tenantSignedAt: new Date('2023-01-01'),
        ownerSignedAt: new Date('2023-01-02'),
      });

      // Create second agreement (current)
      const agreement2 = await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Second agreement',
        status: 'pending_tenant',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      });

      const agreements = await RentAgreement.find({ propertyId });
      expect(agreements).toHaveLength(2);
      expect(agreements.some(a => a.status === 'fully_signed')).toBe(true);
      expect(agreements.some(a => a.status === 'pending_tenant')).toBe(true);
    });

    test('should handle tenant with multiple agreements', async () => {
      // Create second property
      const property2 = await Property.create({
        title: '1BHK Studio',
        description: 'Cozy studio',
        price: 8000,
        location: {
          address: '456 Test St',
          city: 'Allahabad',
          state: 'UP',
          country: 'India',
        },
        images: ['image2.jpg'],
        amenities: ['WiFi'],
        propertyType: 'studio',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        ownerId: mongoose.Types.ObjectId(),
        isAvailable: true,
      });

      // Create agreements for both properties
      await RentAgreement.create({
        propertyId,
        tenantId,
        ownerId,
        agreementText: 'Agreement 1',
        status: 'fully_signed',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        tenantSignature: 'John Doe',
        ownerSignature: 'Jane Smith',
      });

      await RentAgreement.create({
        propertyId: property2._id.toString(),
        tenantId,
        ownerId: property2.ownerId.toString(),
        agreementText: 'Agreement 2',
        status: 'pending_tenant',
        validFrom: new Date('2024-06-01'),
        validUntil: new Date('2025-05-31'),
      });

      const tenantAgreements = await RentAgreement.find({ tenantId });
      expect(tenantAgreements).toHaveLength(2);
    });
  });
});
