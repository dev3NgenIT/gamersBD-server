const express = require('express');
const router = express.Router();
const homeSettingsController = require('../controllers/homeSettings.controller');

// ==================== BASIC CRUD ====================
router.get('/', homeSettingsController.getHomeSettings);
router.post('/', homeSettingsController.createHomeSettings);
router.put('/', homeSettingsController.updateHomeSettings);
router.patch('/', homeSettingsController.partialUpdateHomeSettings);
router.delete('/reset', homeSettingsController.resetHomeSettings);

// ==================== SLIDER MANAGEMENT ====================
router.post('/slider/slides', homeSettingsController.addSliderSlide);
router.put('/slider/slides/:index', homeSettingsController.updateSliderSlide);
router.delete('/slider/slides/:index', homeSettingsController.deleteSliderSlide);
router.put('/slider/settings', homeSettingsController.updateSliderSettings);

// ==================== HERO OFFERS MANAGEMENT ====================
router.post('/hero/offers', homeSettingsController.addHeroOffer);
router.put('/hero/offers/:index', homeSettingsController.updateHeroOffer);
router.delete('/hero/offers/:index', homeSettingsController.deleteHeroOffer);

// ==================== PARTNER LOGOS ====================
router.post('/partner-logos', homeSettingsController.addPartnerLogo);
router.delete('/partner-logos', homeSettingsController.removePartnerLogo);

// ==================== PROMOTIONAL SECTION ONE ====================
router.put('/promotional-section/settings', homeSettingsController.updatePromotionalSection);
router.post('/promotional-section/cards', homeSettingsController.addPromoCard);
router.put('/promotional-section/cards/:index', homeSettingsController.updatePromoCard);
router.delete('/promotional-section/cards/:index', homeSettingsController.deletePromoCard);

// ==================== PROMOTIONAL SECTION TWO ====================
router.put('/promotional-section-two/settings', homeSettingsController.updatePromotionalSectionTwo);
router.post('/promotional-section-two/cards', homeSettingsController.addPromoCardTwo);
router.put('/promotional-section-two/cards/:index', homeSettingsController.updatePromoCardTwo);
router.delete('/promotional-section-two/cards/:index', homeSettingsController.deletePromoCardTwo);

// ==================== CATALOGUE SECTION ====================
router.put('/catalogue', homeSettingsController.updateCatalogueSection);

// ==================== LEGACY ROUTES (Backward Compatibility) ====================
router.post('/sidebar-promos', homeSettingsController.addSidebarPromo);
router.put('/sidebar-promos', homeSettingsController.updateSidebarPromo);
router.delete('/sidebar-promos/:promoIndex', homeSettingsController.deleteSidebarPromo);
router.post('/offer-cards', homeSettingsController.addOfferCard);
router.put('/offer-cards', homeSettingsController.updateOfferCard);
router.delete('/offer-cards/:cardIndex', homeSettingsController.deleteOfferCard);
router.put('/cta-banner', homeSettingsController.updateCtaBanner);

module.exports = router;