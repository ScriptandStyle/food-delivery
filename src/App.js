import React, { useState, useEffect } from 'react';
import './App.css';
import RestaurantList from './components/RestaurantList';
import Checkout from './components/Checkout';
import Home from './components/Home';
import Auth from './components/Auth';
import Orders from './components/Orders';
import About from './components/About';
import Contact from './components/Contact';
import Offers from './components/Offers';
import { getAllFoods, formatFoodData } from './services/foodService';
import { getCurrentUser, logout, isAuthenticated } from './services/authService';

function App() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [user, setUser] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch food items from backend API
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        const data = await getAllFoods();
        if (data && data.length > 0) {
          setFoodItems(formatFoodData(data));
        } else {
          // If no data is returned, import local data directly
          const { foodItems: localFoodItems } = require('./data/foodItems');
          setFoodItems(localFoodItems);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch food items');
        setLoading(false);
        console.error('Error fetching food items:', err);
        // Fallback to local data on error
        const { foodItems: localFoodItems } = require('./data/foodItems');
        setFoodItems(localFoodItems);
      }
    };

    fetchFoodItems();
  }, []);

  // Check if user is authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          handleLogout();
        }
      }
    };

    checkAuth();
  }, []);

  // Get unique categories from food items
  const categories = ['All', ...new Set(foodItems.map(item => item.category))];

  // Filter food items based on search term and category
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart functions
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const showOrdersPage = () => {
    setShowHome(false);
    setShowAuth(false);
    setShowOrders(true);
    setShowAbout(false);
    setShowContact(false);
    setShowOffers(false);
  };

  // Add the function to the window object so it can be called from the Checkout component
  window.showOrdersPage = showOrdersPage;

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowHome(false);
  };

  const handleStartOrder = () => {
    setShowHome(false);
  };

  const handleLogoClick = () => {
    setShowHome(true);
    setSelectedRestaurant(null);
    setCart([]);
  };

  const handleNavClick = (section) => {
    // First, handle the Auth page case
    if (showAuth) {
      setShowAuth(false);
    }
    
    // Reset all page states
    setShowHome(false);
    setShowCheckout(false);
    setSelectedRestaurant(null);
    setShowOrders(false);
    setShowAbout(false);
    setShowContact(false);
    setShowOffers(false);
    
    // Then handle the navigation based on section
    switch (section) {
      case 'home':
        setShowHome(true);
        break;
      case 'restaurants':
        // Just keep all states reset, which shows restaurant list
        break;
      case 'orders':
        setShowOrders(true);
        break;
      case 'about':
        setShowAbout(true);
        break;
      case 'contact':
        setShowContact(true);
        break;
      case 'offers':
        setShowOffers(true);
        break;
      default:
        setShowHome(true);
        break;
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCart([]);
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo" onClick={handleLogoClick}>Food Delvi</h1>
          <nav className="nav-links">
            <a 
              href="#" 
              className={showHome ? 'active' : ''} 
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('home');
              }}
            >
              Home
            </a>
            <a 
              href="#" 
              className={!showHome && !selectedRestaurant && !showOrders && !showAbout && !showContact && !showOffers ? 'active' : ''} 
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('restaurants');
              }}
            >
              Restaurants
            </a>
            <a 
              href="#" 
              className={showOrders ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('orders');
              }}
            >
              Orders
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('offers');
              }}
            >
              Offers
            </a>
            <a 
              href="#" 
              className={showAbout ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('about');
              }}
            >
              About
            </a>
            <a 
              href="#" 
              className={showContact ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('contact');
              }}
            >
              Contact
            </a>
          </nav>
        </div>
        <div className="header-right">
          {!showHome && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          )}
          <div className="header-actions">
            <button className="header-btn">
              <span>📍</span>
              Location
            </button>
            {user ? (
              <div className="user-info">
                <span>👤 {user.name || user.email}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button className="header-btn" onClick={handleAuthClick}>
                <span>👤</span>
                Sign In
              </button>
            )}
            {cart.length > 0 && !showHome && (
              <div className="cart-preview" onClick={() => setShowCheckout(true)}>
                <span className="cart-icon">🛒</span>
                <span className="cart-count">{cart.length}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAuth ? (
        <div className="app-container">
          <Auth onLogin={handleLogin} />
          <div className="auth-nav-overlay">
            <button className="back-to-home" onClick={() => setShowAuth(false)}>
              ← Back to Home
            </button>
          </div>
        </div>
      ) : showCheckout ? (
        <Checkout 
          cart={cart} 
          total={calculateTotal()} 
          user={user} 
          onClose={() => setShowCheckout(false)} 
          clearCart={clearCart}
        />
      ) : showHome ? (
        <Home onStartOrder={handleStartOrder} />
      ) : showOrders ? (
        <Orders />
      ) : showAbout ? (
        <About />
      ) : showContact ? (
        <Contact />
      ) : showOffers ? (
        <Offers onNavigateToRestaurants={() => handleNavClick('restaurants')} />
      ) : !selectedRestaurant ? (
        <RestaurantList onSelectRestaurant={handleRestaurantSelect} />
      ) : (
        <div className="main-content">
          <div className="restaurant-banner">
            <img src={selectedRestaurant.img} alt={selectedRestaurant.name} />
            <div className="restaurant-info">
              <h2>{selectedRestaurant.name}</h2>
              <p>{selectedRestaurant.description}</p>
              <div className="restaurant-details">
                <span>⭐ {selectedRestaurant.rating}</span>
                <span>🕒 {selectedRestaurant.deliveryTime} mins</span>
                <span>💰 Min order: ₹{selectedRestaurant.minOrder}</span>
                <span>🛵 Delivery: ₹{selectedRestaurant.deliveryFee}</span>
              </div>
              <div className="restaurant-features">
                <h3>Features</h3>
                <div className="features-list">
                  {selectedRestaurant.features?.map((feature, index) => (
                    <span key={index}>✓ {feature}</span>
                  ))}
                </div>
              </div>
              {selectedRestaurant.specialties && (
                <div className="restaurant-specialties">
                  <h3>Specialties</h3>
                  <div className="specialties-list">
                    {selectedRestaurant.specialties.map((specialty, index) => (
                      <span key={index}>🏆 {specialty}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedRestaurant.popularItems && (
                <div className="restaurant-popular">
                  <h3>Popular Items</h3>
                  <div className="popular-list">
                    {selectedRestaurant.popularItems.map((item, index) => (
                      <span key={index}>🔥 {item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="menu-section">
            <div className="categories">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="food-grid">
              {console.log('Filtered Items:', filteredItems)}
              {filteredItems && filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div key={item.id} className="food-card" onClick={() => handleItemClick(item)}>
                    <div className="food-image">
                      <img src={item.img} alt={item.name} />
                      <div className="food-rating">⭐ {item.rating}</div>
                    </div>
                    <div className="food-info">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="food-meta">
                        <span className="price">₹{item.price}</span>
                        <button
                          className="add-to-cart"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-items-message">
                  <p>No food items available. Please try another category or check back later.</p>
                </div>
              )}
            </div>
          </div>

          <div className="cart-section">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.img} alt={item.name} />
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>₹{item.price} x {item.quantity}</p>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => removeFromCart(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Total: ₹{calculateTotal()}</h3>
                  <button
                    className="checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showItemModal && selectedItem && (
        <div className="modal" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedItem.img} alt={selectedItem.name} />
            <h2>{selectedItem.name}</h2>
            <p>{selectedItem.description}</p>
            <div className="modal-meta">
              <span className="price">₹{selectedItem.price}</span>
              <span className="rating">⭐ {selectedItem.rating}</span>
            </div>
            <button
              className="add-to-cart"
              onClick={() => {
                addToCart(selectedItem);
                setShowItemModal(false);
              }}
            >
              Add to Cart
            </button>
            <button className="close-btn" onClick={() => setShowItemModal(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
