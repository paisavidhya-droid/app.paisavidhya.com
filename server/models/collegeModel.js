const mongoose = require("mongoose");
const activityLogModel = require("./activityLogModel");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    contactPerson: String,
    contactEmail: String,
    contactPhone: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    outreachDetails: {
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: [
          "Not Contacted",
          "Contacted",
          "Follow-Up",
          "Meeting Scheduled",
          "Not Interested",
          "Signed Up",
        ],
        default: "Not Contacted",
      },
      note: String,
      followUpDate: Date,
    },
  },
  { timestamps: true }
);

// In your college model file

collegeSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await activityLogModel.deleteMany({ modelId: this._id, modelType: "College" });
    next();
  } catch (err) {
    next(err);
  }
});


module.exports = mongoose.model("College", collegeSchema);
