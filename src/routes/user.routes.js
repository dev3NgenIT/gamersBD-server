const express = require('express');
const router = express.Router();
const {
  updateProfile
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Update user profile
router.put('/profile', updateProfile);

module.exports = router;