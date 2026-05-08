# Implementation Plan: Remaining Critical Improvements

## Overview

This implementation plan breaks down 4 critical features into actionable coding tasks:

1. **Document Scanner** - Camera-based document capture with edge detection and PDF conversion
2. **Receipt Scanning (OCR)** - Automated receipt text extraction and expense form auto-fill
3. **Payment Gateway Integration** - Razorpay integration for seamless rent and expense payments
4. **Service Provider Marketplace** - Provider directory with booking and rating system

**Implementation Language:** TypeScript (Next.js 14, React 18)

**Total Properties to Test:** 31 correctness properties across all features

**Estimated Timeline:** 27-33 hours total

---

## Tasks


### Feature 1: Document Scanner (4-5 hours)

- [ ] 1. Set up document scanner infrastructure and dependencies
  - Install required packages: react-webcam, opencv.js, jspdf, sharp
  - Create document scanner directory structure under components/scanner/
  - Set up TypeScript interfaces for scanner state and props
  - Configure OpenCV.js loading strategy (CDN with local fallback)
  - _Requirements: FR-1.1, FR-1.2_

- [ ] 2. Implement camera integration and capture
  - [ ] 2.1 Create CameraView component with react-webcam
    - Implement camera permission handling
    - Add camera selection (front/rear) for mobile devices
    - Create capture button and preview display
    - Handle permission denial with fallback to file upload
    - _Requirements: BR-1.1, FR-1.1, US-1.1_
  
  - [ ]* 2.2 Write unit tests for camera component
    - Test permission granted/denied scenarios
    - Test camera switching functionality
    - Test capture and preview flow
    - _Requirements: BR-1.1_

- [ ] 3. Implement edge detection and image processing
  - [ ] 3.1 Create image processing pipeline with OpenCV.js
    - Implement grayscale conversion
    - Add Gaussian blur and Canny edge detection
    - Create contour detection for document boundaries
    - Implement perspective transform for cropping
    - Add manual corner adjustment UI as fallback
    - _Requirements: FR-1.2, BR-1.3, US-1.1_
  
  - [ ]* 3.2 Write property test for edge detection and cropping
    - **Property 1.1: Edge Detection and Cropping Pipeline**
    - **Validates: Requirements 1.1.2, 1.1.3**
    - Test that detected edges produce cropped image containing only document region
    - _Requirements: FR-1.2_
  
  - [ ]* 3.3 Write unit tests for image processing
    - Test edge detection with various document types
    - Test manual corner adjustment
    - Test fallback when auto-detection fails
    - _Requirements: FR-1.2_


- [ ] 4. Implement image quality enhancement
  - [ ] 4.1 Create enhancement functions
    - Implement brightness adjustment algorithm
    - Implement contrast enhancement
    - Add sharpening filter
    - Add shadow removal (best effort)
    - _Requirements: FR-1.3, BR-1.3, US-1.2_
  
  - [ ]* 4.2 Write property test for image quality enhancement
    - **Property 1.4: Image Quality Enhancement**
    - **Validates: Requirements 1.2.1, 1.2.2**
    - Test that enhanced image has improved brightness and contrast metrics
    - _Requirements: FR-1.3_
  
  - [ ]* 4.3 Write unit tests for enhancement functions
    - Test brightness adjustment with various input images
    - Test contrast enhancement effectiveness
    - Test sharpening filter
    - _Requirements: FR-1.3_

- [ ] 5. Implement PDF conversion and upload
  - [ ] 5.1 Create PDF generation with jsPDF
    - Convert processed image to PDF format
    - Support multi-page PDFs
    - Implement PDF compression
    - Generate thumbnail from first page
    - _Requirements: FR-1.4, US-1.1_
  
  - [ ]* 5.2 Write property test for PDF conversion
    - **Property 1.2: PDF Conversion**
    - **Validates: Requirements 1.1.4**
    - Test that any processed image produces valid PDF readable by standard readers
    - _Requirements: FR-1.4_
  
  - [ ] 5.3 Implement Cloudinary upload integration
    - Upload PDF to Cloudinary
    - Upload thumbnail image
    - Handle upload failures with retry logic
    - Store URLs in response
    - _Requirements: FR-1.4, US-1.1_
  
  - [ ]* 5.4 Write unit tests for PDF and upload
    - Test PDF generation with single and multiple pages
    - Test file size validation
    - Test upload retry logic
    - _Requirements: FR-1.4_

- [ ] 6. Create document scanner API endpoint
  - [ ] 6.1 Implement POST /api/scan/document route
    - Create Next.js API route handler
    - Validate request payload (image, documentType, corners)
    - Process image server-side if needed
    - Return document metadata and URLs
    - _Requirements: FR-1.1, FR-1.2, FR-1.3, FR-1.4_
  
  - [ ]* 6.2 Write unit tests for API endpoint
    - Test valid document scan request
    - Test invalid file type rejection
    - Test file size validation
    - Test error responses
    - _Requirements: FR-1.1_

- [ ] 7. Integrate with document vault
  - [ ] 7.1 Create Document model and save scanned documents
    - Save document record to MongoDB
    - Link to user account
    - Store document type and metadata
    - Make retrievable via documents API
    - _Requirements: US-1.1, IR-1_
  
  - [ ]* 7.2 Write property test for vault integration
    - **Property 1.3: Document Vault Integration**
    - **Validates: Requirements 1.1.5**
    - Test that successfully scanned documents are stored and retrievable
    - _Requirements: IR-1_

- [ ] 8. Build document scanner UI components
  - [ ] 8.1 Create DocumentScanner main component
    - Implement multi-step flow (camera → preview → processing → complete)
    - Add document type selector
    - Create processing indicator with progress
    - Add retake functionality
    - _Requirements: BR-1.4, US-1.3_
  
  - [ ] 8.2 Create ImagePreview component
    - Show captured image with detected edges overlay
    - Allow manual corner adjustment
    - Add confirm/retake buttons
    - _Requirements: BR-1.4, US-1.3_
  
  - [ ]* 8.3 Write property test for retake state management
    - **Property 1.5: Retake State Management**
    - **Validates: Requirements 1.3.2, 1.3.3**
    - Test that retake action clears previous scan data before new capture
    - _Requirements: US-1.3_

- [ ] 9. Checkpoint - Document Scanner Complete
  - Ensure all tests pass, ask the user if questions arise.


### Feature 2: Receipt Scanner (OCR) (5-6 hours)

- [ ] 10. Set up OCR infrastructure and dependencies
  - Install required packages: tesseract.js, sharp
  - Create receipt scanner directory structure under components/scanner/
  - Set up TypeScript interfaces for OCR results and receipt data
  - Configure Tesseract.js worker paths
  - _Requirements: FR-2.1_

- [ ] 11. Implement receipt capture component
  - [ ] 11.1 Create ReceiptCapture component
    - Reuse camera functionality from document scanner
    - Add receipt-specific capture guidance
    - Optimize for receipt dimensions
    - Show capture tips for better OCR results
    - _Requirements: BR-2.1, US-2.1_
  
  - [ ]* 11.2 Write unit tests for receipt capture
    - Test camera integration
    - Test capture flow
    - Test image quality assessment
    - _Requirements: BR-2.1_

- [ ] 12. Implement image preprocessing for OCR
  - [ ] 12.1 Create preprocessing pipeline with Sharp
    - Resize large images (max width 1200px)
    - Convert to grayscale
    - Increase contrast
    - Apply adaptive threshold
    - Implement deskew if needed
    - Remove EXIF data for privacy
    - _Requirements: FR-2.1, BR-2.1_
  
  - [ ]* 12.2 Write unit tests for preprocessing
    - Test image resizing
    - Test grayscale conversion
    - Test contrast enhancement
    - Test EXIF removal
    - _Requirements: FR-2.1_

- [ ] 13. Implement OCR text extraction
  - [ ] 13.1 Create OCR processor with Tesseract.js
    - Initialize Tesseract worker
    - Extract text from preprocessed image
    - Support English and Hindi languages
    - Calculate confidence scores
    - Handle OCR failures gracefully
    - _Requirements: FR-2.1, BR-2.2, US-2.1_
  
  - [ ]* 13.2 Write property test for confidence score calculation
    - **Property 2.4: Confidence Score Calculation**
    - **Validates: Requirements 2.3.1**
    - Test that confidence scores are always between 0-100 for all fields
    - _Requirements: FR-2.1_
  
  - [ ]* 13.3 Write unit tests for OCR extraction
    - Test with high-quality receipt images
    - Test with poor-quality images (blurry, dark, skewed)
    - Test with different receipt formats
    - _Requirements: FR-2.1_

- [ ] 14. Implement amount parsing and detection
  - [ ] 14.1 Create amount extraction logic
    - Define regex patterns for Indian currency formats
    - Extract amounts with ₹, Rs, INR symbols
    - Handle comma and decimal separators
    - Identify total vs subtotal
    - Calculate confidence based on pattern matches
    - _Requirements: FR-2.2, BR-2.3, US-2.1_
  
  - [ ]* 14.2 Write unit tests for amount parsing
    - Test various currency formats (₹1,234.56, Rs 1234, INR 1234.56)
    - Test amount extraction from different receipt layouts
    - Test confidence calculation
    - _Requirements: FR-2.2_

- [ ] 15. Implement merchant and date extraction
  - [ ] 15.1 Create merchant name extraction
    - Extract text from top of receipt
    - Identify merchant name patterns
    - Clean up extracted text
    - Calculate confidence score
    - _Requirements: FR-2.4, BR-2.2, US-2.2_
  
  - [ ] 15.2 Create date extraction logic
    - Define regex patterns for date formats
    - Support DD/MM/YYYY, DD-MM-YY, DD Mon YYYY
    - Validate extracted dates are reasonable
    - Default to current date if extraction fails
    - _Requirements: FR-2.3_
  
  - [ ]* 15.3 Write unit tests for merchant and date parsing
    - Test merchant extraction from various receipt layouts
    - Test date parsing with multiple formats
    - Test date validation
    - _Requirements: FR-2.3, FR-2.4_


- [ ] 16. Create receipt OCR API endpoint
  - [ ] 16.1 Implement POST /api/ocr/receipt route
    - Create Next.js API route handler
    - Validate request payload (image, category)
    - Run preprocessing and OCR pipeline
    - Parse amount, merchant, date from OCR text
    - Upload receipt image to Cloudinary
    - Return structured OCR results with confidence scores
    - _Requirements: FR-2.1, FR-2.2, FR-2.3, FR-2.4_
  
  - [ ]* 16.2 Write property test for OCR graceful degradation
    - **Property 2.7: OCR Graceful Degradation**
    - **Validates: Requirements FR-2.1 (error handling)**
    - Test that OCR failures still allow manual entry and attach receipt image
    - _Requirements: FR-2.1_
  
  - [ ]* 16.3 Write unit tests for OCR API
    - Test successful OCR processing
    - Test OCR failure handling
    - Test image upload to Cloudinary
    - Test response format
    - _Requirements: FR-2.1_

- [ ] 17. Implement expense form auto-fill integration
  - [ ] 17.1 Create form auto-fill logic
    - Pre-fill amount field with detected value
    - Pre-fill description with merchant name
    - Pre-fill date with detected date
    - Attach receipt image to expense
    - Allow user to edit all fields
    - _Requirements: BR-2.4, US-2.1, US-2.2_
  
  - [ ]* 17.2 Write property test for amount detection and form population
    - **Property 2.1: Amount Detection and Form Population**
    - **Validates: Requirements 2.1.3, 2.1.4**
    - Test that detected amount pre-fills expense form amount field
    - _Requirements: FR-2.2_
  
  - [ ]* 17.3 Write property test for merchant detection and description population
    - **Property 2.2: Merchant Detection and Description Population**
    - **Validates: Requirements 2.2.1, 2.2.2**
    - Test that detected merchant pre-fills expense form description field
    - _Requirements: FR-2.4_
  
  - [ ]* 17.4 Write property test for receipt image attachment
    - **Property 2.3: Receipt Image Attachment**
    - **Validates: Requirements 2.2.4**
    - Test that receipt image is attached to expense and retrievable
    - _Requirements: US-2.2_

- [ ] 18. Build receipt scanner UI components
  - [ ] 18.1 Create ReceiptScanner main component
    - Implement multi-step flow (capture → processing → review → complete)
    - Show OCR processing indicator with progress
    - Display extracted data for review
    - _Requirements: BR-2.4, US-2.1_
  
  - [ ] 18.2 Create ReceiptReview component
    - Display detected amount, merchant, date
    - Show confidence scores for each field
    - Highlight low-confidence fields
    - Allow editing of detected values
    - Show original receipt image
    - _Requirements: BR-2.4, US-2.3_
  
  - [ ]* 18.3 Write property test for confidence-based UI feedback
    - **Property 2.5: Confidence-Based UI Feedback**
    - **Validates: Requirements 2.3.2**
    - Test that low-confidence fields are visually highlighted in UI
    - _Requirements: US-2.3_
  
  - [ ]* 18.4 Write property test for high-confidence auto-acceptance
    - **Property 2.6: High-Confidence Auto-Acceptance**
    - **Validates: Requirements 2.3.4**
    - Test that high-confidence fields are marked as auto-accepted
    - _Requirements: US-2.3_

- [ ] 19. Checkpoint - Receipt Scanner Complete
  - Ensure all tests pass, ask the user if questions arise.


### Feature 3: Payment Gateway Integration (8-10 hours)

- [ ] 20. Set up Razorpay integration and dependencies
  - Install razorpay package
  - Set up environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
  - Create payment directory structure under lib/payments/
  - Set up TypeScript interfaces for payment data
  - Create Razorpay instance singleton
  - _Requirements: FR-3.1, BR-3.1_

- [ ] 21. Create Payment data model
  - [ ] 21.1 Define Payment schema in MongoDB
    - Create IPayment interface with all required fields
    - Add indexes for userId, orderId, paymentId, referenceId
    - Add status field with enum values
    - Add timestamps
    - _Requirements: BR-3.1, BR-3.3_
  
  - [ ]* 21.2 Write unit tests for Payment model
    - Test model creation
    - Test field validation
    - Test index creation
    - _Requirements: BR-3.1_

- [ ] 22. Implement payment order creation
  - [ ] 22.1 Create POST /api/payments/create-order endpoint
    - Validate amount, purpose, referenceId from request
    - Fetch reference entity (rent/settlement/booking) to verify amount
    - Create Razorpay order via API
    - Store order in database
    - Return order details with Razorpay key for checkout
    - _Requirements: FR-3.1, FR-3.2, BR-3.1, US-3.1, US-3.2_
  
  - [ ]* 22.2 Write property test for payment amount consistency
    - **Property 3.4: Payment Amount Consistency**
    - **Validates: Requirements 3.2.2**
    - Test that Razorpay order amount matches reference entity amount
    - _Requirements: FR-3.2_
  
  - [ ]* 22.3 Write unit tests for order creation
    - Test valid order creation for rent payment
    - Test valid order creation for settlement payment
    - Test invalid amount rejection (negative, zero, too large)
    - Test missing referenceId handling
    - _Requirements: FR-3.1_

- [ ] 23. Implement payment verification
  - [ ] 23.1 Create signature verification utility
    - Implement HMAC SHA256 signature verification
    - Use crypto.timingSafeEqual for secure comparison
    - Handle invalid signatures
    - _Requirements: FR-3.1, BR-3.2_
  
  - [ ] 23.2 Create POST /api/payments/verify endpoint
    - Validate orderId, paymentId, signature from request
    - Verify Razorpay signature
    - Update payment status to 'captured'
    - Update reference entity status (rent → paid, settlement → confirmed)
    - Generate payment receipt
    - Send notifications to relevant parties
    - Return payment confirmation
    - _Requirements: FR-3.1, FR-3.2, BR-3.3, US-3.1, US-3.2, US-3.3_
  
  - [ ]* 23.3 Write property test for rent payment status update
    - **Property 3.1: Rent Payment Status Update**
    - **Validates: Requirements 3.1.4**
    - Test that successful rent payment updates rent status to 'paid'
    - _Requirements: FR-3.2_
  
  - [ ]* 23.4 Write property test for settlement payment status update
    - **Property 3.2: Settlement Payment Status Update**
    - **Validates: Requirements 3.2.4**
    - Test that successful settlement payment updates status to 'confirmed'
    - _Requirements: FR-3.2_
  
  - [ ]* 23.5 Write unit tests for payment verification
    - Test valid signature verification
    - Test invalid signature rejection
    - Test payment status transitions
    - Test database update atomicity
    - _Requirements: FR-3.1_


- [ ] 24. Implement webhook handling
  - [ ] 24.1 Create POST /api/payments/webhook endpoint
    - Verify webhook signature from Razorpay
    - Parse webhook event type (payment.captured, payment.failed, refund.processed)
    - Implement idempotency check (prevent duplicate processing)
    - Update payment status based on event
    - Update reference entity status
    - Send notifications
    - Respond immediately to Razorpay
    - _Requirements: FR-3.3, BR-3.3_
  
  - [ ]* 24.2 Write unit tests for webhook handling
    - Test webhook signature verification
    - Test idempotency (duplicate webhook calls)
    - Test payment.captured event handling
    - Test payment.failed event handling
    - Test refund.processed event handling
    - _Requirements: FR-3.3_

- [ ] 25. Implement payment receipt generation
  - [ ] 25.1 Create receipt generation utility
    - Generate PDF receipt with payment details
    - Include payer and payee information
    - Include payment method and timestamp
    - Upload receipt to Cloudinary
    - Store receipt URL in payment record
    - _Requirements: BR-3.3, US-3.3_
  
  - [ ]* 25.2 Write property test for payment receipt generation
    - **Property 3.3: Payment Receipt Generation**
    - **Validates: Requirements 3.1.5, 3.3.5**
    - Test that successful payment generates downloadable receipt
    - _Requirements: BR-3.3_

- [ ] 26. Implement payment notifications
  - [ ] 26.1 Create notification service for payments
    - Send email notification to payer
    - Send email notification to payee
    - Send in-app notification to both parties
    - Include payment details and receipt link
    - _Requirements: BR-3.3, US-3.3_
  
  - [ ]* 26.2 Write property test for payment notification delivery
    - **Property 3.5: Payment Notification Delivery**
    - **Validates: Requirements 3.2.5, 3.3.2, 3.3.3**
    - Test that successful payment sends notifications to all relevant parties
    - _Requirements: BR-3.3_

- [ ] 27. Implement payment history and persistence
  - [ ] 27.1 Create GET /api/payments endpoint
    - Fetch user's payment history
    - Support filtering by status, purpose, date range
    - Support pagination
    - Return payment records with receipt URLs
    - _Requirements: BR-3.3, US-3.3_
  
  - [ ]* 27.2 Write property test for payment history persistence
    - **Property 3.6: Payment History Persistence**
    - **Validates: Requirements 3.3.4**
    - Test that all payments (success/failure) are stored and retrievable
    - _Requirements: BR-3.3_

- [ ] 28. Implement refund functionality
  - [ ] 28.1 Create POST /api/payments/refund endpoint
    - Validate paymentId and refund amount
    - Verify user is creditor (authorized to refund)
    - Validate refund reason is provided
    - Create refund via Razorpay API
    - Update payment record with refund details
    - Send refund notifications to both parties
    - _Requirements: FR-3.4, BR-3.4, US-3.4_
  
  - [ ]* 28.2 Write property test for refund reason validation
    - **Property 3.7: Refund Reason Validation**
    - **Validates: Requirements 3.4.3**
    - Test that refund requests without reason are rejected
    - _Requirements: FR-3.4_
  
  - [ ]* 28.3 Write property test for refund processing
    - **Property 3.8: Refund Processing**
    - **Validates: Requirements 3.4.4**
    - Test that valid refund initiates Razorpay refund and stores refund ID
    - _Requirements: FR-3.4_
  
  - [ ]* 28.4 Write property test for refund notification delivery
    - **Property 3.9: Refund Notification Delivery**
    - **Validates: Requirements 3.4.5**
    - Test that processed refund sends notifications to payer and payee
    - _Requirements: FR-3.4_
  
  - [ ]* 28.5 Write unit tests for refund functionality
    - Test valid refund creation
    - Test invalid refund amount rejection
    - Test unauthorized refund rejection
    - Test refund status tracking
    - _Requirements: FR-3.4_


- [ ] 29. Build payment UI components
  - [ ] 29.1 Create PaymentButton component
    - Accept amount, purpose, referenceId as props
    - Create payment order on click
    - Open Razorpay checkout modal
    - Handle payment success callback
    - Handle payment failure callback
    - Show loading state during processing
    - _Requirements: BR-3.1, US-3.1, US-3.2_
  
  - [ ] 29.2 Create PaymentModal component
    - Configure Razorpay checkout options
    - Pre-fill user details (name, email, phone)
    - Apply Stayerra branding
    - Handle modal dismiss
    - _Requirements: BR-3.1, US-3.1_
  
  - [ ] 29.3 Create PaymentStatus component
    - Show success message with payment details
    - Show failure message with retry option
    - Display receipt download link
    - Show payment confirmation
    - _Requirements: BR-3.3, US-3.3_
  
  - [ ] 29.4 Create RefundButton component
    - Accept paymentId, amount, maxAmount as props
    - Show refund confirmation dialog
    - Require refund reason input
    - Process refund on confirmation
    - Show refund status
    - _Requirements: BR-3.4, US-3.4_
  
  - [ ] 29.5 Create PaymentHistory component
    - Display list of user's payments
    - Show payment status, amount, date, method
    - Provide receipt download links
    - Support filtering and pagination
    - _Requirements: BR-3.3, US-3.3_

- [ ] 30. Integrate payment gateway with existing features
  - [ ] 30.1 Add "Pay Now" button to rent tracker
    - Show button for pending rent payments
    - Pass rent amount and ID to PaymentButton
    - Update rent status on payment success
    - _Requirements: IR-3, US-3.1_
  
  - [ ] 30.2 Add "Pay" button to expense settlements
    - Show button for pending settlements
    - Pass settlement amount and ID to PaymentButton
    - Update settlement status on payment success
    - _Requirements: IR-4, US-3.2_
  
  - [ ] 30.3 Add payment option to service bookings
    - Show payment button after service completion
    - Pass booking cost and ID to PaymentButton
    - Link payment to booking record
    - _Requirements: IR-4_

- [ ] 31. Implement rate limiting and security measures
  - [ ] 31.1 Add rate limiting for payment endpoints
    - Limit payment attempts per user per minute
    - Prevent payment spam
    - Return appropriate error messages
    - _Requirements: BR-3.2_
  
  - [ ] 31.2 Add payment logging and monitoring
    - Log all payment events (initiated, success, failure)
    - Log refund events
    - Do not log sensitive data
    - Set up error tracking for payment failures
    - _Requirements: BR-3.2_

- [ ] 32. Checkpoint - Payment Gateway Complete
  - Ensure all tests pass, ask the user if questions arise.


### Feature 4: Service Provider Marketplace (10-12 hours)

- [ ] 33. Create service provider data models
  - [ ] 33.1 Define ServiceProvider schema in MongoDB
    - Create IServiceProvider interface with all required fields
    - Add services array with ServiceCategory enum
    - Add rating and reviewCount fields
    - Add availability object with days and hours
    - Add indexes for services, location, rating, verified status
    - _Requirements: FR-4.1, BR-4.1_
  
  - [ ] 33.2 Define ServiceBooking schema in MongoDB
    - Create IServiceBooking interface with all required fields
    - Add status enum (pending, confirmed, in_progress, completed, cancelled)
    - Link to user, provider, and optional maintenanceRequest
    - Add indexes for userId, providerId, status, preferredDate
    - _Requirements: FR-4.2, BR-4.3_
  
  - [ ] 33.3 Define Review schema in MongoDB
    - Create IReview interface with all required fields
    - Add rating field (1-5)
    - Link to booking, provider, and user
    - Add unique index on bookingId (one review per booking)
    - Add indexes for providerId, rating, createdAt
    - _Requirements: FR-4.5, BR-4.4_
  
  - [ ]* 33.4 Write unit tests for data models
    - Test model creation and validation
    - Test field constraints
    - Test index creation
    - _Requirements: FR-4.1, FR-4.2, FR-4.5_

- [ ] 34. Implement provider listing and search
  - [ ] 34.1 Create GET /api/providers endpoint
    - Support filtering by category, location, minRating, verified
    - Implement pagination (page, limit)
    - Sort by rating descending
    - Return provider list with metadata
    - _Requirements: FR-4.3, BR-4.1, US-4.1, US-4.2_
  
  - [ ]* 34.2 Write property test for provider category filtering
    - **Property 4.1: Provider Category Filtering**
    - **Validates: Requirements 4.1.2**
    - Test that category query returns only providers with that service
    - _Requirements: FR-4.3_
  
  - [ ]* 34.3 Write unit tests for provider listing
    - Test category filtering
    - Test location filtering
    - Test rating filtering
    - Test verified filtering
    - Test pagination
    - _Requirements: FR-4.3_

- [ ] 35. Implement provider profile endpoint
  - [ ] 35.1 Create GET /api/providers/:id endpoint
    - Fetch provider details by ID
    - Include recent reviews
    - Calculate and return provider statistics
    - Mask contact details if no active booking
    - _Requirements: FR-4.1, BR-4.1, US-4.2_
  
  - [ ]* 35.2 Write property test for provider contact information completeness
    - **Property 4.2: Provider Contact Information Completeness**
    - **Validates: Requirements 4.1.3**
    - Test that provider response includes all contact details
    - _Requirements: FR-4.1_
  
  - [ ]* 35.3 Write unit tests for provider profile
    - Test provider details retrieval
    - Test contact masking without booking
    - Test contact reveal with active booking
    - Test provider not found handling
    - _Requirements: FR-4.1_

- [ ] 36. Implement service booking creation
  - [ ] 36.1 Create POST /api/bookings endpoint
    - Validate booking data (providerId, serviceType, description, dates)
    - Check provider availability
    - Create booking record with 'pending' status
    - Link to maintenanceRequest if provided
    - Calculate estimated cost
    - Send booking notification to provider
    - Send confirmation to user
    - _Requirements: FR-4.4, BR-4.3, US-4.1, US-4.3_
  
  - [ ]* 36.2 Write property test for booking-maintenance request linking
    - **Property 4.3: Booking-Maintenance Request Linking**
    - **Validates: Requirements 4.1.5**
    - Test that bookings created from maintenance requests contain the request ID
    - _Requirements: FR-4.4_
  
  - [ ]* 36.3 Write property test for booking confirmation delivery
    - **Property 4.7: Booking Confirmation Delivery**
    - **Validates: Requirements 4.3.5**
    - Test that new booking sends notifications to user and provider
    - _Requirements: FR-4.4_
  
  - [ ]* 36.4 Write unit tests for booking creation
    - Test valid booking creation
    - Test invalid data rejection (past dates, missing fields)
    - Test provider availability checking
    - Test booking conflict detection
    - _Requirements: FR-4.4_


- [ ] 37. Implement booking status management
  - [ ] 37.1 Create PATCH /api/bookings/:id endpoint
    - Allow status updates (confirmed, in_progress, completed, cancelled)
    - Validate status transitions
    - Update actualCost on completion
    - Add completion notes
    - Send status update notifications
    - _Requirements: FR-4.4, BR-4.3_
  
  - [ ]* 37.2 Write property test for rating prompt trigger
    - **Property 4.8: Rating Prompt Trigger**
    - **Validates: Requirements 4.4.1**
    - Test that booking completion triggers rating prompt for user
    - _Requirements: FR-4.4_
  
  - [ ]* 37.3 Write unit tests for booking status updates
    - Test valid status transitions
    - Test invalid status transitions
    - Test completion with cost update
    - Test cancellation handling
    - _Requirements: FR-4.4_

- [ ] 38. Implement provider cost information
  - [ ] 38.1 Add cost estimation logic
    - Define price ranges by service category
    - Calculate estimated cost based on service type
    - Display cost range on provider profile
    - Show estimated cost before booking
    - _Requirements: BR-4.3, US-4.3_
  
  - [ ]* 38.2 Write property test for provider cost information availability
    - **Property 4.5: Provider Cost Information Availability**
    - **Validates: Requirements 4.3.1, 4.3.2**
    - Test that cost information is available before booking
    - _Requirements: BR-4.3_

- [ ] 39. Implement payment integration for bookings
  - [ ] 39.1 Add payment processing for completed bookings
    - Show payment button after service completion
    - Create payment order with booking cost
    - Link payment to booking record
    - Update booking payment status
    - _Requirements: BR-4.3, US-4.3_
  
  - [ ]* 39.2 Write property test for booking payment integration
    - **Property 4.6: Booking Payment Integration**
    - **Validates: Requirements 4.3.4**
    - Test that completed bookings allow payment through gateway
    - _Requirements: BR-4.3_

- [ ] 40. Implement rating and review system
  - [ ] 40.1 Create POST /api/providers/:id/reviews endpoint
    - Validate user has completed booking with provider
    - Validate rating is integer between 1-5
    - Prevent duplicate reviews for same booking
    - Store review with photos
    - Update provider's average rating and review count
    - Publish review immediately
    - _Requirements: FR-4.5, BR-4.4, US-4.4_
  
  - [ ]* 40.2 Write property test for rating value validation
    - **Property 4.9: Rating Value Validation**
    - **Validates: Requirements 4.4.2**
    - Test that ratings outside 1-5 range are rejected
    - _Requirements: FR-4.5_
  
  - [ ]* 40.3 Write property test for review photo attachment support
    - **Property 4.10: Review Photo Attachment Support**
    - **Validates: Requirements 4.4.4**
    - Test that reviews accept and store photo attachments
    - _Requirements: FR-4.5_
  
  - [ ]* 40.4 Write property test for review immediate publication
    - **Property 4.11: Review Immediate Publication**
    - **Validates: Requirements 4.4.5**
    - Test that submitted reviews are immediately visible
    - _Requirements: FR-4.5_
  
  - [ ]* 40.5 Write unit tests for rating and review
    - Test valid review creation
    - Test invalid rating rejection
    - Test duplicate review prevention
    - Test review without completed booking rejection
    - Test rating average calculation
    - _Requirements: FR-4.5_

- [ ] 41. Implement review retrieval and filtering
  - [ ] 41.1 Create GET /api/providers/:id/reviews endpoint
    - Fetch reviews for a provider
    - Support filtering by rating value
    - Support pagination
    - Include user name, date, rating, text, photos
    - Calculate review count
    - _Requirements: BR-4.4, US-4.2_
  
  - [ ]* 41.2 Write property test for review data completeness and accessibility
    - **Property 4.4: Review Data Completeness and Accessibility**
    - **Validates: Requirements 4.2.2, 4.2.3, 4.2.4, 4.2.5**
    - Test that reviews include all data and are filterable by rating
    - _Requirements: BR-4.4_


- [ ] 42. Build provider marketplace UI components
  - [ ] 42.1 Create ProviderList component
    - Display grid/list of provider cards
    - Show provider name, services, rating, review count
    - Add category filter dropdown
    - Add location filter
    - Add verified badge
    - Implement pagination controls
    - _Requirements: BR-4.1, US-4.1, US-4.2_
  
  - [ ] 42.2 Create ProviderCard component
    - Show provider summary (name, avatar, rating, services)
    - Display price range
    - Show response time
    - Add "View Profile" button
    - Show verified badge if applicable
    - _Requirements: BR-4.1, US-4.2_
  
  - [ ] 42.3 Create ProviderProfile component
    - Display full provider details
    - Show bio, experience, completed jobs
    - Display rating and review count
    - Show gallery of work photos
    - List certifications
    - Show availability schedule
    - Display recent reviews
    - Add "Book Service" button
    - _Requirements: BR-4.1, US-4.2_
  
  - [ ] 42.4 Create BookingForm component
    - Service type selector
    - Description text area
    - Preferred date picker
    - Preferred time selector
    - Show estimated cost
    - Link to maintenance request if applicable
    - Submit button
    - _Requirements: BR-4.3, US-4.3_
  
  - [ ] 42.5 Create BookingList component
    - Display user's bookings
    - Show booking status with color coding
    - Display provider details
    - Show service date and time
    - Add status update buttons (for providers)
    - Show payment button for completed bookings
    - Add "Rate Service" button after completion
    - _Requirements: BR-4.3, US-4.3_
  
  - [ ] 42.6 Create RatingForm component
    - 5-star rating selector
    - Review text area
    - Photo upload (multiple)
    - "Would recommend" checkbox
    - Submit button
    - _Requirements: BR-4.4, US-4.4_
  
  - [ ] 42.7 Create ReviewList component
    - Display reviews for a provider
    - Show user name, date, rating, text
    - Display review photos
    - Add rating filter (1-5 stars, all)
    - Show "Would recommend" indicator
    - Implement pagination
    - _Requirements: BR-4.4, US-4.2_

- [ ] 43. Integrate marketplace with maintenance tracker
  - [ ] 43.1 Add "Find Provider" button to maintenance requests
    - Show button on maintenance request detail page
    - Filter providers by maintenance category
    - Pre-fill booking form with maintenance details
    - Link booking to maintenance request
    - Update maintenance status when service is completed
    - _Requirements: IR-5, US-4.1_
  
  - [ ]* 43.2 Write unit tests for maintenance integration
    - Test provider filtering by maintenance category
    - Test booking creation from maintenance request
    - Test maintenance status update on service completion
    - _Requirements: IR-5_

- [ ] 44. Implement provider verification system (admin)
  - [ ] 44.1 Create admin provider management endpoints
    - GET /api/admin/providers - List all providers
    - PATCH /api/admin/providers/:id - Update provider verification status
    - POST /api/admin/providers - Add new provider
    - DELETE /api/admin/providers/:id - Remove provider
    - _Requirements: BR-4.1_
  
  - [ ] 44.2 Create admin provider management UI
    - List pending provider verifications
    - Show provider details and verification documents
    - Add approve/reject buttons
    - Show all providers with edit capability
    - _Requirements: BR-4.1_

- [ ] 45. Add provider search and filtering enhancements
  - [ ] 45.1 Implement advanced search
    - Search by provider name
    - Search by service keywords
    - Combine multiple filters
    - Sort by rating, review count, or price
    - _Requirements: BR-4.1_
  
  - [ ] 45.2 Add provider availability calendar
    - Show provider's available time slots
    - Allow booking specific time slots
    - Prevent double-booking
    - _Requirements: BR-4.3_

- [ ] 46. Checkpoint - Service Marketplace Complete
  - Ensure all tests pass, ask the user if questions arise.


### Cross-Feature Integration and Polish

- [ ] 47. Set up testing infrastructure
  - [ ] 47.1 Install and configure fast-check for property-based testing
    - Install fast-check package
    - Create test data generators (documentImage, receiptImage, serviceProvider, etc.)
    - Set up test configuration with 100 runs per property test
    - Create test utilities and helpers
    - _Requirements: Testing Strategy_
  
  - [ ] 47.2 Set up unit testing framework
    - Configure Jest or Vitest for Next.js
    - Set up test database for integration tests
    - Create test fixtures and mocks
    - Configure code coverage reporting
    - _Requirements: Testing Strategy_

- [ ] 48. Implement error handling and logging
  - [ ] 48.1 Add comprehensive error handling
    - Implement error boundaries for React components
    - Add try-catch blocks in API routes
    - Create standardized error response format
    - Add user-friendly error messages
    - _Requirements: Error Handling section_
  
  - [ ] 48.2 Set up logging and monitoring
    - Configure logging for all features
    - Add payment event logging
    - Add OCR performance logging
    - Set up error tracking (Sentry or similar)
    - Do not log sensitive data
    - _Requirements: Deployment Considerations_

- [ ] 49. Optimize performance
  - [ ] 49.1 Implement client-side optimizations
    - Use Web Workers for image processing
    - Lazy load OpenCV.js and Tesseract.js
    - Implement progressive enhancement for scanner
    - Add loading states and progress indicators
    - _Requirements: Performance Optimization section_
  
  - [ ] 49.2 Implement server-side optimizations
    - Add Redis caching for OCR results
    - Cache provider profiles
    - Implement database query optimization
    - Add pagination to all list endpoints
    - _Requirements: Performance Optimization section_
  
  - [ ] 49.3 Add rate limiting
    - Implement rate limiting for payment endpoints
    - Add rate limiting for OCR endpoints
    - Add rate limiting for booking creation
    - Return appropriate error messages
    - _Requirements: Security Considerations_

- [ ] 50. Implement security measures
  - [ ] 50.1 Add authentication and authorization checks
    - Verify JWT tokens on all protected endpoints
    - Implement role-based access control
    - Add admin-only endpoint protection
    - Verify user ownership for sensitive operations
    - _Requirements: Security Considerations_
  
  - [ ] 50.2 Add data validation and sanitization
    - Validate all API request payloads
    - Sanitize user inputs
    - Remove EXIF data from uploaded images
    - Validate file types and sizes
    - _Requirements: Security Considerations_
  
  - [ ] 50.3 Implement payment security measures
    - Verify all Razorpay signatures
    - Implement webhook idempotency
    - Use atomic database transactions
    - Never log sensitive payment data
    - _Requirements: Security Considerations_

- [ ] 51. Add environment configuration
  - [ ] 51.1 Set up environment variables
    - Add Razorpay keys (test and production)
    - Add webhook secrets
    - Add feature flags
    - Add Tesseract worker paths
    - Document all required environment variables
    - _Requirements: Deployment Considerations_
  
  - [ ] 51.2 Create database migration scripts
    - Create migration for Document collection
    - Create migration for Payment collection
    - Create migration for ServiceProvider collection
    - Create migration for ServiceBooking collection
    - Create migration for Review collection
    - Create indexes for all collections
    - _Requirements: Deployment Considerations_

- [ ] 52. Deploy static assets
  - [ ] 52.1 Set up OpenCV.js and Tesseract.js workers
    - Copy OpenCV.js to public directory
    - Copy Tesseract workers to public directory
    - Configure CDN fallback
    - Test worker loading
    - _Requirements: Deployment Considerations_


- [ ] 53. Create user documentation and guides
  - [ ] 53.1 Create in-app help for document scanner
    - Add scanning tips overlay
    - Create troubleshooting guide for edge detection
    - Add lighting and positioning guidance
    - _Requirements: BR-1.4_
  
  - [ ] 53.2 Create in-app help for receipt scanner
    - Add receipt capture tips
    - Create guide for improving OCR accuracy
    - Add manual entry instructions
    - _Requirements: BR-2.4_
  
  - [ ] 53.3 Create payment help documentation
    - Add payment method guide
    - Create refund policy documentation
    - Add payment troubleshooting guide
    - _Requirements: BR-3.1_
  
  - [ ] 53.4 Create marketplace user guide
    - Add provider selection tips
    - Create booking process guide
    - Add rating and review guidelines
    - _Requirements: BR-4.1_

- [ ] 54. Final integration testing
  - [ ] 54.1 Test document scanner end-to-end flow
    - Test camera → capture → process → upload → vault
    - Test with various document types
    - Test error scenarios and fallbacks
    - Verify performance benchmarks
    - _Requirements: Integration Testing section_
  
  - [ ] 54.2 Test receipt scanner end-to-end flow
    - Test camera → OCR → form fill → expense creation
    - Test with various receipt formats
    - Test low-confidence handling
    - Verify OCR accuracy targets
    - _Requirements: Integration Testing section_
  
  - [ ] 54.3 Test payment gateway end-to-end flow
    - Test initiate → checkout → verify → status update → receipt
    - Test with Razorpay test mode
    - Test webhook delivery and processing
    - Test refund flow
    - Verify payment security measures
    - _Requirements: Integration Testing section_
  
  - [ ] 54.4 Test service marketplace end-to-end flow
    - Test search → select → book → confirm → complete → review
    - Test provider filtering and sorting
    - Test booking notifications
    - Test rating calculation
    - _Requirements: Integration Testing section_
  
  - [ ] 54.5 Test cross-feature integrations
    - Test document scanner → document vault integration
    - Test receipt scanner → expense creation integration
    - Test payment gateway → rent tracker integration
    - Test payment gateway → expense settlements integration
    - Test marketplace → maintenance tracker integration
    - _Requirements: Integration Requirements section_

- [ ] 55. Performance and load testing
  - [ ] 55.1 Run performance benchmarks
    - Document edge detection < 500ms
    - Document processing < 2 seconds
    - PDF conversion < 3 seconds
    - OCR processing < 5 seconds
    - Payment order creation < 1 second
    - Payment verification < 2 seconds
    - Provider search < 500ms
    - Booking creation < 1 second
    - _Requirements: Performance Testing section_
  
  - [ ] 55.2 Run load tests
    - 100 concurrent document scans
    - 50 concurrent OCR requests
    - 200 concurrent payment verifications
    - 500 concurrent provider searches
    - _Requirements: Performance Testing section_

- [ ] 56. Security audit and testing
  - [ ] 56.1 Audit authentication and authorization
    - Verify JWT validation on all endpoints
    - Test unauthorized access attempts
    - Verify role-based access control
    - Test user ownership checks
    - _Requirements: Security Considerations_
  
  - [ ] 56.2 Audit payment security
    - Verify signature verification
    - Test webhook security
    - Verify idempotency
    - Test rate limiting
    - Verify no sensitive data logging
    - _Requirements: Security Considerations_
  
  - [ ] 56.3 Audit data privacy
    - Verify document encryption
    - Test access control
    - Verify EXIF removal
    - Test contact masking
    - _Requirements: Security Considerations_

- [ ] 57. Final checkpoint - All features complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

### Task Organization

- **Tasks marked with `*`** are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties (31 total)
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at feature boundaries

### Property-Based Testing

All property tests use fast-check with minimum 100 runs per test:
- **Document Scanner**: 5 properties
- **Receipt Scanner**: 7 properties  
- **Payment Gateway**: 9 properties
- **Service Marketplace**: 10 properties

### Implementation Order

Features can be implemented in parallel by different developers, but recommended order:
1. Document Scanner (foundational camera/image processing)
2. Receipt Scanner (builds on document scanner)
3. Payment Gateway (independent, high priority)
4. Service Marketplace (integrates with maintenance tracker)

### Dependencies

- **External**: react-webcam, opencv.js, jspdf, sharp, tesseract.js, razorpay
- **Internal**: Document vault, Expense system, Rent tracker, Maintenance tracker
- **Services**: Cloudinary (existing), Razorpay (new)

### Time Estimates

- Document Scanner: 4-5 hours
- Receipt Scanner: 5-6 hours
- Payment Gateway: 8-10 hours
- Service Marketplace: 10-12 hours
- Integration & Testing: 3-4 hours
- **Total: 30-37 hours**

### Success Criteria

- All 31 correctness properties pass
- All unit tests pass
- Performance benchmarks met
- Security audit passed
- End-to-end flows verified
- User documentation complete

