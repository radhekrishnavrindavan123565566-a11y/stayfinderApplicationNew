// Document Scanner Types

export interface Point {
  x: number;
  y: number;
}

export type DocumentType = 'aadhaar' | 'pan' | 'agreement' | 'receipt' | 'other';

export interface DocumentScannerProps {
  onScanComplete: (pdfUrl: string, documentType: DocumentType) => void;
  onCancel: () => void;
  suggestedType?: DocumentType;
}

export interface ScanState {
  step: 'camera' | 'preview' | 'processing' | 'complete';
  capturedImage: string | null;
  detectedEdges: Point[] | null;
  processedImage: string | null;
  pdfUrl: string | null;
  error: string | null;
}

// Receipt Scanner Types

export interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
  onCancel: () => void;
  expenseCategory?: string;
}

export interface ReceiptData {
  amount: number;
  confidence: number;
  merchant?: string;
  date?: string;
  items?: string[];
  rawText: string;
  imageUrl: string;
}

export interface OCRState {
  step: 'capture' | 'processing' | 'review' | 'complete';
  capturedImage: string | null;
  ocrResult: ReceiptData | null;
  isProcessing: boolean;
  error: string | null;
}

// Payment Types

export interface PaymentButtonProps {
  amount: number;
  purpose: 'rent' | 'expense_settlement' | 'service_booking';
  referenceId: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  disabled?: boolean;
}

export interface PaymentState {
  isProcessing: boolean;
  orderId: string | null;
  error: string | null;
}

export interface RefundButtonProps {
  paymentId: string;
  amount: number;
  maxAmount: number;
  reason: string;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

// Service Provider Types

export type ServiceCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'appliance' 
  | 'structural' 
  | 'cleaning' 
  | 'pest_control' 
  | 'other';

export interface ServiceProvider {
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

export interface ProviderListProps {
  category?: ServiceCategory;
  maintenanceRequestId?: string;
  onProviderSelect: (provider: ServiceProvider) => void;
}

export interface ProviderDetails extends ServiceProvider {
  bio: string;
  experience: number;
  completedJobs: number;
  reviews: Review[];
  gallery: string[];
  certifications: string[];
}

export interface ProviderProfileProps {
  providerId: string;
  onBook: () => void;
}

export interface BookingFormProps {
  provider: ServiceProvider;
  maintenanceRequestId?: string;
  onSubmit: (booking: BookingData) => void;
}

export interface BookingData {
  providerId: string;
  serviceType: ServiceCategory;
  description: string;
  preferredDate: string;
  preferredTime: string;
  estimatedCost?: number;
  maintenanceRequestId?: string;
}

export interface RatingFormProps {
  bookingId: string;
  providerId: string;
  onSubmit: (rating: RatingData) => void;
}

export interface RatingData {
  rating: number;
  review: string;
  photos?: string[];
  wouldRecommend: boolean;
}

export interface Review {
  _id: string;
  bookingId: string;
  providerId: string;
  userId: string;
  rating: number;
  review: string;
  photos: string[];
  wouldRecommend: boolean;
  helpful: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
}
