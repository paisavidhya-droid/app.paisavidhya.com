import mongoose from 'mongoose';

const bseMandateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ucc: { type: String, required: true },
    mandateId: { type: String },        // BSE mandate id
    status: { type: String, default: 'PENDING' },
    lastRequest: { type: Object },
    lastResponse: { type: Object },
    env: { type: String, default: 'sandbox' },
  },
  { timestamps: true }
);

const BseMandate = mongoose.model('BseMandate', bseMandateSchema);
export default BseMandate;
