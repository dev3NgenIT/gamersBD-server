// models/Wishlist.js - COMPLETELY FIXED VERSION
const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: {
    type: [wishlistItemSchema],
    default: []
  },
  name: {
    type: String,
    default: 'My Wishlist'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// ✅ FIXED: No pre-save middleware - handle shareId generation differently
// Remove any pre('save') middleware completely

// Virtual for totalItems
wishlistSchema.virtual('totalItems').get(function() {
  return this.items ? this.items.length : 0;
});

// Method to generate share ID (call when making public)
wishlistSchema.methods.generateShareId = function() {
  this.shareId = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
  return this.shareId;
};

// Ensure virtuals are included
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

// Remove any existing model and create new one
if (mongoose.models.Wishlist) {
  delete mongoose.models.Wishlist;
}

module.exports = mongoose.model('Wishlist', wishlistSchema);