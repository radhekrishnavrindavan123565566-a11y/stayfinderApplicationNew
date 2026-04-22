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

ReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
