import mongoose from 'mongoose';
import { emailRegex, phoneRegex } from './_shared.js';
import { LEAD_INTERESTS, LEAD_SOURCES, OUTREACH_STATUS, PREFERRED_TIME_TYPE } from './_enums.js';


const OutreachSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: OUTREACH_STATUS,
      default: 'New',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    note: { type: String, trim: true, maxlength: 2000 },
    followUpAt: { type: Date },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const NoteSchema = new mongoose.Schema(
  {
    body: { type: String, trim: true, maxlength: 4000 },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const LeadSchema = new mongoose.Schema(
  {
    // Basic identity
    name: { type: String, required: true, trim: true, maxlength: 120 },

    phone: {
      type: String,
      required: true,
      trim: true,
      set: v => (v ? String(v).replace(/\s+/g, '') : v), // strip spaces
      validate: {
        validator: v => phoneRegex.test(v),
        message: 'Invalid phone format',
      },
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: v => !v || emailRegex.test(v),
        message: 'Invalid email',
      },
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500, // same as frontend maxLength
      default: "",
    },


    // Meta
    source: {
      type: String,
      default: 'Website',
      enum: LEAD_SOURCES,
      index: true,
    },
    tags: { type: [String], default: [], index: true },

    interests: {
      type: [String],
      default: [],
      enum: LEAD_INTERESTS,
      index: true,
    },

    // Consent (minimal, but important)
    consent: { type: Boolean, default: true, index: true },

    // Light-weight context for attribution (keeps schema small)
    context: {
      utm: {
        source: { type: String, trim: true },
        medium: { type: String, trim: true },
        campaign: { type: String, trim: true },
        content: { type: String, trim: true },
      },
      page: {
        url: { type: String, trim: true },
        referrer: { type: String, trim: true },
      },
    },

    // Pipeline
    outreach: { type: OutreachSchema, default: () => ({ status: 'New', lastActivityAt: new Date() }) },

    // Notes
    notes: { type: [NoteSchema], default: [] },


    preferredTimeType: {
      type: String,
      enum: PREFERRED_TIME_TYPE,
      default: "ASAP",
      index: true,
    },
    preferredTimeAt: {
      type: Date,
      required: function () { return this.preferredTimeType === "SCHEDULED"; },
      index: true,
    },

    archivedAt: { type: Date, index: true },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ---- Indexes -----------------------------------------
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ phone: 1, createdAt: -1 });           // fetch latest lead by phone
LeadSchema.index({ 'outreach.status': 1 });
LeadSchema.index({ 'outreach.followUpAt': 1 });
// lightweight compound for quick ops filters
LeadSchema.index({ source: 1, 'outreach.status': 1, createdAt: -1 });
// optional text-like search (Mongo text index is one-per-collection; use if helpful)
LeadSchema.index({ name: 'text', tags: 'text' });
LeadSchema.index({ archivedAt: 1, createdAt: -1 });

// ---- Activity freshness on nested changes -------------
function bumpActivity(doc) {
  doc.outreach = doc.outreach || {};
  doc.outreach.lastActivityAt = new Date();
}

LeadSchema.pre('findOneAndUpdate', function (next) {
  this.setOptions({ runValidators: true, context: 'query' });
  next();
});

LeadSchema.path('preferredTimeAt').validate(function (v) {
  const u = this.getUpdate?.() || {};
  const set = u.$set || u;
  const type = this.preferredTimeType ?? set?.preferredTimeType ?? u?.preferredTimeType;
  if (type === 'SCHEDULED') return v instanceof Date;
  return true;
}, 'preferredTimeAt is required when preferredTimeType is SCHEDULED');



LeadSchema.pre('save', function (next) {
  if (
    this.isModified('outreach') ||
    this.isModified('outreach.status') ||
    this.isModified('outreach.note') ||
    this.isModified('outreach.followUpAt')
  ) {
    bumpActivity(this);
  }
  next();
});

// Mirror for findOneAndUpdate workflows
LeadSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const hasOutreachChange =
    'outreach' in update ||
    'outreach.status' in update ||
    'outreach.note' in update ||
    'outreach.followUpAt' in update ||
    (update.$set && (
      'outreach' in update.$set ||
      'outreach.status' in update.$set ||
      'outreach.note' in update.$set ||
      'outreach.followUpAt' in update.$set
    ));
  if (hasOutreachChange) {
    this.set({ 'outreach.lastActivityAt': new Date() });
  }
  next();
});

// ---- Lean API output ---------------------------------
LeadSchema.set('toJSON', { versionKey: false });
LeadSchema.set('toObject', { versionKey: false });

// ---- Handy static: recent-dedupe within X minutes ----
LeadSchema.statics.findRecentByPhone = function (phone, minutes = 10) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  return this.findOne({ phone, createdAt: { $gte: since } }).sort({ createdAt: -1 }).lean();
};

export default mongoose.model('Lead', LeadSchema);
