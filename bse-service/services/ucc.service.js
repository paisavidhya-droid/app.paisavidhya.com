import mongoose from "mongoose";
import { uccGenerator } from "../generators/uccGenerator.js";
import User from '../models/user.model.js';
import BseUcc from '../models/bseUcc.model.js';
import { BSE_CONFIG } from '../config/bse.config.js';
import { postBse } from './bseClient.js';

function buildUccPayload({ clientcode, user, options = {} }) {
  return {
    member: {
      // use what BSE expects; start minimal, add fields as error messages demand
      member_id: BSE_CONFIG.memberId || BSE_CONFIG.memberCode,
      // subbr_code, subbr_arn, euin, partner_id etc -> add when BSE asks
    },

    clientcode,

    holders: [
      {
        holder_rank: "1",
        identifier: {
          pan: (user.pan || options.pan || "").toUpperCase(),
        },
        person: {
          name: user.name,
          dob: user.dob ? user.dob.toISOString().slice(0, 10) : options.dob,
        },
        contact: {
          email: user.email,
          mobile: user.phoneNumber,
        },
      },
    ],
  };
}

export async function createUccForUser(userId, payloadOverrides = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (!user.pan) throw new Error("PAN_REQUIRED_FOR_UCC");

  const db = mongoose.connection.db;
  const clientcode = payloadOverrides.clientcode || (await uccGenerator(user.pan, db));

  const payload = buildUccPayload({ clientcode, user, options: payloadOverrides });

  const uccRecord = await BseUcc.create({
    userId: user._id,
    ucc: clientcode,
    status: "PENDING",
    lastRequest: payload,
    env: BSE_CONFIG.env,
  });

  const resp = await postBse("/v2/add_ucc", payload, { encrypt: true });

  uccRecord.lastResponse = resp;
  uccRecord.status = resp?.status || "UNKNOWN";
  await uccRecord.save();

  return { user, uccRecord, bseResponse: resp };
}

export async function getUccRecordsForUser(userId) {
  return BseUcc.find({ userId }).sort({ createdAt: -1 }).lean();
}