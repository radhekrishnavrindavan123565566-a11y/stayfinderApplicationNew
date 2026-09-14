import mongoose, { Schema, Document } from 'mongoose';

interface IInquiry extends Document {
  tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  status: 'new_lead' | 'call_done' | 'visit_scheduled' | 'visit_completed' | 'closed_booked' | 'closed_not_interested';
  priority?: 'low' | 'medium' | 'high';
  inquiryDate: Date;
  source?: 'app' | 'website' | 'whatsapp' | 'call' | 'referral';
  closureReason?: string;
  notes?: string;
  followUpDate?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['new_lead', 'call_done', 'visit_scheduled', 'visit_completed', 'closed_booked', 'closed_not_interested'],
      default: 'new_lead',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    inquiryDate: { type: Date, default: Date.now },
    source: { type: String, enum: ['app', 'website', 'whatsapp', 'call', 'referral'], default: 'app' },
    closureReason: String,
    notes: String,
    followUpDate: Date,
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', inquirySchema);
