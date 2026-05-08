import mongoose, { Schema, Document } from "mongoose";

export interface IDocumentShare extends Document {
  userId: mongoose.Types.ObjectId;
  documentIds: mongoose.Types.ObjectId[];
  shareToken: string;
  expiresAt: Date;
  viewCount: number;
  lastAccessedAt?: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentShareSchema = new Schema<IDocumentShare>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentIds: [{ type: Schema.Types.ObjectId, ref: "RentalDocument", required: true }],
    shareToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    viewCount: { type: Number, default: 0 },
    lastAccessedAt: { type: Date },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
DocumentShareSchema.index({ shareToken: 1 }, { unique: true });
DocumentShareSchema.index({ userId: 1, createdAt: -1 });
DocumentShareSchema.index({ expiresAt: 1 });

export default mongoose.models.DocumentShare ||
  mongoose.model<IDocumentShare>("DocumentShare", DocumentShareSchema);
