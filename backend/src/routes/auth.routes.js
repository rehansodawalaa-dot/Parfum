const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.post(
  '/signup',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[\d\s\-]{7,15}$/)
      .withMessage('Enter a valid phone number'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  validate,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

module.exports = router;
