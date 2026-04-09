import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Books.css';
import { addToCart as addToCartAPI } from '../api/cartApi';

function BooksPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('title');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('id,asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 5; // ✅ 5 books per page

  useEffect(() => {
    fetchBooks(currentPage, sortBy);
  }, [currentPage, sortBy]);

  async function fetchBooks(page = 0, sort = 'id,asc') {
    setLoading(true);
    try {
      const response = await API.get(
        `/api/books/paged?page=${page}&size=${PAGE_SIZE}&sort=${sort}`
      );
      setBooks(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!search.trim()) {
      setCurrentPage(0);
      fetchBooks(0, sortBy);
      return;
    }
    setSearching(true);
    try {
      let response;
      if (filterType === 'title') {
        response = await API.get(`/api/books/search?title=${search}`);
      } else {
        response = await API.get(`/api/books/author?authorName=${search}`);
      }
      setBooks(response.data);
      setTotalPages(0);
    } catch (err) {
      showNotification('No books found', 'error');
      setBooks([]);
      setTotalPages(0);
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    if (e.target.value === '') {
      setCurrentPage(0);
      fetchBooks(0, sortBy);
    }
  }

  function handleSortChange(e) {
    setSortBy(e.target.value);
    setCurrentPage(0); // reset to page 1 on sort change
    setSearch('');     // clear search on sort change
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function addToCart(book) {
  if (book.stock === 0) return;
  try {
    const updatedCart = await addToCartAPI(book.id || book._id, 1);
    showNotification(`"${book.title}" added to cart!`, 'success');
    // Sync navbar badge
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart.totalItems }));
  } catch (err) {
    const msg = err.response?.data?.message || 'Could not add to cart';
    showNotification(msg, 'error');
  }
}

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>📚 All Books
          {totalElements > 0 && !search && (
            <span className="books-count">{totalElements} books</span>
          )}
        </h1>

        <div className="search-controls">
          {/* Filter + Search */}
          <div className="search-bar">
            <select
              className="filter-select"
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value);
                setSearch('');
                fetchBooks(0, sortBy);
              }}
            >
              <option value="title">By Title</option>
              <option value="author">By Author</option>
            </select>
            <input
              type="text"
              placeholder={filterType === 'title' ? 'Search by title...' : 'Search by author...'}
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn-search"
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? '...' : '🔍 Search'}
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="sort-bar">
            <label>Sort by:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="id,asc">Default</option>
              <option value="price,asc">Price: Low to High</option>
              <option value="price,desc">Price: High to Low</option>
              <option value="title,asc">Title: A to Z</option>
              <option value="title,desc">Title: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="no-books">No books found</div>
      ) : (
        <>
          <div className="books-grid">
            {books.map(book => {
              const bookAuthor = book.author || book.authorName ||
                (Array.isArray(book.authors) ? book.authors.join(', ') : book.writer) ||
                'Unknown author';
              const bookId = book.id || book._id;
              return (
                <div className="book-card" key={bookId}>
                  <div className="book-cover">
                    <span className="book-emoji">📖</span>
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">Author: {bookAuthor}</p>
                    <p className="book-price">₹{book.price}</p>
                    <p className={`book-stock ${book.stock === 0 ? 'out' : ''}`}>
                      {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                    </p>
                  </div>
                  <div className="book-actions">
                    <button
                      className="btn-details"
                      onClick={() => navigate(`/books/${bookId}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn-cart"
                      onClick={() => addToCart(book)}
                      disabled={book.stock === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination — hide during search */}
          {totalPages > 1 && !search && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← Prev
              </button>

              {getPageNumbers()[0] > 0 && (
                <>
                  <button className="page-btn" onClick={() => handlePageChange(0)}>1</button>
                  {getPageNumbers()[0] > 1 && <span className="page-dots">...</span>}
                </>
              )}

              {getPageNumbers().map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page + 1}
                </button>
              ))}

              {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                <>
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 2 && (
                    <span className="page-dots">...</span>
                  )}
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(totalPages - 1)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Next →
              </button>

              <span className="page-info">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BooksPage;