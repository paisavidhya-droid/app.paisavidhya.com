const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
     jobId: {
      type: String,
      required: true,
      unique: true,
      index: true, // helps with faster queries
    },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String, required: true },
    appLink: { type: String, required: true },
    jobDesc: { type: String, required: true, maxlength: 250 },
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    isInternal:{type:Boolean}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
