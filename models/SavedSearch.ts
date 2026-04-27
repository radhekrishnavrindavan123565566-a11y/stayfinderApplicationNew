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
    nearLocation?: string;
  };
  lastNotifiedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    filters: {
      city: String,
      minPrice: Number,
      maxPrice: Number,
      propertyType: String,
      bedrooms: Number,
      nearLocation: String,
    },
    lastNotifiedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SavedSearch ||
  mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);
