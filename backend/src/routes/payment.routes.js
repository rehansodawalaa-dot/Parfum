const router = require('express').Router();
const { body } = require('express-validator');
const { createOrder, verifyPayment, getTransactions } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.post(
  '/create-order',
  [body('plan').isIn(['starter', 'pro']).withMessage('Plan must be starter or pro')],
  validate,
  createOrder
);

router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  validate,
  verifyPayment
);

router.get('/transactions', getTransactions);

module.exports = router;
