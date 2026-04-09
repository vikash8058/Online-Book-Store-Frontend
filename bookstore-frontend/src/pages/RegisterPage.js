import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Auth.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Step 1 form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 OTP
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP, 3 = success

  // Timer for OTP expiry
  const [timer, setTimer] = useState(300); // 5 minutes = 300 seconds
  const [timerActive, setTimerActive] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer — runs every second when active
  useEffect(() => {
    if (!timerActive) return;
    if (timer === 0) {
      setTimerActive(false);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval); // cleanup
  }, [timerActive, timer]);

  // Format seconds to MM:SS display
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Step 1 — send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/send-otp', { email });
      setStep(2); // move to OTP step
      setTimer(300); // reset timer
      setTimerActive(true); // start countdown
      setSuccess(`OTP sent to ${email}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — verify OTP and register
  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/register', { name, email, password, otp });
      setStep(3); // success step
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setError('');
    try {
      await API.post('/auth/send-otp', { email });
      setTimer(300);
      setTimerActive(true);
      setSuccess('New OTP sent!');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join our book community</p>
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
        {success && <div className="alert alert-success">{success}</div>}

        {/* Step 1 — Fill details */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password (min 8 characters)</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP to Email'}
            </button>
          </form>
        )}

        {/* Step 2 — Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleRegister}>
            <div className="otp-info">
              <p>Enter the 6-digit OTP sent to</p>
              <strong>{email}</strong>
              {timerActive && (
                <p className="timer">Expires in {formatTime(timer)}</p>
              )}
              {!timerActive && timer === 0 && (
                <p className="timer expired">OTP expired</p>
              )}
            </div>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
            <button
              type="button"
              className="btn-secondary full-width"
              onClick={handleResendOtp}
              style={{ marginTop: '10px' }}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h3>Account Created!</h3>
            <p>Your account has been created successfully.</p>
            <button
              className="btn-primary full-width"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}

        {step === 1 && (
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
