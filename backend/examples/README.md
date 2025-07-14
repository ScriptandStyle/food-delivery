# Food Delvi API Examples

This directory contains examples to help you test and understand the Food Delvi API.

## Prerequisites

Before running these examples, make sure:

1. Your backend server is running (`npm run dev` from the backend directory)
2. MongoDB is connected and running
3. You have installed the required dependencies:
   ```
   npm install axios
   ```

## Available Examples

### 1. Order Flow Example (JavaScript)

This script demonstrates the complete order flow from user registration to order placement and payment processing.

**How to run:**
```
node order_flow_example.js
```

This example will:
1. Register a new user (or login if user exists)
2. Get food items from the database
3. Create a new order
4. Process payment
5. Get order details

### 2. cURL Examples (Shell Script)

A collection of cURL commands to test the API directly from the command line.

**How to run:**
```
# On Windows PowerShell
./curl_examples.sh

# On Linux/Mac
bash curl_examples.sh
```

**Note:** You may need to modify the script to replace placeholder IDs with actual IDs from your database.

### 3. Postman Collection

A complete Postman collection that you can import to test all API endpoints.

**How to use:**
1. Open Postman
2. Click on "Import" button
3. Select the `food_delvi_postman_collection.json` file
4. Once imported, set the following variables in the collection:
   - `base_url`: Your API base URL (default: http://localhost:5000/api)
   - `token`: Your authentication token (obtained after login)
   - `foodId`, `orderId`, etc.: IDs from your database

## API Endpoints Overview

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login a user
- GET `/api/users/me` - Get current user profile
- PUT `/api/users/updatedetails` - Update user details
- PUT `/api/users/updatepassword` - Update user password
- POST `/api/users/forgotpassword` - Request password reset
- PUT `/api/users/resetpassword/:resettoken` - Reset password
- GET `/api/users/logout` - Logout user

### Foods
- GET `/api/foods` - Get all foods (with filtering, sorting, pagination)
- GET `/api/foods/:id` - Get a single food
- POST `/api/foods` - Create a new food (admin only)
- PUT `/api/foods/:id` - Update a food (admin only)
- DELETE `/api/foods/:id` - Delete a food (admin only)
- GET `/api/foods/categories/:category` - Get foods by category
- GET `/api/foods/top` - Get top rated foods
- POST `/api/foods/:id/reviews` - Add a review to a food

### Orders
- POST `/api/orders` - Create a new order
- GET `/api/orders/:id` - Get an order by ID
- GET `/api/orders/myorders` - Get logged in user's orders
- PUT `/api/orders/:id/pay` - Update order to paid
- PUT `/api/orders/:id/deliver` - Update order to delivered (admin only)
- GET `/api/orders` - Get all orders (admin only)

### Payments
- POST `/api/payments/create-payment-intent` - Create Stripe payment intent
- POST `/api/payments/cash-on-delivery` - Process cash on delivery order

### Upload
- POST `/api/upload` - Upload a food image (admin only)
- DELETE `/api/upload/:filename` - Delete an uploaded image (admin only)

## Troubleshooting

If you encounter issues with the examples:

1. Make sure your server is running
2. Check MongoDB connection
3. Verify that you have the correct IDs in the examples
4. Check the server logs for any errors
