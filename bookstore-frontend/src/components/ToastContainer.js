import React from 'react';
import { useNotification } from '../context/NotificationContext';
import '../styles/Toast.css';

export function ToastContainer() {
  const { notifications } = useNotification();

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast toast-${notification.type}`}
        >
          <span className="toast-icon">
            {notification.type === 'success' && '✅'}
            {notification.type === 'error' && '❌'}
            {notification.type === 'warning' && '⚠️'}
            {notification.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{notification.message}</span>
        </div>
      ))}
    </div>
  );
}
