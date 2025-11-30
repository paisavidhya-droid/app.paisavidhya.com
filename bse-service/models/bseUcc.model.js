// models/bseUcc.model.js
import mongoose from 'mongoose';

const bseUccSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ucc: { type: String, index: true },
    status: { type: String, default: 'PENDING' }, // PENDING / SUCCESS / FAILED
    lastRequest: { type: Object },
    lastResponse: { type: Object },
    env: { type: String, default: 'sandbox' },
  },
  { timestamps: true }
);

const BseUcc = mongoose.model('BseUcc', bseUccSchema);
export default BseUcc;
