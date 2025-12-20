// src/models/profile.model.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: { type: String, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'India' },
}, { _id: false });

const bankSchema = new mongoose.Schema({
  accountHolderName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  ifsc: { type: String, trim: true, uppercase: true },
  bankName: { type: String, trim: true },
  branchName: { type: String, trim: true },
  accountType: {
    type: String,
    enum: ['SAVINGS', 'CURRENT', 'NRE', 'NRO', 'OTHER'],
    default: 'SAVINGS'
  }
}, { _id: false });

const nomineeSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  relation: { type: String, trim: true },
  dob: { type: Date },
  sharePercent: { type: Number, min: 0, max: 100 },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
    index: true,
  },

  name: {
    first: { type: String, trim: true },
    middle: { type: String, trim: true },
    last: { type: String, trim: true },
    full: { type: String, trim: true }, // computed if absent
  },

  dob: Date,

  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    default: 'PREFER_NOT_TO_SAY',
    index: true,
  },


  photoUrl: String,

  prefs: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    locale: { type: String, default: 'en-IN' },
    comms: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false }
    }
  },

  // 🔹 Investor / KYC block
  kyc: {
    pan: {
      type: String,
      uppercase: true,
      index: true,
      sparse: true
    },
    kycStatus: {
      type: String,
      enum: ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
      default: 'NOT_STARTED'
    },
    residencyStatus: {
      type: String,
      enum: ['RESIDENT', 'NRI', 'HUF', 'NRO', 'NRE', 'OTHER'],
      default: 'RESIDENT'
    },
    occupation: { type: String, trim: true },
    annualIncomeSlab: { type: String, trim: true }, // e.g. "<2.5L", "2.5L-5L"
    pepStatus: {
      type: String,
      enum: ['NOT_PEP', 'PEP', 'RELATED_TO_PEP', 'UNKNOWN'],
      default: 'NOT_PEP'
    }
  },

  address: addressSchema,

  bank: bankSchema,

  nominee: nomineeSchema,

  // Optional BSE reference shortcut
  bse: {
    ucc: { type: String, index: true },
    env: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox'
    }
  }

}, { timestamps: true });

profileSchema.index({ createdAt: -1 });

// Compute name.full if not provided
profileSchema.pre('save', function(next) {
  const first = this.name?.first?.trim() || '';
  const middle = this.name?.middle?.trim() || '';
  const last = this.name?.last?.trim() || '';
  const parts = [first, middle, last].filter(Boolean);
  if (parts.length && !this.name?.full) {
    this.name.full = parts.join(' ');
  }
  next();
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
