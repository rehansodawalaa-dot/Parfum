const router = require('express').Router();
const { getProducts, getProductBySlug } = require('../controllers/product.controller');

router.get('/',      getProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
