import fetchApi from './api';
import { foodItems } from '../data/foodItems';

// Get all foods
export const getAllFoods = async () => {
  try {
    const response = await fetchApi('/foods');
    return response.data;
  } catch (error) {
    console.log('Error fetching from API, using local data instead:', error);
    return foodItems; // Fall back to local data if API fails
  }
};

// Get food by ID
export const getFoodById = async (id) => {
  try {
    const response = await fetchApi(`/foods/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Format food data to match frontend structure
export const formatFoodData = (foodData) => {
  return foodData.map(food => ({
    id: food._id || food.id,
    name: food.name,
    price: food.price,
    img: food.image || food.img,
    category: food.category,
    description: food.description,
    rating: food.rating,
    isVegetarian: food.isVegetarian,
    isVegan: food.isVegan,
    isGlutenFree: food.isGlutenFree,
    ingredients: food.ingredients,
    isAvailable: food.isAvailable,
    restaurantId: food.restaurantId || food.restaurant || 1 // Default to restaurant 1 if not specified
  }));
};
