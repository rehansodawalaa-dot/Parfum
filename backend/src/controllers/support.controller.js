const SupportTicket = require('../models/SupportTicket');
const rateLimit     = require('express-rate-limit');

// Per-IP limiter for creating support tickets (spam protection)
const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many support requests. Please try again later.' },
});

/**
 * POST /api/support/chat
 * Create a new support ticket (pre-chat info).
 */
const createTicket = async (req, res, next) => {
  try {
    const { customerName, email, phone, initialMessage } = req.body;

    const ticketData = {
      customerName,
      email,
      phone:   phone || '',
      user:    req.user?._id || null,
      messages: initialMessage
        ? [{ sender: 'customer', text: initialMessage.trim(), timestamp: new Date() }]
        : [],
      lastReplyAt: new Date(),
    };

    const ticket = await SupportTicket.create(ticketData);

    res.status(201).json({
      success: true,
      message: 'Support ticket created.',
      ticket: {
        id:           ticket._id,
        ticketNumber: ticket.ticketNumber,
        status:       ticket.status,
        messages:     ticket.messages,
        createdAt:    ticket.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/support/chat
 * User: get their own tickets. Admin: get all with filters + pagination.
 */
const getTickets = async (req, res, next) => {
  try {
    if (req.user?.role === 'admin') {
      const page   = Math.max(1, parseInt(req.query.page) || 1);
      const limit  = Math.min(100, parseInt(req.query.limit) || 20);
      const skip   = (page - 1) * limit;
      const filter = {};

      if (req.query.status)  filter.status = req.query.status;
      if (req.query.search) {
        const re = { $regex: req.query.search, $options: 'i' };
        filter.$or = [
          { customerName: re },
          { email: re },
          { ticketNumber: re },
        ];
      }

      const [tickets, total] = await Promise.all([
        SupportTicket.find(filter)
          .sort({ lastReplyAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email')
          .populate('assignedTo', 'name email'),
        SupportTicket.countDocuments(filter),
      ]);

      return res.json({ success: true, total, page, tickets });
    }

    // Regular user — find by email or linked user ID
    const filter = req.user
      ? { $or: [{ user: req.user._id }, { email: req.user.email }] }
      : {};

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .select('ticketNumber status messages createdAt lastReplyAt');

    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/support/chat/:id
 * Fetch a single ticket (user must own it or be admin).
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    // Non-admin users can only view their own tickets
    if (req.user?.role !== 'admin') {
      const isOwner =
        (ticket.user && ticket.user._id.toString() === req.user?._id?.toString()) ||
        ticket.email === req.user?.email;
      if (!isOwner) return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/support/chat/message
 * Append a message to a ticket.
 */
const addMessage = async (req, res, next) => {
  try {
    const { ticketId, text } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    const isAdmin = req.user?.role === 'admin';

    // Non-admin users can only message their own ticket
    if (!isAdmin) {
      const isOwner =
        (ticket.user && ticket.user.toString() === req.user?._id?.toString()) ||
        ticket.email === req.user?.email;
      if (!isOwner) return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const message = {
      sender:    isAdmin ? 'admin' : 'customer',
      text:      text.trim(),
      timestamp: new Date(),
    };

    ticket.messages.push(message);
    ticket.lastReplyAt = new Date();
    if (ticket.status === 'resolved' && !isAdmin) ticket.status = 'open'; // reopen on customer reply
    await ticket.save();

    res.json({ success: true, message: 'Message sent.', chatMessage: message });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/support/:id/status
 * Admin: update ticket status.
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'resolved') update.resolvedAt = new Date();

    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    res.json({ success: true, message: `Ticket marked as ${status}.`, ticket });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/support/analytics
 * Ticket metrics for the admin dashboard.
 */
const getSupportAnalytics = async (req, res, next) => {
  try {
    const [statusBreakdown, avgResolutionPipeline] = await Promise.all([
      SupportTicket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      SupportTicket.aggregate([
        { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
        {
          $project: {
            resolutionMs: { $subtract: ['$resolvedAt', '$createdAt'] },
          },
        },
        { $group: { _id: null, avgMs: { $avg: '$resolutionMs' } } },
      ]),
    ]);

    const statusMap = { open: 0, pending: 0, resolved: 0, closed: 0 };
    statusBreakdown.forEach((s) => { statusMap[s._id] = s.count; });

    const avgResolutionHours = avgResolutionPipeline[0]
      ? Math.round(avgResolutionPipeline[0].avgMs / 3_600_000)
      : null;

    res.json({
      success: true,
      analytics: {
        open:     statusMap.open,
        pending:  statusMap.pending,
        resolved: statusMap.resolved,
        closed:   statusMap.closed,
        total:    Object.values(statusMap).reduce((a, b) => a + b, 0),
        avgResolutionHours,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  supportLimiter,
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  updateTicketStatus,
  getSupportAnalytics,
};
