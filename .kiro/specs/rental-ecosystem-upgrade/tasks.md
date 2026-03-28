# Implementation Plan: Rental Ecosystem Upgrade

## Overview

Incremental implementation of 15 feature clusters on top of the existing Next.js 16 / Mongoose / Zustand / Tailwind v4 / Socket.io / Stripe stack. Each cluster builds on the previous ones. All code lives inside `roomrentalpplication/`. All `cn` imports use `@/utils/cn`.

## Tasks

- [x] 1. Install dependencies and extend data models
  - [x] 1.1 Install new npm packages
    - Run `npm install openai @react-pdf/renderer` inside `roomrentalpplication/`
    - _Requirements: 12.1, 10.2_

  - [x] 1.2 Create `models/UserPreferences.ts`
    - Fields: userId (ref User), budget {min, max}, preferredBedrooms, preferredAmenities[], preferredCities[], tenantType enum, recentlyViewed[] (max 20, {propertyId, viewedAt}), savedSearches[] (embedded: filters, alertEnabled, lastAlertedAt)
    - _Requirements: 1.1, 8.1, 11.7_

  - [x] 1.3 Create `models/EcosystemService.ts` and `models/ServiceBooking.ts`
    - EcosystemService: type enum, title, description, price, priceUnit enum, availableCities[], isActive
    - ServiceBooking: bookingId (ref Booking), serviceId (ref EcosystemService), tenantId (ref User), scheduledDate, status enum, totalPrice, paymentStatus, notes
    - _Requirements: 2.1, 2.3_

  - [x] 1.4 Create `models/ChatAction.ts`
    - Fields: conversationId, initiatorId (ref User), receiverId (ref User), type enum, status enum, payload (Mixed), expiresAt
    - _Requirements: 4.2, 4.3_

  - [x] 1.5 Create `models/RentAgreement.ts`
    - Fields: bookingId (ref Booking), propertyId (ref Property), tenantId (ref User), ownerId (ref User), agreementText, pdfUrl, tenantSignature, ownerSignature, tenantSignedAt, ownerSignedAt, status enum, validFrom, validUntil
    - _Requirements: 10.1, 10.3, 10.6_

  - [x] 1.6 Create `models/LocalityReview.ts` and `models/LocalityQA.ts`
    - LocalityReview: userId (ref User), city, locality, ratings {safety, connectivity, amenities, cleanliness, overall} (1–5), comment
    - LocalityQA: city, locality, question, askedBy (ref User), answers[] {userId, answer, upvotes, createdAt}
    - _Requirements: 14.1, 14.3_

  - [x] 1.7 Create `models/Dispute.ts`
    - Fields: bookingId (ref Booking), raisedBy (ref User), reason enum, description, evidence[], status enum, adminNotes, resolution, resolvedAt
    - _Requirements: 15.4, 15.7_

  - [x] 1.8 Extend `models/Property.ts` with new fields
    - Add: locationIntelligence {nearbyAmenities[], safetyScore, safetyLabel, lastUpdated}, priceIntelligence {cityAvgPrice, fairPriceRange, pricePosition, percentageDiff, trend[], lastUpdated}, viewCount, weeklyBookings, unitCount
    - _Requirements: 5.1, 9.1, 9.4, 8.2, 13.5_

  - [x] 1.9 Extend `models/Booking.ts` with new fields
    - Add: moveInConfirmation {tenantConfirmedAt, ownerConfirmedAt, status enum, checkInPhotos[]}, disputeId (ref Dispute)
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 1.10 Extend `models/User.ts` with new fields
    - Add: tenantVerified, tenantVerificationDoc, fraudRiskLevel enum, profileCompleteness, trustBadges[]
    - _Requirements: 3.1, 3.3_

- [x] 2. Decision Engine — match score, preferences, and UI
  - [x] 2.1 Create `app/api/user/preferences/route.ts` (GET + PUT)
    - GET returns the authenticated user's UserPreferences (create with defaults if missing)
    - PUT upserts budget, preferredBedrooms, preferredAmenities, preferredCities, tenantType
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Create `app/api/properties/[id]/match-score/route.ts` (GET)
    - Implement `computeMatchScore(property, preferences)` inline: budget (25 pts), bedrooms (20 pts), amenities (20 pts), location (20 pts), tenantType (15 pts)
    - Return {score, reasons, tags, breakdown}; return score 0 + prompt message when no preferences exist
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.8_

  - [ ]* 2.3 Write property test for computeMatchScore
    - **Property 1: Score bounds** — for any valid property and preferences, score ∈ [0, 100]
    - **Property 2: Breakdown sum** — breakdown.budget + breakdown.bedrooms + breakdown.amenities + breakdown.location + breakdown.tenantType === score
    - **Property 3: Non-empty reasons** — score > 0 implies reasons.length > 0
    - **Validates: Requirements 1.2, 1.3, 1.5**

  - [x] 2.4 Create `store/preferencesStore.ts` (Zustand)
    - State: preferences, isLoading; actions: fetchPreferences, updatePreferences
    - _Requirements: 1.1_

  - [x] 2.5 Create `components/properties/MatchScoreBadge.tsx`
    - Displays score as a colored badge (green ≥70, yellow ≥40, red <40) with a "Why?" button
    - Fetches match score from `/api/properties/[id]/match-score` on mount
    - _Requirements: 1.2, 1.7_

  - [x] 2.6 Create `components/properties/WhyThisProperty.tsx` modal
    - Shows score breakdown bars and reason strings; triggered by MatchScoreBadge "Why?" button
    - _Requirements: 1.7_

  - [x] 2.7 Create `components/properties/SmartTags.tsx`
    - Renders Smart_Tag chips returned from match-score API
    - _Requirements: 1.6_

  - [x] 2.8 Create `app/dashboard/preferences/page.tsx`
    - Form to set budget range, preferred bedrooms, amenities checkboxes, preferred cities, tenantType
    - Calls PUT `/api/user/preferences` on submit
    - _Requirements: 1.1, 1.4_

  - [x] 2.9 Integrate MatchScoreBadge and SmartTags into property listing cards and property detail page
    - Add to `components/properties/PropertyCard.tsx` and `app/properties/[id]/page.tsx`
    - _Requirements: 1.2, 1.6_

- [ ] 3. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 4. Trust Layer — fraud risk, profile completeness, and trust badges
  - [x] 4.1 Create `lib/trust.ts`
    - Implement `computeProfileCompleteness(user)`: weighted fields (avatar 15, username 10, email 10, phone 15, bio 10, ownerVerified 20, tenantVerified 20) → 0–100
    - Implement `assessFraudRisk(userId, propertyId?)`: account age, review count, verification status, price anomaly → {level, signals}; cache result 1 hour in-memory Map
    - _Requirements: 3.1, 3.3, 3.4, 3.7_

  - [ ]* 4.2 Write property test for trust functions
    - **Property 4: Completeness bounds** — computeProfileCompleteness returns value in [0, 100] for any user
    - **Property 5: High risk implies high signal** — when level is "high", at least one signal has severity "high"
    - **Validates: Requirements 3.1, 3.4**

  - [x] 4.3 Create `app/api/trust/route.ts` (GET `?userId=`)
    - Admin-only: returns full {level, signals}; non-admin: returns only badge indicator
    - _Requirements: 3.3, 3.8_

  - [x] 4.4 Create `components/trust/TrustProfile.tsx`
    - Displays profile completeness progress bar, trust badges (verified_owner, verified_tenant, safe_deal_guarantee, top_rated, quick_responder), and fraud risk badge (medium/high only, no detail for non-admins)
    - _Requirements: 3.2, 3.5, 3.6_

  - [x] 4.5 Integrate TrustProfile into `app/profile/page.tsx` and property detail owner section
    - _Requirements: 3.2, 3.5_

- [x] 5. Price Intelligence — fair price labels and trend chart
  - [x] 5.1 Create `app/api/properties/price-intelligence/route.ts` (POST, admin/cron only)
    - Accepts {propertyId} or runs for all properties; computes cityAvgPrice from existing Property data, sets fairPriceRange, pricePosition, percentageDiff, appends trend point for current month
    - Updates Property.priceIntelligence fields
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 5.2 Create `components/properties/PriceIntelligence.tsx`
    - Shows "Fair Price" / "Above Average" / "Below Average" label with percentage diff
    - Renders a simple line chart (using SVG or a lightweight approach) for the 12-month trend array
    - _Requirements: 5.2, 5.3, 5.5_

  - [x] 5.3 Integrate PriceIntelligence into `app/properties/[id]/page.tsx`
    - Reads priceIntelligence from the property detail API response
    - _Requirements: 5.5, 5.6_

- [x] 6. Location Intelligence — nearby amenities and safety score
  - [x] 6.1 Create `app/api/properties/[id]/location-intelligence/route.ts` (PUT, owner/admin)
    - Accepts {nearbyAmenities[], safetyScore, safetyLabel} and writes to Property.locationIntelligence
    - _Requirements: 9.1, 9.2, 9.4_

  - [x] 6.2 Create `components/properties/LocationIntelligence.tsx`
    - Displays grouped nearby amenities (icons by type, distance, walk time) and safety score badge
    - _Requirements: 9.3, 9.5_

  - [x] 6.3 Integrate LocationIntelligence into `app/properties/[id]/page.tsx`
    - _Requirements: 9.3, 9.5_

- [x] 7. Emotional UX — recently viewed, view count, and urgency signals
  - [x] 7.1 Create `app/api/properties/[id]/view/route.ts` (POST)
    - Increments Property.viewCount; if authenticated, upserts recentlyViewed entry in UserPreferences (FIFO max 20)
    - _Requirements: 8.2, 8.1_

  - [x] 7.2 Extend Socket.io server (`server.ts` or socket handler) with property viewer room logic
    - On "property:view" event: add socket to room `property:{id}`, increment in-memory viewerCount, broadcast "property:viewers" {propertyId, count}
    - On "property:leave" / disconnect: decrement count, broadcast update; remove stale viewers within 30s via disconnect handler
    - _Requirements: 8.4, 13.1, 13.2, 13.3, 13.4, 8.7_

  - [x] 7.3 Create `components/properties/UrgencySignals.tsx`
    - Subscribes to "property:viewers" Socket.io event; displays "X people viewing now", "Booked N times this week", and "Limited availability" when unitCount is low
    - _Requirements: 8.5, 8.6, 13.5, 13.6_

  - [x] 7.4 Create `components/home/RecentlyViewed.tsx`
    - Fetches recently viewed property IDs from UserPreferences store; renders horizontal scroll of PropertyCards
    - _Requirements: 8.3_

  - [x] 7.5 Integrate UrgencySignals into `app/properties/[id]/page.tsx` and RecentlyViewed into `app/page.tsx`
    - Call POST `/api/properties/[id]/view` on property page mount
    - _Requirements: 8.2, 8.3, 8.5_

- [x] 8. Availability Intelligence — demand heatmap
  - [x] 8.1 Extend `app/api/properties/[id]/availability/route.ts` (GET)
    - Add demandHeatmap to response: compute from booking request counts per date (>3x normal = "high", >1.5x = "medium", else "low")
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 8.2 Extend existing `AvailabilityCalendar` component
    - Read demandHeatmap from availability API; apply color classes to calendar dates (high = red tint, medium = yellow tint)
    - _Requirements: 7.2, 7.3_

- [ ] 9. Smart Owner Tools — demand insights dashboard widget
  - [ ] 9.1 Create `app/api/properties/[id]/demand-insights/route.ts` (GET, owner/admin only)
    - Returns: cityDemandScore (bookings in city / max possible × 100), peakMonths (top 3 months by booking count), bestListingTime string, competitorCount (same city + type), avgOccupancyRate, ownerOccupancyRate, viewsThisWeek (from viewCount delta), wishlistsThisWeek
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.2 Create `components/analytics/DemandInsights.tsx`
    - Displays demand score gauge, peak months chips, best listing time callout, occupancy comparison bar, and weekly stats
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ] 9.3 Integrate DemandInsights into `app/dashboard/analytics/page.tsx`
    - Render per selected property; fetch from demand-insights API
    - _Requirements: 6.2_

- [ ] 10. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Chat as Transaction Engine — action toolbar and action cards
  - [ ] 11.1 Create `app/api/chat/actions/route.ts` (POST)
    - Validate initiator is a conversation participant; create ChatAction with status "pending", expiresAt = now + 48h; emit "chat:action" via Socket.io to receiver
    - _Requirements: 4.2, 4.6, 4.8_

  - [ ] 11.2 Create `app/api/chat/actions/[id]/respond/route.ts` (POST)
    - Accept {accepted: boolean}; update ChatAction status to "accepted" or "rejected"; emit "chat:action:response" to initiator via Socket.io
    - _Requirements: 4.4, 4.5, 4.8_

  - [ ] 11.3 Create a cron/cleanup route `app/api/chat/actions/expire/route.ts` (POST)
    - Sets status "expired" on all ChatActions where expiresAt < now and status = "pending"
    - _Requirements: 4.3_

  - [ ] 11.4 Create `components/chat/ChatActionBar.tsx`
    - Renders four action buttons: Schedule Visit, Send Offer, Generate Agreement, Confirm Booking
    - Each opens a small modal to collect payload data, then calls POST `/api/chat/actions`
    - _Requirements: 4.1, 4.2_

  - [ ] 11.5 Create `components/chat/OfferCard.tsx` and `components/chat/VisitCard.tsx`
    - Render action cards inside the chat message list for both parties
    - Show Accept / Reject buttons for the receiver; show status badge for the initiator
    - When offer is accepted, show "Confirm Booking" CTA for tenant
    - _Requirements: 4.2, 4.4, 4.5, 4.7_

  - [ ] 11.6 Extend `store/chatStore.ts` with chatActions state and socket listeners
    - Add chatActions: Record<conversationId, ChatAction[]>; listen for "chat:action" and "chat:action:response" socket events
    - _Requirements: 4.4, 4.5_

  - [ ] 11.7 Integrate ChatActionBar and action cards into `components/chat/ChatWindow.tsx`
    - Render ChatActionBar above the input; render OfferCard/VisitCard inline in message list when message type is "action"
    - _Requirements: 4.1, 4.2_

- [ ] 12. Rental Ecosystem Services — catalog and booking
  - [ ] 12.1 Create `app/api/ecosystem/services/route.ts` (GET)
    - Returns active EcosystemServices filtered by city query param
    - Seed 4 sample services (cleaning, maintenance, moving, furniture_rental) if collection is empty
    - _Requirements: 2.1, 2.2, 2.6_

  - [ ] 12.2 Create `app/api/ecosystem/bookings/route.ts` (POST)
    - Creates ServiceBooking with status "pending"; initiates Stripe PaymentIntent; on webhook success updates to "confirmed" + "paid"; on failure retains "pending" and notifies tenant
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [ ] 12.3 Create `components/booking/EcosystemServices.tsx`
    - Fetches services for the booking's city; renders service cards with "Book" button; shows booking confirmation inline
    - _Requirements: 2.2, 2.3_

  - [ ] 12.4 Integrate EcosystemServices into the booking confirmation page (`app/dashboard/bookings/page.tsx` or booking detail)
    - _Requirements: 2.2_

- [ ] 13. Legal and Agreement Automation — PDF generation and e-signature
  - [ ] 13.1 Create `lib/agreementTemplate.tsx`
    - React PDF document component using `@react-pdf/renderer` with placeholders for tenant name, owner name, property address, rent amount, duration, validFrom, validUntil
    - _Requirements: 10.1, 10.2_

  - [ ] 13.2 Create `app/api/agreements/route.ts` (POST)
    - Validate booking status is "approved" (return 400 otherwise); fetch booking + property + users; call `renderToBuffer` from `@react-pdf/renderer`; upload buffer to Cloudinary; create RentAgreement with status "pending_tenant"
    - On PDF generation failure: save agreement as "draft" without pdfUrl
    - _Requirements: 10.1, 10.2, 10.3, 10.9, 10.10, 10.11_

  - [ ]* 13.3 Write property test for agreement creation preconditions
    - **Property 6: Booking status gate** — POST /api/agreements with non-approved booking always returns 400
    - **Property 7: Signing user validation** — signAgreement rejects userId not in {tenantId, ownerId}
    - **Validates: Requirements 10.7, 10.10**

  - [ ] 13.4 Create `app/api/agreements/[id]/sign/route.ts` (POST)
    - Validate userId is tenantId or ownerId; record signature + timestamp; advance status (pending_tenant → pending_owner → fully_signed); on fully_signed trigger escrow release exactly once
    - _Requirements: 10.4, 10.5, 10.6, 10.7, 10.11_

  - [ ] 13.5 Create `app/api/agreements/[id]/route.ts` (GET)
    - Returns RentAgreement document; includes pdfUrl for download
    - _Requirements: 10.8, 10.11, 10.12_

  - [ ] 13.6 Create `app/agreements/[id]/page.tsx` (AgreementPage)
    - Shows agreement text, PDF download link, e-signature input (typed name or drawn), and Sign button
    - Calls POST `/api/agreements/[id]/sign`; shows status progression (pending_tenant → pending_owner → fully_signed)
    - _Requirements: 10.3, 10.4, 10.5, 10.8_

- [ ] 14. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Smart Notifications — price drop alerts and saved search alerts
  - [ ] 15.1 Create `app/api/alerts/dispatch/route.ts` (POST, cron-triggered)
    - Price drop: find properties updated in last hour with price decrease ≥5%; notify all wishlisted users; skip if (userId, propertyId) notified within 24h
    - Saved search: find new properties in last hour; match against alertEnabled SavedSearches; notify matching users; update lastAlertedAt
    - Enforce max 5 notifications per user per day
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 15.2 Write property test for alert dispatch invariants
    - **Property 8: Price drop direction** — all dispatched price drop notifications have newPrice < previousPrice
    - **Property 9: No duplicate alerts** — running dispatch twice within 24h for same (userId, propertyId) produces at most 1 notification
    - **Validates: Requirements 11.5, 11.8**

  - [ ] 15.3 Extend `app/dashboard/preferences/page.tsx` with SavedSearch UI
    - Add section to create/edit/delete SavedSearch entries with filter fields and alert toggle
    - Calls PUT `/api/user/preferences` to persist savedSearches
    - _Requirements: 11.7_

- [ ] 16. AI Features — natural language search and description generator
  - [ ] 16.1 Create `lib/openai.ts`
    - Initialize OpenAI client from `process.env.OPENAI_API_KEY`; export `parseSearchQuery(query)` and `generateDescription(request)` helpers with try/catch fallbacks
    - _Requirements: 12.1, 12.4, 12.7_

  - [ ] 16.2 Create `app/api/ai/search/route.ts` (POST)
    - Sanitize + truncate input to 500 chars; call `parseSearchQuery`; return {parsedFilters, confidence}; on failure return {parsedFilters: {}, confidence: 0}
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.9_

  - [ ]* 16.3 Write property test for AI search parsing
    - **Property 10: Confidence bounds** — confidence ∈ [0, 1] for any input
    - **Property 11: High confidence implies filters** — confidence > 0.5 implies at least one parsedFilters field is non-null
    - **Validates: Requirements 12.2, 12.3**

  - [ ] 16.4 Create `app/api/ai/generate-description/route.ts` (POST)
    - Rate-limit to 10 req/min per owner (in-memory counter); call `generateDescription`; validate output is 100–300 words; on failure return template string
    - _Requirements: 12.6, 12.7, 12.8, 12.9_

  - [ ] 16.5 Create `components/search/AISearchBar.tsx`
    - Text input that calls POST `/api/ai/search`; on success populates the property listing filter state; on failure shows "AI search unavailable" toast
    - _Requirements: 12.1, 12.4_

  - [ ] 16.6 Create `components/properties/AIDescriptionGenerator.tsx`
    - Button on the property creation form that calls POST `/api/ai/generate-description` with current form values; inserts returned text into the description field
    - _Requirements: 12.6, 12.7_

  - [ ] 16.7 Integrate AISearchBar into `app/properties/page.tsx` and AIDescriptionGenerator into `app/dashboard/properties/new/page.tsx`
    - _Requirements: 12.1, 12.6_

- [ ] 17. Community Layer — locality reviews and Q&A
  - [ ] 17.1 Create `app/api/community/locality-reviews/route.ts` (GET + POST)
    - GET: filter by city + locality query params, return reviews with aggregate ratings
    - POST: validate auth; validate ratings 1–5; create LocalityReview
    - _Requirements: 14.1, 14.2, 14.6_

  - [ ] 17.2 Create `app/api/community/locality-qa/route.ts` (GET + POST)
    - GET: filter by city + locality; return QA threads
    - POST question: create LocalityQA; POST answer (via `?action=answer`): append answer with upvotes 0; POST upvote (via `?action=upvote`): increment answer upvote count
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

  - [ ] 17.3 Create `components/community/LocalityReviews.tsx`
    - Displays aggregate rating bars and individual review cards; includes a "Write a Review" form
    - _Requirements: 14.1, 14.2_

  - [ ] 17.4 Create `components/community/LocalityQA.tsx`
    - Displays Q&A threads with answer list, upvote buttons, and "Ask a Question" / "Add Answer" forms
    - _Requirements: 14.3, 14.4, 14.5_

  - [ ] 17.5 Integrate LocalityReviews and LocalityQA into `app/properties/[id]/page.tsx`
    - Pass property.location.city and property.location.address (locality) as props
    - _Requirements: 14.2_

- [ ] 18. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Zero Risk Rental System — move-in confirmation and disputes
  - [ ] 19.1 Create `app/api/bookings/[id]/move-in-confirm/route.ts` (POST)
    - Authenticated tenant or owner calls this; update MoveInConfirmation status (tenant_confirmed / owner_confirmed / both_confirmed); on both_confirmed trigger escrow release
    - Tenant can upload checkInPhotos (Cloudinary URLs array)
    - _Requirements: 15.1, 15.2, 15.3, 15.10_

  - [ ] 19.2 Create `app/api/disputes/route.ts` (POST)
    - Validate booking escrow not already released (return 409 if so); create Dispute with status "open"; link disputeId to Booking
    - _Requirements: 15.4, 15.8, 15.9_

  - [ ] 19.3 Create `app/api/disputes/[id]/route.ts` (GET + PATCH)
    - GET: return dispute (tenant sees own, admin sees all)
    - PATCH (admin only): update status, adminNotes, resolution; on "resolved_refund" initiate Stripe refund via existing payments/release logic
    - _Requirements: 15.6, 15.7, 15.9_

  - [ ]* 19.4 Write property test for dispute and escrow invariants
    - **Property 12: Dispute window** — POST /api/disputes after escrow release always returns 409
    - **Property 13: Refund implies resolved_refund** — PATCH to resolved_refund always triggers exactly one Stripe refund call
    - **Validates: Requirements 15.7, 15.8**

  - [ ] 19.5 Create `components/booking/MoveInConfirmation.tsx`
    - Shows confirmation status for tenant and owner; photo upload input; Confirm Move-In button
    - Calls POST `/api/bookings/[id]/move-in-confirm`
    - _Requirements: 15.1, 15.2, 15.3_

  - [ ] 19.6 Create `components/booking/DisputeForm.tsx`
    - Reason select, description textarea, evidence image upload (max 5 MB each, Cloudinary); Submit Dispute button
    - Calls POST `/api/disputes`; shows 409 error message if escrow already released
    - _Requirements: 15.4, 15.5, 15.8_

  - [ ] 19.7 Extend admin panel `app/admin/page.tsx` with dispute management section
    - List open/under_review disputes; detail view with evidence images; Resolve (Refund / No Refund) action buttons
    - Calls PATCH `/api/disputes/[id]`
    - _Requirements: 15.6, 15.7_

  - [ ] 19.8 Integrate MoveInConfirmation and DisputeForm into booking detail view (`app/dashboard/bookings/page.tsx`)
    - Show MoveInConfirmation when booking status is "approved" and check-in date is reached; show DisputeForm when escrow is "holding"
    - _Requirements: 15.1, 15.4_

- [ ] 20. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
- The Socket.io viewer count is stored in server memory only — never persisted to MongoDB
- All `cn` utility imports use `@/utils/cn`
- OpenAI and PDF generation require `OPENAI_API_KEY` in `.env`
