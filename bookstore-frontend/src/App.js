import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/ToastContainer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';
import ProfilePage from './pages/ProfilePage';
import AddressPage from './pages/AddressPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <ToastContainer />
        <Navbar />
        <Routes>
          {/* Public routes — no login needed */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes — login required */}
          <Route path="/books" element={
            <ProtectedRoute><BooksPage /></ProtectedRoute>
          } />
          <Route path="/books/:id" element={
            <ProtectedRoute><BookDetailPage /></ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute><CartPage /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />

          <Route path="/address" element={
            <ProtectedRoute><AddressPage /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="/address" element={
            <ProtectedRoute><AddressPage /></ProtectedRoute>
          } />

          {/* Admin only route */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
          } />

          {/* Profile route */}
            <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />          

          {/* Catch all — redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );

}

export default App;