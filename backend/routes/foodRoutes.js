const express = require('express');
const router = express.Router();
const { 
  getFoods, 
  getFood, 
  createFood, 
  updateFood, 
  deleteFood,
  getFoodsByCategory,
  getTopFoods,
  createFoodReview
} = require('../controllers/foodController');

// Middleware (will be implemented later)
const { protect, authorize } = require('../middleware/auth');

// Get top rated foods
router.get('/top', getTopFoods);

// Get foods by category
router.get('/categories/:category', getFoodsByCategory);

// Add review to food
router.post('/:id/reviews', protect, createFoodReview);

router.route('/')
  .get(getFoods)
  .post(protect, authorize('admin'), createFood);

router.route('/:id')
  .get(getFood)
  .put(protect, authorize('admin'), updateFood)
  .delete(protect, authorize('admin'), deleteFood);

module.exports = router;
