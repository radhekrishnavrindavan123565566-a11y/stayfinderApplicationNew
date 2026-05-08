import mongoose, { Document, Schema } from 'mongoose';

export type ServiceCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'appliance' 
  | 'structural' 
  | 'cleaning' 
  | 'pest_control' 
  | 'other';

export interface IServiceProvider extends Document {
  name: string;
  phone: string;
  email: string;
  services: ServiceCategory[];
  location: string;
  bio: string;
  experience: number;
  verified: boolean;
  verificationDoc?: string;
  avatar?: string;
  gallery: string[];
  certifications: string[];
  priceRange: string;
  responseTime: string;
  rating: number;
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
    hours: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceProviderSchema = new Schema<IServiceProvider>(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    services: {
      type: [String],
      enum: ['plumbing', 'electrical', 'appliance', 'structural', 'cleaning', 'pest_control', 'other'],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationDoc: {
      type: String,
    },
    avatar: {
      type: String,
    },
    gallery: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    priceRange: {
      type: String,
      default: '₹500-1500',
    },
    responseTime: {
      type: String,
      default: 'Within 24 hours',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: false },
      hours: { type: String, default: '9 AM - 6 PM' },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ServiceProviderSchema.index({ services: 1, verified: 1 });
ServiceProviderSchema.index({ location: 1, services: 1 });
ServiceProviderSchema.index({ rating: -1, reviewCount: -1 });

export default mongoose.models.ServiceProvider || mongoose.model<IServiceProvider>('ServiceProvider', ServiceProviderSchema);
