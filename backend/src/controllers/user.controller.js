const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * GET /api/users/dashboard
 * Returns the current user's profile + transaction summary.
 */
const getDashboard = async (req, res, next) => {
  try {
    const [transactions, totalSpent] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('razorpayOrderId amount currency plan status createdAt'),
      Transaction.aggregate([
        { $match: { user: req.user._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        plan: req.user.plan,
        referralCode: req.user.referralCode,
        referralCount: req.user.referralCount,
        memberSince: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      },
      stats: {
        totalSpentPaise: totalSpent[0]?.total || 0,
        transactionCount: transactions.length,
      },
      recentTransactions: transactions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/profile
 * Update name only (email changes require re-verification — out of scope here).
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, updateProfile };
