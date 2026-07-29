import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  rating?: number;
  email?: string;
  attachments?: string[];
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['bug', 'feature', 'improvement', 'other'],
      required: true,
      default: 'other',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: undefined,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    attachments: {
      type: [String],
      default: [],
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'in-progress', 'resolved', 'closed'],
      default: 'new',
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, category: 1 });
FeedbackSchema.index({ createdAt: -1 });

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
