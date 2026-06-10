const router = require('express').Router();
const { body } = require('express-validator');
const { getDashboard, updateProfile, updateSettings } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.get('/dashboard', getDashboard);

router.patch(
  '/profile',
  [
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('phone').optional().trim(),
    body('phoneNumber').optional().trim(),
    body('country').optional().trim().isLength({ max: 80 }),
  ],
  validate,
  updateProfile
);

router.patch(
  '/settings',
  [body('dataSaverEnabled').optional().isBoolean()],
  validate,
  updateSettings
);

module.exports = router;
