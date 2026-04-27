import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: { address: string; city: string; state: string; country: string; lat?: number; lng?: number };
  images: string[];
  videos?: { interior?: string; exterior?: string };
  tour360?: string[]; // array of 360° image URLs
  amenities: string[];
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  ownerId: mongoose.Types.ObjectId;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isBoosted: boolean;
  boostExpiresAt?: Date;
  instantBooking: boolean;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  blockedDates: Date[];
  ownerVerified: boolean;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
  locationIntelligence?: {
    nearbyAmenities: { type: string; name: string; distanceKm: number; walkTimeMinutes: number }[];
    safetyScore?: number;
    safetyLabel?: string;
    lastUpdated?: Date;
  };
  priceIntelligence?: {
    cityAvgPrice?: number;
    fairPriceRange?: { min: number; max: number };
    pricePosition?: string;
    percentageDiff?: number;
    trend?: { month: string; avgPrice: number }[];
    lastUpdated?: Date;
  };
  viewCount: number;
  weeklyBookings: number;
  unitCount: number;
  area: number;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      lat: Number,
      lng: Number,
    },
    images: [{ type: String }],
    videos: {
      interior: { type: String },
      exterior: { type: String },
    },
    tour360: [{ type: String }],
    amenities: [{ type: String }],
    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "studio", "condo", "cabin"],
      default: "apartment",
    },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    maxGuests: { type: Number, default: 2 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAvailable: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBoosted: { type: Boolean, default: false },
    boostExpiresAt: Date,
    instantBooking: { type: Boolean, default: false },
    cancellationPolicy: { type: String, enum: ["flexible", "moderate", "strict"], default: "moderate" },
    blockedDates: [{ type: Date }],
    ownerVerified: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 10 }, // 10% platform commission
    locationIntelligence: {
      nearbyAmenities: [
        {
          type: { type: String },
          name: { type: String },
          distanceKm: { type: Number },
          walkTimeMinutes: { type: Number },
        },
      ],
      safetyScore: { type: Number },
      safetyLabel: { type: String },
      lastUpdated: { type: Date },
    },
    priceIntelligence: {
      cityAvgPrice: { type: Number },
      fairPriceRange: {
        min: { type: Number },
        max: { type: Number },
      },
      pricePosition: { type: String },
      percentageDiff: { type: Number },
      trend: [
        {
          month: { type: String },
          avgPrice: { type: Number },
        },
      ],
      lastUpdated: { type: Date },
    },
    viewCount: { type: Number, default: 0 },
    weeklyBookings: { type: Number, default: 0 },
    unitCount: { type: Number, default: 1 },
    area: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PropertySchema.index({ "location.city": "text", title: "text", description: "text" });
PropertySchema.index({ isBoosted: -1, isFeatured: -1, createdAt: -1 });

// Delete cached model so schema changes (videos field) are always picked up fresh
delete (mongoose.models as Record<string, unknown>).Property;
export default mongoose.model<IProperty>("Property", PropertySchema);
