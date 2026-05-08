import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  documentType: 'aadhaar' | 'pan' | 'agreement' | 'receipt' | 'other';
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  scannedAt?: Date;
  ocrData?: {
    text: string;
    confidence: number;
    extractedFields: Record<string, any>;
  };
  expiryDate?: Date;
  tags: string[];
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['aadhaar', 'pan', 'agreement', 'receipt', 'other'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    scannedAt: {
      type: Date,
    },
    ocrData: {
      text: String,
      confidence: Number,
      extractedFields: Schema.Types.Mixed,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    sharedWith: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ documentType: 1, userId: 1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
