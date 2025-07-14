import React, { useState } from 'react';
import './Offers.css';

const Offers = ({ onNavigateToRestaurants }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOrderNow = () => {
    // Navigate to restaurants page
    if (onNavigateToRestaurants) {
      onNavigateToRestaurants();
    }
  };

  // Mock offers data
  const offers = [
    {
      id: 1,
      title: 'First Order 50% OFF',
      code: 'WELCOME50',
      discount: '50% off up to ₹150',
      validUntil: '2025-06-30',
      minOrder: 299,
      description: 'Get 50% off on your first order with Food Delvi. Maximum discount of ₹150 applicable.',
      terms: ['Valid for new users only', 'Minimum order value of ₹299', 'Not valid on certain restaurants'],
      category: 'new_user'
    },
    {
      id: 2,
      title: 'Weekend Special',
      code: 'WEEKEND25',
      discount: '25% off up to ₹125',
      validUntil: '2025-05-31',
      minOrder: 399,
      description: 'Enjoy your weekends with 25% off on all orders above ₹399. Maximum discount of ₹125 applicable.',
      terms: ['Valid only on Saturdays and Sundays', 'Minimum order value of ₹399', 'Valid once per user per weekend'],
      category: 'special'
    },
    {
      id: 3,
      title: 'Free Delivery',
      code: 'FREEDEL',
      discount: 'Free delivery',
      validUntil: '2025-05-15',
      minOrder: 499,
      description: 'Get free delivery on all orders above ₹499. No maximum limit on delivery fee waiver.',
      terms: ['Minimum order value of ₹499', 'Valid for all users', 'Can be used multiple times'],
      category: 'delivery'
    },
    {
      id: 4,
      title: 'Lunch Special',
      code: 'LUNCH20',
      discount: '20% off up to ₹100',
      validUntil: '2025-06-15',
      minOrder: 349,
      description: 'Get 20% off on all lunch orders between 11 AM and 3 PM. Maximum discount of ₹100 applicable.',
      terms: ['Valid between 11 AM and 3 PM', 'Minimum order value of ₹349', 'Valid for all users'],
      category: 'special'
    },
    {
      id: 5,
      title: 'Premium Restaurants 15% OFF',
      code: 'PREMIUM15',
      discount: '15% off up to ₹200',
      validUntil: '2025-05-31',
      minOrder: 599,
      description: 'Enjoy 15% off on orders from premium restaurants. Maximum discount of ₹200 applicable.',
      terms: ['Valid only on premium restaurants', 'Minimum order value of ₹599', 'Valid for all users'],
      category: 'restaurant'
    },
    {
      id: 6,
      title: 'Family Pack Discount',
      code: 'FAMILY100',
      discount: 'Flat ₹100 off',
      validUntil: '2025-06-30',
      minOrder: 699,
      description: 'Get a flat ₹100 off on family pack orders above ₹699.',
      terms: ['Minimum order value of ₹699', 'Valid for all users', 'Applicable on family pack items only'],
      category: 'special'
    },
    {
      id: 7,
      title: 'Refer a Friend',
      code: 'REFER50',
      discount: '₹50 off for you and your friend',
      validUntil: '2025-12-31',
      minOrder: 299,
      description: 'Refer a friend and both of you get ₹50 off on your next order.',
      terms: ['Valid for all users', 'Minimum order value of ₹299', 'Referral must be a new user'],
      category: 'referral'
    },
    {
      id: 8,
      title: 'App Special Offer',
      code: 'APP30',
      discount: '30% off up to ₹150',
      validUntil: '2025-05-20',
      minOrder: 349,
      description: 'Get 30% off on orders placed through our mobile app. Maximum discount of ₹150 applicable.',
      terms: ['Valid only on mobile app orders', 'Minimum order value of ₹349', 'Valid for all users'],
      category: 'app'
    }
  ];

  // Filter offers based on active tab
  const filteredOffers = activeTab === 'all' 
    ? offers 
    : offers.filter(offer => offer.category === activeTab);

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h1>Offers & Promotions</h1>
        <p className="tagline">Delicious food at delicious prices!</p>
      </div>

      <div className="offers-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Offers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'new_user' ? 'active' : ''}`}
          onClick={() => setActiveTab('new_user')}
        >
          New User
        </button>
        <button 
          className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          Free Delivery
        </button>
        <button 
          className={`tab-btn ${activeTab === 'special' ? 'active' : ''}`}
          onClick={() => setActiveTab('special')}
        >
          Special Deals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'restaurant' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurant')}
        >
          Restaurant Offers
        </button>
      </div>

      <div className="offers-grid">
        {filteredOffers.length > 0 ? (
          filteredOffers.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-header">
                <h2>{offer.title}</h2>
                <div className="offer-discount">{offer.discount}</div>
              </div>
              
              <div className="offer-code-section">
                <div className="offer-code">
                  <span>{offer.code}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopyCode(offer.code)}
                  >
                    {copiedCode === offer.code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              
              <div className="offer-details">
                <p className="offer-description">{offer.description}</p>
                <div className="offer-meta">
                  <div className="meta-item">
                    <span className="meta-label">Valid Until:</span>
                    <span className="meta-value">{new Date(offer.validUntil).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Min. Order:</span>
                    <span className="meta-value">₹{offer.minOrder}</span>
                  </div>
                </div>
              </div>
              
              <div className="offer-terms">
                <h3>Terms & Conditions</h3>
                <ul>
                  {offer.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
              
              <button className="use-offer-btn" onClick={handleOrderNow}>Order Now</button>
            </div>
          ))
        ) : (
          <div className="no-offers">
            <p>No offers available in this category at the moment.</p>
            <p>Please check back later or explore other categories!</p>
          </div>
        )}
      </div>

      <div className="promo-banner">
        <div className="promo-content">
          <h2>Download Our App</h2>
          <p>Get exclusive app-only offers and faster ordering experience!</p>
          <div className="app-buttons">
            <button className="app-btn">
              <span className="app-icon">🍎</span>
              App Store
            </button>
            <button className="app-btn">
              <span className="app-icon">🤖</span>
              Google Play
            </button>
          </div>
        </div>
        <div className="promo-image">
          <img src="https://images.unsplash.com/photo-1551135049-8a33b5883817?w=800&auto=format&fit=crop&q=60" alt="Food Delvi App" />
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How do I redeem an offer?</h3>
            <p>Simply copy the coupon code and apply it at checkout when placing your order.</p>
          </div>
          
          <div className="faq-item">
            <h3>Can I use multiple offers on one order?</h3>
            <p>No, only one offer can be applied per order. Choose the one that gives you the best discount!</p>
          </div>
          
          <div className="faq-item">
            <h3>Why isn't my coupon code working?</h3>
            <p>Please check the terms and conditions of the offer. The code may have expired or your order might not meet the minimum requirements.</p>
          </div>
          
          <div className="faq-item">
            <h3>How often are new offers added?</h3>
            <p>We add new offers every week! Check back regularly or subscribe to our newsletter to stay updated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
