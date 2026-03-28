import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  budget: { min: number; max: number };
  preferredBedrooms: number;
  preferredAmenities: string[];
  preferredCities: string[];
  tenantType: "student" | "family" | "professional" | "couple";
  recentlyViewed: { propertyId: mongoose.Types.ObjectId; viewedAt: Date }[];
  savedSearches: {
    filters: {
      city?: string;
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      propertyType?: string;
      amenities?: string[];
    };
    alertEnabled: boolean;
    lastAlertedAt?: Date;
  }[];
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    preferredBedrooms: { type: Number, default: 1 },
    preferredAmenities: [{ type: String }],
    preferredCities: [{ type: String }],
    tenantType: {
      type: String,
      enum: ["student", "family", "professional", "couple"],
      default: "professional",
    },
    recentlyViewed: {
      type: [
        {
          propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
          viewedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      validate: {
        validator: function (arr: unknown[]) {
          return arr.length <= 20;
        },
        message: "recentlyViewed cannot exceed 20 items",
      },
    },
    savedSearches: [
      {
        filters: {
          city: String,
          minPrice: Number,
          maxPrice: Number,
          bedrooms: Number,
          propertyType: String,
          amenities: [{ type: String }],
        },
        alertEnabled: { type: Boolean, default: false },
        lastAlertedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.UserPreferences ||
  mongoose.model<IUserPreferences>("UserPreferences", UserPreferencesSchema);
