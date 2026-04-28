const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");

// All search routes are PUBLIC - no authentication required
// Now supports single character searches (q=a, q=b, etc.)

// Global search - search everything
router.get("/", searchController.globalSearch);

// Advanced search with filters
router.get("/advanced", searchController.advancedSearch);

// Autocomplete suggestions (works with single character)
router.get("/suggestions", searchController.getSuggestions);

// Popular searches
router.get("/popular", searchController.getPopularSearches);

module.exports = router;
