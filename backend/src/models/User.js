const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Core identity ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    firstName: { type: String, trim: true, maxlength: 50, default: '' },
    lastName:  { type: String, trim: true, maxlength: 50, default: '' },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Email verification ────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken:   { type: String, select: false },
    emailVerifyExpires: { type: Date,   select: false },

    // ── Password reset ────────────────────────────────────────────────────────
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },

    // ── Referral ──────────────────────────────────────────────────────────────
    referralCode:  { type: String, unique: true, sparse: true },
    referredBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCount: { type: Number, default: 0 },

    // ── Security ──────────────────────────────────────────────────────────────
    loginAttempts: { type: Number, default: 0 },
    lockUntil:     { type: Date },
    lastLogin:     { type: Date },

    // ── Profile ───────────────────────────────────────────────────────────────
    phone:       { type: String, default: '' },
    phoneNumber: { type: String, default: '', index: true, sparse: true },
    country:     { type: String, default: '', trim: true },
    avatar:      { type: String, default: '' },

    // ── Preferences ───────────────────────────────────────────────────────────
    dataSaverEnabled: { type: Boolean, default: false },

    // ── Wishlist (array of product IDs) ───────────────────────────────────────
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Account lockout helpers
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock after 5 failed attempts for 30 minutes
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

// Generate referral code
userSchema.methods.generateReferralCode = function () {
  const base = this.name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${rand}`;
};

module.exports = mongoose.model('User', userSchema);
