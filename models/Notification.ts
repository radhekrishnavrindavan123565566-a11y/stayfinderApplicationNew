import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "booking" | "message" | "payment" | "review" | "system" | "boost";
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["booking", "message", "payment", "review", "system", "boost"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Map, of: String },
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
