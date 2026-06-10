const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Order       = require('../models/Order');

/**
 * GET /api/users/dashboard
 * Returns the current user's profile + transaction summary.
 */
const getDashboard = async (req, res, next) => {
  try {
    const [transactions, totalSpent, orderCount] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('razorpayOrderId amount currency plan status createdAt'),
      Transaction.aggregate([
        { $match: { user: req.user._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.countDocuments({ user: req.user._id, paymentStatus: 'paid' }),
    ]);

    res.json({
      success: true,
      user: {
        id:               req.user._id,
        name:             req.user.name,
        firstName:        req.user.firstName,
        lastName:         req.user.lastName,
        email:            req.user.email,
        phone:            req.user.phone,
        phoneNumber:      req.user.phoneNumber,
        country:          req.user.country,
        plan:             req.user.plan,
        referralCode:     req.user.referralCode,
        referralCount:    req.user.referralCount,
        dataSaverEnabled: req.user.dataSaverEnabled,
        memberSince:      req.user.createdAt,
        lastLogin:        req.user.lastLogin,
      },
      stats: {
        totalSpentPaise:  totalSpent[0]?.total || 0,
        transactionCount: transactions.length,
        orderCount,
      },
      recentTransactions: transactions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/profile
 * Update name/firstName/lastName/phone/country.
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'firstName', 'lastName', 'phone', 'phoneNumber', 'country'];
    const update  = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id:          user._id,
        name:        user.name,
        firstName:   user.firstName,
        lastName:    user.lastName,
        email:       user.email,
        phone:       user.phone,
        phoneNumber: user.phoneNumber,
        country:     user.country,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/settings
 * Update user preferences (dataSaverEnabled, etc.)
 */
const updateSettings = async (req, res, next) => {
  try {
    const { dataSaverEnabled } = req.body;
    const update = {};
    if (dataSaverEnabled !== undefined) update.dataSaverEnabled = Boolean(dataSaverEnabled);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Settings updated.',
      settings: { dataSaverEnabled: user.dataSaverEnabled },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, updateProfile, updateSettings };
