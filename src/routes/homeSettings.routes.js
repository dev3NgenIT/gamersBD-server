const express = require("express");
const router = express.Router();
const homeSettingsController = require("../controllers/homeSettings.controller");

// Basic CRUD operations
router.get("/", homeSettingsController.getHomeSettings);
router.post("/", homeSettingsController.createHomeSettings); // Create only if doesn't exist
router.put("/", homeSettingsController.updateHomeSettings); // Update or create
router.patch("/", homeSettingsController.partialUpdateHomeSettings);
router.delete("/reset", homeSettingsController.resetHomeSettings);

// Partner logos management
router.post("/partner-logos", homeSettingsController.addPartnerLogo);
router.delete("/partner-logos", homeSettingsController.removePartnerLogo);

// Sidebar promos management
router.post("/sidebar-promos", homeSettingsController.addSidebarPromo);
router.put("/sidebar-promos", homeSettingsController.updateSidebarPromo);
router.delete(
  "/sidebar-promos/:promoIndex",
  homeSettingsController.deleteSidebarPromo,
);

// Offer cards management
router.post("/offer-cards", homeSettingsController.addOfferCard);
router.put("/offer-cards", homeSettingsController.updateOfferCard);
router.delete(
  "/offer-cards/:cardIndex",
  homeSettingsController.deleteOfferCard,
);

module.exports = router;
