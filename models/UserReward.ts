import mongoose, { Schema, Document } from "mongoose";

export interface IUserReward extends Document {
  userId: mongoose.Types.ObjectId;
  points: number;
  level: number;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    category: "tenant" | "owner" | "social" | "payment" | "special";
  }[];
  streaks: {
    onTimePayment: number;
    dailyLogin: number;
    lastPaymentDate?: Date;
    lastLoginDate?: Date;
  };
  achievements: {
    profileCompleted: boolean;
    firstBooking: boolean;
    firstReview: boolean;
    identityVerified: boolean;
    referralMade: boolean;
    tenPaymentsOnTime: boolean;
  };
  referralCode: string;
  referralCount: number;
  totalEarnings: number; // cashback/rewards in rupees
  createdAt: Date;
  updatedAt: Date;
}

const UserRewardSchema = new Schema<IUserReward>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
        category: {
          type: String,
          enum: ["tenant", "owner", "social", "payment", "special"],
          required: true,
        },
      },
    ],
    streaks: {
      onTimePayment: { type: Number, default: 0 },
      dailyLogin: { type: Number, default: 0 },
      lastPaymentDate: { type: Date },
      lastLoginDate: { type: Date },
    },
    achievements: {
      profileCompleted: { type: Boolean, default: false },
      firstBooking: { type: Boolean, default: false },
      firstReview: { type: Boolean, default: false },
      identityVerified: { type: Boolean, default: false },
      referralMade: { type: Boolean, default: false },
      tenPaymentsOnTime: { type: Boolean, default: false },
    },
    referralCode: { type: String, required: true, unique: true },
    referralCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserRewardSchema.index({ points: -1 });
UserRewardSchema.index({ referralCode: 1 });

export default mongoose.models.UserReward ||
  mongoose.model<IUserReward>("UserReward", UserRewardSchema);
