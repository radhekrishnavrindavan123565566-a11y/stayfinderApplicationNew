import mongoose, { Schema, Document } from 'mongoose';

interface IBanner extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  actionUrl?: string;
  actionType?: 'internal_page' | 'external_link' | 'property' | 'category';
  position: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: {
    roles?: string[];
    cities?: string[];
    userSegments?: string[];
  };
  displayPlatform?: string[];
  impressions?: number;
  clicks?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    description: String,
    imageUrl: { type: String, required: true },
    imageAlt: String,
    actionUrl: String,
    actionType: { type: String, enum: ['internal_page', 'external_link', 'property', 'category'] },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    targetAudience: {
      roles: [String],
      cities: [String],
      userSegments: [String],
    },
    displayPlatform: { type: [String], default: ['app', 'web'] },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, position: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', bannerSchema);
