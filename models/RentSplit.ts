import mongoose, { Schema, Document } from "mongoose";

export interface IRentSplit extends Document {
  bookingId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  primaryTenantId: mongoose.Types.ObjectId;
  totalRent: number;
  splits: {
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    amount: number;
    percentage: number;
    status: "pending" | "paid" | "late";
    paidAt?: Date;
  }[];
  month: string; // "2025-04"
  dueDate: Date;
  status: "partial" | "complete";
  groupChatId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RentSplitSchema = new Schema<IRentSplit>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    primaryTenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalRent: { type: Number, required: true },
    splits: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        email: { type: String, required: true },
        amount: { type: Number, required: true },
        percentage: { type: Number, required: true },
        status: { type: String, enum: ["pending", "paid", "late"], default: "pending" },
        paidAt: { type: Date },
      },
    ],
    month: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["partial", "complete"], default: "partial" },
    groupChatId: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

RentSplitSchema.index({ bookingId: 1, month: 1 });
RentSplitSchema.index({ primaryTenantId: 1 });

export default mongoose.models.RentSplit || mongoose.model<IRentSplit>("RentSplit", RentSplitSchema);
