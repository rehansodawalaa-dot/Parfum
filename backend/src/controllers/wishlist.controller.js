const User    = require('../models/User');
const Product = require('../models/Product');

/**
 * GET /api/wishlist
 * Returns the authenticated user's wishlist with product details.
 */
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path:   'wishlist',
        match:  { isActive: true },
        select: 'name slug brand price originalPrice images rating reviewCount isBestSeller isNew fragranceType category sizes',
      });

    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/wishlist/:productId
 * Add a product to wishlist (idempotent).
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } }, // addToSet prevents duplicates
      { new: true }
    );

    res.json({ success: true, message: 'Added to wishlist.' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/wishlist/:productId
 * Remove a product from wishlist.
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: req.params.productId } }
    );

    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/wishlist/analytics
 * Most wishlisted products and conversion rates.
 */
const getWishlistAnalytics = async (req, res, next) => {
  try {
    const topWishlisted = await User.aggregate([
      { $unwind: '$wishlist' },
      { $group: { _id: '$wishlist', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from:         'products',
          localField:   '_id',
          foreignField: '_id',
          as:           'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id:   0,
          productId:   '$_id',
          wishlistCount: '$count',
          name:    '$product.name',
          brand:   '$product.brand',
          price:   '$product.price',
          images:  '$product.images',
        },
      },
    ]);

    const totalWishlists = await User.aggregate([
      { $project: { count: { $size: '$wishlist' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalWishlistItems: totalWishlists[0]?.total || 0,
        topWishlisted,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, getWishlistAnalytics };
