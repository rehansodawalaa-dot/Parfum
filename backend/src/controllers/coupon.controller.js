const Coupon = require('../models/Coupon');
const Order  = require('../models/Order');

/* ─────────────────────────────────────────────────────────────────────────── */
/*  USER-FACING                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * POST /api/coupons/validate
 * Body: { code, subtotal }
 * Returns discount amount if valid.
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !subtotal) {
      return res.status(400).json({ success: false, message: 'Coupon code and subtotal are required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    // Active check
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
    }

    // Expiry check
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    // Usage limit check
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
    }

    // Minimum order value check
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`,
      });
    }

    // Specific user check
    if (coupon.specificUsers.length > 0) {
      const userId = req.user._id.toString();
      const allowed = coupon.specificUsers.map((u) => u.toString());
      if (!allowed.includes(userId)) {
        return res.status(403).json({ success: false, message: 'This coupon is not valid for your account.' });
      }
    }

    // Per-user usage limit
    if (coupon.perUserLimit > 0) {
      const usedByUser = await Order.countDocuments({
        user: req.user._id,
        couponCode: coupon.code,
        paymentStatus: 'paid',
      });
      if (usedByUser >= coupon.perUserLimit) {
        return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
      }
    }

    const discount = coupon.calcDiscount(Number(subtotal));

    res.json({
      success:  true,
      discount,
      coupon: {
        code:        coupon.code,
        type:        coupon.type,
        value:       coupon.value,
        description: coupon.description,
        maxDiscount: coupon.maxDiscount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ADMIN                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

/** GET /api/admin/coupons */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .populate('specificUsers', 'name email');
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/coupons */
const createCoupon = async (req, res, next) => {
  try {
    const {
      code, description, type, value,
      minOrderValue, maxDiscount, usageLimit,
      perUserLimit, specificUsers, expiresAt,
    } = req.body;

    const coupon = await Coupon.create({
      code:          code.toUpperCase().trim(),
      description,
      type,
      value,
      minOrderValue: minOrderValue || 0,
      maxDiscount:   maxDiscount   || null,
      usageLimit:    usageLimit    || null,
      perUserLimit:  perUserLimit  ?? 1,
      specificUsers: specificUsers || [],
      expiresAt:     expiresAt     || null,
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
    }
    next(err);
  }
};

/** PATCH /api/admin/coupons/:id */
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/coupons/:id */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/coupons/:id/toggle */
const toggleCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, isActive: coupon.isActive, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon };
