const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['men', 'women', 'unisex', 'premium'],
      required: true,
    },
    fragranceType: {
      type: String,
      enum: ['woody', 'floral', 'citrus', 'oriental', 'fresh', 'aquatic'],
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    sizes: {
      type: [String],
      default: ['50ml', '100ml'],
    },
    // Per-size pricing — if set, overrides the top-level price/originalPrice for each size
    sizePricing: {
      type: [
        {
          size:          { type: String, required: true },
          price:         { type: Number, required: true },
          originalPrice: { type: Number, required: true },
          _id: false,
        },
      ],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    notes: {
      top:    { type: [String], default: [] },
      middle: { type: [String], default: [] },
      base:   { type: [String], default: [] },
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    brandStory: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
