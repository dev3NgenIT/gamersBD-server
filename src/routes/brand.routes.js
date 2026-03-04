const express = require("express");
const router = express.Router();
const {
  createBrand,
  getBrands,
  getBrandByIdentifier,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  togglePopularStatus,
  getPopularBrands,
  bulkUpdateBrands,
  updateAllProductCounts,
} = require("../controllers/brand.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// ============= PUBLIC ROUTES =============

// Get popular brands (most specific first)
router.get("/popular", getPopularBrands);

// Get all brands with filters
router.get("/", getBrands);

// Get single brand by ID or slug (catch-all for identifiers)
router.get("/:identifier", getBrandByIdentifier);

// ============= PROTECTED ROUTES (ADMIN ONLY) =============

// Bulk operations
router.patch("/bulk", protect, authorize("admin"), bulkUpdateBrands);

// Update product counts for all brands
router.post(
  "/update-counts",
  protect,
  authorize("admin"),
  updateAllProductCounts,
);

// Create brand
router.post("/", protect, authorize("admin"), createBrand);

// Toggle status
router.patch(
  "/:id/toggle-status",
  protect,
  authorize("admin"),
  toggleBrandStatus,
);
router.patch(
  "/:id/toggle-popular",
  protect,
  authorize("admin"),
  togglePopularStatus,
);

// Update brand
router.put("/:id", protect, authorize("admin"), updateBrand);

// Delete brand
router.delete("/:id", protect, authorize("admin"), deleteBrand);

module.exports = router;
