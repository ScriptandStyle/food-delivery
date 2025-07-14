import React, { useState } from 'react';
import './Checkout.css';
import { createOrder } from '../services/orderService';
import { isAuthenticated } from '../services/authService';

const Checkout = ({ cart, total, onClose, user, clearCart }) => {
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    phone: user ? user.phone : '',
    email: user ? user.email : '',
    address: '',
    paymentMethod: 'credit_card',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if user is authenticated
    if (!isAuthenticated()) {
      setError('Please log in to place an order');
      setLoading(false);
      return;
    }

    try {
      // Prepare order data for API
      const orderData = {
        orderItems: cart.map(item => {
          // Convert numeric IDs to valid MongoDB ObjectId format
          // MongoDB ObjectIds are 24-character hex strings
          // This is a simple conversion for demo purposes - in production you'd use actual ObjectIds from the database
          const foodId = typeof item.id === 'number' 
            ? '000000000000000000000' + item.id.toString().padStart(3, '0') 
            : item.id;
            
          return {
            name: item.name,
            quantity: item.quantity,
            image: item.img,
            price: item.price,
            food: foodId
          };
        }),
        shippingAddress: {
          street: formData.address,
          city: 'Default City', // These could be expanded in a real form
          state: 'Default State',
          zipCode: '123456',
          country: 'India'
        },
        paymentMethod: formData.paymentMethod,
        taxPrice: Math.round(total * 0.05), // 5% tax
        shippingPrice: 50, // Fixed shipping price
        totalPrice: total + Math.round(total * 0.05) + 50
      };

      // Call API to create order
      const response = await createOrder(orderData);
      
      // Clear the cart after successful order
      clearCart();
      
      // Show success message
      alert('Order placed successfully! Check your orders page to see details.');
      
      // Close the checkout modal
      onClose();
      
      // Since we don't have react-router-dom, we'll use a different approach
      // to show orders - we'll tell the parent component to show orders
      if (window.showOrdersPage) {
        window.showOrdersPage();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h2>Checkout</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} className="checkout-item">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="checkout-item">
            <span>Tax (5%)</span>
            <span>₹{Math.round(total * 0.05)}</span>
          </div>
          <div className="checkout-item">
            <span>Delivery Fee</span>
            <span>₹50</span>
          </div>
          <div className="checkout-total">
            <strong>Total Amount:</strong>
            <strong>₹{total + Math.round(total * 0.05) + 50}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
            </select>
          </div>

          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              placeholder="Any special instructions for delivery"
            />
          </div>

          <div className="checkout-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;