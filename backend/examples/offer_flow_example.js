const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Print section header
const printHeader = (text) => {
  console.log('\n' + colors.cyan + colors.bright + text + colors.reset);
  console.log(colors.cyan + '-'.repeat(text.length) + colors.reset + '  ');
};

// Print success message
const printSuccess = (text) => {
  console.log(colors.green + text + colors.reset);
};

// Print error message
const printError = (text) => {
  console.log(colors.red + text + colors.reset);
};

// Print info message
const printInfo = (text) => {
  console.log(colors.yellow + text + colors.reset);
};

// Store auth token and user ID
let authToken = '';
let userId = '';

// Main function to run the example
const runExample = async () => {
  console.log(colors.magenta + colors.bright + '='.repeat(25) + colors.reset);
  console.log(colors.magenta + colors.bright + 'FOOD DELIVERY OFFER FLOW EXAMPLE' + colors.reset);
  console.log(colors.magenta + colors.bright + '='.repeat(25) + colors.reset);

  try {
    // 1. Login as admin to create an offer
    await loginAsAdmin();

    // 2. Create a new offer
    const offer = await createOffer();

    // 3. Login as a regular user
    await loginAsUser();

    // 4. Get food items
    const foodItems = await getFoodItems();

    // 5. Apply offer to cart
    await applyOfferToCart(foodItems, offer);

    // 6. Create order with offer
    await createOrderWithOffer(foodItems, offer);

    console.log('\n' + colors.magenta + colors.bright + '='.repeat(25) + colors.reset);
    console.log(colors.magenta + colors.bright + 'OFFER FLOW COMPLETED SUCCESSFULLY' + colors.reset);
    console.log(colors.magenta + colors.bright + '='.repeat(25) + colors.reset);
  } catch (error) {
    console.error('Error in example flow:', error.message);
  }
};

// Login as admin
const loginAsAdmin = async () => {
  printHeader('1. LOGGING IN AS ADMIN');
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@fooddelvi.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    userId = response.data.data._id;
    
    printSuccess('Admin logged in successfully!');
    printInfo(`User ID: ${userId}`);
    printInfo(`Auth Token: ${authToken.substring(0, 15)}...`);
    
    return response.data;
  } catch (error) {
    printError(`Error logging in: ${error.response?.data?.error || error.message}`);
    throw error;
  }
};

// Login as regular user
const loginAsUser = async () => {
  printHeader('3. LOGGING IN AS REGULAR USER');
  
  try {
    // Try to login with test user
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: 'user@example.com',
        password: 'password123'
      });
      
      authToken = response.data.token;
      userId = response.data.data._id;
      
      printSuccess('User logged in successfully!');
      printInfo(`User ID: ${userId}`);
      printInfo(`Auth Token: ${authToken.substring(0, 15)}...`);
      
      return response.data;
    } catch (loginError) {
      // If login fails, register a new user
      printInfo('User not found, registering a new user...');
      
      const registerResponse = await axios.post(`${API_URL}/users/register`, {
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        },
        phone: '1234567890'
      });
      
      // Login with the newly registered user
      const loginResponse = await axios.post(`${API_URL}/users/login`, {
        email: 'user@example.com',
        password: 'password123'
      });
      
      authToken = loginResponse.data.token;
      userId = loginResponse.data.data._id;
      
      printSuccess('User registered and logged in successfully!');
      printInfo(`User ID: ${userId}`);
      printInfo(`Auth Token: ${authToken.substring(0, 15)}...`);
      
      return loginResponse.data;
    }
  } catch (error) {
    printError(`Error with user authentication: ${error.response?.data?.error || error.message}`);
    throw error;
  }
};

// Create a new offer
const createOffer = async () => {
  printHeader('2. CREATING A NEW OFFER');
  
  try {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const offerData = {
      title: 'Special 20% Off',
      description: 'Get 20% off on your order above ₹500',
      code: 'SPECIAL20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 500,
      maxDiscountAmount: 200,
      isApplicableToAllItems: true,
      startDate: today.toISOString(),
      endDate: nextMonth.toISOString(),
      isActive: true
    };
    
    const response = await axios.post(
      `${API_URL}/offers`,
      offerData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    printSuccess('Offer created successfully!');
    printInfo(`Offer ID: ${response.data.data._id}`);
    printInfo(`Offer Code: ${response.data.data.code}`);
    printInfo(`Discount: ${response.data.data.discountValue}% off on orders above ₹${response.data.data.minOrderValue}`);
    
    return response.data.data;
  } catch (error) {
    printError(`Error creating offer: ${error.response?.data?.error || error.message}`);
    throw error;
  }
};

// Get food items
const getFoodItems = async () => {
  printHeader('4. GETTING FOOD ITEMS');
  
  try {
    const response = await axios.get(`${API_URL}/foods`);
    const foods = response.data.data;
    
    printSuccess(`Found ${foods.length} food items`);
    
    // Select 2 random food items for the cart
    const selectedFoods = [];
    if (foods.length > 0) {
      const randomIndex1 = Math.floor(Math.random() * foods.length);
      selectedFoods.push({
        food: foods[randomIndex1],
        quantity: 2
      });
      
      // Try to get a different food for the second item
      let randomIndex2 = Math.floor(Math.random() * foods.length);
      while (foods.length > 1 && randomIndex2 === randomIndex1) {
        randomIndex2 = Math.floor(Math.random() * foods.length);
      }
      
      selectedFoods.push({
        food: foods[randomIndex2],
        quantity: 1
      });
    }
    
    printInfo('Added to cart:');
    selectedFoods.forEach(item => {
      printInfo(`- ${item.quantity}x ${item.food.name} (₹${item.food.price} each)`);
    });
    
    return selectedFoods;
  } catch (error) {
    printError(`Error getting food items: ${error.response?.data?.error || error.message}`);
    throw error;
  }
};

// Apply offer to cart
const applyOfferToCart = async (foodItems, offer) => {
  printHeader('5. APPLYING OFFER TO CART');
  
  try {
    // Calculate cart total
    let cartTotal = foodItems.reduce((total, item) => {
      return total + (item.food.price * item.quantity);
    }, 0);
    
    printInfo(`Cart Subtotal: ₹${cartTotal}`);
    
    // Prepare cart items for the API
    const cartItemsForApi = foodItems.map(item => ({
      foodId: item.food._id,
      quantity: item.quantity
    }));
    
    // Validate the offer
    const response = await axios.post(
      `${API_URL}/offers/validate`,
      {
        code: offer.code,
        cartItems: cartItemsForApi,
        cartTotal
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    const { discount, finalAmount } = response.data.data;
    
    printSuccess('Offer applied successfully!');
    printInfo(`Discount: ₹${discount}`);
    printInfo(`Final Amount: ₹${finalAmount}`);
    
    return response.data.data;
  } catch (error) {
    printError(`Error applying offer: ${error.response?.data?.error || error.message}`);
    throw error;
  }
};

// Create order with offer
const createOrderWithOffer = async (foodItems, offer) => {
  printHeader('6. CREATING ORDER WITH OFFER');
  
  try {
    // Calculate cart total
    let subTotal = foodItems.reduce((total, item) => {
      return total + (item.food.price * item.quantity);
    }, 0);
    
    // Calculate discount (20% of subtotal with max 200)
    let discount = Math.min((subTotal * 0.2), 200);
    
    // Calculate tax and shipping
    const discountedSubtotal = subTotal - discount;
    const taxRate = 0.05; // 5% tax
    const taxAmount = Math.round(discountedSubtotal * taxRate);
    const shippingPrice = 50; // Fixed shipping
    const totalPrice = discountedSubtotal + taxAmount + shippingPrice;
    
    // Prepare order items
    const orderItems = foodItems.map(item => ({
      name: item.food.name,
      quantity: item.quantity,
      image: item.food.image,
      price: item.food.price,
      food: item.food._id
    }));
    
    // Create the order
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        orderItems,
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card',
        itemsPrice: subTotal,
        taxPrice: taxAmount,
        shippingPrice,
        totalPrice,
        appliedOffer: {
          offerId: offer._id,
          code: offer.code,
          discountAmount: discount
        }
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    printSuccess('Order created successfully!');
    printInfo(`Order ID: ${response.data.data._id}`);
    printInfo(`Status: ${response.data.data.status}`);
    printInfo(`Total: ₹${response.data.data.totalPrice}`);
    printInfo(`Discount Applied: ₹${response.data.data.appliedOffer.discountAmount}`);
    
    printHeader('Order Notification');
    printInfo(`Title: ${response.data.notification.title}`);
    printInfo(`Message: ${response.data.notification.message}`);
    if (response.data.notification.details.discount) {
      printInfo(`Discount: ${response.data.notification.details.discount}`);
    }
    
    return response.data;
  } catch (error) {
    printError(`Error creating order: ${error.response?.data?.error || error.message}`);
    throw error;
  }
};

// Run the example
runExample();
