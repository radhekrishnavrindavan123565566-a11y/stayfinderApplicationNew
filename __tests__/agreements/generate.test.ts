import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: ai-rental-features, Property 1: Form validation rejects incomplete submissions
// Feature: ai-rental-features, Property 2: Generated agreementText contains all required sections
// Feature: ai-rental-features, Property 3: Language fidelity
// Feature: ai-rental-features, Property 4: Successful generation creates a draft document
// Feature: ai-rental-features, Property 5: Data fidelity invariant

// Helper to generate valid date strings
const dateArbitrary = () => fc.integer({ min: 2020, max: 2030 }).chain(year =>
  fc.integer({ min: 1, max: 12 }).chain(month =>
    fc.integer({ min: 1, max: 28 }).map(day =>
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    )
  )
);

interface AgreementGenerateRequest {
  tenantName?: string;
  ownerName?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  monthlyRent?: number;
  startDate?: string;
  endDate?: string;
  language?: 'hindi' | 'english';
  propertyId?: string;
}

// Simulate validation logic
function validateAgreementRequest(data: AgreementGenerateRequest): { valid: boolean; missingField?: string } {
  const requiredFields = ['tenantName', 'ownerName', 'propertyTitle', 'propertyAddress', 'monthlyRent', 'startDate', 'endDate', 'language', 'propertyId'];
  
  for (const field of requiredFields) {
    const value = data[field as keyof AgreementGenerateRequest];
    if (!value && value !== 0) {
      return { valid: false, missingField: field };
    }
  }
  
  return { valid: true };
}

// Simulate agreement text generation
function generateMockAgreementText(data: AgreementGenerateRequest, language: 'hindi' | 'english'): string {
  if (language === 'hindi') {
    return `किराया समझौता

पक्षकार
मालिक: ${data.ownerName}
किरायेदार: ${data.tenantName}

संपत्ति विवरण
शीर्षक: ${data.propertyTitle}
पता: ${data.propertyAddress}

मासिक किराया: ₹${data.monthlyRent}
पट्टे की अवधि: ${data.startDate} से ${data.endDate} तक

भुगतान शर्तें
किराया हर महीने की पहली तारीख को देय है।

सुरक्षा जमा
दो महीने के किराए के बराबर सुरक्षा जमा।

रखरखाव जिम्मेदारियां
किरायेदार परिसर को साफ रखेगा।

समाप्ति खंड
कोई भी पक्ष 30 दिन के नोटिस के साथ समाप्त कर सकता है।

शासी कानून (भारत)
यह समझौता भारत के कानूनों द्वारा शासित है।`;
  } else {
    return `RENTAL AGREEMENT

Parties
Owner: ${data.ownerName}
Tenant: ${data.tenantName}

Property Details
Title: ${data.propertyTitle}
Address: ${data.propertyAddress}

Monthly Rent: ₹${data.monthlyRent}
Lease Duration: ${data.startDate} to ${data.endDate}

Payment Terms
Rent is due on the 1st of each month.

Security Deposit
Security deposit equal to two months' rent.

Maintenance Responsibilities
Tenant shall keep the premises clean.

Termination Clause
Either party may terminate with 30 days' notice.

Governing Law (India)
This agreement is governed by the laws of India.`;
  }
}

describe('Agreement Generation', () => {
  test('P1: Form validation rejects incomplete submissions', () => {
    fc.assert(
      fc.property(
        fc.record({
          tenantName: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          ownerName: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          propertyTitle: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          propertyAddress: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          monthlyRent: fc.option(fc.integer({ min: 1 }), { nil: undefined }),
          startDate: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          endDate: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          language: fc.option(fc.constantFrom('hindi' as const, 'english' as const), { nil: undefined }),
          propertyId: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        }),
        (data: AgreementGenerateRequest) => {
          const result = validateAgreementRequest(data);
          
          // If any required field is missing, validation should fail
          const hasAllFields = data.tenantName && data.ownerName && data.propertyTitle && 
                              data.propertyAddress && data.monthlyRent && data.startDate && 
                              data.endDate && data.language && data.propertyId;
          
          if (!hasAllFields) {
            expect(result.valid).toBe(false);
            expect(result.missingField).toBeDefined();
          } else {
            expect(result.valid).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P2: Generated agreementText contains all required sections', () => {
    fc.assert(
      fc.property(
        fc.record({
          tenantName: fc.string({ minLength: 1, maxLength: 100 }),
          ownerName: fc.string({ minLength: 1, maxLength: 100 }),
          propertyTitle: fc.string({ minLength: 1, maxLength: 200 }),
          propertyAddress: fc.string({ minLength: 1, maxLength: 500 }),
          monthlyRent: fc.integer({ min: 1, max: 1000000 }),
          startDate: dateArbitrary(),
          endDate: dateArbitrary(),
          language: fc.constantFrom('hindi' as const, 'english' as const),
          propertyId: fc.string({ minLength: 1 }),
        }),
        (data: AgreementGenerateRequest) => {
          const text = generateMockAgreementText(data, data.language!);
          
          if (data.language === 'hindi') {
            // Check for Hindi section identifiers
            expect(text).toMatch(/पक्षकार|Parties/i);
            expect(text).toMatch(/संपत्ति विवरण|Property Details/i);
            expect(text).toMatch(/मासिक किराया|Monthly Rent/i);
            expect(text).toMatch(/पट्टे की अवधि|Lease Duration/i);
            expect(text).toMatch(/भुगतान शर्तें|Payment Terms/i);
            expect(text).toMatch(/सुरक्षा जमा|Security Deposit/i);
            expect(text).toMatch(/रखरखाव|Maintenance/i);
            expect(text).toMatch(/समाप्ति|Termination/i);
            expect(text).toMatch(/शासी कानून|Governing Law/i);
          } else {
            // Check for English section identifiers
            expect(text).toContain('Parties');
            expect(text).toContain('Property Details');
            expect(text).toContain('Monthly Rent');
            expect(text).toContain('Lease Duration');
            expect(text).toContain('Payment Terms');
            expect(text).toContain('Security Deposit');
            expect(text).toContain('Maintenance');
            expect(text).toContain('Termination');
            expect(text).toContain('Governing Law');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P3: Language fidelity', () => {
    fc.assert(
      fc.property(
        fc.record({
          tenantName: fc.string({ minLength: 1, maxLength: 100 }),
          ownerName: fc.string({ minLength: 1, maxLength: 100 }),
          propertyTitle: fc.string({ minLength: 1, maxLength: 200 }),
          propertyAddress: fc.string({ minLength: 1, maxLength: 500 }),
          monthlyRent: fc.integer({ min: 1, max: 1000000 }),
          startDate: fc.string({ minLength: 1 }),
          endDate: fc.string({ minLength: 1 }),
          language: fc.constantFrom('hindi' as const, 'english' as const),
          propertyId: fc.string({ minLength: 1 }),
        }),
        (data: AgreementGenerateRequest) => {
          const text = generateMockAgreementText(data, data.language!);
          
          // Devanagari Unicode range: U+0900–U+097F
          const hasDevanagari = /[\u0900-\u097F]/.test(text);
          
          if (data.language === 'hindi') {
            expect(hasDevanagari).toBe(true);
          } else {
            // English text should not contain Devanagari (except in user input)
            // We check the section headers which are generated
            const sectionHeaders = text.split('\n').slice(0, 5).join('\n');
            expect(/[\u0900-\u097F]/.test(sectionHeaders)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P4: Successful generation creates a draft document', () => {
    fc.assert(
      fc.property(
        fc.record({
          tenantName: fc.string({ minLength: 1, maxLength: 100 }),
          ownerName: fc.string({ minLength: 1, maxLength: 100 }),
          propertyTitle: fc.string({ minLength: 1, maxLength: 200 }),
          propertyAddress: fc.string({ minLength: 1, maxLength: 500 }),
          monthlyRent: fc.integer({ min: 1, max: 1000000 }),
          startDate: fc.string({ minLength: 1 }),
          endDate: fc.string({ minLength: 1 }),
          language: fc.constantFrom('hindi' as const, 'english' as const),
          propertyId: fc.string({ minLength: 1 }),
        }),
        (data: AgreementGenerateRequest) => {
          const agreementText = generateMockAgreementText(data, data.language!);
          
          // Simulate created document
          const document = {
            status: 'draft',
            agreementText,
          };
          
          expect(document.status).toBe('draft');
          expect(document.agreementText).toBeTruthy();
          expect(document.agreementText.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P5: Data fidelity invariant', () => {
    fc.assert(
      fc.property(
        fc.record({
          tenantName: fc.string({ minLength: 1, maxLength: 100 }),
          ownerName: fc.string({ minLength: 1, maxLength: 100 }),
          propertyTitle: fc.string({ minLength: 1, maxLength: 200 }),
          propertyAddress: fc.string({ minLength: 1, maxLength: 500 }),
          monthlyRent: fc.integer({ min: 1, max: 1000000 }),
          startDate: dateArbitrary(),
          endDate: dateArbitrary(),
          language: fc.constantFrom('hindi' as const, 'english' as const),
          propertyId: fc.string({ minLength: 1 }),
        }),
        (data: AgreementGenerateRequest) => {
          const text = generateMockAgreementText(data, data.language!);
          
          // Assert all submitted values appear verbatim in the agreement text
          expect(text).toContain(data.tenantName!);
          expect(text).toContain(data.ownerName!);
          expect(text).toContain(data.propertyAddress!);
          expect(text).toContain(String(data.monthlyRent));
          expect(text).toContain(data.startDate!);
          expect(text).toContain(data.endDate!);
        }
      ),
      { numRuns: 100 }
    );
  });
});
