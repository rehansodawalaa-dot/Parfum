const router = require('express').Router();
const { body } = require('express-validator');
const { getDashboard, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.get('/dashboard', getDashboard);

router.patch(
  '/profile',
  [body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 })],
  validate,
  updateProfile
);

module.exports = router;
