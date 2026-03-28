import mongoose, { Schema, Document } from "mongoose";

export interface IEcosystemService extends Document {
  type: "cleaning" | "maintenance" | "moving" | "furniture_rental";
  title: string;
  description: string;
  price: number;
  priceUnit: "per_visit" | "per_hour" | "per_day" | "per_month";
  availableCities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EcosystemServiceSchema = new Schema<IEcosystemService>(
  {
    type: {
      type: String,
      enum: ["cleaning", "maintenance", "moving", "furniture_rental"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    priceUnit: {
      type: String,
      enum: ["per_visit", "per_hour", "per_day", "per_month"],
      required: true,
    },
    availableCities: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.EcosystemService ||
  mongoose.model<IEcosystemService>("EcosystemService", EcosystemServiceSchema);
