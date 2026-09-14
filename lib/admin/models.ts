    import { ObjectId } from 'mongodb';

/**
 * Admin Audit Log - Tracks all admin actions for compliance
 */
export interface AdminAuditLog {
  _id?: ObjectId;
  adminId: ObjectId;
  action: 
    | 'property_approved'
    | 'property_rejected'
    | 'property_status_changed'
    | 'property_edited'
    | 'user_blocked'
    | 'user_unblocked'
    | 'user_verified'
    | 'lead_status_changed'
    | 'lead_exported'
    | 'notification_sent'
    | 'banner_created'
    | 'banner_updated'
    | 'banner_deleted';
  entityType: 'property' | 'user' | 'inquiry' | 'banner' | 'notification';
  entityId: ObjectId;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  reason?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Property Approval Queue - Manages pending property approvals
 */
export interface PropertyApprovalQueue {
  _id?: ObjectId;
  propertyId: ObjectId;
  ownerId: ObjectId;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedData: {
    title: string;
    description: string;
    price: number;
    location: {
      address: string;
      city: string;
    };
    images: string[];
  };
  adminNotes?: string;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  changes?: {
    field: string;
    originalValue: unknown;
    suggestedValue: unknown;
  }[];
}

/**
 * Lead Status History - Tracks inquiry status changes
 */
export interface LeadStatusHistory {
  _id?: ObjectId;
  inquiryId: ObjectId;
  previousStatus: LeadStatus;
  newStatus: LeadStatus;
  changedBy: ObjectId;
  changedAt: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
  followUpDue?: Date;
  reminderSent?: boolean;
}

export type LeadStatus = 
  | 'new_lead'
  | 'call_done'
  | 'visit_scheduled'
  | 'closed_booked'
  | 'closed_not_interested';

/**
 * Banner Analytics - Tracks promotional banner performance
 */
export interface BannerAnalytics {
  _id?: ObjectId;
  bannerId: ObjectId;
  date: Date;
  impressions: number;
  clicks: number;
  uniqueViews: number;
  platformBreakdown: {
    app: { impressions: number; clicks: number };
    web: { impressions: number; clicks: number };
  };
  deviceBreakdown?: {
    mobile: { impressions: number; clicks: number };
    desktop: { impressions: number; clicks: number };
    tablet: { impressions: number; clicks: number };
  };
}

/**
 * Dashboard Stats - Aggregated metrics for admin overview
 */
export interface DashboardStats {
  properties: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
    featured: number;
  };
  users: {
    totalTenants: number;
    totalOwners: number;
    newThisMonth: number;
    verified: number;
    blocked: number;
  };
  inquiries: {
    total: number;
    today: number;
    thisWeek: number;
    newLeads: number;
    closedDeals: number;
  };
  revenue: {
    totalRevenue: number;
    pendingPayments: number;
    monthlyRecurring: number;
  };
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  _id: string;
  action:
    | 'property_posted'
    | 'owner_verified'
    | 'inquiry_submitted'
    | 'booking_created'
    | 'payment_received';
  actorId: string;
  targetId: string;
  targetType: 'property' | 'user' | 'inquiry' | 'booking';
  metadata: Record<string, unknown>;
  timestamp: Date;
  description: string;
}

/**
 * Property Listing Row - UI representation
 */
export interface PropertyListingRow {
  _id: string;
  title: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'active' | 'booked' | 'hidden' | 'archived';
  images: string[];
  isVerified: boolean;
  viewCount: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFilter {
  city?: string;
  propertyType?: string;
  status?: 'pending' | 'active' | 'booked' | 'hidden' | 'archived';
  priceRange?: { min: number; max: number };
  verificationStatus?: 'verified' | 'unverified' | 'rejected';
  sortBy?: 'newest' | 'views' | 'price' | 'rating';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

/**
 * Owner Directory Row
 */
export interface OwnerDirectoryRow {
  _id: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  isVerified: boolean;
  verificationDoc?: string;
  propertyCount: number;
  totalListings: number;
  activeListings: number;
  responseRate: number;
  avgResponseTimeHours: number;
  fraudRiskLevel: 'low' | 'medium' | 'high';
  trustBadges: string[];
  registrationDate: Date;
  lastActivity: Date;
  walletBalance: number;
  planType: 'free' | 'basic' | 'pro' | 'enterprise';
  planExpiresAt: Date;
  isActive: boolean;
}

/**
 * Tenant Directory Row
 */
export interface TenantDirectoryRow {
  _id: string;
  username: string;
  email: string;
  phone: string;
  registrationDate: Date;
  inquiriesCount: number;
  activeInquiries: number;
  bookingsCount: number;
  creditScore?: number;
  fraudRiskLevel: 'low' | 'medium' | 'high';
  tenantVerified: boolean;
  responseRate: number;
  isActive: boolean;
  lastActivity: Date;
  trustBadges: string[];
}

export interface UserFilter {
  role: 'owner' | 'tenant';
  city?: string;
  verificationStatus?: 'verified' | 'unverified' | 'rejected';
  fraudRiskLevel?: 'low' | 'medium' | 'high';
  isActive?: boolean;
  planType?: string;
  sortBy?: 'newest' | 'active' | 'properties' | 'inquiries';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

/**
 * Inquiry Row for leads management
 */
export interface InquiryRow {
  _id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  ownerName: string;
  inquiryDate: Date;
  inquiryTime: string;
  status: LeadStatus;
  statusHistory: {
    status: LeadStatus;
    changedAt: Date;
    changedBy: string;
    notes?: string;
  }[];
  visitScheduledDate?: Date;
  visitScheduledTime?: string;
  visitNotes?: string;
  callDoneDate?: Date;
  callDuration?: number;
  callNotes?: string;
  conversationLink?: string;
  closureReason?: string;
  bookingCreatedId?: string;
  source: 'app' | 'website' | 'whatsapp' | 'call';
  followUpDate?: Date;
  followUpReminder?: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface LeadFilter {
  status?: LeadStatus;
  priority?: 'low' | 'medium' | 'high';
  propertyId?: string;
  ownerId?: string;
  dateRange?: { from: Date; to: Date };
  source?: 'app' | 'website' | 'whatsapp' | 'call';
  sortBy?: 'newest' | 'status' | 'priority' | 'dueDate';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface LeadExportOptions {
  format: 'csv' | 'xlsx';
  fields: (keyof InquiryRow)[];
  filters: LeadFilter;
  includeHistory: boolean;
}

export interface LeadStatusUpdate {
  inquiryId: string;
  newStatus: LeadStatus;
  notes?: string;
  visitDate?: Date;
  visitTime?: string;
  followUpDate?: Date;
  callDuration?: number;
}

/**
 * Banner Content
 */
export interface BannerContent {
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  actionUrl?: string;
  actionType?: 'internal_page' | 'external_link' | 'property' | 'category';
  position: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: {
    roles?: ('tenant' | 'owner' | 'admin')[];
    cities?: string[];
    userSegments?: string[];
  };
  displayPlatform?: ('app' | 'web')[];
  impressions?: number;
  clicks?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Notification Content
 */
export interface NotificationContent {
  _id?: string;
  title: string;
  message: string;
  notificationType: 'info' | 'warning' | 'alert' | 'success';
  channel: ('in_app' | 'whatsapp' | 'sms' | 'email')[];
  targetAudience: {
    roles?: ('tenant' | 'owner' | 'admin')[];
    cities?: string[];
    userIds?: string[];
  };
  scheduledDate?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent';
  deliveryStats?: {
    total: number;
    delivered: number;
    failed: number;
    opened?: number;
    clicked?: number;
  };
}

export interface NotificationRequest {
  title: string;
  message: string;
  channels: ('in_app' | 'whatsapp' | 'sms' | 'email')[];
  targetAudience: {
    roles?: ('tenant' | 'owner' | 'admin')[];
    cities?: string[];
    userIds?: string[];
  };
  scheduledDate?: Date;
  templateId?: string;
}

export interface ContentFilter {
  type?: 'banner' | 'notification';
  status?: 'active' | 'inactive' | 'scheduled' | 'expired';
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'newest' | 'impressions' | 'active';
  page?: number;
  limit?: number;
}
