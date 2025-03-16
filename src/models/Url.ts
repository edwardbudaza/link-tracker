import mongoose, { Document, Schema } from "mongoose";

export interface Url extends Document {
  originalUrl: string;
  shortId: string;
  customSlug?: string;
  createdAt: Date;
  expiresAt?: Date;
  clicks: number;
  isActive: boolean;
  creator?: string;
}

const UrlSchema = new Schema<Url>(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customSlug: {
      type: String,
      uniqe: true,
      sparse: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    creator: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Create indexes for faster queries
UrlSchema.index({ shortId: 1 });
UrlSchema.index({ originalUrl: 1 });

export default mongoose.model<Url>("Url", UrlSchema);
