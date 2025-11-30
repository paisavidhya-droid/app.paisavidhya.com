// controllers/webhook.controller.js
import crypto from 'crypto';
import { BSE_CONFIG } from '../config/bse.config.js';
import WebhookEvent from '../models/webhookEvent.model.js';

export const handleWebhook = async (req, res, next) => {
  try {
    // OPTIONAL: verify signature if BSE sends one (check docs)
    const signature = req.headers['x-bse-signature'];
    if (BSE_CONFIG.webhookSecret && signature) {
      const expected = crypto
        .createHmac('sha256', BSE_CONFIG.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expected !== signature) {
        return res.status(401).json({ message: 'INVALID_WEBHOOK_SIGNATURE' });
      }
    }

    const event = req.body;

    await WebhookEvent.create({
      entityType: event?.entity_type,
      rawPayload: event,
    });

    // TODO: update BseUcc / BseOrder / BseMandate based on event contents

    return res.json({
      ack: {
        status: 'success',
        data: { id: '1' },
        messages: [],
      },
    });
  } catch (err) {
    next(err);
  }
};
