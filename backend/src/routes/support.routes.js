const router = require('express').Router();
const { body } = require('express-validator');
const {
  supportLimiter,
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
} = require('../controllers/support.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// Create ticket — rate-limited, auth optional
router.post(
  '/chat',
  supportLimiter,
  [
    body('customerName').trim().notEmpty().withMessage('Your name is required').isLength({ max: 120 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('initialMessage').optional().trim().isLength({ max: 2000 }),
  ],
  validate,
  createTicket
);

// Get tickets (user sees own, admin sees all) — auth required
router.get('/chat', protect, getTickets);
router.get('/chat/:id', protect, getTicketById);

// Add a message — auth required
router.post(
  '/chat/message',
  protect,
  [
    body('ticketId').notEmpty().withMessage('Ticket ID is required'),
    body('text').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 2000 }),
  ],
  validate,
  addMessage
);

module.exports = router;
