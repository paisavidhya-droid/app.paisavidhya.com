// models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phoneNumber: { type: String },
    pan: { type: String },          // add if you store PAN in main app
    dob: { type: Date },            // optional, if stored
    // any other fields you already use...
  },
  { timestamps: true }
);

// Important: collection name must match your existing one.
// If your main app used `mongoose.model('User', ...)` with default collection,
// it will be "users" -> fine.
const User = mongoose.model('User', userSchema);
export default User;
