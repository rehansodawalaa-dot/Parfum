const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true, // only verified purchasers
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    images: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length <= 5, 'Maximum 5 images per review'],
    },
    // Moderation
    isVisible: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    moderationNote: { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// After saving a review, recompute product rating + reviewCount
reviewSchema.post('save', async function () {
  await recomputeProductRating(this.product);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await recomputeProductRating(doc.product);
});

async function recomputeProductRating(productId) {
  const Product = mongoose.model('Product');
  const result = await mongoose.model('Review').aggregate([
    { $match: { product: productId, isVisible: true, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating:   { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating:      Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].reviewCount,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
