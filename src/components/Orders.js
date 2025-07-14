import React, { useState, useEffect } from 'react';
import './Orders.css';
import { getMyOrders } from '../services/orderService';
import { isAuthenticated } from '../services/authService';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await getMyOrders();
        setOrders(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return (
      <div className="orders-container">
        <div className="orders-login-message">
          <h2>Please log in to view your orders</h2>
          <p>You need to be logged in to view your order history.</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format order status
  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'delivered';
      case 'shipped':
      case 'processing':
        return 'processing';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <p>Explore our restaurants and place your first order!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.substring(0, 8)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {order.appliedOffer && (
                <div className="order-offer">
                  <p>Offer Applied: {order.appliedOffer.code}</p>
                  <p>Discount: ₹{order.appliedOffer.discountAmount}</p>
                </div>
              )}
              
              <div className="order-items">
                <h4>Items</h4>
                <ul>
                  {order.orderItems.map((item, index) => (
                    <li key={index}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="order-footer">
                <div className="delivery-address">
                  <h4>Delivery Address</h4>
                  <p>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                </div>
                <div className="order-total">
                  <h4>Order Summary</h4>
                  <p>Items: ₹{order.itemsPrice || 0}</p>
                  {order.appliedOffer && <p>Discount: -₹{order.appliedOffer.discountAmount}</p>}
                  <p>Tax: ₹{order.taxPrice}</p>
                  <p>Shipping: ₹{order.shippingPrice}</p>
                  <p className="total-amount">Total: ₹{order.totalPrice}</p>
                </div>
              </div>
              
              <div className="order-actions">
                <button className="reorder-btn">Reorder</button>
                <button className="help-btn">Need Help?</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
