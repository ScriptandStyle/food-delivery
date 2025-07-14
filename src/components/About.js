import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Food Delvi</h1>
        <p className="tagline">Delivering happiness, one meal at a time</p>
      </div>

      <div className="about-section">
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60" alt="Delicious food spread" />
        </div>
        <div className="about-content">
          <h2>Our Story</h2>
          <p>
            Founded in 2023, Food Delvi started with a simple mission: to connect people with their favorite restaurants and deliver delicious meals right to their doorstep.
          </p>
          <p>
            What began as a small startup with just a handful of restaurant partners has now grown into one of the most loved food delivery platforms, serving thousands of customers daily across multiple cities.
          </p>
          <p>
            Our journey has been fueled by our passion for food and technology, and our commitment to creating exceptional experiences for both our customers and restaurant partners.
          </p>
        </div>
      </div>

      <div className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🍽️</div>
            <h3>Quality First</h3>
            <p>We partner with restaurants that share our commitment to quality ingredients and exceptional taste.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">⏱️</div>
            <h3>Timely Delivery</h3>
            <p>We understand that time matters, which is why we strive to deliver your food hot and fresh, exactly when you need it.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💚</div>
            <h3>Customer Satisfaction</h3>
            <p>Your happiness is our priority. We go above and beyond to ensure every order brings a smile to your face.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Community Support</h3>
            <p>We believe in supporting local businesses and giving back to the communities we serve.</p>
          </div>
        </div>
      </div>

      <div className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Team member" />
            </div>
            <h3>Bharath Kishore</h3>
            <p className="member-role">Founder & CEO</p>
            <p className="member-bio">A food enthusiast with a background in technology, Bharath founded Food Delvi to revolutionize the food delivery experience. His vision and leadership have been instrumental in the company's rapid growth and success.</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <h3>500+</h3>
          <p>Restaurant Partners</p>
        </div>
        <div className="stat-item">
          <h3>15+</h3>
          <p>Cities Served</p>
        </div>
        <div className="stat-item">
          <h3>100,000+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="stat-item">
          <h3>1M+</h3>
          <p>Deliveries Completed</p>
        </div>
      </div>

      <div className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Food Delvi has been a lifesaver during busy workdays. The food always arrives hot and on time!"</p>
            </div>
            <div className="testimonial-author">
              <p><strong>Amit Kumar</strong>, Delhi</p>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"I love the variety of restaurants available on Food Delvi. It's introduced me to so many new cuisines!"</p>
            </div>
            <div className="testimonial-author">
              <p><strong>Sneha Reddy</strong>, Bangalore</p>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The customer service is exceptional. When I had an issue with my order, it was resolved immediately."</p>
            </div>
            <div className="testimonial-author">
              <p><strong>Rajesh Verma</strong>, Mumbai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
