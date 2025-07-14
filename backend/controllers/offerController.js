const Offer = require('../models/Offer');
const Order = require('../models/Order');
const Food = require('../models/Food');

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Only return active offers that are within their valid date range
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).populate('freeItem', 'name image price');

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Public
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('freeItem', 'name image price')
      .populate('applicableItems', 'name image price');

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);

    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Offer code already exists'
      });
    } else {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
  try {
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    await offer.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Validate offer code
// @route   POST /api/offers/validate
// @access  Private
exports.validateOffer = async (req, res) => {
  try {
    const { code, cartItems, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an offer code'
      });
    }

    // Find the offer by code
    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      isActive: true
    }).populate('freeItem', 'name image price');

    // Check if offer exists
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Invalid offer code'
      });
    }

    // Check if offer is within valid date range
    const currentDate = new Date();
    if (currentDate < offer.startDate || currentDate > offer.endDate) {
      return res.status(400).json({
        success: false,
        error: 'This offer has expired'
      });
    }

    // Check if offer has reached its usage limit
    if (offer.usageLimit !== null && offer.usageCount >= offer.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'This offer has reached its usage limit'
      });
    }

    // Check if user has reached per-user limit
    if (offer.perUserLimit !== null) {
      const userUsageCount = await Order.countDocuments({
        user: req.user.id,
        'appliedOffer.code': offer.code
      });

      if (userUsageCount >= offer.perUserLimit) {
        return res.status(400).json({
          success: false,
          error: `You have already used this offer ${offer.perUserLimit} times`
        });
      }
    }

    // Check minimum order value
    if (cartTotal < offer.minOrderValue) {
      return res.status(400).json({
        success: false,
        error: `Minimum order value of ₹${offer.minOrderValue} required for this offer`
      });
    }

    // Calculate discount based on offer type
    let discount = 0;
    let freeItem = null;

    if (offer.discountType === 'percentage') {
      discount = (cartTotal * offer.discountValue) / 100;
      
      // Apply max discount cap if set
      if (offer.maxDiscountAmount !== null && discount > offer.maxDiscountAmount) {
        discount = offer.maxDiscountAmount;
      }
    } else if (offer.discountType === 'fixed') {
      discount = offer.discountValue;
    } else if (offer.discountType === 'free_item' && offer.freeItem) {
      freeItem = offer.freeItem;
    }

    // Round discount to 2 decimal places
    discount = Math.round(discount * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        offer: {
          _id: offer._id,
          code: offer.code,
          title: offer.title,
          discountType: offer.discountType,
          discountValue: offer.discountValue
        },
        discount,
        freeItem,
        finalAmount: cartTotal - discount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Apply offer to order
// @route   POST /api/offers/apply-to-order
// @access  Private
exports.applyOfferToOrder = async (req, res) => {
  try {
    const { offerId, foodItems } = req.body;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an offer ID'
      });
    }

    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide food items'
      });
    }

    // Find the offer
    const offer = await Offer.findById(offerId).populate('freeItem');

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    // Check if offer is active and within date range
    const currentDate = new Date();
    if (!offer.isActive || currentDate < offer.startDate || currentDate > offer.endDate) {
      return res.status(400).json({
        success: false,
        error: 'This offer is not active or has expired'
      });
    }

    // Get food items details
    const foodItemIds = foodItems.map(item => item.foodId);
    const foodItemsDetails = await Food.find({ _id: { $in: foodItemIds } });

    // Calculate cart total
    let cartTotal = 0;
    const orderItems = [];

    foodItems.forEach(item => {
      const foodDetail = foodItemsDetails.find(f => f._id.toString() === item.foodId);
      if (foodDetail) {
        const itemTotal = foodDetail.price * item.quantity;
        cartTotal += itemTotal;

        orderItems.push({
          food: foodDetail._id,
          name: foodDetail.name,
          image: foodDetail.image,
          price: foodDetail.price,
          quantity: item.quantity
        });
      }
    });

    // Check minimum order value
    if (cartTotal < offer.minOrderValue) {
      return res.status(400).json({
        success: false,
        error: `Minimum order value of ₹${offer.minOrderValue} required for this offer`
      });
    }

    // Calculate discount
    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = (cartTotal * offer.discountValue) / 100;
      
      // Apply max discount cap if set
      if (offer.maxDiscountAmount !== null && discount > offer.maxDiscountAmount) {
        discount = offer.maxDiscountAmount;
      }
    } else if (offer.discountType === 'fixed') {
      discount = offer.discountValue;
    }

    // Add free item if applicable
    if (offer.discountType === 'free_item' && offer.freeItem) {
      orderItems.push({
        food: offer.freeItem._id,
        name: offer.freeItem.name,
        image: offer.freeItem.image,
        price: 0, // Free item has zero price
        quantity: 1,
        isFreeItem: true
      });
    }

    // Calculate tax and total
    const subTotal = cartTotal;
    const discountedSubtotal = subTotal - discount;
    const taxRate = 0.05; // 5% tax
    const taxAmount = Math.round(discountedSubtotal * taxRate);
    const shippingPrice = 50; // Fixed shipping
    const totalPrice = discountedSubtotal + taxAmount + shippingPrice;

    // Prepare order data
    const orderData = {
      orderItems,
      user: req.user.id,
      shippingAddress: req.body.shippingAddress || req.user.address,
      paymentMethod: req.body.paymentMethod || 'cash_on_delivery',
      itemsPrice: subTotal,
      taxPrice: taxAmount,
      shippingPrice,
      totalPrice,
      appliedOffer: {
        offerId: offer._id,
        code: offer.code,
        discountAmount: discount
      }
    };

    // Return the prepared order data
    res.status(200).json({
      success: true,
      data: {
        orderData,
        offer: {
          _id: offer._id,
          code: offer.code,
          title: offer.title,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          discountAmount: discount
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
