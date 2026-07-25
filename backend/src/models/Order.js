const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:         { type: String, required: true },
  brand:        { type: String, required: true },
  image:        { type: String, default: '' },
  size:         { type: String, required: true },
  quantity:     { type: Number, required: true, min: 1 },
  price:        { type: Number, required: true },   // price at time of purchase
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone:    { type: String, required: true },
  email:    { type: String, required: true },
  line1:    { type: String, required: true },
  line2:    { type: String, default: '' },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items:           { type: [orderItemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },

    subtotal:  { type: Number, required: true },
    tax:       { type: Number, required: true },
    shipping:  { type: Number, required: true },
    discount:  { type: Number, default: 0 },      // coupon discount in ₹
    couponCode: { type: String, default: '' },     // coupon code applied
    total:     { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },

    // Payment
    razorpayOrderId:   { type: String, sparse: true },
    razorpayPaymentId: { type: String, sparse: true },
    razorpaySignature: { type: String, sparse: true, select: false },
    paymentStatus:     { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    webhookVerified:   { type: Boolean, default: false },

    // Shipping
    trackingNumber:  { type: String, default: '' },
    carrier:         { type: String, default: '' },
    courierPartner:  { type: String, default: '' },
    shippedAt:       { type: Date },
    deliveredAt:     { type: Date },
    trackingTimeline: [
      {
        status:    { type: String, required: true },
        message:   { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    // Cancellation / refund
    cancelReason:   { type: String, default: '' },
    refundAmount:   { type: Number, default: 0 },
    refundedAt:     { type: Date },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate order number: JRS-YYYYMMDD-XXXXX
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `JRS-${date}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
