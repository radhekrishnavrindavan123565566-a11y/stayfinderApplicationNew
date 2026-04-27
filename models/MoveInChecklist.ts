import mongoose, { Schema, Document } from "mongoose";

export interface IChecklistItem {
  id: string;
  label: string;
  category: string;
  tenantStatus: "ok" | "damaged" | "missing" | "pending";
  ownerStatus: "ok" | "damaged" | "missing" | "pending";
  tenantNote?: string;
  ownerNote?: string;
  photos: string[];
}

export interface IMoveInChecklist extends Document {
  bookingId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  items: IChecklistItem[];
  tenantSignedAt?: Date;
  ownerSignedAt?: Date;
  status: "draft" | "tenant_signed" | "owner_signed" | "completed" | "disputed";
  depositAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
    tenantStatus: { type: String, enum: ["ok", "damaged", "missing", "pending"], default: "pending" },
    ownerStatus: { type: String, enum: ["ok", "damaged", "missing", "pending"], default: "pending" },
    tenantNote: String,
    ownerNote: String,
    photos: [{ type: String }],
  },
  { _id: false }
);

const MoveInChecklistSchema = new Schema<IMoveInChecklist>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [ChecklistItemSchema],
    tenantSignedAt: Date,
    ownerSignedAt: Date,
    status: {
      type: String,
      enum: ["draft", "tenant_signed", "owner_signed", "completed", "disputed"],
      default: "draft",
    },
    depositAmount: Number,
  },
  { timestamps: true }
);

export default mongoose.models.MoveInChecklist ||
  mongoose.model<IMoveInChecklist>("MoveInChecklist", MoveInChecklistSchema);
