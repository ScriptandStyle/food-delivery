const Order = require('../models/Order');
const Food = require('../models/Food');
const Offer = require('../models/Offer');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
      appliedOffer
    } = req.body;

    // Validate required fields
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    // Validate order items
    const validOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        // Skip validation for free items from offers
        if (item.isFreeItem) {
          return item;
        }
        
        // Check if food ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(item.food)) {
          throw new Error(`Invalid food ID format: ${item.food}. Must be a valid ObjectId.`);
        }
        
        const food = await Food.findById(item.food);
        if (!food) {
          throw new Error(`Food item ${item.food} not found`);
        }
        if (!food.isAvailable) {
          throw new Error(`Food item ${food.name} is not available`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for ${food.name}`);
        }
        return {
          ...item,
          price: food.price,
          name: food.name,
          image: food.image
        };
      })
    );

    // Calculate subtotal before discount
    const subTotal = validOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Initialize discount amount
    let discountAmount = 0;
    let offerData = null;
    
    // Validate offer if provided
    if (appliedOffer && appliedOffer.offerId) {
      // Check if offer exists and is valid
      const offer = await Offer.findById(appliedOffer.offerId);
      
      if (!offer) {
        return res.status(400).json({
          success: false,
          error: 'Invalid offer'
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
      
      // Check minimum order value
      if (subTotal < offer.minOrderValue) {
        return res.status(400).json({
          success: false,
          error: `Minimum order value of ₹${offer.minOrderValue} required for this offer`
        });
      }
      
      // Calculate discount based on offer type
      if (offer.discountType === 'percentage') {
        discountAmount = (subTotal * offer.discountValue) / 100;
        
        // Apply max discount cap if set
        if (offer.maxDiscountAmount !== null && discountAmount > offer.maxDiscountAmount) {
          discountAmount = offer.maxDiscountAmount;
        }
      } else if (offer.discountType === 'fixed') {
        discountAmount = offer.discountValue;
      }
      
      // Round discount to 2 decimal places
      discountAmount = Math.round(discountAmount * 100) / 100;
      
      // Store offer data
      offerData = {
        offerId: offer._id,
        code: offer.code,
        discountAmount
      };
      
      // Increment offer usage count
      offer.usageCount += 1;
      await offer.save();
    }
    
    // Calculate totals with discount
    const discountedSubtotal = subTotal - discountAmount;
    const calculatedTax = Math.round(discountedSubtotal * 0.05);
    const calculatedShipping = 50; // Fixed shipping price
    const calculatedTotal = discountedSubtotal + calculatedTax + calculatedShipping;

    // Validate prices
    if (Math.abs(taxPrice - calculatedTax) > 1) { // Allow for small rounding differences
      return res.status(400).json({
        success: false,
        error: 'Invalid tax amount'
      });
    }

    if (shippingPrice !== calculatedShipping) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shipping price'
      });
    }

    if (Math.abs(totalPrice - calculatedTotal) > 1) { // Allow for small rounding differences
      return res.status(400).json({
        success: false,
        error: 'Invalid total price'
      });
    }

    // Validate shipping address
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode', 'country'];
    const missingFields = requiredAddressFields.filter(field => !shippingAddress[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required address fields: ${missingFields.join(', ')}`
      });
    }

    // Create order with validated data
    const order = new Order({
      user: req.user.id,
      orderItems: validOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: subTotal,
      taxPrice: calculatedTax,
      shippingPrice: calculatedShipping,
      totalPrice: calculatedTotal,
      appliedOffer: offerData
    });

    // For simplicity, mark orders as paid immediately except for cash on delivery
    if (paymentMethod !== 'cash_on_delivery') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const createdOrder = await order.save();

    // Update food items stock
    await Promise.all(
      validOrderItems.filter(item => !item.isFreeItem).map(async (item) => {
        const food = await Food.findById(item.food);
        if (food.stock) {
          food.stock = Math.max(0, food.stock - item.quantity);
          await food.save();
        }
      })
    );

    // Create notification data
    const notification = {
      type: 'order_placed',
      title: 'Order Placed Successfully',
      message: `Your order #${createdOrder._id} has been placed successfully and is being processed.`,
      details: {
        orderId: createdOrder._id,
        totalAmount: createdOrder.totalPrice,
        paymentMethod: createdOrder.paymentMethod,
        status: createdOrder.status,
        items: createdOrder.orderItems.length,
        discount: discountAmount > 0 ? `₹${discountAmount} applied` : null
      },
      timestamp: new Date()
    };

    res.status(201).json({
      success: true,
      data: createdOrder,
      notification
    });
  } catch (err) {
    if (err.message) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user is order owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
