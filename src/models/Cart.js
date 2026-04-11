const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  platform: {
    type: String,
    default: "PS5",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total items (works without population)
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price (safe - returns 0 if product not populated)
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((total, item) => {
    // Check if product is populated
    if (item.product && typeof item.product === 'object') {
      const price = item.product.discountPrice || item.product.price || 0;
      return total + price * item.quantity;
    }
    return total;
  }, 0);
});

module.exports = mongoose.model("Cart", cartSchema);