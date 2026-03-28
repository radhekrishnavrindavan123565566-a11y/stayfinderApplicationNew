import mongoose, { Schema } from "mongoose";

// Short-lived typing indicator stored in DB so SSE polling can pick it up
// across multiple Next.js worker processes
const TypingEventSchema = new Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    isTyping: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

TypingEventSchema.index({ conversationId: 1, senderId: 1 }, { unique: true });

export default mongoose.models.TypingEvent ||
  mongoose.model("TypingEvent", TypingEventSchema);
