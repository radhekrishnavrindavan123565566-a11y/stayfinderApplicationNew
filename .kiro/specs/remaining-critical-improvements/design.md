# Technical Design: Remaining Critical Improvements

## Overview

This design document covers the technical implementation of 4 critical features for the Stayerra platform:

1. **Document Scanner** - Camera-based document capture with edge detection and PDF conversion
2. **Receipt Scanning (OCR)** - Automated receipt text extraction and expense form auto-fill
3. **Payment Gateway Integration** - Razorpay integration for seamless rent and expense payments
4. **Service Provider Marketplace** - Provider directory with booking and rating system

These features complete the platform's daily engagement ecosystem by eliminating manual data entry, enabling one-click payments, and connecting users with trusted service providers.

### Design Goals

- **Automation**: Reduce manual data entry by 80% through scanning and OCR
- **Convenience**: Enable one-click payments for rent and expenses
- **Trust**: Build marketplace with verified providers and transparent ratings
- **Performance**: All operations complete within 10 seconds
- **Reliability**: Graceful fallbacks when automation fails

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Document Processing**: react-webcam, opencv.js, jsPDF
- **OCR**: Tesseract.js, Sharp (image preprocessing)
- **Payments**: Razorpay SDK, Razorpay Webhooks
- **Storage**: Cloudinary (existing)
- **Authentication**: JWT (existing)

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Document   │  │   Receipt    │  │   Payment    │          │
│  │   Scanner    │  │   Scanner    │  │   Gateway    │          │
│  │  Component   │  │  Component   │  │  Component   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                  │                   │
│         │                 │                  │                   │
│  ┌──────▼─────────────────▼──────────────────▼────────────────┐ │
│  │           Service Provider Marketplace UI                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                      API Layer (Next.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  /api/scan   │  │  /api/ocr    │  │ /api/payments│           │
│  │  /documents  │  │  /receipts   │  │ /api/webhooks│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────────────────────────────────────────────┐        │
│  │         /api/providers, /api/bookings                │        │
│  └──────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│   MongoDB      │   │   Cloudinary    │   │   Razorpay     │
│   Database     │   │   Storage       │   │   Gateway      │
│                │   │                 │   │                │
│ - Documents    │   │ - Scanned Docs  │   │ - Payments     │
│ - Providers    │   │ - Receipts      │   │ - Refunds      │
│ - Bookings     │   │ - Images        │   │ - Webhooks     │
│ - Payments     │   │                 │   │                │
└────────────────┘   └─────────────────┘   └────────────────┘
```

### Component Interaction Flow

**Document Scanning Flow:**
```
User → Camera Component → Edge Detection → Image Processing → 
PDF Conversion → Cloudinary Upload → Document Vault → Database
```

**Receipt Scanning Flow:**
```
User → Camera Component → Image Preprocessing → Tesseract OCR → 
Text Parsing → Amount Detection → Form Auto-Fill → Expense Creation
```

**Payment Flow:**
```
User → Payment Button → Razorpay Checkout → Payment Processing → 
Webhook Callback → Status Update → Notification → Receipt Generation
```

**Service Booking Flow:**
```
User → Provider Search → Provider Selection → Booking Creation → 
Provider Notification → Service Completion → Rating & Review
```

---

## Components and Interfaces

### Feature 1: Document Scanner

#### Frontend Components

**1. DocumentScanner Component**
```typescript
interface DocumentScannerProps {
  onScanComplete: (pdfUrl: string, documentType: string) => void;
  onCancel: () => void;
  suggestedType?: 'aadhaar' | 'pan' | 'agreement' | 'other';
}

interface ScanState {
  step: 'camera' | 'preview' | 'processing' | 'complete';
  capturedImage: string | null;
  detectedEdges: Point[] | null;
  processedImage: string | null;
  pdfUrl: string | null;
  error: string | null;
}
```

**Component Structure:**
- `DocumentScanner.tsx` - Main scanner component
- `CameraView.tsx` - Camera preview with edge detection overlay
- `ImagePreview.tsx` - Preview with manual corner adjustment
- `ProcessingIndicator.tsx` - Progress indicator during processing

#### Backend API Endpoints

**POST /api/scan/document**
```typescript
// Request
{
  image: string;              // Base64 encoded image
  documentType: string;       // 'aadhaar' | 'pan' | 'agreement' | 'other'
  userId: string;             // From JWT
  autoDetectEdges: boolean;   // Default: true
  corners?: Point[];          // Manual corners if auto-detect fails
}

// Response
{
  success: boolean;
  data: {
    documentId: string;
    pdfUrl: string;
    thumbnailUrl: string;
    documentType: string;
    fileSize: number;
    uploadedAt: string;
  }
}
```

#### Image Processing Pipeline

```typescript
interface ImageProcessor {
  detectEdges(image: ImageData): Point[];
  cropToEdges(image: ImageData, corners: Point[]): ImageData;
  enhanceQuality(image: ImageData): ImageData;
  convertToPDF(images: ImageData[]): Blob;
}

// Processing steps:
// 1. Convert to grayscale
// 2. Apply Gaussian blur
// 3. Canny edge detection
// 4. Find contours
// 5. Identify largest quadrilateral
// 6. Perspective transform
// 7. Enhance brightness/contrast
// 8. Sharpen
// 9. Convert to PDF
```

#### Libraries and Dependencies

- **react-webcam**: Camera access and capture
- **opencv.js**: Edge detection and image processing
- **jsPDF**: PDF generation
- **sharp** (server-side): Image optimization

---

### Feature 2: Receipt Scanning (OCR)

#### Frontend Components

**1. ReceiptScanner Component**
```typescript
interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
  onCancel: () => void;
  expenseCategory?: string;
}

interface ReceiptData {
  amount: number;
  confidence: number;
  merchant?: string;
  date?: string;
  items?: string[];
  rawText: string;
  imageUrl: string;
}

interface OCRState {
  step: 'capture' | 'processing' | 'review' | 'complete';
  capturedImage: string | null;
  ocrResult: ReceiptData | null;
  isProcessing: boolean;
  error: string | null;
}
```

**Component Structure:**
- `ReceiptScanner.tsx` - Main scanner component
- `ReceiptCapture.tsx` - Camera interface for receipt
- `OCRProcessing.tsx` - Processing indicator with progress
- `ReceiptReview.tsx` - Review and edit detected data

#### Backend API Endpoints

**POST /api/ocr/receipt**
```typescript
// Request
{
  image: string;              // Base64 encoded image
  userId: string;             // From JWT
  category?: string;          // Expense category hint
}

// Response
{
  success: boolean;
  data: {
    amount: number;
    amountConfidence: number;  // 0-100
    merchant: string | null;
    merchantConfidence: number;
    date: string | null;
    dateConfidence: number;
    items: string[];
    rawText: string;
    imageUrl: string;
    processingTime: number;    // milliseconds
  }
}
```

#### OCR Processing Pipeline

```typescript
interface OCRProcessor {
  preprocessImage(image: Buffer): Buffer;
  extractText(image: Buffer): string;
  parseAmount(text: string): { value: number; confidence: number };
  parseMerchant(text: string): { value: string; confidence: number };
  parseDate(text: string): { value: string; confidence: number };
}

// Processing steps:
// 1. Convert to grayscale
// 2. Increase contrast
// 3. Apply adaptive threshold
// 4. Denoise
// 5. Deskew if needed
// 6. Run Tesseract OCR
// 7. Parse text with regex patterns
// 8. Extract structured data
// 9. Calculate confidence scores
```

#### Text Parsing Patterns

```typescript
const AMOUNT_PATTERNS = [
  /(?:total|amount|sum)[:\s]*₹?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/i,
  /₹\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/,
  /rs\.?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/i,
  /inr\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/i,
];

const DATE_PATTERNS = [
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})/i,
];

const MERCHANT_PATTERNS = [
  // First 3 lines of text (usually merchant name)
  // Lines with all caps
  // Lines before "bill" or "invoice"
];
```

---

### Feature 3: Payment Gateway Integration

#### Frontend Components

**1. PaymentButton Component**
```typescript
interface PaymentButtonProps {
  amount: number;
  purpose: 'rent' | 'expense_settlement' | 'service_booking';
  referenceId: string;        // Rent ID, Settlement ID, or Booking ID
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  disabled?: boolean;
}

interface PaymentState {
  isProcessing: boolean;
  orderId: string | null;
  error: string | null;
}
```

**2. RefundButton Component**
```typescript
interface RefundButtonProps {
  paymentId: string;
  amount: number;
  maxAmount: number;
  reason: string;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}
```

**Component Structure:**
- `PaymentButton.tsx` - Initiates payment flow
- `PaymentModal.tsx` - Razorpay checkout modal
- `PaymentStatus.tsx` - Success/failure feedback
- `RefundButton.tsx` - Refund initiation
- `PaymentHistory.tsx` - Transaction history

#### Backend API Endpoints

**POST /api/payments/create-order**
```typescript
// Request
{
  amount: number;             // In paise (₹100 = 10000 paise)
  purpose: string;            // 'rent' | 'expense_settlement' | 'service_booking'
  referenceId: string;        // ID of rent/settlement/booking
  userId: string;             // From JWT
}

// Response
{
  success: boolean;
  data: {
    orderId: string;          // Razorpay order ID
    amount: number;
    currency: string;         // 'INR'
    key: string;              // Razorpay key ID
    name: string;             // 'Stayerra'
    description: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    }
  }
}
```

**POST /api/payments/verify**
```typescript
// Request
{
  orderId: string;
  paymentId: string;
  signature: string;
  referenceId: string;
  purpose: string;
}

// Response
{
  success: boolean;
  data: {
    paymentId: string;
    status: 'success' | 'failed';
    amount: number;
    receiptUrl: string;
  }
}
```

**POST /api/payments/webhook**
```typescript
// Razorpay webhook payload
{
  event: 'payment.captured' | 'payment.failed' | 'refund.processed';
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
        method: string;
      }
    }
  }
}

// Response
{
  success: boolean;
}
```

**POST /api/payments/refund**
```typescript
// Request
{
  paymentId: string;
  amount: number;             // In paise
  reason: string;
  userId: string;             // From JWT (must be creditor)
}

// Response
{
  success: boolean;
  data: {
    refundId: string;
    status: 'pending' | 'processed';
    amount: number;
    estimatedArrival: string; // Date
  }
}
```

#### Payment Flow Integration

```typescript
// Razorpay checkout options
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

// Payment verification
async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const text = orderId + '|' + paymentId;
  const generated = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  return generated === signature;
}
```

---

### Feature 4: Service Provider Marketplace

#### Frontend Components

**1. ProviderList Component**
```typescript
interface ProviderListProps {
  category?: ServiceCategory;
  maintenanceRequestId?: string;
  onProviderSelect: (provider: ServiceProvider) => void;
}

interface ServiceProvider {
  _id: string;
  name: string;
  phone: string;
  email: string;
  services: ServiceCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  availability: string;
  priceRange: string;
  responseTime: string;
  avatar?: string;
}
```

**2. ProviderProfile Component**
```typescript
interface ProviderProfileProps {
  providerId: string;
  onBook: () => void;
}

interface ProviderDetails extends ServiceProvider {
  bio: string;
  experience: number;
  completedJobs: number;
  reviews: Review[];
  gallery: string[];
  certifications: string[];
}
```

**3. BookingForm Component**
```typescript
interface BookingFormProps {
  provider: ServiceProvider;
  maintenanceRequestId?: string;
  onSubmit: (booking: BookingData) => void;
}

interface BookingData {
  providerId: string;
  serviceType: ServiceCategory;
  description: string;
  preferredDate: string;
  preferredTime: string;
  estimatedCost?: number;
  maintenanceRequestId?: string;
}
```

**4. RatingForm Component**
```typescript
interface RatingFormProps {
  bookingId: string;
  providerId: string;
  onSubmit: (rating: RatingData) => void;
}

interface RatingData {
  rating: number;           // 1-5
  review: string;
  photos?: string[];
  wouldRecommend: boolean;
}
```

**Component Structure:**
- `ProviderList.tsx` - Browse providers by category
- `ProviderCard.tsx` - Provider summary card
- `ProviderProfile.tsx` - Detailed provider page
- `BookingForm.tsx` - Service booking form
- `BookingList.tsx` - User's bookings
- `RatingForm.tsx` - Rate and review provider

#### Backend API Endpoints

**GET /api/providers**
```typescript
// Query params
{
  category?: string;
  location?: string;
  minRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
}

// Response
{
  success: boolean;
  data: {
    providers: ServiceProvider[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    }
  }
}
```

**GET /api/providers/:id**
```typescript
// Response
{
  success: boolean;
  data: {
    provider: ProviderDetails;
    recentReviews: Review[];
    availability: AvailabilitySlot[];
  }
}
```

**POST /api/bookings**
```typescript
// Request
{
  providerId: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  maintenanceRequestId?: string;
  userId: string;             // From JWT
}

// Response
{
  success: boolean;
  data: {
    booking: ServiceBooking;
    estimatedCost: number;
  }
}
```

**PATCH /api/bookings/:id**
```typescript
// Request
{
  status: 'confirmed' | 'completed' | 'cancelled';
  actualCost?: number;
  completionNotes?: string;
}

// Response
{
  success: boolean;
  data: {
    booking: ServiceBooking;
  }
}
```

**POST /api/providers/:id/reviews**
```typescript
// Request
{
  bookingId: string;
  rating: number;
  review: string;
  photos?: string[];
  wouldRecommend: boolean;
  userId: string;             // From JWT
}

// Response
{
  success: boolean;
  data: {
    review: Review;
    updatedRating: number;
  }
}
```

---

## Data Models

### Document Model

```typescript
interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  documentType: 'aadhaar' | 'pan' | 'agreement' | 'receipt' | 'other';
  fileName: string;
  fileUrl: string;              // Cloudinary URL
  thumbnailUrl?: string;
  fileSize: number;             // bytes
  mimeType: string;
  scannedAt?: Date;             // If created via scanner
  ocrData?: {                   // If OCR was performed
    text: string;
    confidence: number;
    extractedFields: Record<string, any>;
  };
  expiryDate?: Date;            // For ID documents
  tags: string[];
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment Model

```typescript
interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;              // Razorpay order ID
  paymentId: string;            // Razorpay payment ID
  amount: number;               // In paise
  currency: string;             // 'INR'
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method: string;               // 'upi' | 'card' | 'netbanking' | 'wallet'
  purpose: 'rent' | 'expense_settlement' | 'service_booking';
  referenceId: mongoose.Types.ObjectId;  // ID of rent/settlement/booking
  signature: string;            // Razorpay signature
  receiptUrl?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceProvider Model

```typescript
interface IServiceProvider extends Document {
  name: string;
  phone: string;
  email: string;
  services: ServiceCategory[];
  location: string;
  bio: string;
  experience: number;           // years
  verified: boolean;
  verificationDoc?: string;
  avatar?: string;
  gallery: string[];
  certifications: string[];
  priceRange: string;           // '₹500-1000'
  responseTime: string;         // 'Within 2 hours'
  rating: number;               // 0-5
  reviewCount: number;
  completedJobs: number;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    hours: string;              // '9 AM - 6 PM'
  };
  createdAt: Date;
  updatedAt: Date;
}

type ServiceCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'appliance' 
  | 'structural' 
  | 'cleaning' 
  | 'pest_control' 
  | 'other';
```

### ServiceBooking Model

```typescript
interface IServiceBooking extends Document {
  userId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  maintenanceRequestId?: mongoose.Types.ObjectId;
  serviceType: ServiceCategory;
  description: string;
  preferredDate: Date;
  preferredTime: string;
  actualDate?: Date;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  paymentId?: mongoose.Types.ObjectId;
  completionNotes?: string;
  photos?: string[];
  cancelReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Review Model

```typescript
interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;               // 1-5
  review: string;
  photos: string[];
  wouldRecommend: boolean;
  helpful: number;              // Upvote count
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Database Schema

### Indexes

```typescript
// Document indexes
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ documentType: 1, userId: 1 });
DocumentSchema.index({ expiryDate: 1 });

// Payment indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ orderId: 1 }, { unique: true });
PaymentSchema.index({ paymentId: 1 }, { unique: true });
PaymentSchema.index({ referenceId: 1, purpose: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

// ServiceProvider indexes
ServiceProviderSchema.index({ services: 1, verified: 1 });
ServiceProviderSchema.index({ location: 1, services: 1 });
ServiceProviderSchema.index({ rating: -1, reviewCount: -1 });
ServiceProviderSchema.index({ verified: 1, rating: -1 });

// ServiceBooking indexes
ServiceBookingSchema.index({ userId: 1, createdAt: -1 });
ServiceBookingSchema.index({ providerId: 1, createdAt: -1 });
ServiceBookingSchema.index({ maintenanceRequestId: 1 });
ServiceBookingSchema.index({ status: 1, preferredDate: 1 });

// Review indexes
ReviewSchema.index({ providerId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ bookingId: 1 }, { unique: true });
ReviewSchema.index({ rating: 1, helpful: -1 });
```

---


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies and consolidation opportunities:

**Document Scanner:**
- Properties 1.1.2 (edge detection) and 1.1.3 (auto-crop) are sequential steps in the same pipeline - can be combined into one property about the complete edge detection and cropping process
- Properties 1.2.1 (brightness) and 1.2.2 (contrast) are both image enhancement operations - can be combined into a single image quality enhancement property

**Receipt Scanner:**
- Properties 2.1.3 (amount detected) and 2.1.4 (form pre-filled) are sequential - detection implies form population, so 2.1.4 is redundant
- Properties 2.2.1 (merchant extracted) and 2.2.2 (description pre-filled) are sequential - extraction implies form population, so 2.2.2 is redundant
- Properties 2.3.1 (confidence shown) and 2.3.2 (low-confidence highlighted) can be combined into one property about confidence-based UI feedback

**Payment Gateway:**
- Properties 3.3.2 (email sent), 3.3.3 (in-app notification), and 3.2.5 (both parties notified) are all about notification delivery - can be consolidated into one comprehensive notification property
- Properties 3.1.5 (receipt generated) and 3.3.5 (receipt downloadable) are redundant - if a receipt is generated, it should be downloadable

**Service Marketplace:**
- Properties 4.2.2 (review count shown), 4.2.3 (reviews visible), 4.2.4 (reviews include data), and 4.2.5 (reviews filterable) can be consolidated into one comprehensive property about review data completeness and accessibility
- Properties 4.3.1 (cost shown) and 4.3.2 (cost range by service) can be combined into one property about cost information availability

**After consolidation, we have:**
- Document Scanner: 5 properties (down from 7)
- Receipt Scanner: 7 properties (down from 10)
- Payment Gateway: 9 properties (down from 13)
- Service Marketplace: 10 properties (down from 13)

**Total: 31 unique, non-redundant properties**

### Correctness Properties by Feature

## Feature 1: Document Scanner Properties

### Property 1.1: Edge Detection and Cropping Pipeline
*For any* document image with visible edges, the system should detect the document boundaries and crop the image to those boundaries, producing an image that contains only the document region.

**Validates: Requirements 1.1.2, 1.1.3**

### Property 1.2: PDF Conversion
*For any* processed document image, the system should produce a valid PDF file that can be opened by standard PDF readers.

**Validates: Requirements 1.1.4**

### Property 1.3: Document Vault Integration
*For any* successfully scanned document, the resulting PDF should be stored in the user's document vault and be retrievable via the documents API.

**Validates: Requirements 1.1.5**

### Property 1.4: Image Quality Enhancement
*For any* document image, the enhancement process should improve both brightness and contrast metrics compared to the original image.

**Validates: Requirements 1.2.1, 1.2.2**

### Property 1.5: Retake State Management
*For any* scan followed by a retake action, the previous scan data (captured image, processed image, PDF) should be cleared from state before the new capture begins.

**Validates: Requirements 1.3.2, 1.3.3**

## Feature 2: Receipt Scanner Properties

### Property 2.1: Amount Detection and Form Population
*For any* receipt image containing a visible total amount, the OCR system should extract the amount and pre-fill the expense form's amount field with the detected value.

**Validates: Requirements 2.1.3, 2.1.4**

### Property 2.2: Merchant Detection and Description Population
*For any* receipt image containing a merchant name, the OCR system should extract the merchant name and pre-fill the expense form's description field.

**Validates: Requirements 2.2.1, 2.2.2**

### Property 2.3: Receipt Image Attachment
*For any* expense created via receipt scanning, the original receipt image should be attached to the expense record and be retrievable.

**Validates: Requirements 2.2.4**

### Property 2.4: Confidence Score Calculation
*For any* OCR extraction result, the system should calculate and return confidence scores (0-100) for each extracted field (amount, merchant, date).

**Validates: Requirements 2.3.1**

### Property 2.5: Confidence-Based UI Feedback
*For any* OCR result field, if the confidence score is below the threshold (e.g., 70%), the field should be visually highlighted in the UI to prompt user verification.

**Validates: Requirements 2.3.2**

### Property 2.6: High-Confidence Auto-Acceptance
*For any* OCR result field with confidence above the threshold (e.g., 85%), the field should be marked as auto-accepted without requiring explicit user verification.

**Validates: Requirements 2.3.4**

### Property 2.7: OCR Graceful Degradation
*For any* receipt image where OCR fails or returns no results, the system should still allow manual expense entry and attach the receipt image.

**Validates: Requirements FR-2.1 (error handling)**

## Feature 3: Payment Gateway Properties

### Property 3.1: Rent Payment Status Update
*For any* successful payment with purpose "rent", the associated rent record's status should be updated to "paid" immediately after payment verification.

**Validates: Requirements 3.1.4**

### Property 3.2: Settlement Payment Status Update
*For any* successful payment with purpose "expense_settlement", the associated settlement record's status should be updated to "confirmed" immediately after payment verification.

**Validates: Requirements 3.2.4**

### Property 3.3: Payment Receipt Generation
*For any* successful payment, a receipt should be generated and stored, making it available for download.

**Validates: Requirements 3.1.5, 3.3.5**

### Property 3.4: Payment Amount Consistency
*For any* payment checkout, the amount passed to Razorpay should exactly match the amount of the associated rent, settlement, or booking.

**Validates: Requirements 3.2.2**

### Property 3.5: Payment Notification Delivery
*For any* successful payment, notifications (email and in-app) should be sent to all relevant parties (payer and payee).

**Validates: Requirements 3.2.5, 3.3.2, 3.3.3**

### Property 3.6: Payment History Persistence
*For any* completed payment (success or failure), a payment record should be created in the database and be retrievable from the user's payment history.

**Validates: Requirements 3.3.4**

### Property 3.7: Refund Reason Validation
*For any* refund request, if the reason field is empty or missing, the system should reject the request with a validation error.

**Validates: Requirements 3.4.3**

### Property 3.8: Refund Processing
*For any* valid refund request, a refund should be initiated through Razorpay and the refund ID should be stored with the payment record.

**Validates: Requirements 3.4.4**

### Property 3.9: Refund Notification Delivery
*For any* processed refund, both the payer and payee should receive notifications about the refund status.

**Validates: Requirements 3.4.5**

## Feature 4: Service Provider Marketplace Properties

### Property 4.1: Provider Category Filtering
*For any* service category query (e.g., "plumbing"), the system should return only providers whose services array includes that category.

**Validates: Requirements 4.1.2**

### Property 4.2: Provider Contact Information Completeness
*For any* provider returned in search results or profile views, the response should include all contact details (name, phone, email).

**Validates: Requirements 4.1.3**

### Property 4.3: Booking-Maintenance Request Linking
*For any* booking created from a maintenance request, the booking record should contain the maintenance request ID, establishing the link between them.

**Validates: Requirements 4.1.5**

### Property 4.4: Review Data Completeness and Accessibility
*For any* provider with reviews, the system should return review count, recent reviews, and each review should include user name, date, rating, and text. Reviews should be filterable by rating value.

**Validates: Requirements 4.2.2, 4.2.3, 4.2.4, 4.2.5**

### Property 4.5: Provider Cost Information Availability
*For any* provider, cost information (price range or estimated cost) should be available and displayed before booking, with ranges varying by service type.

**Validates: Requirements 4.3.1, 4.3.2**

### Property 4.6: Booking Payment Integration
*For any* completed service booking, the system should allow payment processing through the payment gateway, creating a payment record linked to the booking.

**Validates: Requirements 4.3.4**

### Property 4.7: Booking Confirmation Delivery
*For any* newly created booking, a confirmation notification should be sent to both the user and the provider.

**Validates: Requirements 4.3.5**

### Property 4.8: Rating Prompt Trigger
*For any* booking that transitions to "completed" status, a rating prompt should be triggered for the user who created the booking.

**Validates: Requirements 4.4.1**

### Property 4.9: Rating Value Validation
*For any* review submission, the rating value should be validated to be an integer between 1 and 5 (inclusive), rejecting any values outside this range.

**Validates: Requirements 4.4.2**

### Property 4.10: Review Photo Attachment Support
*For any* review submission, the system should accept and store photo attachments (up to a reasonable limit), making them retrievable with the review.

**Validates: Requirements 4.4.4**

### Property 4.11: Review Immediate Publication
*For any* submitted review, the review should be immediately visible when querying the provider's reviews, without requiring manual approval.

**Validates: Requirements 4.4.5**

---

## Error Handling

### Document Scanner Error Handling

**Camera Permission Denied:**
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // Show permission explanation modal
    // Offer fallback to file upload
    showPermissionModal();
    enableFileUploadFallback();
  }
}
```

**Edge Detection Failure:**
```typescript
const edges = detectEdges(image);
if (!edges || edges.length < 4) {
  // Offer manual corner selection
  // Or skip auto-crop and use full image
  showManualCropOption();
}
```

**PDF Conversion Failure:**
```typescript
try {
  const pdf = await convertToPDF(image);
} catch (error) {
  // Save as image instead
  // Notify user of fallback
  const imageUrl = await uploadImage(image);
  notifyUser('Saved as image instead of PDF');
}
```

**Upload Failure:**
```typescript
try {
  await uploadToCloudinary(pdf);
} catch (error) {
  // Store locally and retry
  // Show offline indicator
  storeLocally(pdf);
  scheduleRetry();
}
```

### Receipt Scanner Error Handling

**OCR Processing Failure:**
```typescript
try {
  const result = await performOCR(image);
} catch (error) {
  // Allow manual entry
  // Still attach receipt image
  showManualEntryForm();
  attachReceiptImage(image);
  notifyUser('Could not read receipt. Please enter details manually.');
}
```

**Low Confidence Results:**
```typescript
if (result.amountConfidence < 70) {
  // Highlight field for verification
  // Provide edit option
  highlightField('amount');
  showVerificationPrompt();
}
```

**No Amount Detected:**
```typescript
if (!result.amount) {
  // Pre-fill other fields if available
  // Focus amount field for manual entry
  preFillAvailableFields(result);
  focusField('amount');
  notifyUser('Please enter the amount manually');
}
```

**Image Quality Issues:**
```typescript
const quality = assessImageQuality(image);
if (quality < 0.5) {
  // Suggest retake
  // Or proceed with warning
  showQualityWarning();
  offerRetakeOption();
}
```

### Payment Gateway Error Handling

**Payment Initialization Failure:**
```typescript
try {
  const order = await createRazorpayOrder(amount);
} catch (error) {
  // Show error message
  // Offer manual payment option
  showError('Could not initialize payment. Please try again.');
  showManualPaymentInstructions();
}
```

**Payment Verification Failure:**
```typescript
const isValid = verifySignature(orderId, paymentId, signature);
if (!isValid) {
  // Log security incident
  // Do not update status
  // Notify admin
  logSecurityIncident('Invalid payment signature');
  notifyAdmin(paymentDetails);
  showError('Payment verification failed');
}
```

**Webhook Delivery Failure:**
```typescript
// Implement idempotency
const existingPayment = await Payment.findOne({ paymentId });
if (existingPayment) {
  // Already processed, return success
  return { success: true };
}

// Process webhook
await processPayment(webhookData);
```

**Refund Failure:**
```typescript
try {
  const refund = await razorpay.payments.refund(paymentId, { amount });
} catch (error) {
  // Log error
  // Notify admin for manual processing
  // Update status to 'refund_pending'
  logError('Refund failed', error);
  notifyAdmin({ paymentId, amount, error });
  await Payment.updateOne({ paymentId }, { refundStatus: 'pending' });
}
```

### Service Marketplace Error Handling

**Provider Not Found:**
```typescript
const provider = await ServiceProvider.findById(providerId);
if (!provider) {
  return errorResponse('Provider not found', 404);
}
```

**Booking Conflict:**
```typescript
const existingBooking = await ServiceBooking.findOne({
  providerId,
  preferredDate,
  status: { $in: ['confirmed', 'in_progress'] }
});
if (existingBooking) {
  return errorResponse('Provider is not available at this time', 409);
}
```

**Duplicate Review:**
```typescript
const existingReview = await Review.findOne({ bookingId });
if (existingReview) {
  return errorResponse('You have already reviewed this booking', 409);
}
```

**Invalid Rating:**
```typescript
if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
  return errorResponse('Rating must be an integer between 1 and 5', 400);
}
```

---

## Testing Strategy

### Dual Testing Approach

This project will use both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property Tests**: Verify universal properties across all inputs using randomized testing

Both approaches are complementary and necessary. Unit tests catch concrete bugs and validate specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library for property-based testing
- **Minimum Iterations**: 100 runs per property test (due to randomization)
- **Test Tagging**: Each property test must reference its design document property

**Tag Format:**
```typescript
// Feature: remaining-critical-improvements, Property 1.1: Edge Detection and Cropping Pipeline
test('document edge detection and cropping', async () => {
  await fc.assert(
    fc.asyncProperty(fc.documentImage(), async (image) => {
      const edges = await detectEdges(image);
      const cropped = await cropToEdges(image, edges);
      expect(cropped).toContainOnlyDocumentRegion();
    }),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Document Scanner Unit Tests:**
- Camera permission handling (granted, denied, unavailable)
- Edge detection with various document types (ID cards, A4 documents, receipts)
- Manual corner adjustment functionality
- PDF generation with single and multiple pages
- Upload retry logic on failure
- File size validation

**Receipt Scanner Unit Tests:**
- OCR with high-quality receipt images
- OCR with poor-quality images (blurry, dark, skewed)
- Amount parsing with various formats (₹1,234.56, Rs 1234, INR 1234.56)
- Date parsing with various formats (DD/MM/YYYY, DD-MM-YY, DD Mon YYYY)
- Merchant name extraction from different receipt layouts
- Confidence score calculation accuracy
- Form auto-fill with partial OCR results

**Payment Gateway Unit Tests:**
- Order creation with valid amounts
- Order creation with invalid amounts (negative, zero, too large)
- Payment signature verification (valid and invalid signatures)
- Webhook signature verification
- Webhook idempotency (duplicate webhook calls)
- Refund creation with valid and invalid amounts
- Payment status transitions
- Receipt generation for different payment types

**Service Marketplace Unit Tests:**
- Provider search by category
- Provider search by location
- Provider filtering by rating
- Booking creation with valid data
- Booking creation with invalid data (past dates, missing fields)
- Booking status transitions
- Review creation with valid ratings
- Review creation with invalid ratings
- Rating average calculation
- Provider availability checking

### Property-Based Testing Strategy

**Document Scanner Property Tests:**
```typescript
// Property 1.1: Edge Detection and Cropping
fc.assert(
  fc.asyncProperty(
    fc.documentImage(),
    async (image) => {
      const edges = await detectEdges(image);
      const cropped = await cropToEdges(image, edges);
      expect(cropped.width).toBeLessThanOrEqual(image.width);
      expect(cropped.height).toBeLessThanOrEqual(image.height);
      expect(cropped).toContainOnlyDocumentRegion();
    }
  ),
  { numRuns: 100 }
);

// Property 1.4: Image Quality Enhancement
fc.assert(
  fc.asyncProperty(
    fc.documentImage(),
    async (image) => {
      const enhanced = await enhanceQuality(image);
      const originalMetrics = calculateQualityMetrics(image);
      const enhancedMetrics = calculateQualityMetrics(enhanced);
      expect(enhancedMetrics.brightness).toBeGreaterThan(originalMetrics.brightness);
      expect(enhancedMetrics.contrast).toBeGreaterThan(originalMetrics.contrast);
    }
  ),
  { numRuns: 100 }
);
```

**Receipt Scanner Property Tests:**
```typescript
// Property 2.1: Amount Detection and Form Population
fc.assert(
  fc.asyncProperty(
    fc.receiptImageWithAmount(),
    async (receipt) => {
      const result = await performOCR(receipt.image);
      expect(result.amount).toBeCloseTo(receipt.actualAmount, 2);
      
      const form = await autoFillForm(result);
      expect(form.amount).toBe(result.amount);
    }
  ),
  { numRuns: 100 }
);

// Property 2.4: Confidence Score Calculation
fc.assert(
  fc.asyncProperty(
    fc.receiptImage(),
    async (image) => {
      const result = await performOCR(image);
      expect(result.amountConfidence).toBeGreaterThanOrEqual(0);
      expect(result.amountConfidence).toBeLessThanOrEqual(100);
      expect(result.merchantConfidence).toBeGreaterThanOrEqual(0);
      expect(result.merchantConfidence).toBeLessThanOrEqual(100);
    }
  ),
  { numRuns: 100 }
);
```

**Payment Gateway Property Tests:**
```typescript
// Property 3.1: Rent Payment Status Update
fc.assert(
  fc.asyncProperty(
    fc.rentPayment(),
    async (payment) => {
      const rent = await createRent(payment.rentData);
      await processPayment({ ...payment, referenceId: rent._id, purpose: 'rent' });
      
      const updatedRent = await Rent.findById(rent._id);
      expect(updatedRent.status).toBe('paid');
    }
  ),
  { numRuns: 100 }
);

// Property 3.4: Payment Amount Consistency
fc.assert(
  fc.asyncProperty(
    fc.settlement(),
    async (settlement) => {
      const order = await createPaymentOrder({
        referenceId: settlement._id,
        purpose: 'expense_settlement'
      });
      
      expect(order.amount).toBe(settlement.amount * 100); // Convert to paise
    }
  ),
  { numRuns: 100 }
);
```

**Service Marketplace Property Tests:**
```typescript
// Property 4.1: Provider Category Filtering
fc.assert(
  fc.asyncProperty(
    fc.serviceCategory(),
    fc.array(fc.serviceProvider()),
    async (category, providers) => {
      await ServiceProvider.insertMany(providers);
      
      const results = await searchProviders({ category });
      
      results.forEach(provider => {
        expect(provider.services).toContain(category);
      });
    }
  ),
  { numRuns: 100 }
);

// Property 4.9: Rating Value Validation
fc.assert(
  fc.asyncProperty(
    fc.integer(),
    fc.booking(),
    async (rating, booking) => {
      const isValid = rating >= 1 && rating <= 5 && Number.isInteger(rating);
      
      if (isValid) {
        await expect(createReview({ bookingId: booking._id, rating })).resolves.toBeDefined();
      } else {
        await expect(createReview({ bookingId: booking._id, rating })).rejects.toThrow();
      }
    }
  ),
  { numRuns: 100 }
);
```

### Test Data Generators

```typescript
// Custom generators for fast-check
const fc = require('fast-check');

// Document image generator
fc.documentImage = () => fc.record({
  width: fc.integer({ min: 800, max: 4000 }),
  height: fc.integer({ min: 600, max: 3000 }),
  data: fc.uint8Array({ minLength: 100000, maxLength: 5000000 }),
  hasVisibleEdges: fc.boolean(),
});

// Receipt image with known amount
fc.receiptImageWithAmount = () => fc.record({
  image: fc.uint8Array({ minLength: 50000, maxLength: 2000000 }),
  actualAmount: fc.float({ min: 10, max: 100000, noNaN: true }),
  merchant: fc.string({ minLength: 3, maxLength: 50 }),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
});

// Service provider generator
fc.serviceProvider = () => fc.record({
  name: fc.string({ minLength: 5, maxLength: 50 }),
  phone: fc.string({ minLength: 10, maxLength: 10 }),
  email: fc.emailAddress(),
  services: fc.array(fc.constantFrom('plumbing', 'electrical', 'appliance', 'structural', 'cleaning', 'pest_control'), { minLength: 1, maxLength: 3 }),
  location: fc.string({ minLength: 5, maxLength: 100 }),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  verified: fc.boolean(),
});

// Rent payment generator
fc.rentPayment = () => fc.record({
  rentData: fc.record({
    amount: fc.integer({ min: 5000, max: 100000 }),
    dueDate: fc.date(),
    status: fc.constant('pending'),
  }),
  paymentId: fc.uuid(),
  orderId: fc.uuid(),
  signature: fc.hexaString({ minLength: 64, maxLength: 64 }),
});
```

### Integration Testing

**End-to-End Flows:**
1. Complete document scanning flow (camera → capture → process → upload → verify in vault)
2. Complete receipt scanning flow (camera → OCR → form fill → expense creation → verify expense)
3. Complete payment flow (initiate → checkout → verify → status update → receipt generation)
4. Complete booking flow (search → select → book → confirm → complete → review)

**API Integration Tests:**
- Document scanner API with Cloudinary
- OCR API with Tesseract.js
- Payment API with Razorpay (use test mode)
- Webhook handling with signature verification

### Performance Testing

**Benchmarks:**
- Document edge detection: < 500ms
- Document processing: < 2 seconds
- PDF conversion: < 3 seconds
- OCR processing: < 5 seconds
- Payment order creation: < 1 second
- Payment verification: < 2 seconds
- Provider search: < 500ms
- Booking creation: < 1 second

**Load Testing:**
- 100 concurrent document scans
- 50 concurrent OCR requests
- 200 concurrent payment verifications
- 500 concurrent provider searches

---


## Security Considerations

### Document Scanner Security

**Data Privacy:**
- Scanned documents may contain sensitive personal information (Aadhaar, PAN)
- All documents must be encrypted at rest in Cloudinary
- Access control: Users can only access their own documents
- Implement document sharing with explicit permissions

**Upload Security:**
```typescript
// Validate file type and size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

**Client-Side Processing:**
- Edge detection and image processing happen client-side when possible
- Reduces server load and data transmission
- Sensitive documents never leave device until explicitly uploaded

### Receipt Scanner Security

**OCR Data Handling:**
- Receipt images may contain personal information
- OCR text extraction happens server-side in isolated environment
- Raw OCR text is not logged or stored permanently
- Only structured data (amount, merchant, date) is retained

**Image Sanitization:**
```typescript
// Remove EXIF data that may contain location
const sanitized = await sharp(image)
  .rotate() // Auto-rotate based on EXIF
  .withMetadata({ exif: {} }) // Strip EXIF
  .toBuffer();
```

### Payment Gateway Security

**PCI DSS Compliance:**
- All payment data handled by Razorpay (PCI DSS Level 1 certified)
- Never store card numbers, CVV, or full card details
- Only store Razorpay payment IDs and order IDs

**Signature Verification:**
```typescript
// Always verify Razorpay signatures
function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Idempotency:**
```typescript
// Prevent duplicate payment processing
const payment = await Payment.findOne({ paymentId });
if (payment) {
  return { success: true, message: 'Already processed' };
}

// Use transaction to ensure atomicity
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Payment.create([paymentData], { session });
  await updateReferenceStatus(referenceId, 'paid', { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Rate Limiting:**
```typescript
// Prevent payment spam
const recentPayments = await Payment.countDocuments({
  userId,
  createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
});

if (recentPayments > 5) {
  throw new Error('Too many payment attempts. Please wait.');
}
```

### Service Marketplace Security

**Provider Verification:**
- Providers must be verified before listing
- Verification includes ID proof and service credentials
- Admin approval required for new providers

**Review Authenticity:**
```typescript
// Only allow reviews from users who booked the service
const booking = await ServiceBooking.findOne({
  _id: bookingId,
  userId,
  status: 'completed'
});

if (!booking) {
  throw new Error('You can only review services you have used');
}

// Prevent duplicate reviews
const existingReview = await Review.findOne({ bookingId });
if (existingReview) {
  throw new Error('You have already reviewed this booking');
}
```

**Contact Information Protection:**
```typescript
// Only reveal provider contact after booking confirmation
function getProviderDetails(provider: IServiceProvider, hasActiveBooking: boolean) {
  if (!hasActiveBooking) {
    return {
      ...provider,
      phone: provider.phone.replace(/\d(?=\d{4})/g, '*'), // Mask phone
      email: provider.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
    };
  }
  return provider;
}
```

### Authentication and Authorization

**JWT Token Validation:**
```typescript
// All API endpoints require valid JWT
export function requireAuth(req: NextRequest): { userId: string; role: string } {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**Role-Based Access Control:**
```typescript
// Admin-only endpoints
export function requireAdmin(req: NextRequest): { userId: string } {
  const { userId, role } = requireAuth(req);
  
  if (role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return { userId };
}

// Provider management
export function requireProviderAccess(req: NextRequest, providerId: string): boolean {
  const { userId, role } = requireAuth(req);
  
  if (role === 'admin') return true;
  
  const provider = await ServiceProvider.findById(providerId);
  return provider?.userId?.toString() === userId;
}
```

---

## Performance Optimization

### Document Scanner Optimization

**Client-Side Processing:**
```typescript
// Use Web Workers for heavy processing
const worker = new Worker('/workers/image-processor.js');

worker.postMessage({ image, operation: 'detectEdges' });

worker.onmessage = (e) => {
  const { edges } = e.data;
  updateUI(edges);
};
```

**Progressive Enhancement:**
```typescript
// Show preview immediately, process in background
const preview = await captureImage();
showPreview(preview);

// Process asynchronously
const processed = await processImage(preview);
updatePreview(processed);
```

**Lazy Loading:**
```typescript
// Load OpenCV.js only when scanner is opened
const loadOpenCV = async () => {
  if (!window.cv) {
    await import('opencv.js');
  }
  return window.cv;
};
```

### Receipt Scanner Optimization

**Image Preprocessing:**
```typescript
// Resize large images before OCR
const MAX_WIDTH = 1200;
if (image.width > MAX_WIDTH) {
  image = await sharp(image)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .toBuffer();
}
```

**Parallel Processing:**
```typescript
// Run multiple OCR operations in parallel
const [amountResult, merchantResult, dateResult] = await Promise.all([
  extractAmount(text),
  extractMerchant(text),
  extractDate(text),
]);
```

**Caching:**
```typescript
// Cache OCR results for same image
const cacheKey = crypto.createHash('md5').update(imageBuffer).digest('hex');
const cached = await redis.get(`ocr:${cacheKey}`);

if (cached) {
  return JSON.parse(cached);
}

const result = await performOCR(imageBuffer);
await redis.setex(`ocr:${cacheKey}`, 3600, JSON.stringify(result));
```

### Payment Gateway Optimization

**Connection Pooling:**
```typescript
// Reuse Razorpay instance
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}
```

**Webhook Queue:**
```typescript
// Process webhooks asynchronously
import { Queue } from 'bull';

const webhookQueue = new Queue('payment-webhooks', REDIS_URL);

webhookQueue.process(async (job) => {
  const { webhookData } = job.data;
  await processPaymentWebhook(webhookData);
});

// In webhook endpoint
app.post('/api/payments/webhook', async (req, res) => {
  // Verify signature
  const isValid = verifySignature(req.body, req.headers['x-razorpay-signature']);
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Queue for processing
  await webhookQueue.add({ webhookData: req.body });
  
  // Respond immediately
  res.json({ success: true });
});
```

### Service Marketplace Optimization

**Database Indexing:**
```typescript
// Compound indexes for common queries
ServiceProviderSchema.index({ services: 1, verified: 1, rating: -1 });
ServiceProviderSchema.index({ location: 1, services: 1, rating: -1 });
ServiceBookingSchema.index({ userId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ providerId: 1, rating: 1, createdAt: -1 });
```

**Pagination:**
```typescript
// Always paginate large result sets
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 20, 100);
const skip = (page - 1) * limit;

const providers = await ServiceProvider.find(query)
  .sort({ rating: -1 })
  .skip(skip)
  .limit(limit)
  .lean();

const total = await ServiceProvider.countDocuments(query);
```

**Aggregation Pipeline:**
```typescript
// Calculate provider statistics efficiently
const providerStats = await Review.aggregate([
  { $match: { providerId: new ObjectId(providerId) } },
  {
    $group: {
      _id: '$providerId',
      avgRating: { $avg: '$rating' },
      reviewCount: { $sum: 1 },
      ratingDistribution: {
        $push: '$rating'
      }
    }
  }
]);
```

**Caching Provider Data:**
```typescript
// Cache frequently accessed provider profiles
const CACHE_TTL = 300; // 5 minutes

async function getProviderProfile(providerId: string) {
  const cacheKey = `provider:${providerId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const provider = await ServiceProvider.findById(providerId)
    .populate('reviews')
    .lean();
  
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(provider));
  
  return provider;
}
```

---

## Deployment Considerations

### Environment Variables

```env
# Existing
MONGODB_URI=mongodb://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# New - Payment Gateway
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# New - OCR (if using external service)
TESSERACT_WORKER_PATH=/workers/tesseract-worker.js

# New - Feature Flags
ENABLE_DOCUMENT_SCANNER=true
ENABLE_RECEIPT_SCANNER=true
ENABLE_PAYMENT_GATEWAY=true
ENABLE_SERVICE_MARKETPLACE=true
```

### Database Migrations

```typescript
// Migration script for new collections
async function migrateDatabase() {
  await connectDB();
  
  // Create new collections
  await mongoose.connection.createCollection('documents');
  await mongoose.connection.createCollection('payments');
  await mongoose.connection.createCollection('serviceproviders');
  await mongoose.connection.createCollection('servicebookings');
  await mongoose.connection.createCollection('reviews');
  
  // Create indexes
  await Document.createIndexes();
  await Payment.createIndexes();
  await ServiceProvider.createIndexes();
  await ServiceBooking.createIndexes();
  await Review.createIndexes();
  
  console.log('Migration complete');
}
```

### Static Asset Deployment

**OpenCV.js:**
```bash
# Copy OpenCV.js to public directory
cp node_modules/opencv.js/opencv.js public/opencv.js
```

**Tesseract.js Workers:**
```bash
# Copy Tesseract workers to public directory
cp node_modules/tesseract.js/dist/worker.min.js public/workers/tesseract-worker.js
cp -r node_modules/tesseract.js-core/tesseract-core.wasm.js public/workers/
```

### CDN Configuration

```typescript
// Load heavy libraries from CDN
const OPENCV_CDN = 'https://cdn.jsdelivr.net/npm/opencv.js@1.2.1/opencv.js';
const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js';

// Fallback to local if CDN fails
async function loadLibrary(cdnUrl: string, localPath: string) {
  try {
    await loadScript(cdnUrl);
  } catch (error) {
    console.warn('CDN failed, loading from local');
    await loadScript(localPath);
  }
}
```

### Monitoring and Logging

**Payment Monitoring:**
```typescript
// Log all payment events
logger.info('Payment initiated', {
  userId,
  amount,
  purpose,
  orderId,
});

logger.info('Payment successful', {
  userId,
  paymentId,
  amount,
  method,
});

logger.error('Payment failed', {
  userId,
  orderId,
  error: error.message,
});
```

**OCR Performance Monitoring:**
```typescript
// Track OCR accuracy and performance
const startTime = Date.now();
const result = await performOCR(image);
const duration = Date.now() - startTime;

logger.info('OCR completed', {
  duration,
  confidence: result.amountConfidence,
  imageSize: image.length,
});
```

**Error Tracking:**
```typescript
// Use Sentry or similar for error tracking
import * as Sentry from '@sentry/nextjs';

try {
  await processPayment(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'payment-gateway',
      userId: data.userId,
    },
  });
  throw error;
}
```

---

## API Documentation

### Document Scanner APIs

#### POST /api/scan/document

Processes a captured document image and uploads it to the document vault.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "documentType": "aadhaar",
  "autoDetectEdges": true,
  "corners": [
    { "x": 100, "y": 100 },
    { "x": 500, "y": 100 },
    { "x": 500, "y": 700 },
    { "x": 100, "y": 700 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "64f5a1b2c3d4e5f6a7b8c9d0",
    "pdfUrl": "https://res.cloudinary.com/.../document.pdf",
    "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.jpg",
    "documentType": "aadhaar",
    "fileSize": 245678,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Receipt Scanner APIs

#### POST /api/ocr/receipt

Performs OCR on a receipt image and extracts structured data.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "category": "electricity"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amount": 1234.56,
    "amountConfidence": 92,
    "merchant": "BESCOM",
    "merchantConfidence": 85,
    "date": "2024-01-10",
    "dateConfidence": 78,
    "items": ["Electricity Charges", "Fixed Charges", "Tax"],
    "rawText": "BESCOM\nElectricity Bill\n...",
    "imageUrl": "https://res.cloudinary.com/.../receipt.jpg",
    "processingTime": 3245
  }
}
```

### Payment Gateway APIs

#### POST /api/payments/create-order

Creates a Razorpay order for payment.

**Request:**
```json
{
  "amount": 10000,
  "purpose": "rent",
  "referenceId": "64f5a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_MNqwertyuiop123",
    "amount": 10000,
    "currency": "INR",
    "key": "rzp_test_1234567890",
    "name": "Stayerra",
    "description": "Rent payment for January 2024",
    "prefill": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210"
    }
  }
}
```

#### POST /api/payments/verify

Verifies a completed payment.

**Request:**
```json
{
  "orderId": "order_MNqwertyuiop123",
  "paymentId": "pay_ABCdefghijklmno",
  "signature": "a1b2c3d4e5f6...",
  "referenceId": "64f5a1b2c3d4e5f6a7b8c9d0",
  "purpose": "rent"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_ABCdefghijklmno",
    "status": "success",
    "amount": 10000,
    "receiptUrl": "https://stayerra.com/receipts/pay_ABCdefghijklmno.pdf"
  }
}
```

#### POST /api/payments/refund

Initiates a refund for a payment.

**Request:**
```json
{
  "paymentId": "pay_ABCdefghijklmno",
  "amount": 10000,
  "reason": "Service not provided"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "rfnd_XYZabcdefghijk",
    "status": "pending",
    "amount": 10000,
    "estimatedArrival": "2024-01-20"
  }
}
```

### Service Marketplace APIs

#### GET /api/providers

Lists service providers with filtering.

**Query Parameters:**
- `category`: Service category (plumbing, electrical, etc.)
- `location`: Provider location
- `minRating`: Minimum rating (0-5)
- `verified`: Only verified providers (true/false)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "name": "ABC Plumbing Services",
        "phone": "9876543210",
        "email": "abc@plumbing.com",
        "services": ["plumbing"],
        "location": "Bangalore",
        "rating": 4.5,
        "reviewCount": 23,
        "verified": true,
        "priceRange": "₹500-1500",
        "responseTime": "Within 2 hours"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### POST /api/bookings

Creates a service booking.

**Request:**
```json
{
  "providerId": "64f5a1b2c3d4e5f6a7b8c9d0",
  "serviceType": "plumbing",
  "description": "Leaking tap in kitchen",
  "preferredDate": "2024-01-20",
  "preferredTime": "10:00 AM",
  "maintenanceRequestId": "64f5a1b2c3d4e5f6a7b8c9d1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "userId": "64f5a1b2c3d4e5f6a7b8c9d3",
      "providerId": "64f5a1b2c3d4e5f6a7b8c9d0",
      "serviceType": "plumbing",
      "description": "Leaking tap in kitchen",
      "preferredDate": "2024-01-20T00:00:00Z",
      "preferredTime": "10:00 AM",
      "status": "pending",
      "estimatedCost": 800,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "estimatedCost": 800
  }
}
```

#### POST /api/providers/:id/reviews

Creates a review for a provider.

**Request:**
```json
{
  "bookingId": "64f5a1b2c3d4e5f6a7b8c9d2",
  "rating": 5,
  "review": "Excellent service! Fixed the issue quickly.",
  "photos": ["https://res.cloudinary.com/.../photo1.jpg"],
  "wouldRecommend": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d4",
      "bookingId": "64f5a1b2c3d4e5f6a7b8c9d2",
      "providerId": "64f5a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f5a1b2c3d4e5f6a7b8c9d3",
      "rating": 5,
      "review": "Excellent service! Fixed the issue quickly.",
      "photos": ["https://res.cloudinary.com/.../photo1.jpg"],
      "wouldRecommend": true,
      "createdAt": "2024-01-22T15:00:00Z"
    },
    "updatedRating": 4.6
  }
}
```

---

## Future Enhancements

### Document Scanner Enhancements

1. **Multi-page Scanning**: Scan multiple pages into a single PDF
2. **OCR on Documents**: Extract text from scanned documents (Aadhaar number, PAN number)
3. **Document Expiry Reminders**: Notify users when documents are about to expire
4. **Batch Upload**: Upload multiple documents at once
5. **Document Templates**: Pre-defined templates for common document types

### Receipt Scanner Enhancements

1. **Item-Level Extraction**: Extract individual line items from receipts
2. **Category Auto-Detection**: Automatically categorize expenses based on merchant
3. **Multi-Currency Support**: Handle receipts in different currencies
4. **Recurring Receipt Detection**: Identify recurring expenses from receipts
5. **Receipt Analytics**: Spending patterns based on receipt data

### Payment Gateway Enhancements

1. **Saved Payment Methods**: Store payment methods for faster checkout
2. **Auto-Pay**: Automatic payment for recurring expenses
3. **Split Payments**: Split a payment across multiple methods
4. **Payment Reminders**: Remind users of upcoming payments
5. **Payment Analytics**: Track payment history and patterns

### Service Marketplace Enhancements

1. **Real-Time Availability**: Live provider availability calendar
2. **In-App Chat**: Chat with providers before booking
3. **Service Packages**: Bundle multiple services at discounted rates
4. **Warranty Tracking**: Track service warranties and guarantees
5. **Provider Ratings Algorithm**: More sophisticated rating system with weighted factors
6. **Emergency Services**: Priority booking for urgent issues
7. **Service History**: Track all services performed on a property

---

## Conclusion

This design document provides a comprehensive technical blueprint for implementing the remaining 4 critical improvements to the Stayerra platform. The design emphasizes:

- **User Experience**: Intuitive interfaces with minimal manual input
- **Reliability**: Graceful error handling and fallback mechanisms
- **Security**: PCI DSS compliance, data encryption, and access control
- **Performance**: Optimized processing and caching strategies
- **Testability**: Comprehensive property-based and unit testing strategies

The implementation of these features will complete the platform's daily engagement ecosystem, providing users with a seamless, automated, and convenient rental management experience.

**Estimated Implementation Timeline:**
- Document Scanner: 4-5 hours
- Receipt Scanner: 5-6 hours
- Payment Gateway: 8-10 hours
- Service Marketplace: 10-12 hours
- **Total: 27-33 hours**

**Next Steps:**
1. Review and approve this design document
2. Create detailed implementation tasks
3. Set up development environment with required libraries
4. Begin implementation in priority order
5. Conduct thorough testing before deployment

