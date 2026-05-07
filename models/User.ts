import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "tenant" | "owner" | "admin";
  avatar?: string;
  phone?: string;
  phoneVerified: boolean;
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
  creditScore?: number;
  creditScoreUpdatedAt?: Date;
  responseRate?: number;       // 0-100 %
  avgResponseTimeHours?: number; // average hours to first reply
  plan?: "free" | "basic" | "pro" | "enterprise";
  planExpiresAt?: Date;
  walletBalance?: number;
  upiId?: string;
  digitalSignature?: string;
  documentStorageUsed?: number;
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
    phone: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },
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
    creditScore: { type: Number, default: null },
    creditScoreUpdatedAt: { type: Date },
    responseRate: { type: Number, default: null },
    avgResponseTimeHours: { type: Number, default: null },
    plan: { type: String, enum: ["free", "basic", "pro", "enterprise"], default: "free" },
    planExpiresAt: { type: Date },
    walletBalance: { type: Number, default: 0 },
    upiId: { type: String },
    digitalSignature: { type: String },
    documentStorageUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ refreshToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ phoneVerified: 1, role: 1 });

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
