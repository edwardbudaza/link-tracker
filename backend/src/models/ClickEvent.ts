import mongoose, { Document, Schema } from "mongoose";

export interface ClickEvent extends Document {
  urlId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  emailClient?: string;
  campaignId?: string;
  source?: 'web' | 'email';
  metadata?: Record<string, any>;
}

const ClickEventSchema = new Schema<ClickEvent>(
  {
    urlId: {
      type: String,
      required: true,
      ref: "Url",
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    referrer: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      default: null,
    },
    browser: {
      type: String,
      default: null,
    },
    os: {
      type: String,
      default: null,
    },
    emailClient: {
      type: String,
      default: null,
    },
    campaignId: {
      type: String,
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: ['web', 'email'],
      default: 'web',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Create compound indexes for common queries
ClickEventSchema.index({ urlId: 1, timestamp: -1 });
ClickEventSchema.index({ campaignId: 1, timestamp: -1 });
ClickEventSchema.index({ source: 1, timestamp: -1 });

export default mongoose.model<ClickEvent>("ClickEvent", ClickEventSchema);
