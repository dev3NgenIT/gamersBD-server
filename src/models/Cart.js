const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  platform: {
    type: String,
    enum: ['PS5', 'PS4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch', 'PC', 'Mobile'], // Add validation
    required: function() {
      // Make platform required only for games that need it
      return this.product?.category === 'games';
    }
  },
  addedAt: {
    type: Date,
    default: Date.now // Track when item was added
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  couponCode: {
    type: String,
    default: null // For future discount feature
  },
  discountedTotal: {
    type: Number,
    default: 0 // After coupon discount
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate totals before save
cartSchema.pre('save', async function(next) {
  if (this.items.length > 0) {
    await this.populate('items.product');
    
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    // Apply coupon if exists (implement later)
    this.discountedTotal = this.totalPrice;
  } else {
    this.totalItems = 0;
    this.totalPrice = 0;
    this.discountedTotal = 0;
  }
  
  next();
});

// Virtual for formatted total
cartSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalPrice.toFixed(2)}`;
});

// Method to check if cart is empty
cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// Method to find specific item
cartSchema.methods.findItem = function(productId, platform) {
  return this.items.find(item => 
    item.product.toString() === productId && 
    (!platform || item.platform === platform)
  );
};

module.exports = mongoose.model('Cart', cartSchema);