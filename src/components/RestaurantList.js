import React from 'react';
import './RestaurantList.css';
import { restaurants } from '../data/restaurants';

const RestaurantList = ({ onSelectRestaurant }) => {
  return (
    <div className="restaurant-list">
      <h2>Popular Restaurants</h2>
      <div className="restaurant-grid">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className="restaurant-card" onClick={() => onSelectRestaurant(restaurant)}>
            <img src={restaurant.img} alt={restaurant.name} />
            <div className="restaurant-info">
              <h3>{restaurant.name}</h3>
              <div className="restaurant-details">
                <span className="rating">⭐ {restaurant.rating}</span>
                <span className="delivery-time">🕒 {restaurant.deliveryTime} mins</span>
              </div>
              <p className="cuisine">{restaurant.cuisine.join(" • ")}</p>
              <p className="description">{restaurant.description}</p>
              <div className="restaurant-footer">
                <span className="min-order">Min order: ₹{restaurant.minOrder}</span>
                <span className="delivery-fee">Delivery: ₹{restaurant.deliveryFee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList; 