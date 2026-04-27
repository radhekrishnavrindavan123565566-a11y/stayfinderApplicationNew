import mongoose, { Schema, Document } from "mongoose";

export interface ISavedSearch extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  filters: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    bedrooms?: number;
    amenities?: string[];
    nearLocation?: string;
  };
  alertEnabled: boolean;
  alertFrequency: "instant" | "daily" | "weekly";
  lastAlertSent?: Date;
  matchCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    filters: {
      city: { type: String },
      minPrice: { type: Number },
      maxPrice: { type: Number },
      propertyType: { type: String },
      bedrooms: { type: Number },
      amenities: [{ type: String }],
      nearLocation: { type: String },
    },
    alertEnabled: { type: Boolean, default: true },
    alertFrequency: {
      type: String,
      enum: ["instant", "daily", "weekly"],
      default: "daily",
    },
    lastAlertSent: { type: Date },
    matchCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SavedSearchSchema.index({ userId: 1, isActive: 1 });

export default mongoose.models.SavedSearch ||
  mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);
