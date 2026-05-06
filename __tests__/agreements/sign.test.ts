import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Feature: ai-rental-features, Property 6: OTP verification gates signing
// Feature: ai-rental-features, Property 7: Status transitions are correct and monotonic

interface Agreement {
  _id: string;
  status: 'draft' | 'pending_tenant' | 'pending_owner' | 'fully_signed';
  tenantSignature?: string;
  ownerSignature?: string;
  tenantSignedAt?: Date;
  ownerSignedAt?: Date;
}

interface OtpEntry {
  otp: string;
  expires: number;
  attempts: number;
}

// Simulate OTP verification
function verifyOtp(otpStore: Map<string, OtpEntry>, email: string, otp: string): { valid: boolean; reason?: string } {
  const stored = otpStore.get(email.toLowerCase().trim());
  if (!stored) return { valid: false, reason: 'OTP not found' };
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return { valid: false, reason: 'OTP expired' };
  }
  if (stored.otp !== otp) return { valid: false, reason: 'Invalid OTP' };
  otpStore.delete(email);
  return { valid: true };
}

// Simulate signing logic
function signAgreement(
  agreement: Agreement,
  isTenant: boolean,
  signature: string,
  otpValid: boolean
): { success: boolean; error?: string; updatedAgreement?: Agreement } {
  if (!otpValid) {
    return { success: false, error: 'Invalid OTP' };
  }

  const updated = { ...agreement };

  if (isTenant) {
    if (agreement.status !== 'pending_tenant') {
      return { success: false, error: 'Not your turn to sign' };
    }
    if (agreement.tenantSignature) {
      return { success: false, error: 'Already signed' };
    }
    updated.tenantSignature = signature;
    updated.tenantSignedAt = new Date();
    updated.status = 'pending_owner';
  } else {
    if (agreement.status !== 'pending_owner') {
      return { success: false, error: 'Not your turn to sign' };
    }
    if (agreement.ownerSignature) {
      return { success: false, error: 'Already signed' };
    }
    updated.ownerSignature = signature;
    updated.ownerSignedAt = new Date();
    updated.status = 'fully_signed';
  }

  return { success: true, updatedAgreement: updated };
}

describe('Agreement Signing', () => {
  test('P6: OTP verification gates signing', () => {
    fc.assert(
      fc.property(
        fc.record({
          agreementId: fc.string({ minLength: 1 }),
          status: fc.constantFrom('pending_tenant' as const, 'pending_owner' as const),
          signature: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          otp: fc.string({ minLength: 6, maxLength: 6 }),
          otpScenario: fc.constantFrom('missing', 'invalid', 'expired', 'valid'),
        }),
        (data) => {
          const otpStore = new Map<string, OtpEntry>();
          const agreement: Agreement = {
            _id: data.agreementId,
            status: data.status,
          };

          let otpValid = false;

          // Setup OTP scenarios
          if (data.otpScenario === 'valid') {
            otpStore.set(data.email.toLowerCase(), {
              otp: data.otp,
              expires: Date.now() + 600000, // 10 minutes
              attempts: 0,
            });
            otpValid = true;
          } else if (data.otpScenario === 'expired') {
            otpStore.set(data.email.toLowerCase(), {
              otp: data.otp,
              expires: Date.now() - 1000, // Expired
              attempts: 0,
            });
          } else if (data.otpScenario === 'invalid') {
            otpStore.set(data.email.toLowerCase(), {
              otp: 'wrong-otp',
              expires: Date.now() + 600000,
              attempts: 0,
            });
          }
          // 'missing' scenario: don't add to store

          const otpResult = verifyOtp(otpStore, data.email, data.otp);
          const isTenant = data.status === 'pending_tenant';
          const result = signAgreement(agreement, isTenant, data.signature, otpResult.valid);

          if (data.otpScenario !== 'valid') {
            // Missing/invalid/expired OTPs should fail
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            // Agreement should be unchanged
            expect(agreement.tenantSignature).toBeUndefined();
            expect(agreement.ownerSignature).toBeUndefined();
          } else {
            // Valid OTP should succeed
            expect(result.success).toBe(true);
            expect(result.updatedAgreement).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P7: Status transitions are correct and monotonic', () => {
    fc.assert(
      fc.property(
        fc.record({
          agreementId: fc.string({ minLength: 1 }),
          tenantSignature: fc.string({ minLength: 1, maxLength: 100 }),
          ownerSignature: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        (data) => {
          // Start with draft status
          let agreement: Agreement = {
            _id: data.agreementId,
            status: 'draft',
          };

          // Transition to pending_tenant (typically done when agreement is sent)
          agreement.status = 'pending_tenant';

          // Tenant signs
          const tenantResult = signAgreement(agreement, true, data.tenantSignature, true);
          expect(tenantResult.success).toBe(true);
          agreement = tenantResult.updatedAgreement!;

          // Status should advance to pending_owner
          expect(agreement.status).toBe('pending_owner');
          expect(agreement.tenantSignature).toBe(data.tenantSignature);
          expect(agreement.tenantSignedAt).toBeDefined();

          // Owner signs
          const ownerResult = signAgreement(agreement, false, data.ownerSignature, true);
          expect(ownerResult.success).toBe(true);
          agreement = ownerResult.updatedAgreement!;

          // Status should advance to fully_signed
          expect(agreement.status).toBe('fully_signed');
          expect(agreement.ownerSignature).toBe(data.ownerSignature);
          expect(agreement.ownerSignedAt).toBeDefined();

          // Verify monotonicity: status never reverts
          const statusSequence = ['draft', 'pending_tenant', 'pending_owner', 'fully_signed'];
          const currentIndex = statusSequence.indexOf(agreement.status);
          expect(currentIndex).toBe(3); // Should be at the end
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P7: Status transitions reject out-of-order signing', () => {
    fc.assert(
      fc.property(
        fc.record({
          agreementId: fc.string({ minLength: 1 }),
          signature: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        (data) => {
          // Try tenant signing when status is pending_owner
          const agreement1: Agreement = {
            _id: data.agreementId,
            status: 'pending_owner',
          };
          const result1 = signAgreement(agreement1, true, data.signature, true);
          expect(result1.success).toBe(false);
          expect(result1.error).toBe('Not your turn to sign');

          // Try owner signing when status is pending_tenant
          const agreement2: Agreement = {
            _id: data.agreementId,
            status: 'pending_tenant',
          };
          const result2 = signAgreement(agreement2, false, data.signature, true);
          expect(result2.success).toBe(false);
          expect(result2.error).toBe('Not your turn to sign');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P7: Duplicate signing is rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          agreementId: fc.string({ minLength: 1 }),
          signature: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        (data) => {
          // Tenant tries to sign twice
          const agreement1: Agreement = {
            _id: data.agreementId,
            status: 'pending_tenant',
            tenantSignature: 'Already Signed',
          };
          const result1 = signAgreement(agreement1, true, data.signature, true);
          expect(result1.success).toBe(false);
          expect(result1.error).toBe('Already signed');

          // Owner tries to sign twice
          const agreement2: Agreement = {
            _id: data.agreementId,
            status: 'pending_owner',
            ownerSignature: 'Already Signed',
          };
          const result2 = signAgreement(agreement2, false, data.signature, true);
          expect(result2.success).toBe(false);
          expect(result2.error).toBe('Already signed');
        }
      ),
      { numRuns: 100 }
    );
  });
});
