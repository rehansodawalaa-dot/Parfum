const Review  = require('../models/Review');
const Order   = require('../models/Order');
const Product = require('../models/Product');

/**
 * POST /api/reviews
 * Authenticated, verified-purchase only. One review per user per product.
 */
const createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Confirm the product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Confirm the user bought this product in the given order
    const order = await Order.findOne({
      _id:    orderId,
      user:   req.user._id,
      status: 'delivered',
      'items.product': productId,
    });
    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'Only verified purchasers can review this product.',
      });
    }

    // Check for duplicate
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product. Edit your existing review.',
      });
    }

    const review = await Review.create({
      product:  productId,
      user:     req.user._id,
      order:    orderId,
      rating,
      title,
      comment,
      images: images || [],
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Review posted successfully.', review });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reviews/:productId
 * Public — paginated reviews for a product.
 */
const getProductReviews = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {
      product:    req.params.productId,
      isVisible:  true,
      isApproved: true,
    };

    const [reviews, total, distribution] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar'),
      Review.countDocuments(filter),
      // Rating distribution: { "5": 12, "4": 8, … }
      Review.aggregate([
        { $match: filter },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]),
    ]);

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => { dist[d._id] = d.count; });

    res.json({ success: true, total, page, reviews, distribution: dist });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reviews/:id
 * Authenticated — user edits their own review.
 */
const updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating, title, comment, images: images || [] },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found or not yours.' });
    }

    res.json({ success: true, message: 'Review updated.', review });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/reviews/:id
 * Authenticated — user deletes their own review, OR admin deletes any.
 */
const deleteReview = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, user: req.user._id };

    const review = await Review.findOneAndDelete(filter);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Recompute product rating after deletion
    const remaining = await Review.aggregate([
      { $match: { product: review.product, isVisible: true, isApproved: true } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const Product = require('../models/Product');
    if (remaining.length) {
      await Product.findByIdAndUpdate(review.product, {
        rating:      Math.round(remaining[0].avg * 10) / 10,
        reviewCount: remaining[0].count,
      });
    } else {
      await Product.findByIdAndUpdate(review.product, { rating: 0, reviewCount: 0 });
    }

    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/admin/reviews
 * Paginated list of all reviews with moderation controls.
 */
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.isVisible  !== undefined) filter.isVisible  = req.query.isVisible  === 'true';
    if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === 'true';

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user',    'name email')
        .populate('product', 'name slug'),
      Review.countDocuments(filter),
    ]);

    res.json({ success: true, total, page, reviews });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/reviews/:id/moderate
 * Approve / hide / restore a review.
 */
const moderateReview = async (req, res, next) => {
  try {
    const { isVisible, isApproved, moderationNote } = req.body;
    const update = { moderatedBy: req.user._id, moderatedAt: new Date() };
    if (isVisible  !== undefined) update.isVisible  = isVisible;
    if (isApproved !== undefined) update.isApproved = isApproved;
    if (moderationNote) update.moderationNote = moderationNote;

    const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    res.json({ success: true, message: 'Review moderated.', review });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  moderateReview,
};
