import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Books.css';
import { addToCart as addToCartAPI } from '../api/cartApi';

function BookDetailPage() {
  const { showNotification } = useNotification();
  const { id } = useParams(); // get book ID from URL
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await API.get(`/api/books/get/${id}`);
        setBook(response.data);
      } catch (err) {
        navigate('/books');
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id, navigate]);

  async function addToCart() {
    try {
      const updatedCart = await addToCartAPI(book.id, quantity);
      showNotification(`"${book.title}" added to cart!`, 'success');
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart.totalItems }));
      navigate('/cart');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to cart';
      showNotification(msg, 'error');
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return null;

  const author = book.author || book.authorName ||
    (Array.isArray(book.authors) ? book.authors.join(', ') : book.writer) ||
    'Unknown author';

  return (
    <div className="book-detail-page">
      <button className="btn-back" onClick={() => navigate('/books')}>
        ← Back to Books
      </button>
      <div className="book-detail-card">
        <div className="book-detail-cover">
          <span className="book-emoji-large">📖</span>
        </div>
        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="detail-author">by {author}</p>
          <p className="detail-price">₹{book.price}</p>
          <p className="detail-stock">
            {book.stock > 0
              ? `✅ ${book.stock} copies available`
              : '❌ Out of stock'}
          </p>
          {book.stock > 0 && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}>+</button>
            </div>
          )}
          <p className="detail-total">
            Total: ₹{book.price * quantity}
          </p>
          <button
            className="btn-primary"
            onClick={addToCart}
            disabled={book.stock === 0}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;