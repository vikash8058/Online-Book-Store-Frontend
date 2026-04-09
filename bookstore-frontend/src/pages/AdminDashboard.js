import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Admin.css';

function AdminDashboard() {
  const { showNotification } = useNotification();
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchType, setUserSearchType] = useState('name'); // 'name' or 'id'
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: '',
    onConfirm: null
  });

  // New book form state
  const [newBook, setNewBook] = useState({ title: '', authorName: '', price: '', stock: '' });
  const [bookMessage, setBookMessage] = useState({ text: '', type: '' });

  // Edit book state
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', authorName: '', price: '', stock: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  //syncs filteredUsers when users loads
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  function openConfirm(message, onConfirm) {
    setConfirmModal({ open: true, message, onConfirm });
  }

  function closeConfirm() {
    setConfirmModal({ open: false, message: '', onConfirm: null });
  }

async function handleUserSearch() {
  if (!userSearch.trim()) {
    setFilteredUsers(users); // reset to all
    return;
  }
  setUserSearchLoading(true);
  try {
    if (userSearchType === 'id') {
      // Search by ID — use existing GET /api/users/get/{id}
      const res = await API.get(`/api/users/get/${userSearch}`);
      setFilteredUsers([res.data]); // returns single user, wrap in array
    } else {
      // Search by name — GET /api/users/search?name=...
      const res = await API.get(`/api/users/search?name=${userSearch}`);
      setFilteredUsers(res.data);
    }
  } catch (err) {
    showNotification('No users found', 'error');
    setFilteredUsers([]);
  } finally {
    setUserSearchLoading(false);
  }
}

async function handleProviderFilter(provider) {
  setProviderFilter(provider);
  setUserSearch(''); // clear search when filtering
  if (provider === 'ALL') {
    setFilteredUsers(users);
    return;
  }
  try {
    const res = await API.get(`/api/users/filter?provider=${provider}`);
    setFilteredUsers(res.data);
  } catch (err) {
    showNotification('Failed to filter users', 'error');
  }
}

function handleUserSearchKeyDown(e) {
  if (e.key === 'Enter') handleUserSearch();
}

function handleUserSearchClear() {
  setUserSearch('');
  setProviderFilter('ALL');
  setFilteredUsers(users);
}

  async function fetchAll() {
    try {
      const [booksRes, ordersRes, usersRes] = await Promise.all([
        API.get('/api/books/get'),
        API.get('/api/orders/get'),
        API.get('/api/users/get'),
      ]);
      setBooks(booksRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  // Add new book
  async function handleAddBook(e) {
    e.preventDefault();
    try {
      await API.post('/api/books/create', {
        title: newBook.title,
        authorName: newBook.authorName,
        price: parseFloat(newBook.price),
        stock: parseInt(newBook.stock),
      });
      showNotification('Book added successfully!', 'success');
      setNewBook({ title: '', authorName: '', price: '', stock: '' });
      fetchAll();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add book';
      showNotification(errorMsg, 'error');
    }
  }

  // Edit book (open modal)
  function openEditBook(book) {
    setEditingBook(book.id || book._id);
    setEditForm({
      title: book.title,
      authorName: book.authorName || book.author,
      price: book.price,
      stock: book.stock,
    });
  }

  // Update book
  async function handleUpdateBook(e) {
    e.preventDefault();
    if (!editingBook) return;
    try {
      await API.put(`/api/books/update/${editingBook}`, {
        title: editForm.title,
        authorName: editForm.authorName,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
      });
      showNotification('Book updated successfully!', 'success');
      setEditingBook(null);
      fetchAll();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update book';
      showNotification(errorMsg, 'error');
    }
  }

  // Delete book
  async function handleDeleteBook(id) {
    const book = books.find(b => b.id === id);
    openConfirm(
      `Are you sure you want to delete "${book?.title}"? This action cannot be undone.`,
      async () => {
        closeConfirm();
        try {
          await API.delete(`/api/books/delete/${id}`);
          showNotification('Book deleted successfully!', 'success');
          fetchAll();
        } catch (err) {
          showNotification('Failed to delete book', 'error');
        }
      }
    );
  }

  //delete user with confirmation and block admin deletion
  async function handleDeleteUser(id) {
    // Find the user to check role
    const user = filteredUsers.find(u => u.id === id);

    // Block admin deletion
    if (user?.role === 'ADMIN') {
      showNotification('Admin account cannot be deleted.', 'error');
      return;
    }

    openConfirm(
      `Are you sure you want to delete "${user?.name}"? This action cannot be undone.`,
      async () => {
        closeConfirm();
        try {
          await API.delete(`/api/users/delete/${id}`);
          showNotification('User deleted successfully!', 'success');
          setUsers(prev => prev.filter(u => u.id !== id));
          setFilteredUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to delete user';
          showNotification(msg, 'error');
        }
      }
    );
  }

  // Update order status
  async function handleStatusUpdate(orderId, status) {
    try {
      await API.patch(`/api/orders/status/${orderId}`, { status });
      showNotification('Order status updated!', 'success');
      fetchAll();
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;

  // Stats for overview cards
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="admin-page">
      <h1>⚙️ Admin Dashboard</h1>

      {/* Tab navigation */}
      <div className="admin-tabs">
        {['overview', 'books', 'orders', 'users'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card blue">
              <h3>{books.length}</h3>
              <p>Total Books</p>
            </div>
            <div className="stat-card green">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
            <div className="stat-card purple">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card orange">
              <h3>₹{totalRevenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Books Tab */}
      {activeTab === 'books' && (
        <div className="books-tab">
          {/* Add book form */}
          <div className="add-book-form">
            <h2>Add New Book</h2>
            {bookMessage.text && (
              <div className={`alert ${bookMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {bookMessage.text}
              </div>
            )}
            <form onSubmit={handleAddBook}>
              <div className="form-row">
                <input
                  placeholder="Title"
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Author Name"
                  value={newBook.authorName}
                  onChange={e => setNewBook({ ...newBook, authorName: e.target.value })}
                  required
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={newBook.price}
                  onChange={e => setNewBook({ ...newBook, price: e.target.value })}
                  required
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={newBook.stock}
                  onChange={e => setNewBook({ ...newBook, stock: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary">Add Book</button>
              </div>
            </form>
          </div>

          {/* Books table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Author</th>
                  <th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.authorName || book.author}</td>
                    <td>₹{book.price}</td>
                    <td>{book.stock}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => openEditBook(book)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteBook(book.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="orders-tab">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Book</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const items = order.items || (order.bookTitle ? [{
                    bookTitle: order.bookTitle,
                    quantity: order.quantity,
                    price: order.price || order.totalPrice,
                  }] : []);
                  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                  const totalPrice = order.totalAmount ?? order.totalPrice ?? items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                  const bookTitles = items.map(item => `${item.bookTitle || item.title || 'Unknown'}${item.quantity ? ` x${item.quantity}` : ''}`).join(', ');

                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.userId}</td> 
                      <td>{bookTitles || '—'}</td>
                      <td>{totalQty || '—'}</td>
                      <td>₹{totalPrice}</td>
                      <td>
                        <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={e => handleStatusUpdate(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option>PENDING</option>
                          <option>CONFIRMED</option>
                          <option>SHIPPED</option>
                          <option>DELIVERED</option>
                          <option>CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-tab">

          {/* Search + Filter bar */}
          <div className="user-controls">

            {/* Search type toggle */}
            <select
              className="filter-select"
              value={userSearchType}
              onChange={e => { setUserSearchType(e.target.value); setUserSearch(''); }}
            >
              <option value="name">Search by Name</option>
              <option value="id">Search by ID</option>
            </select>

            {/* Search input */}
            <input
              className="user-search-input"
              type={userSearchType === 'id' ? 'number' : 'text'}
              placeholder={userSearchType === 'id' ? 'Enter user ID...' : 'Enter name...'}
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              onKeyDown={handleUserSearchKeyDown}
            />

            <button
              className="btn-primary"
              onClick={handleUserSearch}
              disabled={userSearchLoading}
            >
              {userSearchLoading ? '...' : '🔍 Search'}
            </button>

            {/* Provider filter buttons */}
            <div className="provider-filters">
              {['ALL', 'LOCAL', 'GOOGLE'].map(p => (
                <button
                  key={p}
                  className={`provider-btn ${providerFilter === p ? 'active' : ''}`}
                  onClick={() => handleProviderFilter(p)}
                >
                  {p === 'ALL' ? '👥 All' : p === 'LOCAL' ? '📧 Local' : '🌐 Google'}
                </button>
              ))}
            </div>

            {/* Clear button — show only when something is filtered */}
            {(userSearch || providerFilter !== 'ALL') && (
              <button className="btn-secondary" onClick={handleUserSearchClear}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Result count */}
          <p className="result-count">
            Showing {filteredUsers.length} of {users.length} users
          </p>

          {/* Users table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'customer'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`provider-badge ${user.authProvider === 'GOOGLE' ? 'google' : 'local'}`}>
                          {user.authProvider === 'GOOGLE' ? '🌐 GOOGLE' : '📧 LOCAL'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === 'ADMIN'}
                          title={user.role === 'ADMIN' ? 'Admin cannot be deleted' : 'Delete user'}
                          style={{ opacity: user.role === 'ADMIN' ? 0.4 : 1, cursor: user.role === 'ADMIN' ? 'not-allowed' : 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit book modal */}
      {editingBook && (
        <div className="modal-overlay" onClick={() => setEditingBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Book</h2>
            <form onSubmit={handleUpdateBook}>
              <div className="form-group">
                <label>Title</label>
                <input
                  placeholder="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author Name</label>
                <input
                  placeholder="Author Name"
                  value={editForm.authorName}
                  onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  placeholder="Stock"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update Book</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingBook(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.open && (
        <div className="modal-overlay" onClick={closeConfirm}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Confirm Action</h3>
            <p>{confirmModal.message}</p>
            <div className="confirm-actions">
              <button
                className="btn-danger"
                onClick={confirmModal.onConfirm}
              >
                Yes, Delete
              </button>
              <button
                className="btn-secondary"
                onClick={closeConfirm}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;