import React from 'react';
import './Home.css';

const Home = ({ onStartOrder }) => {
  const featuredCategories = [
    {
      name: 'Pizza',
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=60',
      description: 'Authentic Italian pizzas'
    },
    {
      name: 'Indian',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
      description: 'Flavorful Indian cuisine'
    },
    {
      name: 'Japanese',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&auto=format&fit=crop&q=60',
      description: 'Fresh sushi and more'
    },
    {
      name: 'Desserts',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=60',
      description: 'Sweet treats'
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Delicious Food Delivered To Your Door</h1>
          <p>Choose from hundreds of restaurants and get your favorite meals delivered fresh</p>
          <button className="cta-button" onClick={onStartOrder}>Start Ordering</button>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <span className="feature-icon">🚀</span>
          <h3>Fast Delivery</h3>
          <p>Get your food delivered within 30 minutes</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🍽️</span>
          <h3>Quality Food</h3>
          <p>Partner with top-rated restaurants</p>
        </div>
        <div className="feature">
          <span className="feature-icon">💰</span>
          <h3>Best Deals</h3>
          <p>Regular offers and discounts</p>
        </div>
      </section>

      <section className="featured-categories">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          {featuredCategories.map(category => (
            <div key={category.name} className="category-card" onClick={onStartOrder}>
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="app-promo">
        <div className="promo-content">
          <h2>Download Our App</h2>
          <p>Get exclusive offers and track your orders in real-time</p>
          <div className="app-buttons">
            <button className="app-store-btn">
              <span>📱</span> App Store
            </button>
            <button className="play-store-btn">
              <span>🤖</span> Play Store
            </button>
          </div>
        </div>
        <div className="promo-image">
          <img src="https://images.unsplash.com/photo-1633113093730-47449a1a9c6e?w=800&auto=format&fit=crop&q=60" alt="Mobile App" />
        </div>
      </section>
    </div>
  );
};

export default Home; 