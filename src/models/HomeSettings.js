const mongoose = require('mongoose');

const HomeSettingsSchema = new mongoose.Schema({
  // 1. HERO SECTION (Image 1)
  hero: {
    backgroundImg: { type: String, default: '' },
    characterImg: { type: String, default: '' },
    partnerLogos: [{ type: String }],
    sidebarPromos: [{
      category: String,
      title: String,
      image: String,
      link: String,
      isHighlighted: { type: Boolean, default: false }
    }]
  },

  // 2. GRID OFFERS (Images 2 & 3)
  offersSection: {
    title: { type: String, default: "Latest Offers" },
    cards: [{
      gameTitle: String,
      badge: String,
      heading: String,
      subText: String,
      image: String,
      link: String
    }]
  },

  // 3. CTA BANNER (Image 4)
  ctaBanner: {
    mainHeading: String,
    coloredHeading: String,
    description: String,
    featuredGameCovers: [{ type: String }],
    stats: {
      customerCount: { type: String, default: "2k+" },
      rating: { type: Number, default: 4.8 }
    },
    primaryBtn: { text: String, url: String },
    secondaryBtn: { text: String, url: String }
  }

}, { timestamps: true });

module.exports = mongoose.model('HomeSettings', HomeSettingsSchema);