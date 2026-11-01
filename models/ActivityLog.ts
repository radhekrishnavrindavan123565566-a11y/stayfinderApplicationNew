import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  type:
    | 'user_registered'
    | 'user_updated'
    | 'property_added'
    | 'property_updated'
    | 'rent_updated'
    | 'property_rented'
    | 'inquiry_received'
    | 'inquiry_updated'
    | 'booking_created'
    | 'payment_received'
    | 'review_posted'
    | 'dispute_raised';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high';
  actorId?: mongoose.Types.ObjectId;
  targetId?: string;
  targetType?: 'user' | 'property' | 'inquiry' | 'booking';
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    type: {
      type: String,
      enum: [
        'user_registered',
        'user_updated',
        'property_added',
        'property_updated',
        'rent_updated',
        'property_rented',
        'inquiry_received',
        'inquiry_updated',
        'booking_created',
        'payment_received',
        'review_posted',
        'dispute_raised',
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: String },
    targetType: {
      type: String,
      enum: ['user', 'property', 'inquiry', 'booking'],
    },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
