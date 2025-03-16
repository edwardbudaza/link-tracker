import mongoose, { Document, Schema } from "mongoose";

export interface ClickEvent extends Document {
  urlId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  device?: string;
  browser?: string;
  os?: string;
}

const ClickEventSchema = new Schema<ClickEvent>(
  {
    urlId: {
      type: String,
      required: true,
      ref: "Url",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
    referer: String,
    country: String,
    device: String,
    browser: String,
    os: String,
  },
  { timestamps: true }
);

// Create indexes for faster analytics queries
ClickEventSchema.index({ urlId: 1 });
ClickEventSchema.index({ timestamp: 1 });

export default mongoose.model<ClickEvent>("ClickEvent", ClickEventSchema);
