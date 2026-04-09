import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Auth.css';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass, 3=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 — send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — reset password
  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      setStep(3);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>We'll send you an OTP to reset</p>
        </div>

        {/* Step indicators */}
        <div className="steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Step 1 — Enter email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>
        )}

        {/* Step 2 — Enter OTP + new password */}
        {step === 2 && (
          <form onSubmit={handleReset}>
            <div className="otp-info">
              <p>OTP sent to <strong>{email}</strong></p>
            </div>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h3>Password Reset!</h3>
            <p>Your password has been reset successfully.</p>
            <button
              className="btn-primary full-width"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;