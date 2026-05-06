# Design Document — AI Rental Features

## Overview

This document covers the technical design for two features added to Nestora, a Next.js 16 / MongoDB rental marketplace serving Uttar Pradesh, India.

**Feature 1 — AI Lease Agreement Generator**: A structured form collects party and property details; a new `POST /api/agreements/generate` endpoint calls GPT-4o-mini to produce a legally-structured agreement in Hindi or English. The resulting `RentAgreement` document starts in `draft` status. Both parties sign via a modal that first verifies their identity with an OTP sent to their registered email, then records the typed signature. The signed agreement is downloadable as a PDF rendered client-side by `@react-pdf/renderer`.

**Feature 2 — Conversational Property Search**: The existing `AISearchBar` component and `POST /api/ai/search` route are already wired together. The only backend change is removing `requireAuth` from the route and updating the system prompt to use INR / India context. No new components are needed.

Both features are additive. Existing agreements, the manual `SearchBar`, and all other routes remain untouched.

---

## Architecture

```mermaid
graph TD
  subgraph "Feature 1 — Agreement Generator"
    AF[AgreementGeneratorForm\napp/agreements/generate/page.tsx]
    AG[POST /api/agreements/generate\nGPT-4o-mini call]
    SM[AgreementSignModal]
    SA[POST /api/agreements/:id/sign\n+ OTP verification]
    PDF[AgreementPDF\n@react-pdf/renderer\nclient-side]
    RA[(RentAgreement\nMongoDB)]

    AF -->|form fields| AG
    AG -->|agreementText + draft doc| RA
    AG -->|{ agreementId, agreementText }| AF
    AF --> SM
    SM -->|POST /api/auth/send-otp| OTP[OTP Store\nin-memory]
    SM -->|{ signature, otp, email }| SA
    SA -->|verify OTP| OTP
    SA -->|update signatures + status| RA
    AF -->|AgreementData| PDF
  end

  subgraph "Feature 2 — AI Search"
    SB[AISearchBar\ncomponents/search/AISearchBar.tsx]
    ASR[POST /api/ai/search\nno auth required]
    PS[(Property Store\nZustand)]
    PL[Property Grid]

    SB -->|query| ASR
    ASR -->|NLP_Filters| SB
    SB -->|setFilters + fetchProperties| PS
    PS --> PL
  end
```

---

## Components and Interfaces

### New API Endpoints

#### `POST /api/agreements/generate`

Accepts form fields, calls GPT-4o-mini, creates a `draft` `RentAgreement`, and returns the document.

**Request body:**
```ts
{
  tenantName: string;       // required
  ownerName: string;        // required
  propertyTitle: string;    // required
  propertyAddress: string;  // required
  monthlyRent: number;      // required, INR
  startDate: string;        // required, ISO date string
  endDate: string;          // required, ISO date string
  language: "hindi" | "english"; // required
  // Caller must be authenticated — tenantId / ownerId resolved from JWT
  propertyId?: string;      // optional, links to existing Property doc
  bookingId?: string;       // optional, links to existing Booking doc
}
```

**Response (201):**
```ts
{
  success: true,
  data: {
    agreement: IRentAgreement  // full populated document
  }
}
```

**Error responses:**
- `400` — missing required fields
- `401` — unauthenticated
- `504` — GPT call timed out (>15 s)
- `500` — GPT API error or DB error

**GPT system prompt (English path):**
```
You are a legal document assistant for Indian residential rental agreements.
Generate a complete, legally-structured rental agreement under Indian law.
Include these sections: Parties, Property Details, Monthly Rent, Lease Duration,
Payment Terms, Security Deposit, Maintenance Responsibilities, Termination Clause,
Governing Law (India). Use formal legal English. Return only the agreement text.
```

**GPT system prompt (Hindi path):**
```
आप भारतीय आवासीय किराया समझौतों के लिए एक कानूनी दस्तावेज़ सहायक हैं।
भारतीय कानून के तहत एक पूर्ण, कानूनी रूप से संरचित किराया समझौता तैयार करें।
इन खंडों को शामिल करें: पक्षकार, संपत्ति विवरण, मासिक किराया, पट्टे की अवधि,
भुगतान शर्तें, सुरक्षा जमा, रखरखाव जिम्मेदारियां, समाप्ति खंड, शासी कानून (भारत)।
औपचारिक कानूनी हिंदी (देवनागरी लिपि) का उपयोग करें। केवल समझौते का पाठ लौटाएं।
```

---

#### `POST /api/agreements/[id]/sign` — updated

Adds OTP verification before recording the signature. The existing `{ signature: string }` body is extended:

**Request body:**
```ts
{
  signature: string;  // typed name — required
  otp: string;        // 6-digit code — required
  email: string;      // signing party's email — required for OTP lookup
}
```

The handler verifies the OTP against the in-memory `otpStore` in `send-otp/route.ts` by calling the shared verification logic (extracted to `lib/otpStore.ts` — see Data Models). If valid, it proceeds with the existing signature recording logic. The OTP is consumed (deleted) on success.

**Status machine enforcement:**
```
draft → pending_tenant → pending_owner → fully_signed
```
- Tenant can only sign when status is `pending_tenant`
- Owner can only sign when status is `pending_owner`
- Signing out of turn returns `409`
- Re-signing returns `409`

**Error responses (new):**
- `401` — missing or invalid OTP
- `401` — OTP expired (message: "OTP expired")
- `409` — party has already signed
- `409` — wrong signing order

---

#### `POST /api/ai/search` — updated

Remove `requireAuth(req)`. Update system prompt to use INR and India context.

**Change diff (conceptual):**
```diff
- requireAuth(req); // must be logged in to use AI search parser
+ // public endpoint — no auth required

  content: `You are a rental property search assistant for India.
  Parse the user's natural language query and extract structured search filters.
  Return ONLY a JSON object with these optional fields:
  - city: string (Indian city name)
- - minPrice: number (per night)
- - maxPrice: number (per night)
+ - minPrice: number (monthly rent in INR)
+ - maxPrice: number (monthly rent in INR)
  - bedrooms: number (minimum)
- - propertyType: "apartment" | "house" | "villa" | "studio" | "condo" | "cabin"
+ - propertyType: "apartment" | "house" | "villa" | "studio" | "condo" | "cabin"
  - amenities: string[] (from: WiFi, Parking, Kitchen, Pool, Gym, AC, TV, Washer)
  - keywords: string (remaining search terms)
+ - nearLocation: string (landmark or area name)
  
- Example: {"city": "New York", "maxPrice": 150, "bedrooms": 2}
+ Example: {"city": "Allahabad", "maxPrice": 8000, "bedrooms": 2, "amenities": ["WiFi"]}
+ Price parsing: "₹8000", "8 thousand", "8k" all map to 8000. "1BHK"→bedrooms:1, "2BHK"→bedrooms:2.`
```

---

### New UI Components

#### `AgreementGeneratorForm`

**Path:** `components/agreements/AgreementGeneratorForm.tsx`

Controlled form using `react-hook-form` + `zod` validation (matching existing patterns in the codebase). On submit, calls `POST /api/agreements/generate`. On success, renders a preview of `agreementText` and shows the `AgreementSignModal` and PDF download button.

**Props:** none (self-contained, reads auth from `authStore`)

**Internal state:**
```ts
type Step = "form" | "preview" | "signing";
```

**Form fields:**
- `tenantName` — text input
- `ownerName` — text input
- `propertyTitle` — text input
- `propertyAddress` — textarea
- `monthlyRent` — number input (₹)
- `startDate` — date input
- `endDate` — date input
- `language` — radio: "english" | "hindi"

**PDF download:** Uses `@react-pdf/renderer`'s `PDFDownloadLink` component client-side. Passes `AgreementData` built from the generated agreement document. Available at all stages (shows "Pending signature" placeholders for unsigned parties).

---

#### `AgreementSignModal`

**Path:** `components/agreements/AgreementSignModal.tsx`

Two-step modal:
1. **OTP step** — shows the signing party's email (masked), a "Send OTP" button that calls `POST /api/auth/send-otp`, and a 6-digit OTP input.
2. **Signature step** — a text input for the typed signature and a "Sign Agreement" button that calls `POST /api/agreements/[id]/sign`.

**Props:**
```ts
{
  agreementId: string;
  onSigned: (updatedAgreement: IRentAgreement) => void;
  onClose: () => void;
}
```

---

#### `app/agreements/generate/page.tsx`

New page that hosts `AgreementGeneratorForm`. Protected — redirects to login if unauthenticated (using existing auth pattern from other protected pages).

---

### Existing Components — No Changes

- `AISearchBar` — already fully implemented; no code changes needed
- `AgreementPDF` in `lib/agreementTemplate.ts` — already handles `tenantSignature?: string` and `ownerSignature?: string` with "Pending signature" placeholders
- `generateAgreementText` — untouched

---

## Data Models

### `RentAgreement` — existing model, no schema changes needed

All required fields already exist in `models/RentAgreement.ts`:

| Field | Type | Notes |
|---|---|---|
| `bookingId` | ObjectId | Required by schema — for GPT-generated agreements without a booking, we'll make this optional via a schema update |
| `propertyId` | ObjectId | ref: Property |
| `tenantId` | ObjectId | ref: User |
| `ownerId` | ObjectId | ref: User |
| `agreementText` | string | GPT output or template output |
| `pdfUrl` | string? | optional stored URL |
| `tenantSignature` | string? | typed name |
| `ownerSignature` | string? | typed name |
| `tenantSignedAt` | Date? | UTC timestamp |
| `ownerSignedAt` | Date? | UTC timestamp |
| `status` | enum | `draft` \| `pending_tenant` \| `pending_owner` \| `fully_signed` \| `expired` |
| `validFrom` | Date | lease start |
| `validUntil` | Date | lease end |

**Required schema change:** `bookingId` is currently `required: true`. For GPT-generated agreements that aren't tied to a booking, it must become optional (`required: false`). This is a non-breaking change — existing documents all have `bookingId` set.

### `lib/otpStore.ts` — new shared module

The OTP store in `send-otp/route.ts` is currently module-scoped (not exported). To allow the sign endpoint to verify OTPs without duplicating the store, extract it to a shared module:

```ts
// lib/otpStore.ts
export const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

export function verifyOtp(email: string, otp: string): { valid: boolean; reason?: string } {
  const stored = otpStore.get(email.toLowerCase().trim());
  if (!stored) return { valid: false, reason: "OTP not found" };
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return { valid: false, reason: "OTP expired" };
  }
  if (stored.otp !== otp.toString()) return { valid: false, reason: "Invalid OTP" };
  otpStore.delete(email); // consume on success
  return { valid: true };
}
```

`send-otp/route.ts` imports and uses this store instead of its own local `Map`.

### `NLP_Filters` — TypeScript interface

```ts
// Returned by POST /api/ai/search
interface NLPFilters {
  city?: string;
  minPrice?: number;       // INR/month
  maxPrice?: number;       // INR/month
  bedrooms?: number;
  propertyType?: "apartment" | "house" | "villa" | "studio" | "condo" | "cabin";
  amenities?: string[];
  keywords?: string;
  nearLocation?: string;
}
```

This is a strict subset of the `Filters` interface in `store/propertyStore.ts` — all fields map directly.

### `AgreementGenerateRequest` — TypeScript interface

```ts
interface AgreementGenerateRequest {
  tenantName: string;
  ownerName: string;
  propertyTitle: string;
  propertyAddress: string;
  monthlyRent: number;
  startDate: string;        // ISO date
  endDate: string;          // ISO date
  language: "hindi" | "english";
  propertyId?: string;
  bookingId?: string;
}
```

---

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form validation rejects incomplete submissions

*For any* `AgreementGeneratorForm` submission where one or more required fields (tenantName, ownerName, propertyTitle, propertyAddress, monthlyRent, startDate, endDate, language) are missing or empty, the form SHALL prevent submission and the `POST /api/agreements/generate` endpoint SHALL not be called.

**Validates: Requirements 1.1**

---

### Property 2: Generated agreementText contains all required sections

*For any* valid `AgreementGenerateRequest`, the `agreementText` returned by `POST /api/agreements/generate` SHALL contain all of the following section identifiers: parties/पक्षकार, property details/संपत्ति विवरण, monthly rent/मासिक किराया, lease duration/पट्टे की अवधि, payment terms/भुगतान शर्तें, security deposit/सुरक्षा जमा, maintenance/रखरखाव, termination/समाप्ति, governing law/शासी कानून.

**Validates: Requirements 1.3**

---

### Property 3: Language fidelity

*For any* valid `AgreementGenerateRequest` with `language = "hindi"`, the `agreementText` SHALL contain Devanagari Unicode characters (code points U+0900–U+097F). *For any* valid request with `language = "english"`, the `agreementText` SHALL not contain Devanagari characters.

**Validates: Requirements 1.4, 1.5**

---

### Property 4: Successful generation creates a draft document

*For any* valid `AgreementGenerateRequest` that results in a successful GPT response, the created `RentAgreement` document SHALL have `status = "draft"` and a non-empty `agreementText`.

**Validates: Requirements 1.7**

---

### Property 5: Data fidelity invariant

*For any* valid `AgreementGenerateRequest`, the `agreementText` stored in the `RentAgreement` document SHALL contain the exact values submitted for `tenantName`, `ownerName`, `propertyAddress`, `monthlyRent`, `startDate`, and `endDate`.

**Validates: Requirements 1.8, 3.4**

---

### Property 6: OTP verification gates signing

*For any* `POST /api/agreements/[id]/sign` request that is missing an OTP, contains an invalid OTP, or contains an expired OTP, the endpoint SHALL return HTTP 401, SHALL NOT record a signature, and SHALL NOT advance the `Agreement_Status`. The `RentAgreement` document SHALL be identical before and after the rejected request.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 7: Status transitions are correct and monotonic

*For any* `RentAgreement` in `pending_tenant` status, a valid tenant signing request SHALL advance status to `pending_owner`. *For any* agreement in `pending_owner` status, a valid owner signing request SHALL advance status to `fully_signed`. *For any* sequence of valid signing operations, the status SHALL never revert to a prior state in the sequence `draft → pending_tenant → pending_owner → fully_signed`.

**Validates: Requirements 2.4, 2.5, 2.6**

---

### Property 8: PDF content fidelity across all signing stages

*For any* `RentAgreement` document, the PDF rendered by `AgreementPDF` SHALL contain the values of `tenantName`, `ownerName`, `propertyAddress`, `monthlyRent`, `startDate`, and `endDate` identical to those stored in MongoDB. *For any* `fully_signed` agreement, the PDF SHALL also contain both `tenantSignature`, `ownerSignature`, `tenantSignedAt`, and `ownerSignedAt`. *For any* agreement not in `fully_signed` status, unsigned party slots SHALL display "Pending signature". The rendered PDF byte length SHALL be greater than 0 for all valid agreements.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

---

### Property 9: NLP_Filters schema compatibility

*For any* non-empty natural language query sent to `POST /api/ai/search`, the returned `filters` object SHALL only contain keys that are valid fields in the `Filters` interface of `propertyStore.ts` (`city`, `minPrice`, `maxPrice`, `bedrooms`, `propertyType`, `keywords`/`search`, `nearLocation`). When the query contains a price in INR format (₹N, Nk, N thousand), `maxPrice` SHALL equal the numeric INR value. When the query contains a BHK count (1BHK, 2BHK, etc.), `bedrooms` SHALL equal the corresponding integer.

**Validates: Requirements 4.3, 4.4, 4.5, 4.7**

---

### Property 10: AISearchBar filter mapping

*For any* successful `AI_Search_API` response containing `NLP_Filters`, the `Property_Store` filter fields after `setFilters` is called SHALL match the corresponding `NLP_Filters` values (`city → city`, `maxPrice → maxPrice`, `bedrooms → bedrooms`, `propertyType → propertyType`, `keywords → search`, `nearLocation → nearLocation`).

**Validates: Requirements 5.2, 5.3**

---

### Property 11: Clear resets all filters

*For any* `Property_Store` filter state, calling the AISearchBar clear action SHALL set all filter fields (`city`, `minPrice`, `maxPrice`, `bedrooms`, `propertyType`, `search`, `nearLocation`) to empty strings and SHALL trigger `fetchProperties(1)`.

**Validates: Requirements 5.6, 7.1, 7.2**

---

### Property 12: Filter correctness invariant

*For any* set of active `Property_Store` filters, every property returned by `fetchProperties` SHALL satisfy all non-null filter constraints: `city` matches case-insensitively, `price` is within `[minPrice, maxPrice]`, and `bedrooms >= filters.bedrooms`.

**Validates: Requirements 5.7**

---

### Property 13: Search monotonicity (metamorphic)

*For any* two filter states F1 and F2 where F2 adds at least one additional non-null constraint to F1, the count of properties returned for F2 SHALL be less than or equal to the count returned for F1.

**Validates: Requirements 5.8**

---

### Property 14: Idempotence — clearing filters

*For any* `Property_Store` filter state, clearing all filters and calling `fetchProperties(1)` SHALL produce the same property list as calling `fetchProperties(1)` with all filters empty from a fresh store initialization.

**Validates: Requirements 7.4**

---

## Error Handling

### Agreement Generation (`POST /api/agreements/generate`)

| Condition | Response | Side effects |
|---|---|---|
| Missing required field | `400` with field name | None |
| Unauthenticated caller | `401` | None |
| GPT API key not configured | `500` "OpenAI not configured" | None |
| GPT call times out (>15 s) | `504` "Agreement generation timed out" | No document created |
| GPT returns malformed JSON | `500` "Failed to parse agreement" | No document created |
| MongoDB write fails | `500` | No document created |

The handler wraps the GPT call in a `Promise.race` against a 15-second timeout. If the race resolves to the timeout, it returns 504 without creating a document.

### OTP-Verified Signing (`POST /api/agreements/[id]/sign`)

| Condition | Response | Side effects |
|---|---|---|
| Missing `otp` or `email` field | `400` | None |
| OTP not found in store | `401` "Invalid OTP" | None |
| OTP expired | `401` "OTP expired" | OTP deleted from store |
| OTP invalid (wrong code) | `401` "Invalid OTP" | Attempt counter incremented |
| Party already signed | `409` "Already signed" | None |
| Wrong signing order | `409` "Not your turn to sign" | None |
| Agreement not found | `404` | None |
| Caller not a party | `403` | None |

### AI Search (`POST /api/ai/search`)

| Condition | Response | Side effects |
|---|---|---|
| Empty query | `400` "query required" | None |
| GPT returns empty `{}` | `200` `{ filters: {}, originalQuery }` | None |
| GPT returns unparseable JSON | `200` `{ filters: {}, originalQuery }` | None |
| GPT API error | `500` (via `handleApiError`) | None |

The handler wraps `JSON.parse` in a try/catch and falls back to `{}` on parse failure, satisfying Requirement 4.6.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs at specific inputs and integration points
- Property tests verify universal correctness across the full input space

### Property-Based Testing Library

**Library:** `fast-check` (TypeScript-native, works with Jest/Vitest, no additional setup beyond `npm install fast-check --save-dev`)

Each property test runs a minimum of **100 iterations** (fast-check default is 100; set `{ numRuns: 100 }` explicitly).

Each test is tagged with a comment in the format:
```
// Feature: ai-rental-features, Property N: <property_text>
```

### Property Tests

Each correctness property maps to exactly one property-based test:

| Property | Test file | fast-check arbitraries |
|---|---|---|
| P1: Form validation | `__tests__/agreements/generate.test.ts` | `fc.record` with optional fields omitted |
| P2: Required sections | `__tests__/agreements/generate.test.ts` | `fc.record` of valid form inputs |
| P3: Language fidelity | `__tests__/agreements/generate.test.ts` | `fc.constantFrom("hindi", "english")` |
| P4: Draft status on creation | `__tests__/agreements/generate.test.ts` | `fc.record` of valid form inputs |
| P5: Data fidelity | `__tests__/agreements/generate.test.ts` | `fc.record` of valid form inputs |
| P6: OTP gates signing | `__tests__/agreements/sign.test.ts` | `fc.string`, `fc.date` for expired OTPs |
| P7: Status monotonicity | `__tests__/agreements/sign.test.ts` | `fc.record` of agreement + signing sequence |
| P8: PDF content fidelity | `__tests__/agreements/pdf.test.ts` | `fc.record` of AgreementData |
| P9: NLP_Filters schema | `__tests__/ai/search.test.ts` | `fc.string` for queries |
| P10: Filter mapping | `__tests__/search/aiSearchBar.test.ts` | `fc.record` of NLPFilters |
| P11: Clear resets filters | `__tests__/search/aiSearchBar.test.ts` | `fc.record` of Filters |
| P12: Filter correctness | `__tests__/search/propertyStore.test.ts` | `fc.array` of Property + `fc.record` of Filters |
| P13: Search monotonicity | `__tests__/search/propertyStore.test.ts` | `fc.array` of Property + two filter records |
| P14: Idempotence | `__tests__/search/propertyStore.test.ts` | `fc.record` of Filters |

### Unit Tests

Unit tests focus on specific examples, integration points, and error conditions not covered by property tests:

- `POST /api/agreements/generate` — GPT timeout returns 504, GPT error returns 500, missing field returns 400
- `POST /api/agreements/[id]/sign` — expired OTP returns 401 with "OTP expired", duplicate sign returns 409, wrong-order sign returns 409
- `POST /api/ai/search` — unauthenticated request returns 200 (not 401), empty GPT response returns `{ filters: {} }`
- `GET /api/agreements/[id]` — existing document returns 200 (regression)
- `POST /api/agreements` — still uses `generateAgreementText`, not GPT (regression)
- `lib/otpStore.ts` — `verifyOtp` consumes OTP on success, returns correct reason strings

### Test Configuration

```ts
// vitest.config.ts (or jest.config.ts) — no changes needed
// fast-check usage example:
import fc from "fast-check";

test("P5: data fidelity", () => {
  // Feature: ai-rental-features, Property 5: agreementText contains all submitted field values
  fc.assert(
    fc.property(
      fc.record({
        tenantName: fc.string({ minLength: 1 }),
        ownerName: fc.string({ minLength: 1 }),
        propertyAddress: fc.string({ minLength: 1 }),
        monthlyRent: fc.integer({ min: 1 }),
        startDate: fc.string({ minLength: 1 }),
        endDate: fc.string({ minLength: 1 }),
      }),
      (input) => {
        const text = generateAgreementText({ ...input, agreementId: "test", propertyTitle: "Test" });
        return (
          text.includes(input.tenantName) &&
          text.includes(input.ownerName) &&
          text.includes(input.propertyAddress) &&
          text.includes(String(input.monthlyRent))
        );
      }
    ),
    { numRuns: 100 }
  );
});
```
