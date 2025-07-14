# Food Delvi Backend

This is the backend API for the Food Delvi website, built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Compass installed
- MongoDB server running locally or a MongoDB Atlas account

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure MongoDB Compass:
   - Open MongoDB Compass
   - Connect to your local MongoDB instance (typically `mongodb://localhost:27017`)
   - Create a new database named `food_delvi`

3. Configure environment variables:
   - The `.env` file is already set up with the following variables:
     - `PORT=5000` - The port the server will run on
     - `MONGODB_URI=mongodb://localhost:27017/food_delvi` - MongoDB connection string
     - `JWT_SECRET=your_jwt_secret_key_here` - Secret key for JWT tokens
     - `JWT_EXPIRE=30d` - JWT token expiration time
   - **Important**: Change the `JWT_SECRET` to a secure random string

### Running the Server

Start the development server:
```bash
npm run dev
```

The server will start on port 5000 (or the port specified in your .env file).

## API Endpoints

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get a single food
- `POST /api/foods` - Create a new food (Admin only)
- `PUT /api/foods/:id` - Update a food (Admin only)
- `DELETE /api/foods/:id` - Delete a food (Admin only)

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/updatedetails` - Update user details

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/myorders` - Get logged in user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Connecting Frontend to Backend

In your React frontend, you can connect to the backend by making API requests to the endpoints. Example:

```javascript
// Example of fetching foods from the API
const fetchFoods = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/foods');
    const data = await response.json();
    if (data.success) {
      setFoods(data.data);
    }
  } catch (error) {
    console.error('Error fetching foods:', error);
  }
};
```
