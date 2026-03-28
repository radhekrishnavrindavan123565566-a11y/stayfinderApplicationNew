import mongoose, { Schema, Document } from "mongoose";

export interface ILocalityReview extends Document {
  userId: mongoose.Types.ObjectId;
  city: string;
  locality: string;
  ratings: {
    safety: number;
    connectivity: number;
    amenities: number;
    cleanliness: number;
    overall: number;
  };
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocalityReviewSchema = new Schema<ILocalityReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    locality: { type: String, required: true },
    ratings: {
      safety: { type: Number, min: 1, max: 5, required: true },
      connectivity: { type: Number, min: 1, max: 5, required: true },
      amenities: { type: Number, min: 1, max: 5, required: true },
      cleanliness: { type: Number, min: 1, max: 5, required: true },
      overall: { type: Number, min: 1, max: 5, required: true },
    },
    comment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.LocalityReview ||
  mongoose.model<ILocalityReview>("LocalityReview", LocalityReviewSchema);
