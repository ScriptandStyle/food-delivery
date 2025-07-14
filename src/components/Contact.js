import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormError(true);
      return;
    }
    
    // In a real app, this would send the form data to a backend API
    console.log('Form submitted:', formData);
    
    // Show success message
    setFormError(false);
    setFormSubmitted(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="tagline">We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Our Address</h3>
            <p>123 Food Street, Tech Park</p>
            <p>Bangalore, Karnataka 560001</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>Phone</h3>
            <p>Customer Support: +91 1234567890</p>
            <p>Restaurant Partners: +91 9876543210</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">✉️</div>
            <h3>Email</h3>
            <p>support@fooddelvi.com</p>
            <p>partners@fooddelvi.com</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">⏰</div>
            <h3>Working Hours</h3>
            <p>Monday to Sunday: 10:00 AM - 11:00 PM</p>
            <p>Customer Support: 24/7</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>
          
          {formSubmitted && (
            <div className="form-success">
              <p>Thank you for your message! We'll get back to you shortly.</p>
            </div>
          )}
          
          {formError && (
            <div className="form-error">
              <p>Please fill in all required fields.</p>
            </div>
          )}
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your Phone Number (Optional)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject (Optional)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      <div className="map-section">
        <h2>Find Us</h2>
        <div className="map-container">
          {/* In a real app, this would be a Google Maps or similar embed */}
          <div className="map-placeholder">
            <img src="https://maps.googleapis.com/maps/api/staticmap?center=Bangalore,India&zoom=13&size=600x300&maptype=roadmap&key=YOUR_API_KEY" alt="Map location" />
            <div className="map-overlay">
              <p>Interactive map would be displayed here</p>
              <p>(API key required for actual implementation)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How do I track my order?</h3>
            <p>You can track your order in real-time through the "Orders" section in your account. We provide live updates as your food is prepared and delivered.</p>
          </div>
          
          <div className="faq-item">
            <h3>What if I need to cancel my order?</h3>
            <p>You can cancel your order within 5 minutes of placing it. After that, please contact our customer support for assistance.</p>
          </div>
          
          <div className="faq-item">
            <h3>How do I become a delivery partner?</h3>
            <p>To become a delivery partner, please visit our "Careers" page and apply under the "Delivery Partners" section.</p>
          </div>
          
          <div className="faq-item">
            <h3>How can restaurants join Food Delvi?</h3>
            <p>Restaurants interested in partnering with us can email partners@fooddelvi.com or call our restaurant partner line for more information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
