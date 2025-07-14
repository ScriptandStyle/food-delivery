#!/bin/bash
# Food Delivery API cURL Examples
# These examples demonstrate how to interact with the Food Delivery API using cURL

# Base URL
API_URL="http://localhost:5000/api"

# Store the auth token
AUTH_TOKEN=""

echo "====================================="
echo "FOOD DELIVERY API CURL EXAMPLES"
echo "====================================="
echo ""

# 1. Register a new user
echo "1. REGISTERING A NEW USER"
echo "------------------------"

register_response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "password123",
    "address": {
      "street": "456 Park Avenue",
      "city": "Delhi",
      "state": "Delhi",
      "zipCode": "110001",
      "country": "India"
    },
    "phone": "9876543210"
  }' \
  $API_URL/users/register)

echo "Response: $register_response"
echo ""

# Extract token from response (this is a simplified extraction and might need adjustment)
AUTH_TOKEN=$(echo $register_response | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# If registration fails (user exists), try login
if [[ -z "$AUTH_TOKEN" ]]; then
  echo "2. LOGGING IN (SINCE USER MIGHT ALREADY EXIST)"
  echo "--------------------------------------------"
  
  login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "email": "jane.smith@example.com",
      "password": "password123"
    }' \
    $API_URL/users/login)
  
  echo "Response: $login_response"
  echo ""
  
  # Extract token from login response
  AUTH_TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | sed 's/"token":"//')
fi

echo "Auth Token: ${AUTH_TOKEN:0:15}..."
echo ""

# 3. Get all food items
echo "3. GETTING FOOD ITEMS"
echo "-------------------"

foods_response=$(curl -s -X GET \
  $API_URL/foods?limit=5)

echo "Response: $foods_response"
echo ""

# 4. Get food items by category
echo "4. GETTING FOOD ITEMS BY CATEGORY"
echo "-------------------------------"

category_response=$(curl -s -X GET \
  $API_URL/foods/categories/main%20course)

echo "Response: $category_response"
echo ""

# 5. Get top rated food items
echo "5. GETTING TOP RATED FOOD ITEMS"
echo "-----------------------------"

top_response=$(curl -s -X GET \
  $API_URL/foods/top?limit=3)

echo "Response: $top_response"
echo ""

# 6. Create a new order
echo "6. CREATING A NEW ORDER"
echo "---------------------"

order_response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "orderItems": [
      {
        "food": "REPLACE_WITH_ACTUAL_FOOD_ID",
        "name": "Butter Chicken",
        "image": "butter-chicken.jpg",
        "price": 350,
        "quantity": 2
      },
      {
        "food": "REPLACE_WITH_ACTUAL_FOOD_ID",
        "name": "Paneer Tikka",
        "image": "paneer-tikka.jpg",
        "price": 280,
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "456 Park Avenue",
      "city": "Delhi",
      "state": "Delhi",
      "zipCode": "110001",
      "country": "India"
    },
    "paymentMethod": "cash_on_delivery",
    "taxPrice": 49,
    "shippingPrice": 50,
    "totalPrice": 1029
  }' \
  $API_URL/orders)

echo "Response: $order_response"
echo ""

# Extract order ID from response
ORDER_ID=$(echo $order_response | grep -o '"_id":"[^"]*' | sed 's/"_id":"//')

echo "Order ID: $ORDER_ID"
echo ""

# 7. Get order details
echo "7. GETTING ORDER DETAILS"
echo "----------------------"

order_details_response=$(curl -s -X GET \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  $API_URL/orders/$ORDER_ID)

echo "Response: $order_details_response"
echo ""

# 8. Process cash on delivery
echo "8. PROCESSING CASH ON DELIVERY"
echo "----------------------------"

cod_response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "orderId": "'$ORDER_ID'"
  }' \
  $API_URL/payments/cash-on-delivery)

echo "Response: $cod_response"
echo ""

# 9. Get user's orders
echo "9. GETTING USER'S ORDERS"
echo "----------------------"

my_orders_response=$(curl -s -X GET \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  $API_URL/orders/myorders)

echo "Response: $my_orders_response"
echo ""

echo "====================================="
echo "CURL EXAMPLES COMPLETED"
echo "====================================="

echo ""
echo "NOTE: Some examples might fail if:"
echo "1. The server is not running"
echo "2. MongoDB is not connected"
echo "3. Food IDs need to be replaced with actual IDs from your database"
echo "4. The order ID extraction fails (simple regex might not work for all responses)"
echo ""
echo "To use this script properly:"
echo "1. Start your backend server"
echo "2. Make sure MongoDB is running"
echo "3. Replace 'REPLACE_WITH_ACTUAL_FOOD_ID' with real food IDs from your database"
echo "4. Run this script"
