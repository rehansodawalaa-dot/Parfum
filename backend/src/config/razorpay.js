const Razorpay = require('razorpay');

// In production, Razorpay credentials are required.
// In development/test, we allow the server to start without them.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('[Config] Razorpay credentials missing in production. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
}

const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

module.exports = razorpay;
