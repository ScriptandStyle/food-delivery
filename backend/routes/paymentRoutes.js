const express = require('express');
const router = express.Router();
const { 
  createPaymentIntent, 
  stripeWebhook, 
  processCashOnDelivery 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe webhook route - needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Create payment intent route
router.post('/create-payment-intent', protect, createPaymentIntent);

// Cash on delivery route
router.post('/cash-on-delivery', protect, processCashOnDelivery);

module.exports = router;
