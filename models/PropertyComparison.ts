import mongoose, { Schema, Document } from "mongoose";

export interface IPropertyComparison extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  properties: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyComparisonSchema = new Schema<IPropertyComparison>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, default: "My Comparison" },
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    notes: { type: String },
  },
  { timestamps: true }
);

PropertyComparisonSchema.index({ userId: 1 });

export default mongoose.models.PropertyComparison ||
  mongoose.model<IPropertyComparison>("PropertyComparison", PropertyComparisonSchema);
