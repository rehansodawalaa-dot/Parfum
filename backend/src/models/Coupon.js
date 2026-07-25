const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type:     String,
      required: [true, 'Coupon code is required'],
      unique:   true,
      uppercase: true,
      trim:     true,
      maxlength: [30, 'Code cannot exceed 30 characters'],
    },
    description: { type: String, default: '', trim: true, maxlength: 100 },

    // ── Type ──────────────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: ['percent', 'flat'],   // percent = X% off, flat = ₹X off
      required: true,
    },
    value: {
      type:     Number,
      required: true,
      min:      [1, 'Value must be at least 1'],
    },

    // ── Constraints ───────────────────────────────────────────────────────────
    minOrderValue: { type: Number, default: 0 },           // minimum cart value
    maxDiscount:   { type: Number, default: null },        // cap for percent coupons (null = no cap)

    // ── Usage ─────────────────────────────────────────────────────────────────
    usageLimit:    { type: Number, default: null },        // null = unlimited
    usedCount:     { type: Number, default: 0 },
    perUserLimit:  { type: Number, default: 1 },           // how many times one user can use it

    // ── Scope ─────────────────────────────────────────────────────────────────
    // If specificUsers is non-empty, coupon is only valid for those user IDs
    specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Validity ──────────────────────────────────────────────────────────────
    expiresAt: { type: Date, default: null },              // null = never expires
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Virtual: is this coupon currently usable? ─────────────────────────────────
couponSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
  return true;
});

/**
 * Calculate discount amount for a given subtotal.
 * Returns the discount in rupees (integer, capped at subtotal).
 */
couponSchema.methods.calcDiscount = function (subtotal) {
  let discount = 0;
  if (this.type === 'percent') {
    discount = Math.round((subtotal * this.value) / 100);
    if (this.maxDiscount !== null) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.value;
  }
  return Math.min(discount, subtotal); // can't discount more than the order value
};

module.exports = mongoose.model('Coupon', couponSchema);
