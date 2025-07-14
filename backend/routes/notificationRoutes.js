const express = require('express');
const router = express.Router();
const { 
  createOrderNotification,
  getUserNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Create order notification
router.post('/order', protect, createOrderNotification);

// Get user notifications
router.get('/', protect, getUserNotifications);

module.exports = router;
