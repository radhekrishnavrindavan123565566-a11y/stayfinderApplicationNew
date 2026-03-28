# Requirements Document

## Introduction

This document defines the requirements for the StayFinder Rental Ecosystem Upgrade — a comprehensive enhancement of the existing Next.js 16 App Router rental platform. The upgrade introduces 15 advanced feature clusters spanning decision intelligence, trust infrastructure, transactional chat, legal automation, community layers, and zero-risk rental guarantees. The goal is to surpass Airbnb/MagicBricks-level functionality while maintaining the existing architecture patterns (App Router, Mongoose, Zustand, Tailwind CSS v4, Socket.io, Stripe, Cloudinary).

## Glossary

- **Decision_Engine**: The system component that computes match scores and smart tags for properties relative to user preferences.
- **Match_Score**: A numeric value in [0, 100] representing how well a property matches a user's stored preferences.
- **Smart_Tag**: A human-readable label assigned to a property based on its attributes and the user's tenant type (e.g., "Best for students").
- **Ecosystem_Service**: A post-booking ancillary service (cleaning, maintenance, moving, furniture rental) bookable through the platform.
- **Trust_Layer**: The system component responsible for tenant/owner verification, fraud risk assessment, and profile completeness scoring.
- **Fraud_Risk**: A computed risk level ("low", "medium", "high") derived from account age, review history, verification status, and price anomalies.
- **Chat_Engine**: The extended chat system that supports structured transaction actions (visit scheduling, offer sending, agreement generation, booking confirmation).
- **Chat_Action**: A structured transaction record created within a conversation (schedule_visit, send_offer, generate_agreement, confirm_booking).
- **Price_Intelligence**: The system component that computes fair price indicators, price trend data, and comparative labels for properties.
- **Owner_Tools**: The dashboard component providing demand insights, occupancy analytics, and listing timing recommendations to property owners.
- **Availability_Intelligence**: The system component that highlights high-demand dates on the property availability calendar.
- **Emotional_UX**: The set of UI signals including recently viewed properties, real-time viewer counts, and social proof indicators.
- **Location_Intelligence**: The system component that stores and surfaces nearby amenities and area safety scores per property.
- **Agreement_System**: The system component that auto-generates rent agreements, collects e-signatures, and produces PDF downloads.
- **Smart_Notifications**: The alert system that dispatches price drop alerts and new property match alerts for saved searches.
- **AI_Assistant**: The system component providing natural language property search and auto-generated property descriptions via OpenAI.
- **Community_Layer**: The system component supporting locality reviews, neighborhood Q&A, and area ratings.
- **Escrow_System**: The existing Stripe-based payment escrow extended with move-in confirmation and dispute/refund workflows.
- **Dispute_System**: The system component managing tenant-raised disputes, evidence collection, and admin resolution.
- **UserPreferences**: A persisted document storing a user's budget range, preferred bedrooms, amenities, cities, and tenant type.
- **SavedSearch**: A persisted filter set within UserPreferences with optional alert notifications enabled.
- **RentAgreement**: A generated legal document linking a booking, tenant, owner, and property with e-signature support.
- **ServiceBooking**: A record linking an EcosystemService to a main rental booking with scheduling and payment status.
- **LocalityReview**: A user-submitted review of a neighborhood with multi-dimensional ratings.
- **LocalityQA**: A community Q&A thread scoped to a city and locality.
- **MoveInConfirmation**: A sub-document on a Booking tracking tenant and owner confirmation of move-in with photo evidence.

---

## Requirements

### Requirement 1: Decision Engine — Match Score and Smart Tags

**User Story:** As a tenant, I want to see a personalized match score and smart tags for each property, so that I can quickly identify properties that best fit my needs without manually comparing every listing.

#### Acceptance Criteria

1. THE Decision_Engine SHALL store a UserPreferences document per user containing budget range, preferred bedrooms, preferred amenities, preferred cities, and tenant type.
2. WHEN a tenant views a property listing page, THE Decision_Engine SHALL compute a Match_Score in the range [0, 100] for that property against the tenant's stored UserPreferences.
3. THE Decision_Engine SHALL compute the Match_Score as the sum of five weighted sub-scores: budget (max 25), bedrooms (max 20), amenities (max 20), location (max 20), and tenant type (max 15).
4. WHEN a tenant has no stored UserPreferences, THE Decision_Engine SHALL return a score of 0 and prompt the tenant to complete their preference profile.
5. WHEN a Match_Score is computed, THE Decision_Engine SHALL return a non-empty list of human-readable reason strings if the score is greater than 0.
6. THE Decision_Engine SHALL assign Smart_Tags to properties based on property attributes and the tenant's tenant type (e.g., "Best for students" for budget-friendly properties when tenantType is "student").
7. WHEN a tenant clicks "Why this property?", THE Decision_Engine SHALL display the score breakdown and reason strings in a modal.
8. THE Decision_Engine SHALL expose a GET `/api/properties/[id]/match-score` endpoint that returns the score, reasons, tags, and breakdown for the authenticated tenant.

---

### Requirement 2: Rental Ecosystem Services

**User Story:** As a tenant who has completed a booking, I want to browse and book ancillary services (cleaning, maintenance, moving, furniture rental), so that I can manage my move-in needs from a single platform.

#### Acceptance Criteria

1. THE Ecosystem_Service system SHALL maintain a catalog of services with type, title, description, price, price unit, provider, and available cities.
2. WHEN a tenant views their booking confirmation page, THE Ecosystem_Service system SHALL display available services filtered by the property's city.
3. WHEN a tenant books an Ecosystem_Service, THE Ecosystem_Service system SHALL create a ServiceBooking record linked to the main rental booking with status "pending".
4. WHEN a ServiceBooking payment is processed successfully, THE Ecosystem_Service system SHALL update the ServiceBooking paymentStatus to "paid" and status to "confirmed".
5. IF a Stripe charge fails for a ServiceBooking, THEN THE Ecosystem_Service system SHALL retain the ServiceBooking status as "pending" and notify the tenant with a retry payment link.
6. THE Ecosystem_Service system SHALL expose GET `/api/ecosystem/services` and POST `/api/ecosystem/bookings` endpoints.

---

### Requirement 3: Trust Layer

**User Story:** As a platform user, I want to see verified badges, fraud warnings, and profile completeness scores, so that I can make informed decisions about who I rent from or to.

#### Acceptance Criteria

1. THE Trust_Layer SHALL compute a profile completeness score in the range [0, 100] for every user based on the presence of avatar, username, email, phone, bio, owner verification, and tenant verification fields.
2. WHEN a user's profile is viewed, THE Trust_Layer SHALL display the profile completeness score and applicable trust badges.
3. THE Trust_Layer SHALL assess Fraud_Risk for users and properties, returning a level of "low", "medium", or "high" and a list of FraudSignal records.
4. WHEN a Fraud_Risk level is "high", THE Trust_Layer SHALL ensure at least one FraudSignal with severity "high" is present in the signals list.
5. WHEN a tenant views a property detail page, THE Trust_Layer SHALL display a fraud risk warning badge if the owner's Fraud_Risk level is "medium" or "high".
6. THE Trust_Layer SHALL mark a user as Safe_Deal_Eligible only when all trust checks pass (verified identity, low fraud risk, complete profile above 80%).
7. THE Trust_Layer SHALL cache fraud risk assessments for 1 hour per user to avoid repeated computation.
8. THE Trust_Layer SHALL expose fraud risk data (level and signals) only to admin users; tenants and owners SHALL see only the badge indicator.

---

### Requirement 4: Chat as Transaction Engine

**User Story:** As a tenant or owner, I want to schedule visits, send rent offers, generate agreements, and confirm bookings directly within the chat interface, so that the entire rental transaction can happen without leaving the conversation.

#### Acceptance Criteria

1. THE Chat_Engine SHALL display an action toolbar within the ChatWindow with buttons for Schedule Visit, Send Offer, Generate Agreement, and Confirm Booking.
2. WHEN a tenant initiates a Chat_Action, THE Chat_Engine SHALL create a ChatAction record with status "pending", an expiry of 48 hours, and render it as an action card in the conversation for both parties.
3. WHEN a Chat_Action expires without a response, THE Chat_Engine SHALL update its status to "expired" and display an expiry notice in the chat.
4. WHEN an owner accepts a Chat_Action, THE Chat_Engine SHALL update the ChatAction status to "accepted" and notify the initiating tenant via Socket.io.
5. WHEN an owner rejects a Chat_Action, THE Chat_Engine SHALL update the ChatAction status to "rejected" and notify the initiating tenant.
6. THE Chat_Engine SHALL validate that the Chat_Action initiator is a participant in the conversation before creating the record.
7. WHEN a "send_offer" Chat_Action is accepted, THE Chat_Engine SHALL display a "Confirm Booking" call-to-action to the tenant.
8. THE Chat_Engine SHALL expose POST `/api/chat/actions` and POST `/api/chat/actions/[id]/respond` endpoints.

---

### Requirement 5: Price Intelligence

**User Story:** As a tenant browsing properties, I want to see fair price indicators and price trend graphs, so that I can understand whether a listing is priced competitively before making a decision.

#### Acceptance Criteria

1. THE Price_Intelligence system SHALL store per-property data including city average price, fair price range, price position, percentage difference from average, and a monthly trend array.
2. WHEN a property listing is displayed, THE Price_Intelligence system SHALL show a "Fair Price" indicator label and the percentage difference from the city average (e.g., "10% cheaper than average").
3. THE Price_Intelligence system SHALL classify each property's price position as "below_average", "average", or "above_average" relative to similar properties in the same city.
4. THE Price_Intelligence system SHALL update price intelligence data nightly via a background job rather than on every request.
5. WHEN a tenant views a property detail page, THE Price_Intelligence system SHALL render a price trend graph showing monthly average prices for the past 12 months.
6. THE Price_Intelligence system SHALL expose price intelligence data via the property detail API response.

---

### Requirement 6: Smart Owner Tools

**User Story:** As a property owner, I want to see demand insights, occupancy analytics, and listing timing recommendations, so that I can optimize my listing strategy and maximize occupancy.

#### Acceptance Criteria

1. THE Owner_Tools system SHALL compute a city demand score (0–100), peak months, competitor count, and city-wide average occupancy rate per property.
2. WHEN an owner views their property dashboard, THE Owner_Tools system SHALL display the demand score, peak months, and a "best time to list" recommendation string.
3. THE Owner_Tools system SHALL display the owner's property-specific occupancy rate alongside the city-wide average for comparison.
4. THE Owner_Tools system SHALL show views and wishlist additions for the property in the past 7 days.
5. THE Owner_Tools system SHALL expose demand insight data via GET `/api/properties/[id]/demand-insights` accessible only to the property owner and admins.

---

### Requirement 7: Availability Intelligence

**User Story:** As a tenant, I want to see high-demand dates highlighted on the property availability calendar, so that I can plan my booking around peak periods.

#### Acceptance Criteria

1. THE Availability_Intelligence system SHALL identify high-demand dates as dates with more than 3 times the normal booking request volume for a property.
2. WHEN a tenant views the availability calendar, THE Availability_Intelligence system SHALL visually highlight high-demand dates with a distinct color or indicator.
3. THE Availability_Intelligence system SHALL maintain a demand heatmap per property mapping each date to a demand level of "low", "medium", or "high".
4. THE Availability_Intelligence system SHALL expose heatmap data via the existing property availability API endpoint.

---

### Requirement 8: Emotional UX — Recently Viewed and Social Proof

**User Story:** As a tenant, I want to see recently viewed properties, real-time viewer counts, and booking social proof, so that I can easily return to properties I was interested in and gauge their popularity.

#### Acceptance Criteria

1. THE Emotional_UX system SHALL track recently viewed properties per authenticated user, maintaining a maximum of 20 entries in FIFO order.
2. WHEN a tenant views a property, THE Emotional_UX system SHALL add the property to the tenant's recently viewed list and update the property's total view count.
3. WHEN a tenant visits the homepage or listings page, THE Emotional_UX system SHALL display a "Recently Viewed" section showing the tenant's last viewed properties.
4. THE Emotional_UX system SHALL broadcast real-time viewer counts per property via Socket.io, emitting a "property:viewers" event whenever a user enters or leaves a property page.
5. WHEN a property page is viewed, THE Emotional_UX system SHALL display "X people viewing now" using the real-time Socket.io viewer count.
6. THE Emotional_UX system SHALL display "Booked N times this week" on property cards and detail pages using the property's weekly booking count.
7. IF a user disconnects without emitting a leave event, THEN THE Emotional_UX system SHALL remove the user from the viewer count within 30 seconds via the Socket.io disconnect handler.

---

### Requirement 9: Location Intelligence

**User Story:** As a tenant, I want to see nearby amenities and an area safety score for each property, so that I can evaluate the neighborhood before committing to a rental.

#### Acceptance Criteria

1. THE Location_Intelligence system SHALL store nearby amenities per property including type (metro, school, hospital, mall, park, restaurant), name, distance in km, and walking time in minutes.
2. WHEN a property is created or updated, THE Location_Intelligence system SHALL fetch and store nearby amenity data in the Property document rather than computing it at query time.
3. WHEN a tenant views a property detail page, THE Location_Intelligence system SHALL display the list of nearby amenities with distance and walking time.
4. THE Location_Intelligence system SHALL store a safety score (0–100) and a safety label ("Very Safe", "Safe", "Moderate", "Use Caution") per property.
5. WHEN a tenant views a property detail page, THE Location_Intelligence system SHALL display the area safety score and label.

---

### Requirement 10: Legal and Agreement Automation

**User Story:** As a tenant or owner, I want rent agreements to be auto-generated, signed electronically, and downloadable as PDFs, so that the legal process is seamless and paperless.

#### Acceptance Criteria

1. WHEN a booking reaches "approved" status, THE Agreement_System SHALL be capable of generating a RentAgreement document containing tenant name, owner name, property address, rent amount, and rental duration.
2. THE Agreement_System SHALL generate a PDF of the rent agreement using `@react-pdf/renderer` and store it at a Cloudinary URL.
3. WHEN a RentAgreement is created, THE Agreement_System SHALL set its initial status to "pending_tenant" and require the tenant's e-signature first.
4. WHEN a tenant signs a RentAgreement, THE Agreement_System SHALL record the tenant's signature and timestamp, and transition the status to "pending_owner".
5. WHEN an owner signs a RentAgreement after the tenant has signed, THE Agreement_System SHALL record the owner's signature and timestamp, transition the status to "fully_signed", and trigger escrow release exactly once.
6. WHEN a RentAgreement has status "fully_signed", THE Agreement_System SHALL ensure both tenantSignedAt and ownerSignedAt are non-null.
7. THE Agreement_System SHALL validate that the signing user is either the tenantId or ownerId of the agreement before accepting a signature.
8. WHEN a tenant requests a PDF download, THE Agreement_System SHALL provide the Cloudinary PDF URL for direct download.
9. IF PDF generation fails, THEN THE Agreement_System SHALL save the agreement as "draft" status without a pdfUrl and expose a retry endpoint.
10. IF a booking is not in "approved" status, THEN THE Agreement_System SHALL return a 400 error when agreement generation is requested.
11. THE Agreement_System SHALL expose POST `/api/agreements`, POST `/api/agreements/[id]/sign`, and GET `/api/agreements/[id]` endpoints.
12. THE Agreement_System SHALL serialize RentAgreement documents to and from JSON for API responses.

---

### Requirement 11: Smart Notifications

**User Story:** As a tenant, I want to receive alerts when a wishlisted property drops in price or when new properties match my saved searches, so that I never miss a good deal.

#### Acceptance Criteria

1. THE Smart_Notifications system SHALL dispatch price drop alerts to all users who have wishlisted a property when that property's price decreases by 5% or more.
2. WHEN a price drop alert is dispatched, THE Smart_Notifications system SHALL include the property ID, previous price, new price, and drop percentage in the notification payload.
3. WHEN a new property is listed that matches a user's SavedSearch filters, THE Smart_Notifications system SHALL dispatch a new property match alert to that user.
4. THE Smart_Notifications system SHALL run alert dispatch as a scheduled job every hour via a Next.js API route triggered by a cron job.
5. THE Smart_Notifications system SHALL not dispatch duplicate alerts for the same (userId, propertyId) pair within a 24-hour window.
6. THE Smart_Notifications system SHALL rate-limit alerts to a maximum of 5 notifications per user per day.
7. WHEN a user creates or updates a SavedSearch, THE Smart_Notifications system SHALL allow the user to enable or disable alerts per saved search.
8. FOR ALL price drop notifications n, THE Smart_Notifications system SHALL ensure n.payload.newPrice is less than n.payload.previousPrice.

---

### Requirement 12: AI Features — Natural Language Search and Description Generator

**User Story:** As a tenant, I want to search for properties using natural language, and as an owner, I want AI to generate compelling property descriptions, so that both discovery and listing creation are faster and more intuitive.

#### Acceptance Criteria

1. WHEN a tenant submits a natural language search query, THE AI_Assistant SHALL parse the query using OpenAI and return structured filters including bedrooms, maxPrice, city, amenities, and propertyType.
2. THE AI_Assistant SHALL return a confidence score in [0, 1] with every parsed search query.
3. WHEN the confidence score is greater than 0.5, THE AI_Assistant SHALL ensure parsedFilters contains at least one non-null field.
4. IF the OpenAI API call fails, THEN THE AI_Assistant SHALL fall back to an empty filter set with confidence 0 and display a "AI search unavailable" toast to the user.
5. THE AI_Assistant SHALL sanitize and truncate natural language search input to a maximum of 500 characters before sending to OpenAI.
6. WHEN an owner requests an AI-generated property description, THE AI_Assistant SHALL generate a description of 100–300 words mentioning property type, bedrooms, location, and at least 3 amenities if provided.
7. IF the OpenAI API call for description generation fails, THEN THE AI_Assistant SHALL fall back to a template-based description.
8. THE AI_Assistant SHALL rate-limit description generation to 10 requests per minute per owner.
9. THE AI_Assistant SHALL expose POST `/api/ai/search` and POST `/api/ai/generate-description` endpoints.

---

### Requirement 13: Urgency and FOMO Signals

**User Story:** As a tenant browsing properties, I want to see real-time urgency signals like viewer counts and booking frequency, so that I can gauge demand and make timely decisions.

#### Acceptance Criteria

1. WHEN a user opens a property page, THE Emotional_UX system SHALL emit a "property:view" Socket.io event to increment the real-time viewer count for that property.
2. WHEN a user leaves a property page, THE Emotional_UX system SHALL emit a "property:leave" Socket.io event to decrement the real-time viewer count.
3. THE Emotional_UX system SHALL broadcast updated viewer counts to all connected clients viewing the same property whenever the count changes.
4. THE Emotional_UX system SHALL store real-time viewer counts in server memory per propertyId Socket.io room, not in the database.
5. THE Emotional_UX system SHALL update the property's weeklyBookings count to reflect bookings confirmed in the last 7 days.
6. WHEN a property has limited available units, THE Emotional_UX system SHALL display a "limited availability" indicator on the property card.

---

### Requirement 14: Community Layer — Locality Reviews and Q&A

**User Story:** As a tenant, I want to read and contribute locality reviews and neighborhood Q&A, so that I can make informed decisions about the area before renting.

#### Acceptance Criteria

1. THE Community_Layer SHALL allow authenticated users to submit LocalityReview records with ratings (1–5) for safety, connectivity, amenities, cleanliness, and overall, plus a comment.
2. WHEN a tenant views a property detail page, THE Community_Layer SHALL display locality reviews and the aggregate ratings for the property's city and locality.
3. THE Community_Layer SHALL allow authenticated users to post questions to a LocalityQA thread scoped to a city and locality.
4. WHEN a user posts an answer to a LocalityQA question, THE Community_Layer SHALL append the answer with the user ID, answer text, upvote count of 0, and creation timestamp.
5. THE Community_Layer SHALL allow authenticated users to upvote answers in a LocalityQA thread.
6. THE Community_Layer SHALL expose GET and POST `/api/community/locality-reviews` and GET and POST `/api/community/locality-qa` endpoints.

---

### Requirement 15: Zero Risk Rental System — Enhanced Escrow and Disputes

**User Story:** As a tenant, I want a move-in confirmation flow and a dispute/refund system, so that I am protected if the property does not match the listing or access is denied.

#### Acceptance Criteria

1. WHEN a booking's check-in date is reached, THE Escrow_System SHALL require both tenant and owner to confirm move-in before releasing escrow funds.
2. WHEN a tenant confirms move-in, THE Escrow_System SHALL update the MoveInConfirmation status to "tenant_confirmed" and allow the tenant to upload check-in photos.
3. WHEN both tenant and owner have confirmed move-in, THE Escrow_System SHALL update the MoveInConfirmation status to "both_confirmed" and trigger escrow release.
4. WHEN a tenant raises a dispute, THE Dispute_System SHALL create a Dispute record with status "open", linked to the booking, with a reason, description, and optional evidence uploads.
5. THE Dispute_System SHALL accept evidence uploads as images only, with a maximum file size of 5 MB per file, validated via Cloudinary upload preset.
6. WHEN an admin resolves a dispute as "resolved_refund", THE Dispute_System SHALL initiate a Stripe refund and update the Dispute status accordingly.
7. WHEN a dispute has status "resolved_refund", THE Dispute_System SHALL ensure a Stripe refund was initiated.
8. IF a tenant attempts to raise a dispute after escrow has already been released, THEN THE Dispute_System SHALL return a 409 error with the message "Escrow already released, dispute window closed".
9. THE Dispute_System SHALL expose POST `/api/disputes`, GET `/api/disputes/[id]`, and PATCH `/api/disputes/[id]` endpoints.
10. THE Escrow_System SHALL expose POST `/api/bookings/[id]/move-in-confirm` for both tenant and owner confirmation.
