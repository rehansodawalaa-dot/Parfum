const Product = require('../models/Product');

/* ── Public ──────────────────────────────────────────────────────────────── */

/** GET /api/products */
const getProducts = async (req, res, next) => {
  try {
    const { category, fragranceType, brand, minPrice, maxPrice, sort, search, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (category)      filter.category      = category;
    if (fragranceType) filter.fragranceType  = fragranceType;
    if (brand)         filter.brand          = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'rating':     { rating: -1 },
      'newest':     { createdAt: -1 },
      'featured':   { isBestSeller: -1, createdAt: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.featured;

    const skip  = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), products });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:slug */
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/* ── Admin ───────────────────────────────────────────────────────────────── */

/** POST /api/admin/products */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/products/:id */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product updated.', product });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/products/:id  (soft delete) */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product removed from store.' });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/products  (includes inactive) */
const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, total: products.length, products });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAllProductsAdmin };
