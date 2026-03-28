import mongoose, { Schema, Document } from "mongoose";

export interface IDispute extends Document {
  bookingId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  reason: "property_mismatch" | "no_access" | "safety_issue" | "fraud" | "other";
  description: string;
  evidence: string[];
  status: "open" | "under_review" | "resolved_refund" | "resolved_no_refund" | "closed";
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["property_mismatch", "no_access", "safety_issue", "fraud", "other"],
      required: true,
    },
    description: { type: String, required: true },
    evidence: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "under_review", "resolved_refund", "resolved_no_refund", "closed"],
      default: "open",
    },
    adminNotes: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Dispute ||
  mongoose.model<IDispute>("Dispute", DisputeSchema);
