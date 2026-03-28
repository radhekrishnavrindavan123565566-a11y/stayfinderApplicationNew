import mongoose, { Schema, Document } from "mongoose";

export interface IServiceBooking extends Document {
  bookingId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalPrice: number;
  paymentStatus: "unpaid" | "paid";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBookingSchema = new Schema<IServiceBooking>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "EcosystemService", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceBooking ||
  mongoose.model<IServiceBooking>("ServiceBooking", ServiceBookingSchema);
