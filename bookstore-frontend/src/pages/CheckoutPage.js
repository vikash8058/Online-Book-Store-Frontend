import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getMyAddresses } from '../api/addressApi';
import { initiatePayment, verifyPayment } from '../api/paymentApi';
import { getCart } from '../api/cartApi';
import '../styles/Checkout.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMode, setPaymentMode] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [addrData, cartData] = await Promise.all([
          getMyAddresses(),
          getCart()
        ]);
        setAddresses(addrData);
        setCart(cartData);

        // Auto-select default address
        const def = addrData.find(a => a.default);
        if (def) setSelectedAddressId(def.id);

        // If no address → redirect to address page
        if (addrData.length === 0) {
          showNotification('Please add an address first', 'error');
          navigate('/address');
        }

        // If cart empty → redirect to books
        if (cartData.items.length === 0) {
          showNotification('Your cart is empty', 'error');
          navigate('/cart');
        }
      } catch {
        showNotification('Failed to load checkout', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate, showNotification]);

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      showNotification('Please select a delivery address', 'error');
      return;
    }
    setPlacing(true);

    try {
      const response = await initiatePayment(selectedAddressId, paymentMode);

      if (paymentMode === 'COD') {
        // COD — order created directly
        showNotification(`Order #${response.id} placed! Pay on delivery.`, 'success', 3000);
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: 0 }));
        setTimeout(() => navigate('/orders'), 2000);

      } else {
        // ONLINE — open Razorpay popup
        openRazorpay(response);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      showNotification(msg, 'error');
    } finally {
      setPlacing(false);
    }
  }

  function openRazorpay(paymentData) {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Razorpay test key
      amount: paymentData.amount * 100,   // paise
      currency: 'INR',
      name: 'Book Wala',
      description: 'Book Purchase',
      order_id: paymentData.razorpayOrderId,

      handler: async function (response) {
        // Payment success — verify on backend
        try {
          const order = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            selectedAddressId
          );
          showNotification(`Order #${order.id} placed! Payment successful.`, 'success', 3000);
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: 0 }));
          setTimeout(() => navigate('/orders'), 2000);
        } catch (err) {
          showNotification('Payment verification failed. Contact support.', 'error');
        }
      },

      prefill: {
        name: localStorage.getItem('name') || '',
      },

      theme: { color: '#5c6bc0' },

      modal: {
        ondismiss: function () {
          showNotification('Payment cancelled', 'error');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (loading) return <div className="loading">Loading checkout...</div>;

  return (
    <div className="checkout-page">
      <h1>🛍️ Checkout</h1>

      <div className="checkout-layout">

        {/* Left — Address + Payment */}
        <div className="checkout-left">

          {/* Address selection */}
          <div className="checkout-section">
            <h2>📍 Delivery Address</h2>
            <div className="address-options">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <input
                    type="radio"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="address-option-detail">
                    <p className="addr-name">{addr.fullName}</p>
                    <p>{addr.addressLine}, {addr.city}</p>
                    <p>{addr.state} — {addr.pincode}</p>
                    <p>📞 {addr.phone}</p>
                    {addr.default && <span className="default-badge">Default</span>}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-secondary add-addr-btn"
              onClick={() => navigate('/address')}
            >
              + Add New Address
            </button>
          </div>

          {/* Payment method */}
          <div className="checkout-section">
            <h2>💳 Payment Method</h2>
            <div className="payment-options">
              <div
                className={`payment-option ${paymentMode === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMode('COD')}
              >
                <input
                  type="radio"
                  checked={paymentMode === 'COD'}
                  onChange={() => setPaymentMode('COD')}
                />
                <div>
                  <p className="payment-title">💵 Cash on Delivery</p>
                  <p className="payment-sub">Pay when your order arrives</p>
                </div>
              </div>
              <div
                className={`payment-option ${paymentMode === 'ONLINE' ? 'selected' : ''}`}
                onClick={() => setPaymentMode('ONLINE')}
              >
                <input
                  type="radio"
                  checked={paymentMode === 'ONLINE'}
                  onChange={() => setPaymentMode('ONLINE')}
                />
                <div>
                  <p className="payment-title">💳 Online Payment</p>
                  <p className="payment-sub">UPI, Cards, Net Banking via Razorpay</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right — Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-box">
            <h2>Order Summary</h2>
            {cart?.items.map(item => (
              <div key={item.cartItemId} className="summary-item">
                <span>{item.bookTitle} × {item.quantity}</span>
                <span>₹{item.itemTotal}</span>
              </div>
            ))}
            <div className="summary-divider" />
            <div className="summary-row">
              <span>Delivery</span>
              <span className="free">FREE</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{cart?.grandTotal}</span>
            </div>
            <div className="selected-payment">
              {paymentMode === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
            </div>
            <button
              className="btn-primary full-width"
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddressId}
            >
              {placing
                ? 'Processing...'
                : paymentMode === 'COD'
                  ? 'Place Order (COD)'
                  : 'Pay Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;