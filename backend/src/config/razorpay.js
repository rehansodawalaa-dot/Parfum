const Razorpay = require('razorpay');

// Warn if Razorpay credentials are missing — but don't crash the server.
// Payment routes will return a 503 if razorpay is null.
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('[Config] Razorpay credentials not set. Payment features will be unavailable until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are configured.');
}

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

module.exports = razorpay;
