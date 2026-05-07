import mongoose, { Schema, Document } from "mongoose";

export interface ISharedExpense extends Document {
  roommateGroupId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  category: "electricity" | "water" | "internet" | "groceries" | "rent" | "other";
  paidBy: mongoose.Types.ObjectId;
  expenseDate: Date;
  splitMethod: "equal" | "percentage" | "custom_amounts" | "by_share";
  participants: {
    userId: mongoose.Types.ObjectId;
    shareAmount: number;
    sharePercentage?: number;
    shareRatio?: number;
  }[];
  receiptImages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SharedExpenseSchema = new Schema<ISharedExpense>(
  {
    roommateGroupId: { type: Schema.Types.ObjectId, ref: "RoommateGroup" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["electricity", "water", "internet", "groceries", "rent", "other"],
      required: true,
    },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expenseDate: { type: Date, default: Date.now },
    splitMethod: {
      type: String,
      enum: ["equal", "percentage", "custom_amounts", "by_share"],
      default: "equal",
    },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        shareAmount: { type: Number, required: true, min: 0 },
        sharePercentage: { type: Number, min: 0, max: 100 },
        shareRatio: { type: Number, min: 0 },
      },
    ],
    receiptImages: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for performance
SharedExpenseSchema.index({ roommateGroupId: 1, createdAt: -1 });
SharedExpenseSchema.index({ createdBy: 1, createdAt: -1 });
SharedExpenseSchema.index({ "participants.userId": 1, createdAt: -1 });
SharedExpenseSchema.index({ category: 1, expenseDate: -1 });

export default mongoose.models.SharedExpense ||
  mongoose.model<ISharedExpense>("SharedExpense", SharedExpenseSchema);
