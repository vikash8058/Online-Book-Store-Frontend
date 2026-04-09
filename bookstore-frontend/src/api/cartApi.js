// cartApi.js
// All cart and order API calls — used by CartPage, BooksPage, BookDetailPage, Navbar

import API from './axios';

// Add book to cart (creates cart automatically if first time)
export async function addToCart(bookId, quantity) {
  const res = await API.post('/api/cart/add', { bookId, quantity });
  return res.data;
}

// Get current user's cart
export async function getCart() {
  const res = await API.get('/api/cart');
  return res.data;
}

// Update quantity of one cart item
export async function updateCartItem(cartItemId, quantity) {
  const res = await API.patch(`/api/cart/update/${cartItemId}`, { quantity });
  return res.data;
}

// Remove one item from cart
export async function removeCartItem(cartItemId) {
  const res = await API.delete(`/api/cart/remove/${cartItemId}`);
  return res.data;
}

// Clear entire cart
export async function clearCart() {
  const res = await API.delete('/api/cart/clear');
  return res.data;
}

// Place order from cart — no body needed, backend reads cart from JWT
export async function placeOrder() {
  const res = await API.post('/api/orders/place');
  return res.data;
}

// Get current user's orders
export async function getMyOrders() {
  const res = await API.get('/api/orders/my-orders');
  return res.data;
}