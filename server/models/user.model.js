const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // don’t return password by default
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'STAFF', 'CUSTOMER'],
    default: 'CUSTOMER'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },

  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },

  phoneOtpHash: String,
  phoneOtpExpires: Date,
  phoneOtpAttempts: { type: Number, default: 0 },

  // If you want email magic link:
  emailVerifyVersion: { type: Number, default: 0 }, // token versioning (optional)

  // lastLoginAt: Date,
  // lastLoginIp: String,
  // lastLoginUa: String,
  // failedLoginCount: { type: Number, default: 0 },
  // lastFailedAt: Date,


  otp: String,
  otpExpires: Date
},
  { timestamps: true }
);


// ✅ Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password hasn't changed

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

//Compareing Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { sub: this._id.toString(), email: this.email, role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '12h' }
  );
  return token;
};


const User = mongoose.model('User', userSchema);

module.exports = User;



