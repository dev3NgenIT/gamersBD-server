// controllers/cart.controller.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price discountPrice images stock category slug platform",
    });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, platform } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Check if product already in cart (with same platform)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (platform ? item.platform === platform : true),
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check stock for new total
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${product.stock} total available`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        ...(platform && { platform }), // Only add platform if provided
      });
    }

    // Save cart (triggers pre-save hook to calculate totals)
    await cart.save();

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      select: "name price discountPrice images stock category slug",
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Check product stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Save cart (triggers pre-save hook)
    await cart.save();

    // Populate for response
    await cart.populate({
      path: "items.product",
      select: "name price discountPrice images stock category slug",
    });

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Filter out the item
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Save cart (triggers pre-save hook)
    await cart.save();

    // Populate for response
    await cart.populate({
      path: "items.product",
      select: "name price discountPrice images stock category slug",
    });

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        user: cart.user,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
const getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    res.json({
      success: true,
      count: cart?.totalItems || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Validate cart items (check stock before checkout)
// @route   GET /api/cart/validate
// @access  Private
const validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        valid: false,
        message: "Cart is empty",
        issues: [],
      });
    }

    const issues = [];

    // Check each item for stock issues
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        issues.push({
          productId: item.product._id,
          productName: item.product.name,
          requested: item.quantity,
          available: item.product.stock,
          platform: item.platform,
        });
      }
    }

    res.json({
      success: true,
      valid: issues.length === 0,
      issues,
      message:
        issues.length > 0
          ? "Some items have stock issues"
          : "Cart is valid for checkout",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  validateCart,
};
