import mongoose, { Schema, Document } from "mongoose";

export interface IPropertyActivity extends Document {
  propertyId: mongoose.Types.ObjectId;
  activityType: "view" | "wishlist" | "booking" | "inquiry" | "share";
  userId?: mongoose.Types.ObjectId;
  metadata?: {
    userCollege?: string;
    userCity?: string;
    deviceType?: string;
  };
  createdAt: Date;
}

const PropertyActivitySchema = new Schema<IPropertyActivity>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    activityType: {
      type: String,
      enum: ["view", "wishlist", "booking", "inquiry", "share"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: {
      userCollege: { type: String },
      userCity: { type: String },
      deviceType: { type: String },
    },
  },
  { timestamps: true }
);

PropertyActivitySchema.index({ propertyId: 1, createdAt: -1 });
PropertyActivitySchema.index({ createdAt: -1 });

export default mongoose.models.PropertyActivity ||
  mongoose.model<IPropertyActivity>("PropertyActivity", PropertyActivitySchema);
