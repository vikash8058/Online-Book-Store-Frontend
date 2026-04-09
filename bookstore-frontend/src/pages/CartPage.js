import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getCart, updateCartItem, removeCartItem } from '../api/cartApi';
import '../styles/Cart.css';

// Sync cart count to Navbar badge
function syncCartCount(totalItems) {
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: totalItems }));
}

function CartPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
      syncCartCount(data.totalItems);
    } catch (err) {
      showNotification('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function handleQuantityChange(cartItemId, newQty) {
    if (newQty < 1) return;
    try {
      const updated = await updateCartItem(cartItemId, newQty);
      setCart(updated);
      syncCartCount(updated.totalItems);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update quantity';
      showNotification(msg, 'error');
    }
  }

  async function handleRemove(cartItemId) {
    try {
      const updated = await removeCartItem(cartItemId);
      setCart(updated);
      syncCartCount(updated.totalItems);
      showNotification('Item removed from cart', 'success');
    } catch (err) {
      showNotification('Could not remove item', 'error');
    }
  }

  // Just navigate to checkout — order placed there
  function handlePlaceOrder() {
    navigate('/checkout');
  }

  if (loading) return <div className="loading">Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some books to get started</p>
        <button className="btn-primary" onClick={() => navigate('/books')}>
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>🛒 Your Cart</h1>
      <div className="cart-layout">

        {/* Cart Items */}
        <div className="cart-items">
          {cart.items.map(item => (
            <div className="cart-item" key={item.cartItemId}>
              <div className="cart-item-icon">📖</div>
              <div className="cart-item-info">
                <h3>{item.bookTitle}</h3>
                <p>by {item.authorName}</p>
                <p className="item-price">₹{item.price} each</p>
              </div>
              <div className="cart-item-controls">
                <button
                  onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-item-total">
                ₹{item.itemTotal}
              </div>
              <button
                className="btn-remove"
                onClick={() => handleRemove(item.cartItemId)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items ({cart.totalItems})</span>
            <span>₹{cart.grandTotal}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className="free">FREE</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{cart.grandTotal}</span>
          </div>
          <button
            className="btn-primary full-width"
            onClick={handlePlaceOrder}
            disabled={!cart || cart.items.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>

      </div>
    </div>
  );
}

export default CartPage;