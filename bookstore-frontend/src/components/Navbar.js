import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { getCart } from '../api/cartApi';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const sidebarRef = useRef(null);

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [name, setName] = useState(localStorage.getItem('name'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function handleStorageChange() {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
      setName(localStorage.getItem('name'));
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Initial load
    if (token && role === 'CUSTOMER') { 
      getCart()
        .then(data => setCartCount(data.totalItems || 0))
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }

    // Listen for cart changes from any page
    function handleCartUpdate(e) {
      setCartCount(e.detail || 0);
    }
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [token, role]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('cart');
    localStorage.removeItem('userId');
    setToken(null);
    setRole(null);
    setName(null);
    setSidebarOpen(false);
    navigate('/');
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">📚 Book Wala</Link>
        </div>
        <div className="navbar-right">
          {token ? (
            <>
              <span className="navbar-user">
                👤 {name}
                <span className={`role-badge ${role === 'ADMIN' ? 'admin' : 'customer'}`}>
                  {role}
                </span>
              </span>
              <button
                className="hamburger-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                <span className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </>
          ) : (
            <>
              <div className="navbar-auth-links desktop-only">
                <Link to="/books" className="btn-nav-books">Browse Books</Link>
                <Link to="/login" className="btn-nav-login">Login</Link>
                <Link to="/register" className="btn-nav-register">Register</Link>
              </div>
              <button
                className="hamburger-btn mobile-only"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                <span className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </>
          )}
        </div>
      </nav>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-avatar">
            {token ? name?.charAt(0).toUpperCase() : '📚'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-name">{token ? name : 'Welcome'}</p>
            <span className={`role-badge ${role === 'ADMIN' ? 'admin' : 'customer'}`}>
              {token ? role : 'Guest'}
            </span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <div className="sidebar-links">
          {token ? (
            <>
              {/* Books — all logged in users */}
              <Link
                to="/books"
                className={`sidebar-link ${currentPath.startsWith('/books') ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">📚</span>
                Books
              </Link>

              {/* CUSTOMER only */}
              {role === 'CUSTOMER' && (
                <>
                  <Link
                    to="/cart"
                    className={`sidebar-link ${currentPath.startsWith('/cart') ? 'active' : ''}`}
                  >
                    <span className="sidebar-link-icon">🛒</span>
                    Cart
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    className={`sidebar-link ${currentPath.startsWith('/orders') ? 'active' : ''}`}
                  >
                    <span className="sidebar-link-icon">📦</span>
                    My Orders
                  </Link>

                  <Link
                    to="/address"
                    className={`sidebar-link ${currentPath.startsWith('/address') ? 'active' : ''}`}
                  >
                    <span className="sidebar-link-icon">📍</span>
                    My Addresses
                  </Link>
                </>
              )}

              {/* ADMIN only */}
              {role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`sidebar-link ${currentPath.startsWith('/admin') ? 'active' : ''}`}
                >
                  <span className="sidebar-link-icon">⚙️</span>
                  Dashboard
                </Link>
              )}

              {/* Profile — all logged in users */}
              <Link
                to="/profile"
                className={`sidebar-link ${currentPath.startsWith('/profile') ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">👤</span>
                Profile
              </Link>

              <div className="sidebar-divider" />

              <button className="sidebar-logout" onClick={handleLogout}>
                <span className="sidebar-link-icon">🚪</span>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/books"
                className={`sidebar-link ${currentPath.startsWith('/books') ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">📚</span>
                Browse Books
              </Link>
              <Link
                to="/login"
                className={`sidebar-link ${currentPath.startsWith('/login') ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">🔐</span>
                Login
              </Link>
              <Link
                to="/register"
                className={`sidebar-link ${currentPath.startsWith('/register') ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">📝</span>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;