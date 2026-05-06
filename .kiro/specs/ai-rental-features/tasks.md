# Implementation Plan: AI Rental Features

## Overview

Implement two features: an AI-powered lease agreement generator (GPT-4o-mini, OTP-verified signing, PDF download) and a public conversational property search (NLP → filters). Tasks follow the key implementation steps from the design, building incrementally so each step integrates into the previous.

## Tasks

- [x] 1. Extract shared OTP store to `lib/otpStore.ts`
  - [x] 1.1 Create `lib/otpStore.ts` exporting `otpStore` Map and `verifyOtp` function
    - Export `otpStore` as a named `Map<string, { otp: string; expires: number; attempts: number }>`
    - Export `verifyOtp(email, otp)` that checks expiry, validates code, deletes on success, and returns `{ valid: boolean; reason?: string }`
    - Mirror the existing logic in `send-otp/route.ts` exactly (10-min TTL, attempt tracking)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.2 Update `app/api/auth/send-otp/route.ts` to import from `lib/otpStore.ts`
    - Remove the local `otpStore` Map declaration
    - Import `otpStore` from `@/lib/otpStore`
    - Keep `lastSentMap`, `generateOtp`, rate-limit logic, and all existing behaviour unchanged
    - _Requirements: 6.1_

  - [x]* 1.3 Write unit tests for `lib/otpStore.ts`
    - Test `verifyOtp` returns `{ valid: true }` and deletes the entry on correct OTP
    - Test `verifyOtp` returns `{ valid: false, reason: "OTP expired" }` for expired entries
    - Test `verifyOtp` returns `{ valid: false, reason: "OTP not found" }` when key is absent
    - Test `verifyOtp` returns `{ valid: false, reason: "Invalid OTP" }` for wrong code
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Make `bookingId` optional in `models/RentAgreement.ts`
  - [x] 2.1 Update `RentAgreement` schema and TypeScript interface
    - Change `bookingId` field in the Mongoose schema from `required: true` to `required: false`
    - Update the `IRentAgreement` interface so `bookingId` is typed as `mongoose.Types.ObjectId | undefined`
    - Verify existing `POST /api/agreements` route (which always passes `bookingId`) still compiles without changes
    - _Requirements: 1.7, 6.1, 6.3_

- [x] 3. Create `POST /api/agreements/generate` endpoint
  - [x] 3.1 Create `app/api/agreements/generate/route.ts`
    - Validate all required fields: `tenantName`, `ownerName`, `propertyTitle`, `propertyAddress`, `monthlyRent`, `startDate`, `endDate`, `language` — return 400 with field name if any are missing
    - Call `requireAuth(req)` and resolve `tenantId` / `ownerId` from the JWT; return 401 if unauthenticated
    - Build the GPT system prompt based on `language` ("hindi" or "english") using the exact prompts from the design document
    - Wrap the `openai.chat.completions.create` call in a `Promise.race` against a 15-second timeout; return 504 if it loses
    - On GPT success, create a `RentAgreement` document with `status: "draft"`, `agreementText` from GPT, `validFrom: startDate`, `validUntil: endDate`, and optional `propertyId` / `bookingId` if provided
    - Return 201 with the full populated agreement document
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x]* 3.2 Write property test for form validation (P1)
    - **Property 1: Form validation rejects incomplete submissions**
    - **Validates: Requirements 1.1**
    - Use `fc.record` with optional fields omitted to generate partial request bodies; assert the handler returns 400 for each

  - [x]* 3.3 Write property test for required sections in agreementText (P2)
    - **Property 2: Generated agreementText contains all required sections**
    - **Validates: Requirements 1.3**
    - Use `fc.record` of valid form inputs; mock the OpenAI call; assert `agreementText` contains all required section identifiers

  - [x]* 3.4 Write property test for language fidelity (P3)
    - **Property 3: Language fidelity**
    - **Validates: Requirements 1.4, 1.5**
    - Use `fc.constantFrom("hindi", "english")`; assert Hindi responses contain Devanagari code points (U+0900–U+097F) and English responses do not

  - [x]* 3.5 Write property test for draft status on creation (P4)
    - **Property 4: Successful generation creates a draft document**
    - **Validates: Requirements 1.7**
    - Use `fc.record` of valid form inputs; assert created document has `status === "draft"` and non-empty `agreementText`

  - [x]* 3.6 Write property test for data fidelity (P5)
    - **Property 5: Data fidelity invariant**
    - **Validates: Requirements 1.8, 3.4**
    - Use `fc.record` with `fc.string({ minLength: 1 })` for name/address fields and `fc.integer({ min: 1 })` for rent; assert `agreementText` contains each submitted value verbatim

- [x] 4. Update `POST /api/agreements/[id]/sign` with OTP verification
  - [x] 4.1 Update `app/api/agreements/[id]/sign/route.ts`
    - Extend the request body to accept `{ signature: string; otp: string; email: string }`
    - Return 400 if `otp` or `email` is missing
    - Call `verifyOtp(email, otp)` from `@/lib/otpStore`; return 401 with the reason string if `valid` is false
    - Enforce the status machine: tenant can only sign when `status === "pending_tenant"`, owner when `status === "pending_owner"`; return 409 "Not your turn to sign" otherwise
    - Return 409 "Already signed" if the calling party's signature field is already set
    - Keep all existing signature-recording and status-advancement logic intact
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1_

  - [x]* 4.2 Write property test for OTP gating (P6)
    - **Property 6: OTP verification gates signing**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Use `fc.string()` for OTP values and `fc.date()` for expired timestamps; assert that missing/invalid/expired OTPs all return 401 and leave the agreement document unchanged

  - [x]* 4.3 Write property test for status monotonicity (P7)
    - **Property 7: Status transitions are correct and monotonic**
    - **Validates: Requirements 2.4, 2.5, 2.6**
    - Use `fc.record` of agreement + signing sequence; assert status only advances forward and never reverts

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update `POST /api/ai/search` for public access and INR context
  - [x] 6.1 Update `app/api/ai/search/route.ts`
    - Remove the `requireAuth(req)` call so the endpoint is publicly accessible
    - Replace the system prompt with the India/INR version from the design: use INR monthly rent, Indian city names, add `nearLocation` field, update the example to use Allahabad/₹8000, add BHK parsing instructions
    - Wrap `JSON.parse` in a try/catch and fall back to `{}` on parse failure (return `{ filters: {}, originalQuery }` with 200)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x]* 6.2 Write property test for NLP_Filters schema compatibility (P9)
    - **Property 9: NLP_Filters schema compatibility**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.7**
    - Use `fc.string()` for queries; mock OpenAI; assert returned `filters` keys are all valid `Filters` interface fields, INR prices parse correctly, and BHK counts map to integers

- [x] 7. Create `AgreementGeneratorForm` component
  - [x] 7.1 Create `components/agreements/AgreementGeneratorForm.tsx`
    - Use `react-hook-form` + `zod` for validation matching existing codebase patterns
    - Implement three internal steps: `"form"` → `"preview"` → `"signing"`
    - Form fields: `tenantName`, `ownerName`, `propertyTitle`, `propertyAddress` (textarea), `monthlyRent` (number, ₹), `startDate`, `endDate`, `language` (radio: english/hindi)
    - On submit, call `POST /api/agreements/generate`; on success transition to `"preview"` step showing `agreementText`
    - In `"preview"` step, render a `PDFDownloadLink` from `@react-pdf/renderer` using `AgreementPDF` from `lib/agreementTemplate.ts`; show `AgreementSignModal` trigger button
    - Read auth from `authStore` (match existing pattern used in other protected components)
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.5_

  - [x]* 7.2 Write property test for filter mapping (P10)
    - **Property 10: AISearchBar filter mapping**
    - **Validates: Requirements 5.2, 5.3**
    - Use `fc.record` of `NLPFilters`; assert `setFilters` maps each field to the correct `Property_Store` key

- [x] 8. Create `AgreementSignModal` component
  - [x] 8.1 Create `components/agreements/AgreementSignModal.tsx`
    - Accept props: `{ agreementId: string; onSigned: (updated: IRentAgreement) => void; onClose: () => void }`
    - Step 1 (OTP): show masked email of signing party, "Send OTP" button calling `POST /api/auth/send-otp`, and a 6-digit OTP input
    - Step 2 (Signature): text input for typed signature and "Sign Agreement" button calling `POST /api/agreements/[id]/sign` with `{ signature, otp, email }`
    - On successful sign response, call `onSigned(updatedAgreement)` and close the modal
    - Display appropriate error messages for 401 (invalid/expired OTP) and 409 (already signed / wrong order)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9. Create `app/agreements/generate/page.tsx`
  - [x] 9.1 Create the generate page
    - Protect the route: redirect to login if unauthenticated, using the same auth-guard pattern as other protected pages in the codebase
    - Render `AgreementGeneratorForm` as the sole page content
    - _Requirements: 1.1, 6.1_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Write remaining property-based tests
  - [x]* 11.1 Write property test for PDF content fidelity (P8)
    - **Property 8: PDF content fidelity across all signing stages**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    - Use `fc.record` of `AgreementData`; render `AgreementPDF` and assert all field values appear in output; assert "Pending signature" appears for unsigned slots; assert byte length > 0

  - [x]* 11.2 Write property test for clear resets all filters (P11)
    - **Property 11: Clear resets all filters**
    - **Validates: Requirements 5.6, 7.1, 7.2**
    - Use `fc.record` of `Filters`; assert clear action sets all fields to empty strings and calls `fetchProperties(1)`

  - [x]* 11.3 Write property tests for filter correctness and monotonicity (P12, P13)
    - **Property 12: Filter correctness invariant**
    - **Property 13: Search monotonicity (metamorphic)**
    - **Validates: Requirements 5.7, 5.8**
    - Use `fc.array` of Property + `fc.record` of Filters; assert every returned property satisfies all non-null constraints; assert adding constraints never increases result count

  - [x]* 11.4 Write property test for filter idempotence (P14)
    - **Property 14: Idempotence — clearing filters**
    - **Validates: Requirements 7.4**
    - Use `fc.record` of Filters; assert clearing and fetching produces the same list as a fresh store initialization

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `{ numRuns: 100 }` and are tagged with `// Feature: ai-rental-features, Property N: ...`
- The `lib/otpStore.ts` extraction (task 1) must be completed before tasks 3 and 4 which both depend on it
- `bookingId` schema change (task 2) must be completed before task 3 which creates agreements without a booking