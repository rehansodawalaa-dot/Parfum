const router = require('express').Router();
const { body } = require('express-validator');
const { createOrder, verifyOrder, getMyOrders, getOrderById, getOrderTracking, createCODOrder } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

const addressValidation = [
  body('items').isArray({ min: 1 }).withMessage('Cart cannot be empty'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').matches(/^\d{10}$/).withMessage('Valid 10-digit phone required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email required'),
  body('shippingAddress.line1').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit PIN required'),
];

router.post('/create', addressValidation, validate, createOrder);
router.post('/cod',    addressValidation, validate, createCODOrder);

router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  validate,
  verifyOrder
);

router.get('/my',            getMyOrders);
router.get('/:id/tracking',  getOrderTracking);
router.get('/:id',           getOrderById);

module.exports = router;
