import mongoose from 'mongoose';

const bseOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ucc: { type: String, required: true },
    orderId: { type: String },             // BSE order_id
    memOrdRef: { type: String },           // your mem_ord_ref_id
    schemeCode: { type: String, required: true },
    amount: { type: Number, required: true },
    txnType: { type: String, enum: ['BUY', 'SELL'], required: true },
    status: { type: String, default: 'PENDING' },
    lastRequest: { type: Object },
    lastResponse: { type: Object },
    env: { type: String, default: 'sandbox' },
  },
  { timestamps: true }
);

const BseOrder = mongoose.model('BseOrder', bseOrderSchema);
export default BseOrder;
