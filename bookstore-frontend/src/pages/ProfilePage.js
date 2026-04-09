import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Profile.css';

function ProfilePage() {
  const { showNotification } = useNotification();

  // Name update state
  const [name, setName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Show/hide password toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Check if Google user
  const authProvider = localStorage.getItem('authProvider');
  const isGoogleUser = authProvider === 'GOOGLE';
  const role = localStorage.getItem('role');

  // Pre-fill name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('name');
    if (storedName) setName(storedName);
  }, []);

  // Update name
  async function handleUpdateName(e) {
    e.preventDefault();
    if (!name.trim()) {
      showNotification('Name cannot be empty', 'error');
      return;
    }
    setNameLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      await API.patch(`/api/users/update/${userId}`, { name });
      localStorage.setItem('name', name);
      window.dispatchEvent(new Event('storage'));
      showNotification('Name updated successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update name', 'error');
    } finally {
      setNameLoading(false);
    }
  }

  // Update password
  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await API.post('/auth/update-password', { currentPassword, newPassword });
      showNotification('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>

      {/* Profile Info Card */}
      <div className="profile-info-card">
        <div className="profile-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-details">
          <h2>{name}</h2>
          <span className={`role-badge ${role === 'ADMIN' ? 'admin' : 'customer'}`}>
            {role}
          </span>
          {/* ✅ Show Google badge if Google user */}
          {isGoogleUser && (
            <p className="google-badge">🔵 Signed in with Google</p>
          )}
        </div>
      </div>

      <div className="profile-sections">

        {/* ✅ Update Name — visible to ALL users */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>✏️ Update Name</h2>
            <p>Change how your name appears across the app</p>
          </div>
          <form onSubmit={handleUpdateName}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={nameLoading}
            >
              {nameLoading ? 'Updating...' : 'Update Name'}
            </button>
          </form>
        </div>

        {/* ✅ Change Password — LOCAL users only */}
        {!isGoogleUser && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>🔒 Change Password</h2>
              <p>Make sure your new password is strong and unique</p>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-field">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-field">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, number, special char"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-field">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <div className="password-rules">
                <p>Password must contain:</p>
                <ul>
                  <li className={newPassword.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>One uppercase letter</li>
                  <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>One number</li>
                  <li className={/[@$!%*?&]/.test(newPassword) ? 'valid' : ''}>One special character (@$!%*?&)</li>
                </ul>
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* ✅ Google users see this instead of password section */}
        {isGoogleUser && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>🔵 Google Account</h2>
              <p>You are signed in via Google</p>
            </div>
            <div className="google-info-text">
              <p>Password management is handled by Google. You can only update your display name.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProfilePage;