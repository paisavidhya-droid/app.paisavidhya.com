// services/ucc.service.js
import User from '../models/user.model.js';
import BseUcc from '../models/bseUcc.model.js';
import { BSE_CONFIG } from '../config/bse.config.js';
import { postBse } from './bseClient.js';

/**
 * Build payload for BSE's add_ucc API.
 * You must adjust this to EXACTLY match BSE PDF field names.
 */
function buildUccPayload(user, options = {}) {
  // These names (member/investor/holder) match BSE docs conceptually.
  // Check the PDF and rename keys if needed.
  return {
    member: {
      code: BSE_CONFIG.memberCode,
    },
    investor: {
      name: user.name,
      email: user.email,
      mobile: user.phoneNumber,
      pan: user.pan || options.pan,
      dob: user.dob ? user.dob.toISOString().slice(0, 10) : options.dob,
      // Add taxStatus, occupation, etc. as per BSE
    },
    holder: [
      {
        name: user.name,
        // More fields required by BSE...
      },
    ],
  };
}

/**
 * Create UCC for a given userId
 */
export async function createUccForUser(userId, payloadOverrides = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');

  const payload = buildUccPayload(user, payloadOverrides);

  const uccRecord = await BseUcc.create({
    userId: user._id,
    status: 'PENDING',
    lastRequest: payload,
    env: BSE_CONFIG.env,
  });

  const resp = await postBse('/v2/add_ucc', payload);

  // TODO: match actual response structure from BSE
  const uccCode = resp?.data?.ucc || resp?.ucc || null;
  const status = resp?.status || 'UNKNOWN';

  uccRecord.ucc = uccCode;
  uccRecord.status = status;
  uccRecord.lastResponse = resp;
  await uccRecord.save();

  return { user, uccRecord, bseResponse: resp };
}

export async function getUccRecordsForUser(userId) {
  return BseUcc.find({ userId }).sort({ createdAt: -1 }).lean();
}
