# Requirements Document

## Introduction

This document defines the requirements for the Roommate Matching feature for Nestora, a rental platform focused on the Uttar Pradesh market with emphasis on students and PG accommodations. The feature enables tenants seeking shared accommodation to discover and connect with compatible roommates based on budget, lifestyle preferences, location, and compatibility factors. This creates a social layer that helps students and young professionals find compatible roommates before committing to a rental property, driving viral growth and increasing booking conversion for shared properties.

## Glossary

- **Roommate_Profile**: A tenant's profile extension containing roommate-specific preferences, lifestyle habits, and compatibility attributes
- **Compatibility_Score**: A numeric value in [0, 100] representing how well two tenants match based on their Roommate_Profiles
- **Roommate_Match**: A computed pairing between two tenants with a Compatibility_Score above a minimum threshold
- **Roommate_Group**: A collection of 2-8 tenants who have agreed to search for properties together
- **Lifestyle_Preference**: A set of attributes describing habits (sleep schedule, cleanliness, noise tolerance, guests, smoking, drinking, dietary preferences)
- **Budget_Range**: The minimum and maximum monthly rent a tenant is willing to pay for shared accommodation
- **Location_Preference**: The preferred cities, localities, and proximity to college/office for accommodation search
- **Verification_Status**: The level of identity verification for a tenant (unverified, phone_verified, document_verified, college_verified)
- **Privacy_Setting**: User-controlled visibility settings for Roommate_Profile (public, verified_only, hidden)
- **Roommate_Request**: A connection request sent from one tenant to another to initiate roommate matching
- **Roommate_Connection**: An accepted Roommate_Request establishing a mutual connection between two tenants
- **Group_Search**: A property search session initiated by a Roommate_Group with combined budget and preferences
- **Compatibility_Factor**: An individual attribute used in computing Compatibility_Score (budget, location, lifestyle, schedule, habits)
- **Match_Reason**: A human-readable explanation for why two tenants are compatible
- **Discovery_Feed**: A paginated list of potential roommate matches sorted by Compatibility_Score
- **Roommate_Chat**: A private conversation between two tenants exploring roommate compatibility
- **Group_Chat**: A shared conversation among all members of a Roommate_Group
- **Profile_Completeness**: A percentage score indicating how much of the Roommate_Profile has been filled out
- **College_Verification**: A verification process confirming a tenant's enrollment at a specific educational institution
- **Shared_Property**: A property listing that supports multiple tenants (PG, shared apartment, multi-bedroom unit)

---

## Requirements

### Requirement 1: Roommate Profile Creation

**User Story:** As a tenant, I want to create a detailed roommate profile with my preferences and lifestyle habits, so that I can be matched with compatible roommates.

#### Acceptance Criteria

1. THE Roommate_Profile SHALL store Budget_Range with minimum and maximum monthly rent values
2. THE Roommate_Profile SHALL store Location_Preference including preferred cities, localities, and proximity to college or office
3. THE Roommate_Profile SHALL store Lifestyle_Preference including sleep schedule, cleanliness level, noise tolerance, guest frequency, smoking status, drinking status, and dietary preferences
4. THE Roommate_Profile SHALL store occupation type (student, working_professional, freelancer, other)
5. WHEN occupation type is student, THE Roommate_Profile SHALL store college name, course, and year of study
6. WHEN occupation type is working_professional, THE Roommate_Profile SHALL store company name and office location
7. THE Roommate_Profile SHALL store preferred move-in date range
8. THE Roommate_Profile SHALL store preferred roommate gender (male, female, any)
9. THE Roommate_Profile SHALL store preferred roommate age range
10. THE Roommate_Profile SHALL store a bio text field with maximum 500 characters
11. THE Roommate_Profile SHALL store interests as an array of tags
12. THE Roommate_Profile SHALL compute Profile_Completeness as a percentage based on filled fields
13. WHEN Profile_Completeness is below 60%, THE Roommate_Profile SHALL be marked as incomplete and excluded from Discovery_Feed

### Requirement 2: Compatibility Scoring Algorithm

**User Story:** As a tenant, I want to see compatibility scores with potential roommates, so that I can quickly identify the best matches.

#### Acceptance Criteria

1. THE Compatibility_Score SHALL be computed as a weighted sum of five factors: budget alignment (25 points), location alignment (20 points), lifestyle compatibility (30 points), schedule compatibility (15 points), and demographic compatibility (10 points)
2. WHEN computing budget alignment, THE system SHALL award full points if Budget_Ranges overlap by 80% or more, and proportionally fewer points for smaller overlaps
3. WHEN computing location alignment, THE system SHALL award full points if preferred cities match and localities overlap, and partial points for city-only matches
4. WHEN computing lifestyle compatibility, THE system SHALL compare cleanliness level, noise tolerance, guest frequency, smoking status, and drinking status, awarding points for exact matches and deducting points for conflicts
5. WHEN computing schedule compatibility, THE system SHALL compare sleep schedules and award points for similar wake-up and sleep times
6. WHEN computing demographic compatibility, THE system SHALL compare age ranges, gender preferences, and occupation types
7. THE system SHALL generate Match_Reason strings explaining the top 3 compatibility factors for each Roommate_Match
8. WHEN Compatibility_Score is below 40, THE system SHALL exclude the pairing from Discovery_Feed
9. THE system SHALL recompute Compatibility_Score whenever either tenant updates their Roommate_Profile

### Requirement 3: Roommate Discovery Interface

**User Story:** As a tenant, I want to browse potential roommates sorted by compatibility, so that I can find the best matches for my needs.

#### Acceptance Criteria

1. THE Discovery_Feed SHALL display tenants with complete Roommate_Profiles sorted by Compatibility_Score in descending order
2. THE Discovery_Feed SHALL display each potential match with profile photo, name, age, occupation, Compatibility_Score, and top 3 Match_Reason strings
3. THE Discovery_Feed SHALL support filtering by Budget_Range, Location_Preference, occupation type, and Verification_Status
4. THE Discovery_Feed SHALL support pagination with 20 results per page
5. WHEN a tenant has Privacy_Setting set to verified_only, THE Discovery_Feed SHALL only show that tenant to users with Verification_Status of document_verified or college_verified
6. WHEN a tenant has Privacy_Setting set to hidden, THE Discovery_Feed SHALL exclude that tenant from all search results
7. THE Discovery_Feed SHALL display a verification badge for tenants with college_verified status
8. THE Discovery_Feed SHALL allow tenants to save potential matches to a favorites list
9. THE Discovery_Feed SHALL exclude tenants who have already been sent a Roommate_Request by the current user

### Requirement 4: Roommate Connection Requests

**User Story:** As a tenant, I want to send connection requests to potential roommates, so that I can initiate conversations with compatible matches.

#### Acceptance Criteria

1. WHEN a tenant clicks connect on a potential match, THE system SHALL create a Roommate_Request with sender, receiver, and optional message
2. THE system SHALL limit each tenant to 10 pending outgoing Roommate_Requests at any time
3. WHEN a Roommate_Request is created, THE system SHALL send a notification to the receiver
4. THE system SHALL allow the receiver to accept, reject, or ignore the Roommate_Request
5. WHEN a Roommate_Request is accepted, THE system SHALL create a Roommate_Connection between the two tenants
6. WHEN a Roommate_Connection is created, THE system SHALL automatically create a Roommate_Chat between the two tenants
7. WHEN a Roommate_Request is rejected, THE system SHALL hide the sender from the receiver's Discovery_Feed permanently
8. THE system SHALL automatically expire Roommate_Requests after 7 days if no action is taken
9. THE system SHALL allow tenants to withdraw pending Roommate_Requests before they are accepted or rejected

### Requirement 5: Roommate Messaging

**User Story:** As a tenant, I want to chat with potential roommates, so that I can discuss compatibility and plan our accommodation search.

#### Acceptance Criteria

1. THE Roommate_Chat SHALL support text messages with maximum 2000 characters per message
2. THE Roommate_Chat SHALL support image sharing with maximum 5 images per message
3. THE Roommate_Chat SHALL display message timestamps and read receipts
4. THE Roommate_Chat SHALL support real-time message delivery using Socket.io
5. THE Roommate_Chat SHALL display typing indicators when the other tenant is composing a message
6. THE Roommate_Chat SHALL allow tenants to block or report other tenants for inappropriate behavior
7. WHEN a tenant blocks another tenant, THE system SHALL delete the Roommate_Connection and hide all messages
8. THE Roommate_Chat SHALL store message history for 90 days
9. THE Roommate_Chat SHALL support emoji reactions to messages

### Requirement 6: Roommate Group Formation

**User Story:** As a tenant, I want to form a group with compatible roommates, so that we can search for properties together.

#### Acceptance Criteria

1. THE system SHALL allow a tenant to create a Roommate_Group by inviting 1-7 connected roommates
2. WHEN a Roommate_Group is created, THE system SHALL send invitations to all invited tenants
3. THE system SHALL require all invited tenants to accept the invitation before the Roommate_Group becomes active
4. WHEN a Roommate_Group becomes active, THE system SHALL create a Group_Chat for all members
5. THE Roommate_Group SHALL have a creator who serves as the group admin
6. THE group admin SHALL be able to remove members from the Roommate_Group
7. THE system SHALL allow any member to leave the Roommate_Group voluntarily
8. WHEN a member leaves, THE system SHALL notify all remaining members
9. THE Roommate_Group SHALL store a combined Budget_Range computed as the sum of individual budgets divided by group size
10. THE Roommate_Group SHALL store a consensus Location_Preference based on overlapping preferences of all members

### Requirement 7: Group Property Search

**User Story:** As a member of a roommate group, I want to search for properties that accommodate our entire group, so that we can find suitable shared accommodation.

#### Acceptance Criteria

1. THE Group_Search SHALL filter properties to show only Shared_Property listings with bedroom count greater than or equal to group size
2. THE Group_Search SHALL compute a group match score for each property based on the Roommate_Group's combined Budget_Range and consensus Location_Preference
3. THE Group_Search SHALL display properties sorted by group match score in descending order
4. THE Group_Search SHALL allow any group member to save properties to a shared group wishlist
5. THE Group_Search SHALL display saved properties with indicators showing which members have favorited each property
6. THE Group_Search SHALL allow any group member to initiate a property inquiry on behalf of the group
7. WHEN a property inquiry is sent, THE system SHALL notify the property owner that the inquiry is from a Roommate_Group
8. THE Group_Search SHALL display the number of bedrooms required and total group budget in the search interface

### Requirement 8: Verification and Trust

**User Story:** As a tenant, I want to verify my identity and see verified roommates, so that I can trust the people I connect with.

#### Acceptance Criteria

1. THE system SHALL support phone verification via OTP for all tenants
2. THE system SHALL support document verification by uploading government ID (Aadhaar, PAN, Driving License)
3. THE system SHALL support College_Verification by uploading student ID card or enrollment letter
4. WHEN College_Verification is submitted, THE system SHALL verify the document and update Verification_Status to college_verified within 24 hours
5. THE system SHALL display verification badges on Roommate_Profiles in the Discovery_Feed
6. THE system SHALL prioritize verified tenants in Discovery_Feed rankings
7. THE system SHALL allow tenants to filter Discovery_Feed to show only verified users
8. THE system SHALL store verification documents securely and delete them after 30 days of verification approval

### Requirement 9: Privacy Controls

**User Story:** As a tenant, I want to control who can see my roommate profile, so that I can maintain my privacy.

#### Acceptance Criteria

1. THE system SHALL provide three Privacy_Setting options: public, verified_only, and hidden
2. WHEN Privacy_Setting is public, THE Roommate_Profile SHALL be visible to all tenants with complete profiles
3. WHEN Privacy_Setting is verified_only, THE Roommate_Profile SHALL be visible only to tenants with Verification_Status of document_verified or college_verified
4. WHEN Privacy_Setting is hidden, THE Roommate_Profile SHALL be excluded from Discovery_Feed and search results
5. THE system SHALL allow tenants to change Privacy_Setting at any time
6. THE system SHALL allow tenants to hide specific profile fields (phone number, college name, company name) from non-connected users
7. THE system SHALL display only first name and age to non-connected users, revealing full name only after Roommate_Connection is established

### Requirement 10: Integration with Property Search

**User Story:** As a tenant, I want to see roommate matching options while browsing properties, so that I can find roommates for properties I'm interested in.

#### Acceptance Criteria

1. WHEN viewing a Shared_Property listing, THE system SHALL display a "Find Roommates for this Property" button
2. WHEN the button is clicked, THE system SHALL show potential roommates whose Budget_Range and Location_Preference match the property
3. THE system SHALL allow tenants to send property-specific Roommate_Requests with the property attached
4. WHEN a property-specific Roommate_Request is accepted, THE system SHALL add the property to the shared wishlist of both tenants
5. THE system SHALL display a count of active roommate seekers for each Shared_Property
6. THE system SHALL allow property owners to enable a "Roommate Matching Enabled" flag on their listings
7. WHEN "Roommate Matching Enabled" is true, THE property SHALL appear in Group_Search results with higher priority

### Requirement 11: Social Sharing and Viral Growth

**User Story:** As a tenant, I want to share my roommate profile with friends, so that I can find roommates through my social network.

#### Acceptance Criteria

1. THE system SHALL generate a unique shareable link for each Roommate_Profile
2. THE shareable link SHALL display a public preview of the profile with Compatibility_Score hidden
3. THE system SHALL support sharing via WhatsApp, Facebook, Instagram, and Twitter
4. THE system SHALL track referrals when a new user signs up via a shared profile link
5. WHEN a referred user creates a Roommate_Connection with the referrer, THE system SHALL award both users a "Social Connector" badge
6. THE system SHALL display social proof indicators showing how many mutual connections two potential roommates have
7. THE system SHALL allow tenants to invite friends via email or phone number to join the platform

### Requirement 12: Roommate Matching Analytics

**User Story:** As a platform admin, I want to track roommate matching metrics, so that I can measure feature success and optimize the algorithm.

#### Acceptance Criteria

1. THE system SHALL track the number of Roommate_Profiles created per day
2. THE system SHALL track the number of Roommate_Requests sent and accepted per day
3. THE system SHALL track the number of Roommate_Groups formed per day
4. THE system SHALL track the conversion rate from Roommate_Connection to Group_Search
5. THE system SHALL track the conversion rate from Group_Search to property booking
6. THE system SHALL track the average Compatibility_Score of accepted Roommate_Requests
7. THE system SHALL track the distribution of Profile_Completeness scores
8. THE system SHALL provide a dashboard displaying all metrics with date range filters

### Requirement 13: Notifications and Alerts

**User Story:** As a tenant, I want to receive notifications about roommate activity, so that I can respond promptly to connection requests and messages.

#### Acceptance Criteria

1. WHEN a tenant receives a Roommate_Request, THE system SHALL send a push notification and email
2. WHEN a Roommate_Request is accepted, THE system SHALL notify the sender via push notification
3. WHEN a tenant receives a message in Roommate_Chat, THE system SHALL send a push notification
4. WHEN a tenant is invited to a Roommate_Group, THE system SHALL send a push notification and email
5. WHEN a new potential match with Compatibility_Score above 80 joins the platform, THE system SHALL send a notification to compatible tenants
6. THE system SHALL allow tenants to configure notification preferences for each notification type
7. THE system SHALL batch notifications to avoid sending more than 5 notifications per hour per tenant

### Requirement 14: Reporting and Moderation

**User Story:** As a tenant, I want to report inappropriate behavior, so that the platform remains safe and trustworthy.

#### Acceptance Criteria

1. THE system SHALL allow tenants to report other tenants for fake profiles, harassment, spam, or inappropriate content
2. WHEN a report is submitted, THE system SHALL collect evidence including screenshots and message history
3. THE system SHALL notify platform admins of all reports within 1 hour
4. THE system SHALL allow admins to review reports and take action (warning, suspension, ban)
5. WHEN a tenant is banned, THE system SHALL delete all their Roommate_Connections and remove them from all Roommate_Groups
6. THE system SHALL track the number of reports per tenant and automatically flag accounts with 3 or more reports for admin review
7. THE system SHALL allow admins to view full message history for reported conversations

### Requirement 15: Mobile Responsiveness

**User Story:** As a tenant, I want to use roommate matching on my mobile device, so that I can search for roommates on the go.

#### Acceptance Criteria

1. THE Discovery_Feed SHALL render responsively on mobile devices with screen widths down to 320px
2. THE Roommate_Chat SHALL support touch gestures for scrolling and image viewing
3. THE Roommate_Profile creation form SHALL use mobile-optimized input controls (date pickers, dropdowns, sliders)
4. THE Group_Search interface SHALL display property cards in a single column on mobile devices
5. THE system SHALL optimize image loading for mobile networks with progressive loading and compression
6. THE system SHALL support mobile browser notifications for Roommate_Requests and messages
