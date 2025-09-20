const mongoose = require('mongoose');
const activityLogModel = require('./activityLogModel');

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // Basic validation for 10-digit mobile
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    degree: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    yearOfPassout: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    occupation: {
      type: String,
      enum: ['Student', 'Working', 'Job-Hunting'],
    },
    currentSalary: {
      type: String,
    },
    preferredCourse: {
      type: String,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    appliedFor: { type: String },
    source: {
      type: String,
      default: 'Website',
      enum: ['Website', 'LinkedIn', 'Referral', 'Instagram', 'WhatsApp', 'Campaign', 'Other'],
    },
    referralCode: {
      type: String,
    },
  
    
    // Outreach Information 
    outreachDetails: {
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Interested','Follow-Up','Meeting Scheduled', 'Enrolled', 'Not Interested', 'Rejected'],
      default: 'New',
    },
      note: {
        type: String,
        trim: true,
      },
      followUpDate: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

// Pre-delete middleware to log activity when deleting a candidate
candidateSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await activityLogModel.deleteMany({ modelId: this._id, modelType: 'Candidate' });
    next();
  } catch (err) {
    next(err);
  }
});


module.exports = mongoose.model('Candidate', candidateSchema);
