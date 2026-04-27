import mongoose, { Schema, Document } from "mongoose";

export interface ITenantVerification extends Document {
  userId: mongoose.Types.ObjectId;
  documents: {
    type: "aadhaar" | "pan" | "passport" | "driving_license" | "college_id" | "employment_letter";
    fileUrl: string;
    verified: boolean;
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    uploadedAt: Date;
  }[];
  backgroundCheck: {
    status: "pending" | "in_progress" | "completed" | "failed";
    score?: number;
    report?: string;
    completedAt?: Date;
  };
  policeVerification: {
    status: "not_requested" | "pending" | "verified" | "rejected";
    certificateUrl?: string;
    verifiedAt?: Date;
  };
  creditScore: {
    score?: number;
    lastChecked?: Date;
    provider?: string;
  };
  employmentVerification: {
    status: "not_verified" | "pending" | "verified" | "rejected";
    companyName?: string;
    designation?: string;
    monthlySalary?: number;
    verifiedAt?: Date;
  };
  overallStatus: "incomplete" | "pending" | "verified" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const TenantVerificationSchema = new Schema<ITenantVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    documents: [
      {
        type: {
          type: String,
          enum: ["aadhaar", "pan", "passport", "driving_license", "college_id", "employment_letter"],
          required: true,
        },
        fileUrl: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        rejectionReason: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    backgroundCheck: {
      status: {
        type: String,
        enum: ["pending", "in_progress", "completed", "failed"],
        default: "pending",
      },
      score: { type: Number },
      report: { type: String },
      completedAt: { type: Date },
    },
    policeVerification: {
      status: {
        type: String,
        enum: ["not_requested", "pending", "verified", "rejected"],
        default: "not_requested",
      },
      certificateUrl: { type: String },
      verifiedAt: { type: Date },
    },
    creditScore: {
      score: { type: Number },
      lastChecked: { type: Date },
      provider: { type: String },
    },
    employmentVerification: {
      status: {
        type: String,
        enum: ["not_verified", "pending", "verified", "rejected"],
        default: "not_verified",
      },
      companyName: { type: String },
      designation: { type: String },
      monthlySalary: { type: Number },
      verifiedAt: { type: Date },
    },
    overallStatus: {
      type: String,
      enum: ["incomplete", "pending", "verified", "rejected"],
      default: "incomplete",
    },
  },
  { timestamps: true }
);

export default mongoose.models.TenantVerification ||
  mongoose.model<ITenantVerification>("TenantVerification", TenantVerificationSchema);
