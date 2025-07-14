const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create order notification
// @route   POST /api/notifications/order
// @access  Private
exports.createOrderNotification = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user is authorized to create notification for this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Update order status
    order.status = 'processing';
    
    // If payment method is cash on delivery, don't mark as paid
    if (order.paymentMethod !== 'cash_on_delivery') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    // Get user details for the notification
    const user = await User.findById(req.user.id);

    // Create notification response
    const notification = {
      type: 'order_placed',
      title: 'Order Placed Successfully',
      message: `Your order #${order._id} has been placed successfully and is being processed.`,
      details: {
        orderId: order._id,
        totalAmount: order.totalPrice,
        paymentMethod: order.paymentMethod,
        status: order.status,
        items: order.orderItems.length
      },
      timestamp: new Date()
    };

    res.status(200).json({
      success: true,
      data: {
        notification,
        order
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

// @desc    Get user notifications (mock - would be implemented with a real Notification model)
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    // Get user's recent orders to create mock notifications
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Create mock notifications from orders
    const notifications = orders.map(order => ({
      id: order._id,
      type: 'order_update',
      title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      message: `Your order #${order._id} is ${order.status}.`,
      details: {
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt || order.createdAt
      },
      isRead: false,
      timestamp: order.updatedAt || order.createdAt
    }));
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
