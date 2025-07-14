const mongoose = require('mongoose');
const Food = require('./models/Food');
const User = require('./models/User');
const { foodItems } = require('../src/data/foodItems');
const bcrypt = require('bcryptjs');

// Connect to database directly instead of using the config file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/food_delvi');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await Food.deleteMany();
    
    // Create food items with specific ObjectIds to match frontend IDs
    const foodsToInsert = foodItems.map(item => {
      // Create a 24-character hex string with the item.id padded at the end
      // This ensures the ObjectId in MongoDB matches what the frontend expects
      const idStr = '000000000000000000000' + item.id.toString().padStart(3, '0');
      
      return {
        _id: new mongoose.Types.ObjectId(idStr),
        name: item.name,
        description: item.description,
        price: item.price,
        category: mapCategory(item.category),
        image: item.img,
        isVegetarian: item.category.toLowerCase().includes('vegetable') || 
                     item.category.toLowerCase().includes('salad'),
        isVegan: item.category.toLowerCase().includes('vegan'),
        isGlutenFree: false,
        ingredients: [item.description], // Using description as placeholder for ingredients
        rating: item.rating,
        numReviews: Math.floor(Math.random() * 100) + 10,
        isAvailable: true
      };
    });

    await Food.insertMany(foodsToInsert);

    // Create a test user if it doesn't exist
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'user'
      });
    }

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    await Food.deleteMany();
    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Map frontend categories to backend enum values
function mapCategory(frontendCategory) {
  const categoryMap = {
    'Pizza': 'main course',
    'Burgers': 'main course',
    'Pasta': 'main course',
    'Indian': 'main course',
    'Japanese': 'main course',
    'Salads': 'appetizer',
    'Soups': 'appetizer',
    'Appetizers': 'appetizer',
    'Desserts': 'dessert',
    'Thai': 'main course',
    'Middle Eastern': 'main course',
    'Italian': 'main course',
    'British': 'main course',
    'South Indian': 'main course'
  };
  
  return categoryMap[frontendCategory] || 'main course';
}

// Connect to database
connectDB();

// Check if -d flag is provided to destroy data
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
