import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyContact extends Document {
  userId: mongoose.Types.ObjectId;
  contacts: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }[];
  propertyAddress?: string;
  localEmergencyServices: {
    police?: string;
    ambulance?: string;
    fire?: string;
    hospital?: string;
  };
  ownerContact?: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    contacts: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    propertyAddress: { type: String },
    localEmergencyServices: {
      police: { type: String, default: "100" },
      ambulance: { type: String, default: "108" },
      fire: { type: String, default: "101" },
      hospital: { type: String },
    },
    ownerContact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmergencyContact ||
  mongoose.model<IEmergencyContact>("EmergencyContact", EmergencyContactSchema);
