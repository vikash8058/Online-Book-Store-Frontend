// OrdersPage.jsx
// Calls GET /api/orders/my-orders — backend reads user from JWT
// No userId needed anywhere
import API from '../api/axios';
import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { getMyOrders } from '../api/cartApi';
import '../styles/Orders.css';

function OrdersPage() {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        showNotification('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [showNotification]);

  function getStatusClass(status) {
    if (status === 'PENDING')   return 'status-pending';
    if (status === 'SHIPPED')   return 'status-shipped';
    if (status === 'DELIVERED') return 'status-delivered';
    if (status === 'CANCELLED') return 'status-cancelled';
    return 'status-pending';
  }

  // Add this function inside OrdersPage
  async function handleDownloadInvoice(orderId) {
    try {
      const response = await API.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob'   // ← important — tells axios to treat response as file
      });

      // Create download link and click it programmatically
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-order-${orderId}.pdf`);
      document.body.appendChild(link);  
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showNotification('Failed to download invoice', 'error');
    }
  }

async function handleCancelOrder(orderId) {
  if (!window.confirm('Are you sure you want to cancel this order?')) return;
  try {
    await API.post(`/api/orders/cancel/${orderId}`);
    showNotification('Order cancelled successfully', 'success');
    // Refresh orders
    const data = await getMyOrders();
    setOrders(data);
  } catch (err) {
    const msg = err.response?.data?.message || 'Could not cancel order';
    showNotification(msg, 'error');
  }
}

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-page">
      <h1>📦 My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order.id}>

              <div className="order-header">
                <span className="order-id">Order #{order.id}</span>
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              {order.status === 'PENDING' && (
                <button
                  className="btn-cancel-order"
                  onClick={() => handleCancelOrder(order.id)}
                >
                  Cancel Order
                </button>
              )}
              <div className="order-body">
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(order.orderDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>

                <div className="order-items">
                  <p><strong>Items:</strong></p>
                  {order.items.map(item => (
                    <p key={item.id} className="order-item-line">
                      📖 {item.bookTitle} × {item.quantity} — ₹{item.price * item.quantity}
                    </p>
                  ))}
                </div>

                <p><strong>Total:</strong> ₹{order.totalAmount}</p>

                {/* Delivery address */}
                {order.deliveryAddressLine && (
                  <div className="order-address">
                    <p><strong>Delivered to:</strong></p>
                    <p>{order.deliveryFullName} | 📞 {order.deliveryPhone}</p>
                    <p>{order.deliveryAddressLine}, {order.deliveryCity}</p>
                    <p>{order.deliveryState} — {order.deliveryPincode}</p>
                  </div>
                )}

                {/* Payment mode */}
                {order.paymentMode && (
                  <p>
                    <strong>Payment:</strong>{' '}
                    <span className={`payment-badge ${order.paymentMode.toLowerCase()}`}>
                      {order.paymentMode === 'COD' ? '💵 Cash on Delivery' : '💳 Online'}
                    </span>
                    {' '}
                    <span className={`status-badge ${getStatusClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </p>
                )}
              </div>
              <button
                className="btn-invoice"
                onClick={() => handleDownloadInvoice(order.id)}
              >
                📄 Download Invoice
              </button>
                
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;