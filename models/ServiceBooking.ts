import mongoose, { Document, Schema } from 'mongoose';
import { ServiceCategory } from './ServiceProvider';

export interface IServiceBooking extends Document {
  userId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  maintenanceRequestId?: mongoose.Types.ObjectId;
  serviceType: ServiceCategory;
  description: string;
  preferredDate: Date;
  preferredTime: string;
  actualDate?: Date;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  paymentId?: mongoose.Types.ObjectId;
  completionNotes?: string;
  photos?: string[];
  cancelReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBookingSchema = new Schema<IServiceBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
      index: true,
    },
    maintenanceRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'MaintenanceRequest',
      index: true,
    },
    serviceType: {
      type: String,
      enum: ['plumbing', 'electrical', 'appliance', 'structural', 'cleaning', 'pest_control', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    actualDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    estimatedCost: {
      type: Number,
      required: true,
    },
    actualCost: {
      type: Number,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    completionNotes: {
      type: String,
    },
    photos: {
      type: [String],
      default: [],
    },
    cancelReason: {
      type: String,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ServiceBookingSchema.index({ status: 1, preferredDate: 1 });

export default mongoose.models.ServiceBooking || mongoose.model<IServiceBooking>('ServiceBooking', ServiceBookingSchema);
