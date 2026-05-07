import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  propertyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  ownerReply?: string;
  ownerRepliedAt?: Date;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    ownerReply: { type: String, trim: true },
    ownerRepliedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance
ReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ propertyId: 1, createdAt: -1 }); // For property reviews
ReviewSchema.index({ userId: 1, createdAt: -1 }); // For user's reviews
ReviewSchema.index({ bookingId: 1 }); // For booking-related reviews
ReviewSchema.index({ rating: -1, createdAt: -1 }); // For top-rated reviews
ReviewSchema.index({ propertyId: 1, rating: -1 }); // For property rating queries

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
