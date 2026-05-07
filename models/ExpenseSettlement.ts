import mongoose, { Schema, Document } from "mongoose";

export interface IExpenseSettlement extends Document {
  expenseId: mongoose.Types.ObjectId;
  debtor: mongoose.Types.ObjectId;
  creditor: mongoose.Types.ObjectId;
  amount: number;
  paymentStatus: "pending" | "paid" | "confirmed";
  paidAt?: Date;
  confirmedAt?: Date;
  upiTransactionId?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSettlementSchema = new Schema<IExpenseSettlement>(
  {
    expenseId: { type: Schema.Types.ObjectId, ref: "SharedExpense", required: true },
    debtor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    creditor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "confirmed"],
      default: "pending",
    },
    paidAt: { type: Date },
    confirmedAt: { type: Date },
    upiTransactionId: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

// Indexes for performance
ExpenseSettlementSchema.index({ debtor: 1, paymentStatus: 1 });
ExpenseSettlementSchema.index({ creditor: 1, paymentStatus: 1 });
ExpenseSettlementSchema.index({ expenseId: 1 });
ExpenseSettlementSchema.index({ debtor: 1, creditor: 1, paymentStatus: 1 });

export default mongoose.models.ExpenseSettlement ||
  mongoose.model<IExpenseSettlement>("ExpenseSettlement", ExpenseSettlementSchema);
