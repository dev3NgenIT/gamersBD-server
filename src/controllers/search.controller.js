const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Blog = require('../models/Blog');

/**
 * Global Search - Search across all collections
 * GET /api/search?q=keyword&type=all&limit=50&page=1
 */
exports.globalSearch = async (req, res) => {
  try {
    const { q, type = 'all', limit = 50, page = 1 } = req.query;
    
    console.log('Search query received:', q);
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = q.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Case-insensitive regex for partial matching
    const regex = new RegExp(searchTerm, 'i');
    const results = {};

    // Search Products - Make sure to search in ALL relevant fields
    if (type === 'products' || type === 'all') {
      try {
        const productsQuery = {
          $or: [
            { name: regex },
            { description: regex },
            { shortDescription: regex },
            { tags: { $in: [regex] } },
            { 'variants.sku': regex },
            { 'brand.name': regex },
            { 'category.name': regex }
          ]
        };
        
        // Don't filter by status if status field doesn't exist or is 'active'
        // Some products might not have status field
        const products = await Product.find(productsQuery)
          .select('name slug description shortDescription images price discount rating stock category brand createdAt')
          .populate('category', 'name slug')
          .populate('brand', 'name slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();

        const totalProducts = await Product.countDocuments(productsQuery);

        results.products = {
          items: products.map(p => ({
            ...p,
            finalPrice: p.discountPrice || p.price,
            type: 'product'
          })),
          total: totalProducts
        };
        
        console.log(`Found ${totalProducts} products for "${searchTerm}"`);
      } catch (err) {
        console.error('Product search error:', err);
        results.products = { items: [], total: 0 };
      }
    }

    // Search Categories
    if (type === 'categories' || type === 'all') {
      try {
        const categories = await Category.find({
          $or: [
            { name: regex },
            { description: regex },
            { slug: regex }
          ]
        })
        .select('name slug description image parent categoryLevel')
        .populate('parent', 'name slug')
        .sort({ name: 1 })
        .limit(parseInt(limit))
        .lean();

        results.categories = {
          items: categories.map(c => ({ ...c, type: 'category' })),
          total: categories.length
        };
        
        console.log(`Found ${categories.length} categories for "${searchTerm}"`);
      } catch (err) {
        console.error('Category search error:', err);
        results.categories = { items: [], total: 0 };
      }
    }

    // Search Brands
    if (type === 'brands' || type === 'all') {
      try {
        const brands = await Brand.find({
          $or: [
            { name: regex },
            { description: regex },
            { slug: regex }
          ]
        })
        .select('name slug description logo')
        .sort({ name: 1 })
        .limit(parseInt(limit))
        .lean();

        results.brands = {
          items: brands.map(b => ({ ...b, type: 'brand' })),
          total: brands.length
        };
        
        console.log(`Found ${brands.length} brands for "${searchTerm}"`);
      } catch (err) {
        console.error('Brand search error:', err);
        results.brands = { items: [], total: 0 };
      }
    }

    // Search Blogs
    if (type === 'blogs' || type === 'all') {
      try {
        const blogs = await Blog.find({
          $or: [
            { title: regex },
            { content: regex },
            { excerpt: regex },
            { tags: { $in: [regex] } },
            { author: regex }
          ]
        })
        .select('title slug excerpt image author tags views createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

        results.blogs = {
          items: blogs.map(b => ({ ...b, type: 'blog' })),
          total: blogs.length
        };
        
        console.log(`Found ${blogs.length} blogs for "${searchTerm}"`);
      } catch (err) {
        console.error('Blog search error:', err);
        results.blogs = { items: [], total: 0 };
      }
    }

    res.status(200).json({
      success: true,
      data: results,
      meta: {
        query: searchTerm,
        type: type,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

/**
 * Get Search Suggestions (Autocomplete)
 * GET /api/search/suggestions?q=keyword&limit=10
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, 'i');
    const suggestions = [];

    // Product suggestions
    try {
      const products = await Product.find({
        $or: [
          { name: regex },
          { tags: { $in: [regex] } }
        ]
      })
      .select('name slug images price discountPrice discount rating')
      .limit(8)
      .lean();

      products.forEach(p => {
        suggestions.push({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          images: p.images,
          price: p.discountPrice || p.price,
          discount: p.discount,
          rating: p.rating,
          type: 'product'
        });
      });
    } catch (err) {
      console.error('Product suggestions error:', err);
    }

    // Category suggestions
    try {
      const categories = await Category.find({ name: regex })
        .select('name slug image')
        .limit(5)
        .lean();

      categories.forEach(c => {
        suggestions.push({
          _id: c._id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          type: 'category'
        });
      });
    } catch (err) {
      console.error('Category suggestions error:', err);
    }

    // Brand suggestions
    try {
      const brands = await Brand.find({ name: regex })
        .select('name slug logo')
        .limit(5)
        .lean();

      brands.forEach(b => {
        suggestions.push({
          _id: b._id,
          name: b.name,
          slug: b.slug,
          image: b.logo,
          type: 'brand'
        });
      });
    } catch (err) {
      console.error('Brand suggestions error:', err);
    }

    // Blog suggestions
    try {
      const blogs = await Blog.find({ 
        title: regex
      })
      .select('title slug excerpt image')
      .limit(5)
      .lean();

      blogs.forEach(b => {
        suggestions.push({
          _id: b._id,
          name: b.title,
          slug: b.slug,
          image: b.image,
          excerpt: b.excerpt,
          type: 'blog'
        });
      });
    } catch (err) {
      console.error('Blog suggestions error:', err);
    }

    // Sort by relevance: prioritize exact matches at the beginning
    suggestions.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bExact = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    const limitedSuggestions = suggestions.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: limitedSuggestions,
      meta: {
        query: searchTerm,
        count: limitedSuggestions.length
      }
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
};

/**
 * Advanced Search with Filters
 */
exports.advancedSearch = async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const searchTerm = q?.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    // Text search - supports partial matching
    if (searchTerm && searchTerm.length >= 1) {
      const regex = new RegExp(searchTerm, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { shortDescription: regex },
        { tags: { $in: [regex] } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Price range filter (use discountPrice or price)
    if (minPrice || maxPrice) {
      query.$or = [
        { price: {} },
        { discountPrice: {} }
      ];
      if (minPrice) {
        query.$or[0].price.$gte = parseFloat(minPrice);
        query.$or[1].discountPrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.$or[0].price.$lte = parseFloat(maxPrice);
        query.$or[1].discountPrice.$lte = parseFloat(maxPrice);
      }
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { name: 1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name slug description shortDescription images price discountPrice discount rating stock category brand createdAt')
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    const productsWithPrice = products.map(p => ({
      ...p,
      finalPrice: p.discountPrice || p.price
    }));

    res.status(200).json({
      success: true,
      data: productsWithPrice,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      filters: {
        category,
        brand,
        minPrice,
        maxPrice,
        rating,
        inStock: inStock === 'true'
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing advanced search',
      error: error.message
    });
  }
};

/**
 * Get Popular Searches
 */
exports.getPopularSearches = async (req, res) => {
  try {
    const popularSearches = [
      { term: 'gaming mouse', count: 1250 },
      { term: 'mechanical keyboard', count: 980 },
      { term: 'gaming headset', count: 870 },
      { term: 'monitor', count: 760 },
      { term: 'gaming chair', count: 650 },
      { term: 'graphics card', count: 540 },
      { term: 'processor', count: 430 },
      { term: 'ram', count: 320 },
      { term: 'ssd', count: 280 },
      { term: 'laptop', count: 250 }
    ];

    res.status(200).json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular searches',
      error: error.message
    });
  }
};