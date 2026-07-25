const router = require('express').Router();
const { body } = require('express-validator');
const { getUsers, getTransactions, getAnalytics, toggleUserActive } = require('../controllers/admin.controller');
const { createProduct, updateProduct, deleteProduct, getAllProductsAdmin, toggleProduct } = require('../controllers/product.controller');
const { getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const { updateOrderTracking }  = require('../controllers/order.controller');
const { getAllReviewsAdmin, moderateReview } = require('../controllers/review.controller');
const { getWishlistAnalytics } = require('../controllers/wishlist.controller');
const { getTickets, getTicketById, addMessage, updateTicketStatus, getSupportAnalytics } = require('../controllers/support.controller');
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon } = require('../controllers/coupon.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const { validate } = require('../middleware/validate.middleware');

router.use(protect, adminOnly);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', getUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);

// ── Transactions & analytics ──────────────────────────────────────────────────
router.get('/transactions', getTransactions);
router.get('/analytics',    getAnalytics);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', getAllProductsAdmin);
router.patch('/products/:id/toggle', toggleProduct);
router.post(
  '/products',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('category').isIn(['men', 'women', 'unisex', 'premium']).withMessage('Invalid category'),
    body('fragranceType').isIn(['woody', 'floral', 'citrus', 'oriental', 'fresh', 'aquatic']).withMessage('Invalid fragrance type'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  ],
  validate,
  createProduct
);
router.put('/products/:id',    updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders',                   getAllOrders);
router.patch('/orders/:id/status',      updateOrderStatus);
router.patch('/orders/:id/tracking',    updateOrderTracking);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews',                  getAllReviewsAdmin);
router.patch('/reviews/:id/moderate',   moderateReview);

// ── Wishlist analytics ────────────────────────────────────────────────────────
router.get('/wishlist/analytics',       getWishlistAnalytics);

// ── Support / tickets ─────────────────────────────────────────────────────────
router.get('/support',                  getTickets);
router.get('/support/analytics',        getSupportAnalytics);
router.get('/support/:id',              getTicketById);
router.patch('/support/:id/status',     updateTicketStatus);
router.post(
  '/support/message',
  [
    body('ticketId').notEmpty(),
    body('text').trim().notEmpty().isLength({ max: 2000 }),
  ],
  validate,
  addMessage
);

// ── Coupons ───────────────────────────────────────────────────────────────────
router.get('/coupons',              getCoupons);
router.post(
  '/coupons',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('type').isIn(['percent', 'flat']).withMessage('Type must be percent or flat'),
    body('value').isFloat({ min: 1 }).withMessage('Value must be at least 1'),
  ],
  validate,
  createCoupon
);
router.patch('/coupons/:id',        updateCoupon);
router.patch('/coupons/:id/toggle', toggleCoupon);
router.delete('/coupons/:id',       deleteCoupon);

module.exports = router;
