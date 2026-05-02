const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Pricing in paise (1 INR = 100 paise)
const PLANS = {
  starter: { amount: 49900, label: 'Starter Plan' },  // ₹499
  pro:     { amount: 99900, label: 'Pro Plan' },       // ₹999
};

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and stores a pending transaction.
 */
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }

    const { amount, label } = PLANS[plan];

    // Create order on Razorpay
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan,
        label,
      },
    });

    // Persist pending transaction
    await Transaction.create({
      user: req.user._id,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      plan,
      status: 'created',
      notes: order.notes,
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID, // safe to expose — it's the public key
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/verify
 * Client-side verification after Razorpay checkout success.
 * NOTE: This is a secondary check. The authoritative verification
 * happens in the webhook handler.
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Upgrade user plan
    await User.findByIdAndUpdate(transaction.user, { plan: transaction.plan });

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      transaction: {
        id: transaction._id,
        plan: transaction.plan,
        amount: transaction.amount,
        status: transaction.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/transactions
 * Returns the authenticated user's transaction history.
 */
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-razorpaySignature -__v');

    res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment, getTransactions };
