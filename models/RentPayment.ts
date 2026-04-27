import mongoose, { Schema, Document } from "mongoose";

export interface IRentPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  amount: number;
  month: string; // "2025-04"
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "late" | "waived";
  note?: string;
  createdAt: Date;
}

const RentPaymentSchema = new Schema<IRentPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // "YYYY-MM"
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { type: String, enum: ["pending", "paid", "late", "waived"], default: "pending" },
    note: { type: String },
  },
  { timestamps: true }
);

RentPaymentSchema.index({ tenantId: 1, month: 1 });
RentPaymentSchema.index({ ownerId: 1, month: 1 });
RentPaymentSchema.index({ bookingId: 1, month: 1 }, { unique: true });

export default mongoose.models.RentPayment ||
  mongoose.model<IRentPayment>("RentPayment", RentPaymentSchema);
