import mongoose, { Schema, Document } from "mongoose";

export interface IRoommateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  city: string;
  budget: { min: number; max: number };
  moveInDate: Date;
  gender: "male" | "female" | "any";
  lookingFor: "male" | "female" | "any";
  occupation: "student" | "working" | "other";
  institution?: string; // college/office name
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    pets: boolean;
    vegetarian: boolean;
    earlyBird: boolean; // vs night owl
    studyFriendly: boolean;
  };
  languages: string[];
  about: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoommateProfileSchema = new Schema<IRoommateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    city: { type: String, required: true },
    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    moveInDate: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "any"], required: true },
    lookingFor: { type: String, enum: ["male", "female", "any"], default: "any" },
    occupation: { type: String, enum: ["student", "working", "other"], default: "student" },
    institution: { type: String },
    lifestyle: {
      smoking: { type: Boolean, default: false },
      drinking: { type: Boolean, default: false },
      pets: { type: Boolean, default: false },
      vegetarian: { type: Boolean, default: false },
      earlyBird: { type: Boolean, default: true },
      studyFriendly: { type: Boolean, default: true },
    },
    languages: [{ type: String }],
    about: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoommateProfileSchema.index({ city: 1, isActive: 1 });

export default mongoose.models.RoommateProfile ||
  mongoose.model<IRoommateProfile>("RoommateProfile", RoommateProfileSchema);
