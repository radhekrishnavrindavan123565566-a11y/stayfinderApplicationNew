import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  bookingId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  totalAmount: number;
  platformFee: number;
  landlordAmount: number;
  currency: string;
  status: "pending" | "completed" | "refunded" | "failed";
  paymentIntentId?: string;
  refundId?: string;
  refundAmount?: number;
  type: "booking" | "refund" | "boost";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    landlordAmount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["pending", "completed", "refunded", "failed"], default: "pending" },
    paymentIntentId: String,
    refundId: String,
    refundAmount: Number,
    type: { type: String, enum: ["booking", "refund", "boost"], default: "booking" },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
