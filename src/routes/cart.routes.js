// routes/cart.routes.js
const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  validateCart,
} = require("../controllers/cart.controller");
const { protect } = require("../middleware/auth.middleware");

// All cart routes are protected (user must be logged in)
router.use(protect);

// Cart routes
router.get("/", getCart);
router.get("/count", getCartCount);
router.get("/validate", validateCart);
router.post("/add", addToCart);
router.put("/update/:itemId", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
