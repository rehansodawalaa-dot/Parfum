const router = require('express').Router();
const { handleRazorpayWebhook } = require('../controllers/webhook.controller');

// IMPORTANT: Use express.raw() here so req.body is a Buffer for HMAC verification.
// This route is mounted BEFORE express.json() in app.js.
router.post(
  '/razorpay',
  require('express').raw({ type: 'application/json' }),
  handleRazorpayWebhook
);

module.exports = router;
