import mongoose, { Schema, Document } from "mongoose";

export interface IReaction {
  userId: mongoose.Types.ObjectId;
  emoji: string;
}

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "image" | "video" | "file" | "emoji";
  status: "sent" | "delivered" | "seen";
  mediaUrl?: string;
  mediaType?: string;
  reactions: IReaction[];
  read: boolean;
  deletedFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  { userId: { type: Schema.Types.ObjectId, ref: "User" }, emoji: String },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    content: { type: String, default: "" },
    type: { type: String, enum: ["text", "image", "video", "file", "emoji"], default: "text" },
    status: { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },
    mediaUrl: String,
    mediaType: String,
    reactions: { type: [ReactionSchema], default: [] },
    read: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
