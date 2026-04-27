const HomeSettings = require('../models/HomeSettings');

// ==================== BASIC CRUD OPERATIONS ====================

exports.getHomeSettings = async (req, res) => {
  try {
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

exports.updateHomeSettings = async (req, res) => {
  try {
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      req.body,
      {
        new: true,
        upsert: true,
        runValidators: true
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

exports.createHomeSettings = async (req, res) => {
  try {
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

// ==================== SLIDER MANAGEMENT ====================

exports.addSliderSlide = async (req, res) => {
  try {
    const slideData = req.body;
    
    if (!slideData.id) {
      const settings = await HomeSettings.findOne({});
      const currentSlides = settings?.hero?.slider?.slides || [];
      slideData.id = currentSlides.length + 1;
    }
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'hero.slider.slides': slideData } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Slider slide added successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSliderSlide = async (req, res) => {
  try {
    const { index } = req.params;
    const slideData = req.body;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.hero.slider.slides[index]) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found at index'
      });
    }
    
    settings.hero.slider.slides[index] = { ...settings.hero.slider.slides[index], ...slideData };
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Slider slide updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteSliderSlide = async (req, res) => {
  try {
    const { index } = req.params;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.hero.slider.slides[index]) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found at index'
      });
    }
    
    settings.hero.slider.slides.splice(index, 1);
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Slider slide deleted successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSliderSettings = async (req, res) => {
  try {
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $set: { 'hero.slider.settings': req.body } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Slider settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== HERO OFFERS MANAGEMENT ====================

exports.addHeroOffer = async (req, res) => {
  try {
    const offerData = req.body;
    
    if (!offerData.id) {
      const settings = await HomeSettings.findOne({});
      const currentOffers = settings?.hero?.offers || [];
      offerData.id = currentOffers.length + 1;
    }
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'hero.offers': offerData } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Hero offer added successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateHeroOffer = async (req, res) => {
  try {
    const { index } = req.params;
    const offerData = req.body;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.hero.offers[index]) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found at index'
      });
    }
    
    settings.hero.offers[index] = { ...settings.hero.offers[index], ...offerData };
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Hero offer updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteHeroOffer = async (req, res) => {
  try {
    const { index } = req.params;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.hero.offers[index]) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found at index'
      });
    }
    
    settings.hero.offers.splice(index, 1);
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Hero offer deleted successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== PARTNER LOGOS ====================

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

// ==================== PROMOTIONAL SECTION ONE ====================

exports.updatePromotionalSection = async (req, res) => {
  try {
    const updateData = req.body;
    const updateQuery = { $set: {} };
    
    Object.keys(updateData).forEach(key => {
      updateQuery.$set[`promotionalSection.${key}`] = updateData[key];
    });
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      updateQuery,
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Promotional section updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addPromoCard = async (req, res) => {
  try {
    const cardData = req.body;
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'promotionalSection.cards': cardData } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Promo card added successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePromoCard = async (req, res) => {
  try {
    const { index } = req.params;
    const cardData = req.body;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.promotionalSection.cards[index]) {
      return res.status(404).json({
        success: false,
        message: 'Card not found at index'
      });
    }
    
    settings.promotionalSection.cards[index] = { ...settings.promotionalSection.cards[index], ...cardData };
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Promo card updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deletePromoCard = async (req, res) => {
  try {
    const { index } = req.params;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.promotionalSection.cards[index]) {
      return res.status(404).json({
        success: false,
        message: 'Card not found at index'
      });
    }
    
    settings.promotionalSection.cards.splice(index, 1);
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Promo card deleted successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== PROMOTIONAL SECTION TWO ====================

exports.updatePromotionalSectionTwo = async (req, res) => {
  try {
    const updateData = req.body;
    const updateQuery = { $set: {} };
    
    Object.keys(updateData).forEach(key => {
      updateQuery.$set[`promotionalSectionTwo.${key}`] = updateData[key];
    });
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      updateQuery,
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Promotional section two updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addPromoCardTwo = async (req, res) => {
  try {
    const cardData = req.body;
    
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $push: { 'promotionalSectionTwo.cards': cardData } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Promo card added to section two',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePromoCardTwo = async (req, res) => {
  try {
    const { index } = req.params;
    const cardData = req.body;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.promotionalSectionTwo.cards[index]) {
      return res.status(404).json({
        success: false,
        message: 'Card not found at index'
      });
    }
    
    settings.promotionalSectionTwo.cards[index] = { ...settings.promotionalSectionTwo.cards[index], ...cardData };
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Promo card updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deletePromoCardTwo = async (req, res) => {
  try {
    const { index } = req.params;
    
    const settings = await HomeSettings.findOne({});
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    if (!settings.promotionalSectionTwo.cards[index]) {
      return res.status(404).json({
        success: false,
        message: 'Card not found at index'
      });
    }
    
    settings.promotionalSectionTwo.cards.splice(index, 1);
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Promo card deleted successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== CATALOGUE SECTION ====================

exports.updateCatalogueSection = async (req, res) => {
  try {
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $set: { catalogueSection: req.body } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Catalogue section updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== LEGACY METHODS ====================

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

exports.updateCtaBanner = async (req, res) => {
  try {
    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { $set: { ctaBanner: req.body } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'CTA banner updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};