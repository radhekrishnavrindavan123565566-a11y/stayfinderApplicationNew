import mongoose, { Schema, Document } from "mongoose";

export interface IChatAction extends Document {
  conversationId: string;
  initiatorId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  type: "schedule_visit" | "send_offer" | "generate_agreement" | "confirm_booking";
  status: "pending" | "accepted" | "rejected" | "expired";
  payload?: unknown;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatActionSchema = new Schema<IChatAction>(
  {
    conversationId: { type: String, required: true },
    initiatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["schedule_visit", "send_offer", "generate_agreement", "confirm_booking"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    payload: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ChatAction ||
  mongoose.model<IChatAction>("ChatAction", ChatActionSchema);
