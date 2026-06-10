const router = require('express').Router();
const { body } = require('express-validator');
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Review title is required').isLength({ max: 120 }),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 2000 }),
];

// Public
router.get('/:productId', getProductReviews);

// Authenticated
router.post(
  '/',
  protect,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('orderId').notEmpty().withMessage('Order ID is required'),
    ...reviewValidation,
  ],
  validate,
  createReview
);

router.put('/:id', protect, reviewValidation, validate, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
