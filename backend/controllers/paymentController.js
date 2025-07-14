const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create payment intent with Stripe
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
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

    // Check if user is authorized to pay for this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to pay for this order'
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Get user details for the payment
    const user = await User.findById(req.user.id);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'inr', // Change to your currency
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id
      },
      receipt_email: user.email,
      description: `Payment for order #${order._id}`
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Webhook for Stripe events
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// Handle successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata');
      return;
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: paymentIntent.receipt_email
    };

    await order.save();
    console.log(`Order ${orderId} marked as paid`);
  } catch (err) {
    console.error('Error handling successful payment:', err);
  }
};

// Handle failed payment
const handleFailedPayment = async (paymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata');
      return;
    }

    // Log the failed payment but don't change order status
    console.log(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`);
  } catch (err) {
    console.error('Error handling failed payment:', err);
  }
};

// @desc    Process cash on delivery order
// @route   POST /api/payments/cash-on-delivery
// @access  Private
exports.processCashOnDelivery = async (req, res) => {
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

    // Check if user is authorized
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if payment method is cash on delivery
    if (order.paymentMethod !== 'cash_on_delivery') {
      return res.status(400).json({
        success: false,
        error: 'This order is not set for cash on delivery'
      });
    }

    // Update order status
    order.status = 'processing';
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
