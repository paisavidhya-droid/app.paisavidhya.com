import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'BSE' },
    entityType: { type: String },
    rawPayload: { type: Object },
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);
export default WebhookEvent;
