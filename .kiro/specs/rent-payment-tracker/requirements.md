# Requirements Document

## Introduction

The Rent Payment Tracker is a feature for Nestora that enables tenants to log monthly rent payments and owners to confirm them, creating a verifiable payment history. This feature addresses a critical need in the Uttar Pradesh rental market, particularly for students and PG accommodations, by building trust between parties, helping tenants establish rental credit history, and providing proof of payment. The system integrates with existing bookings and provides automated reminders, payment status tracking, and downloadable receipts.

## Glossary

- **Rent_Payment_Tracker**: The system component that manages rent payment logging, confirmation, and history
- **Tenant**: A user with role "tenant" who logs rent payments for their active bookings
- **Owner**: A user with role "owner" who confirms rent payments from tenants
- **Admin**: A user with role "admin" who can view all payment records and resolve disputes
- **Payment_Record**: A document representing a single month's rent payment with status, amount, method, and proof
- **Booking**: An existing booking entity linking tenant, owner, and property with start/end dates
- **Payment_Status**: The state of a payment record (pending, confirmed, disputed, late)
- **Payment_Method**: The method used for payment (UPI, bank_transfer, cash, cheque, online)
- **Payment_Receipt**: A downloadable PDF document proving payment was made and confirmed
- **Payment_History**: A chronological timeline of all payment records for a booking
- **Rent_Reminder**: An automated notification sent to tenants about upcoming or overdue rent
- **Late_Payment**: A payment record where the payment date is after the due date
- **Payment_Proof**: Optional image or document uploaded by tenant as evidence of payment
- **Credit_Score**: A numerical score (0-100) calculated from payment history for tenant reputation

## Requirements

### Requirement 1: Payment Record Creation

**User Story:** As a tenant, I want to log my monthly rent payments, so that I can maintain a verifiable payment history.

#### Acceptance Criteria

1. WHEN a tenant has an active booking, THE Rent_Payment_Tracker SHALL allow the tenant to create a Payment_Record
2. THE Rent_Payment_Tracker SHALL require payment amount, payment date, and Payment_Method for each Payment_Record
3. THE Rent_Payment_Tracker SHALL allow tenants to upload Payment_Proof images or documents (optional)
4. THE Rent_Payment_Tracker SHALL set Payment_Status to "pending" when a Payment_Record is created
5. THE Rent_Payment_Tracker SHALL associate each Payment_Record with the corresponding Booking
6. THE Rent_Payment_Tracker SHALL validate that payment amount matches the booking's monthly rent amount (within 5% tolerance)
7. THE Rent_Payment_Tracker SHALL prevent duplicate Payment_Records for the same month and booking

### Requirement 2: Payment Confirmation

**User Story:** As an owner, I want to confirm rent payments from my tenants, so that both parties have verified payment records.

#### Acceptance Criteria

1. WHEN a Payment_Record has Payment_Status "pending", THE Rent_Payment_Tracker SHALL allow the Owner to confirm the payment
2. WHEN an Owner confirms a payment, THE Rent_Payment_Tracker SHALL update Payment_Status to "confirmed"
3. WHEN an Owner confirms a payment, THE Rent_Payment_Tracker SHALL record the confirmation timestamp
4. THE Rent_Payment_Tracker SHALL allow Owners to view all pending Payment_Records for their properties
5. THE Rent_Payment_Tracker SHALL send a notification to the Tenant when their payment is confirmed
6. THE Rent_Payment_Tracker SHALL allow Owners to mark a payment as "disputed" with a reason

### Requirement 3: Payment History Display

**User Story:** As a tenant or owner, I want to view the complete payment history for a booking, so that I can track all rent payments over time.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL display Payment_History in chronological order (newest first)
2. THE Rent_Payment_Tracker SHALL show payment amount, payment date, Payment_Method, Payment_Status, and confirmation date for each Payment_Record
3. THE Rent_Payment_Tracker SHALL display Payment_Proof thumbnails when available
4. THE Rent_Payment_Tracker SHALL calculate and display total payments made, total confirmed payments, and pending amount
5. THE Rent_Payment_Tracker SHALL filter Payment_History by Payment_Status (all, pending, confirmed, disputed, late)
6. THE Rent_Payment_Tracker SHALL allow both Tenant and Owner to view the Payment_History for their shared bookings

### Requirement 4: Automated Rent Reminders

**User Story:** As a tenant, I want to receive automatic reminders about upcoming rent payments, so that I don't miss payment deadlines.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL send a Rent_Reminder to Tenants on the 1st day of each month for active bookings
2. WHEN a payment is 3 days overdue, THE Rent_Payment_Tracker SHALL send a Late_Payment reminder to the Tenant
3. WHEN a payment is 7 days overdue, THE Rent_Payment_Tracker SHALL send a second Late_Payment reminder to both Tenant and Owner
4. THE Rent_Payment_Tracker SHALL send reminders via in-app notifications and email
5. THE Rent_Payment_Tracker SHALL include booking details, due amount, and payment logging link in each Rent_Reminder
6. THE Rent_Payment_Tracker SHALL stop sending reminders when a Payment_Record is created for that month

### Requirement 5: Late Payment Tracking

**User Story:** As an owner, I want to track late payments, so that I can identify payment patterns and take appropriate action.

#### Acceptance Criteria

1. WHEN a Payment_Record's payment date is after the 5th of the month, THE Rent_Payment_Tracker SHALL mark it as Late_Payment
2. THE Rent_Payment_Tracker SHALL calculate days late for each Late_Payment
3. THE Rent_Payment_Tracker SHALL display a late payment indicator on Payment_Records in Payment_History
4. THE Rent_Payment_Tracker SHALL calculate late payment percentage for each Tenant across all bookings
5. THE Rent_Payment_Tracker SHALL include late payment data in Tenant's Credit_Score calculation
6. THE Rent_Payment_Tracker SHALL allow Owners to view late payment statistics for their tenants

### Requirement 6: Payment Receipt Generation

**User Story:** As a tenant, I want to download payment receipts, so that I have official proof of payment for my records.

#### Acceptance Criteria

1. WHEN a Payment_Record has Payment_Status "confirmed", THE Rent_Payment_Tracker SHALL allow generation of a Payment_Receipt
2. THE Payment_Receipt SHALL include tenant name, owner name, property address, payment amount, payment date, confirmation date, Payment_Method, and receipt number
3. THE Payment_Receipt SHALL include Nestora branding and a unique receipt ID
4. THE Rent_Payment_Tracker SHALL generate Payment_Receipts in PDF format
5. THE Rent_Payment_Tracker SHALL allow Tenants to download Payment_Receipts from Payment_History
6. THE Rent_Payment_Tracker SHALL allow Owners to download Payment_Receipts for their records

### Requirement 7: Payment Dispute Handling

**User Story:** As an owner or tenant, I want to dispute incorrect payment records, so that payment history remains accurate.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL allow Owners to mark a Payment_Record as "disputed" with a mandatory reason
2. THE Rent_Payment_Tracker SHALL allow Tenants to respond to disputed payments with comments
3. WHEN a payment is disputed, THE Rent_Payment_Tracker SHALL send notifications to both parties
4. THE Rent_Payment_Tracker SHALL allow Admins to view all disputed Payment_Records
5. THE Rent_Payment_Tracker SHALL allow Admins to resolve disputes by updating Payment_Status
6. THE Rent_Payment_Tracker SHALL maintain a dispute history log for each Payment_Record

### Requirement 8: Payment Analytics Dashboard

**User Story:** As an owner, I want to view payment analytics, so that I can understand payment patterns and tenant reliability.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL display total rent collected per month for each Owner
2. THE Rent_Payment_Tracker SHALL calculate and display on-time payment rate across all tenants
3. THE Rent_Payment_Tracker SHALL show average days to payment confirmation
4. THE Rent_Payment_Tracker SHALL display Payment_Method distribution (percentage breakdown)
5. THE Rent_Payment_Tracker SHALL show pending payment amount across all properties
6. THE Rent_Payment_Tracker SHALL provide a 6-month payment trend chart

### Requirement 9: Tenant Credit Score Integration

**User Story:** As a tenant, I want my payment history to contribute to my credit score, so that I can build rental credibility for future bookings.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL calculate Credit_Score based on payment history (on-time rate, total payments, dispute count)
2. WHEN a Payment_Record is confirmed, THE Rent_Payment_Tracker SHALL update the Tenant's Credit_Score
3. THE Rent_Payment_Tracker SHALL weight recent payments more heavily than older payments in Credit_Score calculation
4. THE Rent_Payment_Tracker SHALL display Credit_Score on Tenant profiles
5. THE Rent_Payment_Tracker SHALL allow Tenants to share their Payment_History and Credit_Score with prospective owners
6. WHEN a payment is marked as Late_Payment, THE Rent_Payment_Tracker SHALL reduce the Tenant's Credit_Score proportionally

### Requirement 10: Payment Method Recording

**User Story:** As a tenant, I want to record the payment method used, so that both parties have complete payment information.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL support Payment_Methods: UPI, bank_transfer, cash, cheque, and online
2. THE Rent_Payment_Tracker SHALL allow Tenants to enter transaction reference numbers for digital payments
3. THE Rent_Payment_Tracker SHALL display Payment_Method in Payment_History and Payment_Receipts
4. WHERE Payment_Method is UPI or bank_transfer, THE Rent_Payment_Tracker SHALL allow entry of transaction ID
5. WHERE Payment_Method is cheque, THE Rent_Payment_Tracker SHALL allow entry of cheque number
6. THE Rent_Payment_Tracker SHALL validate transaction ID format for UPI payments (12-digit numeric)

### Requirement 11: Admin Payment Oversight

**User Story:** As an admin, I want to monitor all payment activities, so that I can ensure platform compliance and resolve issues.

#### Acceptance Criteria

1. THE Rent_Payment_Tracker SHALL allow Admins to view all Payment_Records across all bookings
2. THE Rent_Payment_Tracker SHALL provide filters for Payment_Status, date range, and payment amount
3. THE Rent_Payment_Tracker SHALL display platform-wide payment statistics (total payments, confirmation rate, dispute rate)
4. THE Rent_Payment_Tracker SHALL allow Admins to export payment data to CSV format
5. THE Rent_Payment_Tracker SHALL flag suspicious payment patterns (multiple disputes, unusual amounts)
6. THE Rent_Payment_Tracker SHALL allow Admins to manually adjust Payment_Status when resolving disputes

### Requirement 12: Booking Integration

**User Story:** As a user, I want payment tracking to integrate seamlessly with my bookings, so that I have a unified rental experience.

#### Acceptance Criteria

1. WHEN a Booking status is "approved" and startDate has passed, THE Rent_Payment_Tracker SHALL enable payment logging
2. THE Rent_Payment_Tracker SHALL calculate expected monthly payment count based on Booking duration
3. THE Rent_Payment_Tracker SHALL display payment completion percentage on Booking details page
4. WHEN a Booking ends, THE Rent_Payment_Tracker SHALL mark the Payment_History as complete
5. THE Rent_Payment_Tracker SHALL link to Payment_History from Booking details page
6. THE Rent_Payment_Tracker SHALL prevent payment logging for cancelled or rejected bookings
