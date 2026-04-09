import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const features = [
    { icon: '📚', title: 'Huge Collection', desc: 'Browse thousands of books across all genres — fiction, tech, science, and more.' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Get your books delivered straight to your doorstep quickly and safely.' },
    { icon: '🔒', title: 'Secure Payment', desc: 'Your transactions are fully encrypted and always safe with us.' },
    { icon: '⭐', title: 'Best Prices', desc: 'Competitive prices with regular discounts and exclusive deals.' },
    { icon: '📦', title: 'Easy Tracking', desc: 'Track your orders in real time from placement to delivery.' },
    { icon: '🔄', title: 'Easy Returns', desc: 'Hassle-free return policy — no questions asked within 7 days.' },
  ];

  return (
    <div className="landing">

      {/* Hero Section — NO login/register buttons here */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎉 India's Favourite Book Store</div>
          <h1 className="hero-title">
            Discover Your Next <br />
            <span className="highlight">Favourite Book</span>
          </h1>
          <p className="hero-subtitle">
            Explore thousands of books across every genre. Place orders,
            track deliveries, and enjoy the best prices — all in one place.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>10,000+</strong>
              <span>Books</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>50,000+</strong>
              <span>Customers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>4.8★</strong>
              <span>Rating</span>
            </div>
          </div>

          {/* ✅ Only logged in users get a button here */}
          {token && (
            <button
              className="btn-hero-primary"
              onClick={() => navigate('/books')}
            >
              Browse Books →
            </button>
          )}
        </div>

        <div className="hero-image">
          <div className="hero-book-showcase">
            <div className="showcase-card card-1">
              <span>📘</span>
              <p>Java Spring</p>
              <small>₹149</small>
            </div>
            <div className="showcase-card card-2">
              <span>📗</span>
              <p>Machine Learning</p>
              <small>₹299</small>
            </div>
            <div className="showcase-card card-3">
              <span>📕</span>
              <p>Python Basics</p>
              <small>₹199</small>
            </div>
            <div className="showcase-card card-4">
              <span>📙</span>
              <p>Spring Boot</p>
              <small>₹239</small>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-header">
          <h2>Why Choose BookStore?</h2>
          <p>Everything you need for the perfect reading experience</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Banner — NO buttons at all */}
      <div className="banner-section">
        <div className="banner-content">
          <h2>Start Your Reading Journey Today</h2>
          <p>Join over 50,000 book lovers who trust BookStore for their reading needs</p>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <div className="footer-brand">📚 BookStore</div>
        <p>© 2025 BookStore. All rights reserved.</p>
      </div>

    </div>
  );
}

export default LandingPage;