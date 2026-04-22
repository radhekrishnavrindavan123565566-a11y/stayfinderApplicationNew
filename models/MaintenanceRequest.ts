import mongoose, { Schema, Document } from "mongoose";

export interface IMaintenanceRequest extends Document {
  bookingId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: "plumbing" | "electrical" | "appliance" | "structural" | "cleaning" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  images: string[];
  ownerNote?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["plumbing", "electrical", "appliance", "structural", "cleaning", "other"], default: "other" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    images: [{ type: String }],
    ownerNote: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.MaintenanceRequest ||
  mongoose.model<IMaintenanceRequest>("MaintenanceRequest", MaintenanceRequestSchema);
