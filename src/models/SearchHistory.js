const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  ip: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
  }
});

// Index for faster queries
SearchHistorySchema.index({ query: 1, createdAt: -1 });
SearchHistorySchema.index({ userId: 1 });
SearchHistorySchema.index({ sessionId: 1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);