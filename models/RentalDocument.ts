import mongoose, { Schema, Document } from "mongoose";

export interface IRentalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  documentType: "aadhaar" | "pan" | "rent_agreement" | "police_verification" | "other";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: Date;
  expiryDate?: Date;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RentalDocumentSchema = new Schema<IRentalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentType: {
      type: String,
      enum: ["aadhaar", "pan", "rent_agreement", "police_verification", "other"],
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    isExpired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
RentalDocumentSchema.index({ userId: 1, documentType: 1 });
RentalDocumentSchema.index({ userId: 1, createdAt: -1 });
RentalDocumentSchema.index({ expiryDate: 1 });
RentalDocumentSchema.index({ verificationStatus: 1 });

export default mongoose.models.RentalDocument ||
  mongoose.model<IRentalDocument>("RentalDocument", RentalDocumentSchema);
