import mongoose, { Schema, Document } from "mongoose";

export interface IViewingSchedule extends Document {
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  timeSlot: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  viewingType: "in-person" | "virtual";
  meetingLink?: string;
  tenantNotes?: string;
  ownerNotes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ViewingScheduleSchema = new Schema<IViewingSchedule>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    viewingType: {
      type: String,
      enum: ["in-person", "virtual"],
      default: "in-person",
    },
    meetingLink: { type: String },
    tenantNotes: { type: String },
    ownerNotes: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ViewingScheduleSchema.index({ tenantId: 1, scheduledDate: 1 });
ViewingScheduleSchema.index({ ownerId: 1, scheduledDate: 1 });
ViewingScheduleSchema.index({ propertyId: 1, scheduledDate: 1 });

export default mongoose.models.ViewingSchedule ||
  mongoose.model<IViewingSchedule>("ViewingSchedule", ViewingScheduleSchema);
