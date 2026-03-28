import mongoose, { Schema, Document } from "mongoose";

export interface IRentAgreement extends Document {
  bookingId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  agreementText: string;
  pdfUrl?: string;
  tenantSignature?: string;
  ownerSignature?: string;
  tenantSignedAt?: Date;
  ownerSignedAt?: Date;
  status: "draft" | "pending_tenant" | "pending_owner" | "fully_signed" | "expired";
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RentAgreementSchema = new Schema<IRentAgreement>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agreementText: { type: String, required: true },
    pdfUrl: { type: String },
    tenantSignature: { type: String },
    ownerSignature: { type: String },
    tenantSignedAt: { type: Date },
    ownerSignedAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "pending_tenant", "pending_owner", "fully_signed", "expired"],
      default: "draft",
    },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.RentAgreement ||
  mongoose.model<IRentAgreement>("RentAgreement", RentAgreementSchema);
