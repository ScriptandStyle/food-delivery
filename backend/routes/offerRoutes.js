const express = require('express');
const router = express.Router();
const { 
  getOffers, 
  getOffer, 
  createOffer, 
  updateOffer, 
  deleteOffer,
  validateOffer,
  applyOfferToOrder
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getOffers);
router.get('/:id', getOffer);

// Protected routes
router.post('/validate', protect, validateOffer);
router.post('/apply-to-order', protect, applyOfferToOrder);

// Admin routes
router.post('/', protect, authorize('admin'), createOffer);
router.put('/:id', protect, authorize('admin'), updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;
