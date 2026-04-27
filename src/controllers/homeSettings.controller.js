const HomeSettings = require('../models/HomeSettings');

// Get the single home settings document
exports.getHomeSettings = async (req, res) => {
  try {
    // Find the first document or create one with defaults
    let settings = await HomeSettings.findOne();
    
    if (!settings) {
      settings = await HomeSettings.create({});
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create or update the home settings (single document)
exports.updateHomeSettings = async (req, res) => {
  try {
    // Find and update the existing document, or create new one
    const settings = await HomeSettings.findOneAndUpdate(
      {}, // empty filter to match first document
      req.body,
      {
        new: true, // return updated document
        upsert: true, // create if doesn't exist
        runValidators: true // run schema validations
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Home settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Partial update for specific sections
exports.partialUpdateHomeSettings = async (req, res) => {
  try {
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Home settings partially updated',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reset to default settings
exports.resetHomeSettings = async (req, res) => {
  try {
    await HomeSettings.deleteMany({});
    const defaultSettings = await HomeSettings.create({});
    
    res.status(200).json({
      success: true,
      message: 'Home settings reset to default',
      data: defaultSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add a partner logo
exports.addPartnerLogo = async (req, res) => {
  try {
    const { logoUrl } = req.body;
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'hero.partnerLogos': logoUrl } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Partner logo added successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove a partner logo
exports.removePartnerLogo = async (req, res) => {
  try {
    const { logoUrl } = req.body;
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $pull: { 'hero.partnerLogos': logoUrl } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Partner logo removed successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add sidebar promo
exports.addSidebarPromo = async (req, res) => {
  try {
    const promoData = req.body;
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'hero.sidebarPromos': promoData } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Sidebar promo added successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update sidebar promo
exports.updateSidebarPromo = async (req, res) => {
  try {
    const { promoIndex, promoData } = req.body;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.hero.sidebarPromos[promoIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found at index'
      });
    }
    
    settings.hero.sidebarPromos[promoIndex] = promoData;
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Sidebar promo updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete sidebar promo
exports.deleteSidebarPromo = async (req, res) => {
  try {
    const { promoIndex } = req.params;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    settings.hero.sidebarPromos.splice(promoIndex, 1);
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Sidebar promo deleted successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add offer card
exports.addOfferCard = async (req, res) => {
  try {
    const cardData = req.body;
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'offersSection.cards': cardData } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Offer card added successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update offer card
exports.updateOfferCard = async (req, res) => {
  try {
    const { cardIndex, cardData } = req.body;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.offersSection.cards[cardIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Card not found at index'
      });
    }
    
    settings.offersSection.cards[cardIndex] = cardData;
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Offer card updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete offer card
exports.deleteOfferCard = async (req, res) => {
  try {
    const { cardIndex } = req.params;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    settings.offersSection.cards.splice(cardIndex, 1);
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Offer card deleted successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Add this to your controller file
exports.createHomeSettings = async (req, res) => {
  try {
    // Check if settings already exist
    const existingSettings = await HomeSettings.findOne();
    
    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: 'Home settings already exist. Use PUT to update instead.'
      });
    }
    
    const settings = await HomeSettings.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Home settings created successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};