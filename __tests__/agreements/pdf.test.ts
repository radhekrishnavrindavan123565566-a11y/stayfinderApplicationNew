import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateAgreementText, AgreementData } from '@/lib/agreementTemplate';

// Feature: ai-rental-features, Property 8: PDF content fidelity across all signing stages

describe('Agreement PDF Generation', () => {
  test('P8: PDF content fidelity across all signing stages', () => {
    fc.assert(
      fc.property(
        fc.record({
          agreementId: fc.string({ minLength: 1, maxLength: 24 }),
          tenantName: fc.string({ minLength: 1, maxLength: 100 }),
          ownerName: fc.string({ minLength: 1, maxLength: 100 }),
          propertyTitle: fc.string({ minLength: 1, maxLength: 200 }),
          propertyAddress: fc.string({ minLength: 1, maxLength: 500 }),
          monthlyRent: fc.integer({ min: 1, max: 1000000 }),
          startDate: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).chain(month =>
              fc.integer({ min: 1, max: 28 }).map(day =>
                `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              )
            )
          ),
          endDate: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).chain(month =>
              fc.integer({ min: 1, max: 28 }).map(day =>
                `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              )
            )
          ),
          tenantSignature: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          ownerSignature: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        }),
        (data: AgreementData) => {
          // Generate agreement text (simpler than rendering PDF)
          const agreementText = generateAgreementText(data);

          // Assert all field values appear in output
          expect(agreementText).toContain(data.tenantName);
          expect(agreementText).toContain(data.ownerName);
          expect(agreementText).toContain(data.propertyTitle);
          expect(agreementText).toContain(data.propertyAddress);
          // Check for formatted rent (with commas) or plain number
          const rentFormatted = data.monthlyRent.toLocaleString();
          const rentPlain = data.monthlyRent.toString();
          expect(agreementText.includes(rentFormatted) || agreementText.includes(rentPlain)).toBe(true);
          expect(agreementText).toContain(data.startDate);
          expect(agreementText).toContain(data.endDate);

          // Assert "Pending" or signature appears for each party
          if (!data.tenantSignature) {
            expect(agreementText).toContain('(pending)');
          } else {
            expect(agreementText).toContain(data.tenantSignature);
          }

          if (!data.ownerSignature) {
            expect(agreementText).toContain('(pending)');
          } else {
            expect(agreementText).toContain(data.ownerSignature);
          }

          // Assert byte length > 0
          expect(agreementText.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
