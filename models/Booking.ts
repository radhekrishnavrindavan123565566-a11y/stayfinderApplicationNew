import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  nights: number;
  platformFee: number;
  landlordEarning: number;
  escrowStatus: "holding" | "released" | "refunded" | "none";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentIntentId?: string;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  message?: string;
  instantBooking: boolean;
  checkInConfirmed: boolean;
  moveInConfirmation?: {
    tenantConfirmedAt?: Date;
    ownerConfirmedAt?: Date;
    status: "pending" | "tenant_confirmed" | "owner_confirmed" | "both_confirmed" | "disputed";
    checkInPhotos: string[];
  };
  disputeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    nights: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    landlordEarning: { type: Number, default: 0 },
    escrowStatus: {
      type: String,
      enum: ["holding", "released", "refunded", "none"],
      default: "none",
    },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    paymentIntentId: String,
    cancellationPolicy: { type: String, enum: ["flexible", "moderate", "strict"], default: "moderate" },
    message: String,
    instantBooking: { type: Boolean, default: false },
    checkInConfirmed: { type: Boolean, default: false },
    moveInConfirmation: {
      tenantConfirmedAt: { type: Date },
      ownerConfirmedAt: { type: Date },
      status: {
        type: String,
        enum: ["pending", "tenant_confirmed", "owner_confirmed", "both_confirmed", "disputed"],
        default: "pending",
      },
      checkInPhotos: [{ type: String }],
    },
    disputeId: { type: Schema.Types.ObjectId, ref: "Dispute" },
  },
  { timestamps: true }
);

// Indexes for performance
BookingSchema.index({ tenantId: 1, status: 1 });
BookingSchema.index({ ownerId: 1, status: 1 });
BookingSchema.index({ propertyId: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ paymentStatus: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
