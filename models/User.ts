import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "tenant" | "owner" | "admin";
  avatar?: string;
  wishlist: mongoose.Types.ObjectId[];
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  ownerVerified: boolean;
  verificationDoc?: string;
  tenantVerified: boolean;
  tenantVerificationDoc: string;
  fraudRiskLevel: "low" | "medium" | "high";
  profileCompleteness: number;
  trustBadges: string[];
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["tenant", "owner", "admin"], default: "tenant" },
    avatar: { type: String, default: "" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    ownerVerified: { type: Boolean, default: false },
    verificationDoc: { type: String, default: "" },
    tenantVerified: { type: Boolean, default: false },
    tenantVerificationDoc: { type: String, default: "" },
    fraudRiskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
    profileCompleteness: { type: Number, default: 0 },
    trustBadges: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  return obj;
};

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
