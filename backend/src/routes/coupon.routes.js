const router = require('express').Router();
const { body } = require('express-validator');
const { validateCoupon } = require('../controllers/coupon.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.post(
  '/validate',
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('subtotal').isFloat({ min: 1 }).withMessage('Valid subtotal required'),
  ],
  validate,
  validateCoupon
);

module.exports = router;
