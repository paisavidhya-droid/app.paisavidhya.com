// src/models/profile.model.js
import mongoose from 'mongoose';

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

  primaryPhone: {
    number: { type: String, trim: true },
    verified: { type: Boolean, default: false }
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
