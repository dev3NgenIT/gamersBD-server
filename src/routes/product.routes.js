const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getProductsByOfferType,
  getAllOffers,
  getRelatedProducts,
  getFlashSaleProducts,
  getLatestProducts,
  getProductsByPriceRange,
  updateFlashSaleSold
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public Routes
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/offers', getAllOffers);
router.get('/offers/:type', getProductsByOfferType);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/latest', getLatestProducts);
router.get('/price-range', getProductsByPriceRange);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

// Protected Routes (Admin only)
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.patch('/:id/flash-sale', protect, authorize('admin'), updateFlashSaleSold);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;