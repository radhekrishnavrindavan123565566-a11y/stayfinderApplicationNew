import mongoose, { Schema, Document } from 'mongoose';

interface IAdminAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  entityType: 'property' | 'user' | 'inquiry' | 'banner' | 'notification' | 'booking';
  entityId: mongoose.Types.ObjectId;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const adminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['property', 'user', 'inquiry', 'banner', 'notification', 'booking'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    reason: String,
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for efficient queries
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.models.AdminAuditLog || mongoose.model<IAdminAuditLog>('AdminAuditLog', adminAuditLogSchema);
