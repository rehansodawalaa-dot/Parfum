const User          = require('../models/User');
const Transaction   = require('../models/Transaction');
const Review        = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
      User.countDocuments(),
    ]);

    res.json({ success: true, total, page, limit, users });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email plan')
        .select('-razorpaySignature'),
      Transaction.countDocuments(),
    ]);

    res.json({ success: true, total, page, limit, transactions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      dataSaverUsers,
      totalRevenuePaise,
      planBreakdown,
      revenueByDay,
      countryBreakdown,
      openTickets,
      resolvedTickets,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ dataSaverEnabled: true }),
      Transaction.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            count:   { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      User.aggregate([
        { $match: { country: { $ne: '' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'resolved' }),
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        dataSaverUsers,
        totalRevenueINR:  (totalRevenuePaise[0]?.total || 0) / 100,
        planBreakdown,
        revenueByDay,
        countryBreakdown,
        support: { openTickets, resolvedTickets },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/toggle-active
 */
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getTransactions, getAnalytics, toggleUserActive };
