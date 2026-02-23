const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Validate category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    // Validate base64 images
    if (productData.mainImage && !productData.mainImage.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        message: 'Main image must be a valid base64 image'
      });
    }
    
    if (productData.images && Array.isArray(productData.images)) {
      for (let img of productData.images) {
        if (!img.startsWith('data:image')) {
          return res.status(400).json({
            success: false,
            message: 'All images must be valid base64 images'
          });
        }
      }
    }
    
    const product = await Product.create(productData);
    
    // Update category product count
    await Category.findByIdAndUpdate(productData.category, {
      $inc: { productCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate SKU error
    if (error.code === 11000 && error.keyPattern?.sku) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      type,
      platform,
      genre,
      minPrice,
      maxPrice,
      search,
      isFeatured,
      inStock,
      offerType
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (platform) filter.platform = platform;
    if (genre) filter.genre = genre;
    if (isFeatured === 'true') filter.isFeatured = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (offerType) filter.offerType = offerType;
    
    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Search
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug path');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Increment view count
    product.views += 1;
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.views;
    delete updates.soldCount;
    delete updates.createdAt;
    
    // If category is being updated, update product counts
    if (updates.category) {
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.category.toString() !== updates.category) {
        // Decrement old category count
        await Category.findByIdAndUpdate(oldProduct.category, {
          $inc: { productCount: -1 }
        });
        // Increment new category count
        await Category.findByIdAndUpdate(updates.category, {
          $inc: { productCount: 1 }
        });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Decrement category product count
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find({ 
      category: categoryId,
      isActive: true 
    })
    .populate('category', 'name slug')
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await Product.countDocuments({ category: categoryId, isActive: true });
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      isFeatured: true,
      isActive: true 
    })
    .populate('category', 'name slug')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
    .populate('category', 'name slug')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await Product.countDocuments({ 
      $text: { $search: q },
      isActive: true 
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get products by offer type
// @route   GET /api/products/offers/:type
// @access  Public
const getProductsByOfferType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    const validTypes = ['hot-deal', 'best-deal', 'special-offer', 'flash-sale', 'featured'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer type. Must be one of: hot-deal, best-deal, special-offer, flash-sale, featured'
      });
    }
    
    const products = await Product.find({
      offerType: type,
      isActive: true
    })
    .sort({ offerPriority: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products by offer type error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all active offers
// @route   GET /api/products/offers
// @access  Public
const getAllOffers = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const products = await Product.find({
      offerType: { $ne: 'none' },
      isActive: true
    })
    .sort({ offerPriority: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get all offers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get related products (same category, different ID)
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const related = await Product.find({
      category: product.category,
      _id: { $ne: id },
      isActive: true
    })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: related.length,
      data: related
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get flash sale products (with limited quantity)
// @route   GET /api/products/flash-sale
// @access  Public
const getFlashSaleProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await Product.find({
      offerType: 'flash-sale',
      isActive: true,
      flashSaleQuantity: { $gt: 0 }
    })
    .sort({ offerPriority: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get flash sale products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get latest products
// @route   GET /api/products/latest
// @access  Public
const getLatestProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get latest products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get products by price range
// @route   GET /api/products/price-range
// @access  Public
const getProductsByPriceRange = async (req, res) => {
  try {
    const { min = 0, max = Infinity, limit = 20 } = req.query;
    
    const products = await Product.find({
      price: { $gte: Number(min), $lte: Number(max) },
      isActive: true
    })
    .sort({ price: 1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products by price range error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update flash sale sold count
// @route   PATCH /api/products/:id/flash-sale
// @access  Private/Admin
const updateFlashSaleSold = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.offerType !== 'flash-sale') {
      return res.status(400).json({
        success: false,
        message: 'Product is not a flash sale item'
      });
    }
    
    if (product.flashSaleSold + quantity > product.flashSaleQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough flash sale quantity available'
      });
    }
    
    product.flashSaleSold += quantity;
    product.stock -= quantity;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Flash sale updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update flash sale error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};