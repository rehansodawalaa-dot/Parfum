const router = require('express').Router();
const { body } = require('express-validator');
const { getUsers, getTransactions, getAnalytics, toggleUserActive } = require('../controllers/admin.controller');
const { createProduct, updateProduct, deleteProduct, getAllProductsAdmin } = require('../controllers/product.controller');
const { getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect, adminOnly);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);

// Transactions & analytics
router.get('/transactions', getTransactions);
router.get('/analytics', getAnalytics);

// Products
router.get('/products', getAllProductsAdmin);
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
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
