const Food = require('../models/Food');

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res) => {
  try {
    const { 
      category, 
      isVegetarian, 
      isVegan, 
      isGlutenFree, 
      minPrice, 
      maxPrice, 
      search,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by dietary preferences
    if (isVegetarian === 'true') {
      query.isVegetarian = true;
    }

    if (isVegan === 'true') {
      query.isVegan = true;
    }

    if (isGlutenFree === 'true') {
      query.isGlutenFree = true;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Only show available foods by default
    if (req.query.showUnavailable !== 'true') {
      query.isAvailable = true;
    }

    // Count total documents for pagination
    const total = await Food.countDocuments(query);

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default sort by newest
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortOptions = { [sortField]: sortOrder };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination and sorting
    const foods = await Food.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + foods.length < total
      },
      data: foods
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
exports.getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new food
// @route   POST /api/foods
// @access  Private
exports.createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      data: food
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update food
// @route   PUT /api/foods/:id
// @access  Private
exports.updateFood = async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete food
// @route   DELETE /api/foods/:id
// @access  Private
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get food by category
// @route   GET /api/foods/categories/:category
// @access  Public
exports.getFoodsByCategory = async (req, res) => {
  try {
    const foods = await Food.find({ 
      category: req.params.category,
      isAvailable: true 
    });

    if (foods.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No foods found in category ${req.params.category}`
      });
    }

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get top rated foods
// @route   GET /api/foods/top
// @access  Public
exports.getTopFoods = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    
    const foods = await Food.find({ isAvailable: true })
      .sort({ rating: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create review for food
// @route   POST /api/foods/:id/reviews
// @access  Private
exports.createFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a rating between 1 and 5'
      });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    // Check if user already reviewed this food
    if (!food.reviews) {
      food.reviews = [];
    }

    const alreadyReviewed = food.reviews.find(
      r => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: 'Food already reviewed'
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user.id
    };

    food.reviews.push(review);
    food.numReviews = food.reviews.length;
    food.rating = food.reviews.reduce((acc, item) => item.rating + acc, 0) / food.reviews.length;

    await food.save();

    res.status(201).json({
      success: true,
      message: 'Review added',
      data: food
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
