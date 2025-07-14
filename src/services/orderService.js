import fetchApi from './api';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's orders
export const getMyOrders = async () => {
  try {
    const response = await fetchApi('/orders/myorders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const response = await fetchApi(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order to paid
export const updateOrderToPaid = async (id, paymentResult) => {
  try {
    const response = await fetchApi(`/orders/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(paymentResult)
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
