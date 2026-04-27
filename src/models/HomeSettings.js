const mongoose = require('mongoose');

const HomeSettingsSchema = new mongoose.Schema({
  // 1. HERO SECTION WITH SLIDER & OFFERS
  hero: {
    // Main Slider Images (Carousel)
    slider: {
      enabled: { type: Boolean, default: true },
      slides: [{
        id: { type: Number },
        url: { type: String, required: true },
        alt: { type: String },
        link: { type: String, default: '/shop' },
        order: { type: Number, default: 0 }
      }],
      settings: {
        autoplay: { type: Boolean, default: true },
        autoplaySpeed: { type: Number, default: 5000 },
        showArrows: { type: Boolean, default: true },
        height: { type: String, default: '568px' }
      }
    },
    
    // Right Side Offers (Thumbnails with progress bar)
    offers: [{
      id: { type: Number },
      image: { type: String, required: true },
      imageBg: { type: String, default: 'bg-purple-100' },
      title: { type: String, required: true }, // "MONTHLY DEALS"
      description: { type: String, required: true }, // "DualSense Controller"
      linkText: { type: String, default: 'Shop Now' },
      linkUrl: { type: String, default: '/shop' },
      order: { type: Number, default: 0 }
    }],
    
    // Character/Background images (if needed)
    backgroundImg: { type: String },
    characterImg: { type: String },
    partnerLogos: [{ type: String }]
  },

  // 2. PROMOTIONAL SECTION (Grid of offers - 2 columns)
  promotionalSection: {
    title: { type: String, default: 'Featured Offers' },
    enabled: { type: Boolean, default: true },
    cards: [{
      gameTitle: { type: String, required: true }, // "FORTNITE"
      badge: { type: String }, // "EPIC PACK"
      badgeColor: { type: String, default: 'purple' }, // purple, blue, green, orange
      image: { type: String, required: true },
      heading: { type: String, required: true }, // "AmongUs x Fortnite"
      description: { type: String, required: true },
      linkText: { type: String, default: 'Learn More' },
      linkUrl: { type: String, default: '/shop' },
      order: { type: Number, default: 0 }
    }]
  },

  // 3. PROMOTIONAL SECTION TWO (3 columns grid)
  promotionalSectionTwo: {
    title: { type: String, default: 'More Offers' },
    enabled: { type: Boolean, default: true },
    cards: [{
      gameTitle: { type: String, required: true },
      badge: { type: String },
      badgeColor: { type: String, default: 'purple' },
      image: { type: String, required: true },
      heading: { type: String, required: true },
      description: { type: String, required: true },
      linkText: { type: String, default: 'Learn More' },
      linkUrl: { type: String, default: '/shop' },
      order: { type: Number, default: 0 }
    }]
  },

  // 4. CATALOGUE/CTA SECTION
  catalogueSection: {
    enabled: { type: Boolean, default: true },
    image: { type: String, required: true },
    badge: { type: String, default: 'New Arrivals' },
    badgeIcon: { type: String, default: 'sparkles' }, // sparkles, fire, etc.
    title: { type: String, required: true }, // "Discover Your"
    coloredTitle: { type: String, required: true }, // "Ultimate Gaming"
    description: { type: String, required: true },
    primaryBtn: {
      text: { type: String, default: 'Go to Catalog' },
      url: { type: String, default: '/categories' }
    },
    secondaryBtn: {
      text: { type: String, default: 'Shop Now' },
      url: { type: String, default: '/shop' }
    },
    stats: {
      customerCount: { type: String, default: '2k+' },
      rating: { type: Number, default: 4.8 }
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('HomeSettings', HomeSettingsSchema);