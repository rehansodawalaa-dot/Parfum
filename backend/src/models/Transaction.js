const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Razorpay order ID (created on backend before checkout)
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    // Razorpay payment ID (returned after successful payment)
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    // Razorpay signature (for verification)
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number, // stored in paise (INR smallest unit)
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    plan: {
      type: String,
      enum: ['starter', 'pro'],
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    // Webhook-verified flag — only set to true after signature verification
    webhookVerified: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
