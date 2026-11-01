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

// ── Indexes ───────────────────────────────────────────────────────────────────
inquirySchema.index({ status: 1, inquiryDate: -1 });          // admin list + pipeline filter
inquirySchema.index({ tenantId: 1, createdAt: -1 });          // tenant's own inquiries
inquirySchema.index({ propertyId: 1 });                       // property-level lookup
inquirySchema.index({ ownerId: 1, status: 1 });               // owner dashboard
inquirySchema.index({ createdAt: -1 });                       // activity stats (today/thisWeek)
inquirySchema.index({ priority: 1, status: 1 });              // admin filters
inquirySchema.index({ followUpDate: 1 }, { sparse: true });   // follow-up scheduler

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', inquirySchema);
