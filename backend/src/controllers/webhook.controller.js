const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay sends a raw POST with X-Razorpay-Signature header.
 * We MUST use the raw body (Buffer) for HMAC verification — this is why
 * this route is registered BEFORE express.json() in app.js.
 *
 * Reference: https://razorpay.com/docs/webhooks/validate-test/
 */
const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return res.status(400).json({ success: false, message: 'Missing signature or webhook secret.' });
  }

  // Verify HMAC-SHA256 signature using raw body
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body) // req.body is a Buffer here (raw)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.warn('[Webhook] Invalid signature — possible spoofed request.');
    return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
  }

  // Parse the raw body now that it's verified
  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
  }

  console.log(`[Webhook] Event received: ${event.event}`);

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        const transaction = await Transaction.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            razorpayPaymentId: payment.id,
            status: 'paid',
            webhookVerified: true,
          },
          { new: true }
        );

        if (transaction) {
          await User.findByIdAndUpdate(transaction.user, { plan: transaction.plan });
          console.log(`[Webhook] Payment captured for order ${orderId}. User plan upgraded.`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        await Transaction.findOneAndUpdate(
          { razorpayOrderId: payment.order_id },
          { status: 'failed', webhookVerified: true }
        );
        console.log(`[Webhook] Payment failed for order ${payment.order_id}.`);
        break;
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity;
        await Transaction.findOneAndUpdate(
          { razorpayPaymentId: refund.payment_id },
          { status: 'refunded', webhookVerified: true }
        );
        console.log(`[Webhook] Refund created for payment ${refund.payment_id}.`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.event}`);
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err);
    // Return 200 to prevent Razorpay from retrying — log the error internally
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
};

module.exports = { handleRazorpayWebhook };
