/**
 * Food Delivery API Order Flow Example
 * 
 * This script demonstrates the complete order flow from:
 * 1. User registration
 * 2. User login
 * 3. Browsing food items
 * 4. Creating an order
 * 5. Getting order notification
 * 6. Checking order status
 */

const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:5000/api';

// Store auth token and user data
let authToken = '';
let userId = '';
let orderId = '';

// Example user data
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  address: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India'
  },
  phone: '9876543210'
};

// Example order data (will be populated with actual food items)
let orderData = {
  orderItems: [],
  shippingAddress: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India'
  },
  paymentMethod: 'credit_card',
  taxPrice: 0, // Will be calculated
  shippingPrice: 0, // Will be calculated
  totalPrice: 0 // Will be calculated
};

// Headers with auth token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`
});

// 1. Register a new user
const registerUser = async () => {
  try {
    console.log('1. REGISTERING NEW USER');
    console.log('----------------------');
    
    const response = await axios.post(`${API_URL}/users/register`, userData);
    
    authToken = response.data.token;
    userId = response.data.user.id;
    
    console.log('User registered successfully!');
    console.log(`User ID: ${userId}`);
    console.log(`Auth Token: ${authToken.substring(0, 15)}...`);
    console.log('\n');
    
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    // If user already exists, try logging in
    if (error.response?.data?.error === 'User already exists') {
      return loginUser();
    }
    throw error;
  }
};

// 2. Login user
const loginUser = async () => {
  try {
    console.log('2. LOGGING IN USER');
    console.log('-----------------');
    
    const response = await axios.post(`${API_URL}/users/login`, {
      email: userData.email,
      password: userData.password
    });
    
    authToken = response.data.token;
    userId = response.data.user.id;
    
    console.log('User logged in successfully!');
    console.log(`User ID: ${userId}`);
    console.log(`Auth Token: ${authToken.substring(0, 15)}...`);
    console.log('\n');
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
    throw error;
  }
};

// 3. Get food items
const getFoodItems = async () => {
  try {
    console.log('3. GETTING FOOD ITEMS');
    console.log('-------------------');
    
    // Get food items with pagination and filtering
    const response = await axios.get(`${API_URL}/foods?limit=5&category=main course`);
    
    console.log(`Found ${response.data.count} food items`);
    
    // If no food items found, we need to create some
    if (response.data.count === 0) {
      console.log('No food items found. Creating sample food items...');
      await createSampleFoodItems();
      return getFoodItems();
    }
    
    // Add some food items to the order
    const foodItems = response.data.data;
    foodItems.slice(0, 2).forEach(food => {
      orderData.orderItems.push({
        food: food._id,
        name: food.name,
        image: food.image,
        price: food.price,
        quantity: Math.floor(Math.random() * 3) + 1 // Random quantity between 1-3
      });
    });
    
    console.log('Added to cart:');
    orderData.orderItems.forEach(item => {
      console.log(`- ${item.quantity}x ${item.name} ($${item.price} each)`);
    });
    console.log('\n');
    
    return foodItems;
  } catch (error) {
    console.error('Error getting food items:', error.response?.data || error.message);
    throw error;
  }
};

// Helper: Create sample food items if none exist
const createSampleFoodItems = async () => {
  try {
    // Login as admin first (you would need to create an admin user in your DB)
    const adminLogin = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@fooddelvi.com',
      password: 'admin123'
    });
    
    const adminToken = adminLogin.data.token;
    
    const sampleFoods = [
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in a rich, creamy tomato sauce',
        price: 350,
        category: 'main course',
        image: 'butter-chicken.jpg',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        ingredients: ['chicken', 'butter', 'cream', 'tomato', 'spices'],
        isAvailable: true,
        stock: 50
      },
      {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with vegetables and spices',
        price: 280,
        category: 'main course',
        image: 'paneer-tikka.jpg',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        ingredients: ['paneer', 'bell peppers', 'onions', 'yogurt', 'spices'],
        isAvailable: true,
        stock: 40
      },
      {
        name: 'Veg Biryani',
        description: 'Fragrant rice dish with vegetables and aromatic spices',
        price: 250,
        category: 'main course',
        image: 'veg-biryani.jpg',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        ingredients: ['basmati rice', 'mixed vegetables', 'ghee', 'spices'],
        isAvailable: true,
        stock: 30
      }
    ];
    
    for (const food of sampleFoods) {
      await axios.post(`${API_URL}/foods`, food, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
    }
    
    console.log('Sample food items created successfully!');
  } catch (error) {
    console.error('Error creating sample food items:', error.response?.data || error.message);
    // Continue even if we can't create sample items
  }
};

// 4. Calculate order totals
const calculateOrderTotals = () => {
  console.log('4. CALCULATING ORDER TOTALS');
  console.log('--------------------------');
  
  // Calculate subtotal from items
  const subtotal = orderData.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  // Calculate tax (5% of subtotal)
  orderData.taxPrice = Math.round(subtotal * 0.05);
  
  // Fixed shipping price
  orderData.shippingPrice = 50;
  
  // Calculate total
  orderData.totalPrice = subtotal + orderData.taxPrice + orderData.shippingPrice;
  
  console.log(`Subtotal: $${subtotal}`);
  console.log(`Tax (5%): $${orderData.taxPrice}`);
  console.log(`Shipping: $${orderData.shippingPrice}`);
  console.log(`Total: $${orderData.totalPrice}`);
  console.log('\n');
};

// 5. Create order
const createOrder = async () => {
  try {
    console.log('5. CREATING ORDER');
    console.log('----------------');
    
    const response = await axios.post(
      `${API_URL}/orders`, 
      orderData,
      { headers: getHeaders() }
    );
    
    orderId = response.data.data._id;
    
    console.log('Order created successfully!');
    console.log(`Order ID: ${orderId}`);
    console.log(`Status: ${response.data.data.status}`);
    
    // Display notification from order creation
    if (response.data.notification) {
      console.log('\nOrder Notification:');
      console.log(`Title: ${response.data.notification.title}`);
      console.log(`Message: ${response.data.notification.message}`);
    }
    
    console.log('\n');
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

// 6. Get order notifications
const getOrderNotifications = async () => {
  try {
    console.log('6. GETTING ORDER NOTIFICATIONS');
    console.log('----------------------------');
    
    const response = await axios.get(
      `${API_URL}/notifications`,
      { headers: getHeaders() }
    );
    
    console.log(`Found ${response.data.count} notifications`);
    
    if (response.data.count > 0) {
      console.log('\nLatest notifications:');
      response.data.data.slice(0, 3).forEach(notification => {
        console.log(`- ${notification.title}: ${notification.message}`);
      });
    }
    
    console.log('\n');
    
    return response.data;
  } catch (error) {
    console.error('Error getting notifications:', error.response?.data || error.message);
    throw error;
  }
};

// 7. Get order details
const getOrderDetails = async () => {
  try {
    console.log('7. GETTING ORDER DETAILS');
    console.log('-----------------------');
    
    const response = await axios.get(
      `${API_URL}/orders/${orderId}`,
      { headers: getHeaders() }
    );
    
    console.log('Order details:');
    console.log(`Order ID: ${response.data.data._id}`);
    console.log(`Status: ${response.data.data.status}`);
    console.log(`Payment Method: ${response.data.data.paymentMethod}`);
    console.log(`Total: $${response.data.data.totalPrice}`);
    console.log(`Is Paid: ${response.data.data.isPaid ? 'Yes' : 'No'}`);
    console.log(`Is Delivered: ${response.data.data.isDelivered ? 'Yes' : 'No'}`);
    console.log('\n');
    
    return response.data;
  } catch (error) {
    console.error('Error getting order details:', error.response?.data || error.message);
    throw error;
  }
};

// Run the complete order flow
const runOrderFlow = async () => {
  try {
    console.log('=================================');
    console.log('FOOD DELIVERY ORDER FLOW EXAMPLE');
    console.log('=================================\n');
    
    // Step 1: Register user (or login if user exists)
    await registerUser();
    
    // Step 2: Get food items and add to cart
    await getFoodItems();
    
    // Step 3: Calculate order totals
    calculateOrderTotals();
    
    // Step 4: Create the order
    await createOrder();
    
    // Step 5: Get order notifications
    await getOrderNotifications();
    
    // Step 6: Get order details
    await getOrderDetails();
    
    console.log('=================================');
    console.log('ORDER FLOW COMPLETED SUCCESSFULLY');
    console.log('=================================');
  } catch (error) {
    console.error('Error in order flow:', error);
  }
};

// Execute the order flow
runOrderFlow();
