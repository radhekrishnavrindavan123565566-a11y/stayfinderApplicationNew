import mongoose, { Schema, Document } from "mongoose";

export interface ILocalityQA extends Document {
  city: string;
  locality: string;
  question: string;
  askedBy: mongoose.Types.ObjectId;
  answers: {
    userId: mongoose.Types.ObjectId;
    answer: string;
    upvotes: number;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LocalityQASchema = new Schema<ILocalityQA>(
  {
    city: { type: String, required: true },
    locality: { type: String, required: true },
    question: { type: String, required: true },
    askedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        answer: { type: String, required: true },
        upvotes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.LocalityQA ||
  mongoose.model<ILocalityQA>("LocalityQA", LocalityQASchema);
