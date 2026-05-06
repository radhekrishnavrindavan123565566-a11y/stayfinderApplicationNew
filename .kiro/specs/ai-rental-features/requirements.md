# Requirements Document

## Introduction

This spec covers two high-impact AI features for Nestora, a rental marketplace serving Uttar Pradesh, India, built on Next.js 16, MongoDB, and GPT-4o-mini.

**Feature 1 — AI-Powered Lease Agreement Generator**: Tenants and owners fill a structured form; GPT-4o-mini generates a legally-structured rental agreement in Hindi or English. Both parties sign digitally with OTP verification. The signed agreement is stored and downloadable as a PDF.

**Feature 2 — Conversational Property Search (NLP → Filters)**: Any visitor types a natural language query (e.g. "2BHK near Allahabad University under ₹8000 with WiFi"); GPT extracts structured filters; matching properties are fetched and displayed. The existing `AISearchBar` component and `/api/ai/search` route are already present but the API currently blocks unauthenticated users — this spec closes that gap and wires the full flow.

Both features must leave existing agreements, the manual `SearchBar`, property listings, and the `/api/agreements/[id]/sign` endpoint fully intact.

---

## Glossary

- **Agreement_Generator**: The new GPT-4o-mini powered service that produces `agreementText` from structured form inputs.
- **Agreement_Form**: The UI form that collects tenant name, owner name, property details, rent, dates, and language preference before generation.
- **OTP_Service**: The existing `/api/auth/send-otp` and `/api/auth/phone-otp` infrastructure used to verify a party's phone number before they can sign.
- **Sign_API**: The existing `POST /api/agreements/[id]/sign` endpoint that records a party's signature and advances the agreement status.
- **Agreement_Status**: The state machine value on a `RentAgreement` document: `draft` → `pending_tenant` → `pending_owner` → `fully_signed`.
- **PDF_Renderer**: The `@react-pdf/renderer` library (already in `package.json`) used client-side to render and download the agreement as a PDF.
- **AI_Search_API**: The existing `POST /api/ai/search` route that calls GPT-4o-mini to parse a natural language query into structured property filters.
- **AI_SearchBar**: The existing `AISearchBar` React component (`components/search/AISearchBar.tsx`) that calls `AI_Search_API` and updates `Property_Store`.
- **Property_Store**: The Zustand store (`store/propertyStore.ts`) that holds filters and fetches properties from `/api/properties`.
- **NLP_Filters**: The structured JSON object extracted by GPT from a natural language query, containing optional fields: `city`, `minPrice`, `maxPrice`, `bedrooms`, `propertyType`, `amenities`, `keywords`, `nearLocation`.
- **Visitor**: Any user of the Nestora platform, authenticated or unauthenticated.
- **Party**: Either the tenant or the owner on a specific `RentAgreement` document.

---

## Requirements

### Requirement 1: AI Lease Agreement Generation

**User Story:** As a tenant or owner, I want to fill a form and have GPT generate a legally-structured rental agreement, so that I do not need to draft legal text manually.

#### Acceptance Criteria

1. THE `Agreement_Form` SHALL collect the following fields before generation: tenant full name, owner full name, property title, property address, monthly rent (₹), lease start date, lease end date, and language preference (Hindi or English).
2. WHEN the user submits the `Agreement_Form` with all required fields, THE `Agreement_Generator` SHALL call GPT-4o-mini and return a complete `agreementText` within 15 seconds.
3. THE `Agreement_Generator` SHALL include all of the following sections in every generated agreement: parties, property details, monthly rent, lease duration, payment terms, security deposit, maintenance responsibilities, termination clause, and governing law (India).
4. WHERE the user selects Hindi as the language preference, THE `Agreement_Generator` SHALL produce `agreementText` with all section headings and body text in Hindi (Devanagari script).
5. WHERE the user selects English as the language preference, THE `Agreement_Generator` SHALL produce `agreementText` with all section headings and body text in English.
6. IF the GPT-4o-mini API call fails or times out, THEN THE `Agreement_Generator` SHALL return an error response with a human-readable message and SHALL NOT create a `RentAgreement` document.
7. WHEN `agreementText` is successfully generated, THE `Agreement_Generator` SHALL create a `RentAgreement` document with `status` set to `draft` and store `agreementText` in the document.
8. FOR ALL valid `Agreement_Form` inputs, the generated `agreementText` SHALL contain the exact tenant name, owner name, property address, monthly rent value, start date, and end date that were submitted in the form (data fidelity invariant).

---

### Requirement 2: OTP-Verified Digital Signing

**User Story:** As a tenant or owner, I want to verify my identity with an OTP before signing the agreement, so that signatures are authenticated and legally defensible.

#### Acceptance Criteria

1. WHEN a Party attempts to sign a `RentAgreement`, THE `Sign_API` SHALL require a valid OTP that was issued to the Party's registered phone number within the preceding 10 minutes.
2. IF a Party submits a signing request without a valid OTP token, THEN THE `Sign_API` SHALL return HTTP 401 and SHALL NOT record the signature or advance the `Agreement_Status`.
3. IF a Party submits an expired OTP (older than 10 minutes), THEN THE `Sign_API` SHALL return HTTP 401 with the message "OTP expired" and SHALL NOT record the signature.
4. WHEN the tenant signs a `RentAgreement` whose `Agreement_Status` is `pending_tenant`, THE `Sign_API` SHALL record `tenantSignature`, set `tenantSignedAt` to the current UTC timestamp, and advance `Agreement_Status` to `pending_owner`.
5. WHEN the owner signs a `RentAgreement` whose `Agreement_Status` is `pending_owner`, THE `Sign_API` SHALL record `ownerSignature`, set `ownerSignedAt` to the current UTC timestamp, and advance `Agreement_Status` to `fully_signed`.
6. THE `Agreement_Status` SHALL only advance forward through the sequence `draft` → `pending_tenant` → `pending_owner` → `fully_signed` and SHALL never revert to a prior state (status monotonicity invariant).
7. IF a Party who has already signed attempts to sign again, THEN THE `Sign_API` SHALL return HTTP 409 and SHALL NOT overwrite the existing signature or timestamp.

---

### Requirement 3: Signed PDF Storage and Download

**User Story:** As a tenant or owner, I want to download the signed agreement as a PDF, so that I have a portable legal record.

#### Acceptance Criteria

1. WHEN a `RentAgreement` reaches `Agreement_Status` of `fully_signed`, THE `PDF_Renderer` SHALL be able to generate a downloadable PDF containing all agreement sections, both party signatures, and both `signedAt` timestamps.
2. THE `PDF_Renderer` SHALL embed the tenant's typed signature and the owner's typed signature in the PDF's Signatures section, each accompanied by the corresponding `signedAt` date and time.
3. WHEN a Party downloads the PDF for a `fully_signed` agreement, THE `PDF_Renderer` SHALL produce a non-empty PDF file (byte length > 0).
4. FOR ALL `RentAgreement` documents, the `agreementText` stored in MongoDB and the content rendered in the PDF SHALL contain identical values for tenant name, owner name, property address, monthly rent, start date, and end date (round-trip fidelity property).
5. WHILE a `RentAgreement` has `Agreement_Status` other than `fully_signed`, THE `PDF_Renderer` SHALL still render the PDF with "Pending signature" placeholders for unsigned parties, allowing partial download at any stage.
6. IF `pdfUrl` is set on the `RentAgreement` document, THEN THE `Agreement_Generator` SHALL serve the stored URL as the canonical download link rather than regenerating the PDF on every request.

---

### Requirement 4: Conversational Property Search — API (NLP → Filters)

**User Story:** As a Visitor, I want to type a natural language description of what I'm looking for, so that I can search for properties without filling in multiple filter fields manually.

#### Acceptance Criteria

1. THE `AI_Search_API` SHALL accept requests from unauthenticated Visitors (no JWT required) and SHALL NOT return HTTP 401 for anonymous callers.
2. WHEN a Visitor sends a non-empty natural language query to `AI_Search_API`, THE `AI_Search_API` SHALL call GPT-4o-mini and return a `NLP_Filters` JSON object within 10 seconds.
3. THE `AI_Search_API` SHALL extract at least the following fields from a query when they are present: `city`, `maxPrice`, `bedrooms`, `amenities`, and `nearLocation`.
4. IF the query contains a price expressed in Indian Rupees (e.g. "₹8000", "8 thousand", "8k"), THEN THE `AI_Search_API` SHALL parse it as a numeric value in INR and set `maxPrice` accordingly.
5. IF the query contains a bedroom count expressed as "1BHK", "2BHK", "3BHK", or a plain number followed by "bedroom" or "room", THEN THE `AI_Search_API` SHALL set `bedrooms` to the corresponding integer.
6. IF GPT-4o-mini returns an empty object or unparseable JSON, THEN THE `AI_Search_API` SHALL return `{ filters: {}, originalQuery: <query> }` with HTTP 200 and SHALL NOT return an error status.
7. FOR ALL valid natural language queries, the `NLP_Filters` returned by `AI_Search_API` SHALL be a strict subset of the filter schema accepted by `/api/properties` (schema compatibility invariant).

---

### Requirement 5: Conversational Property Search — UI Integration

**User Story:** As a Visitor on the properties page, I want the AI search bar to trigger a live property search, so that I see matching results immediately without navigating away.

#### Acceptance Criteria

1. THE `AI_SearchBar` SHALL be visible and interactive on the `/properties` page for all Visitors, regardless of authentication state.
2. WHEN a Visitor submits a query via `AI_SearchBar`, THE `AI_SearchBar` SHALL call `AI_Search_API`, map the returned `NLP_Filters` to `Property_Store` filter fields, and call `fetchProperties(1)` to reload the property grid.
3. WHEN `AI_SearchBar` updates `Property_Store` filters, THE `SearchBar` (manual compact bar) SHALL reflect the same filter values in its own inputs so both bars remain in sync.
4. WHILE the `AI_Search_API` call is in progress, THE `AI_SearchBar` SHALL display a loading indicator and SHALL disable the search button to prevent duplicate submissions.
5. IF `AI_Search_API` returns an empty `NLP_Filters` object, THEN THE `AI_SearchBar` SHALL call `fetchProperties(1)` with no filters applied and SHALL display all available properties.
6. WHEN a Visitor clears the `AI_SearchBar` input, THE `AI_SearchBar` SHALL reset all `Property_Store` filters to empty strings and call `fetchProperties(1)`, restoring the default property listing.
7. WHEN `AI_SearchBar` sets filters in `Property_Store`, THE resulting property list SHALL only contain properties that satisfy all non-null filter constraints (city case-insensitive match, price within `[minPrice, maxPrice]`, `bedrooms >= NLP_Filters.bedrooms`) — filter correctness invariant.
8. FOR ALL queries Q1 and Q2 where Q2 adds additional constraints to Q1, the result count for Q2 SHALL be less than or equal to the result count for Q1 (monotonicity / metamorphic property).

---

### Requirement 6: Backward Compatibility — Existing Agreements

**User Story:** As a tenant or owner with an existing agreement, I want my current agreement to continue working exactly as before, so that the new AI generation feature does not disrupt active leases.

#### Acceptance Criteria

1. THE `Sign_API` (`POST /api/agreements/[id]/sign`) SHALL continue to accept the existing `{ signature: string }` request body and SHALL function identically for agreements created before this feature is deployed.
2. THE `generateAgreementText` function in `lib/agreementTemplate.ts` SHALL remain unchanged and SHALL continue to produce valid `agreementText` for all existing callers (the `POST /api/agreements` route that creates agreements from a `bookingId`).
3. WHEN the `POST /api/agreements` route creates an agreement from a `bookingId`, THE route SHALL continue to use `generateAgreementText` and SHALL NOT invoke the `Agreement_Generator` GPT call.
4. THE `AgreementPDF` React component in `lib/agreementTemplate.ts` SHALL continue to render correctly for all `RentAgreement` documents regardless of whether `agreementText` was generated by GPT or by `generateAgreementText`.
5. FOR ALL existing `RentAgreement` documents in MongoDB, a GET request to `/api/agreements/[id]` SHALL return HTTP 200 with the full populated agreement (regression invariant).

---

### Requirement 7: Backward Compatibility — Property Search

**User Story:** As a Visitor using the manual search bar, I want my existing keyword and filter-based search to continue working after the AI search feature is integrated, so that I am not forced to use natural language.

#### Acceptance Criteria

1. THE `SearchBar` component SHALL continue to operate independently of `AI_SearchBar` — a manual search SHALL overwrite any AI-set filters in `Property_Store` and trigger a fresh `fetchProperties(1)` call.
2. WHEN a Visitor uses the manual `SearchBar` after a prior AI search, THE `Property_Store` filters set by the manual search SHALL fully replace the filters set by the AI search (no stale AI filter leakage).
3. THE `/api/properties` GET endpoint SHALL continue to accept all existing query parameters (`search`, `city`, `minPrice`, `maxPrice`, `propertyType`, `bedrooms`, `nearLocation`, `page`) without modification.
4. WHILE no search query or filters are active, THE `Property_Store` SHALL display all available properties sorted by boost and recency, identical to the pre-feature behavior (idempotence invariant: clearing all filters and fetching produces the same result as a fresh page load).
5. IF the `AI_Search_API` call fails (network error or 5xx), THEN THE `AI_SearchBar` SHALL display a toast error message and SHALL NOT modify the current `Property_Store` filters, leaving the existing search results intact.
