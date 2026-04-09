import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/Auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleLogin(e) {
    e.preventDefault(); // prevent page refresh
    setError('');
    setLoading(true);

    try {
      // Call POST /auth/login
      const response = await API.post('/auth/login', { email, password });

      const token = response.data.token;

      // Decode JWT payload to get role and name
      // JWT = header.payload.signature
      // payload is base64 encoded — we decode it
      const payload = JSON.parse(atob(token.split('.')[1]));

      function normalizeRole(value) {
        if (value == null) return null;
        if (typeof value === 'string') {
          const tokens = value
            .toUpperCase()
            .replace(/^ROLE_/, '')
            .split(/[,\s]+/)
            .map((token) => token.trim())
            .filter(Boolean);
          if (tokens.includes('ADMIN')) return 'ADMIN';
          if (tokens.includes('CUSTOMER')) return 'CUSTOMER';
          return tokens[0] || null;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            const role = normalizeRole(item);
            if (role) return role;
          }
          return null;
        }
        if (typeof value === 'object') {
          return normalizeRole(value.authority || value.role || value.name || value.value);
        }
        return null;
      }

      function resolveUserId(value) {
        if (value == null) return null;
        if (typeof value === 'string' || typeof value === 'number') return value;
        if (typeof value === 'object') {
          return value.userId || value.id || value.user?.id || value.user?.userId || value.user?.user_id || value.user?.sub || value.sub || value.user?.email;
        }
        return null;
      }

      const rawRole =
        normalizeRole(payload.role) ||
        normalizeRole(payload.roles) ||
        normalizeRole(payload.authorities) ||
        normalizeRole(response.data.role) ||
        normalizeRole(response.data.roles) ||
        normalizeRole(response.data.authorities) ||
        normalizeRole(response.data.user?.role) ||
        normalizeRole(response.data.user?.roles) ||
        normalizeRole(response.data.user?.authorities);
      const name = response.data.name || payload.name || email.split('@')[0];
      let userId =
        resolveUserId(response.data.userId) ||
        resolveUserId(response.data.id) ||
        resolveUserId(response.data.user) ||
        resolveUserId(payload.id) ||
        resolveUserId(payload.userId) ||
        resolveUserId(payload.user) ||
        resolveUserId(payload.sub);

      // Save token early so the API client can use it for role detection.
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);

      // If the local userId is an email or missing, resolve the numeric ID from the customer profile endpoint.
      try {
        const profileResponse = await API.get('/api/users/me');
        userId =
          resolveUserId(profileResponse.data.userId) ||
          resolveUserId(profileResponse.data.id) ||
          resolveUserId(profileResponse.data.user) ||
          resolveUserId(profileResponse.data.data) ||
          userId;

        // Get real name from /api/users/me
        if (profileResponse.data.name) {
          localStorage.setItem('name', profileResponse.data.name);
        }
      } catch (profileErr) {
        console.warn('Unable to resolve profile after login', profileErr);
      }

      if (userId && !(typeof userId === 'string' && userId.includes('@'))) {
        localStorage.setItem('userId', userId);
      } else {
        localStorage.removeItem('userId');
      }

      let normalizedRole = rawRole === 'ADMIN'
        ? 'ADMIN'
        : rawRole === 'CUSTOMER'
          ? 'CUSTOMER'
          : null;

      if (!normalizedRole) {
        try {
          await API.get('/api/users/get');
          normalizedRole = 'ADMIN';
        } catch (err) {
          normalizedRole = 'CUSTOMER';
        }
      }

      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('authProvider', 'LOCAL'); // add this for consistency with Google login

      // Show success notification
      showNotification('Login successful! Redirecting...', 'success', 2000);

      window.dispatchEvent(new Event('storage'));
      // Redirect based on role
      if (normalizedRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/books');
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Google OAuth2 login — redirect to Spring Boot OAuth2 endpoint
  function handleGoogleLogin() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  // Handle OAuth2 callback from backend (token in URL)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token && !localStorage.getItem('token')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.sub || payload.email;

      // Extract role from JWT
      const jwtRole = payload.role || payload.roles || payload.authorities;
      let role = 'CUSTOMER';
      if (jwtRole) {
        if (typeof jwtRole === 'string' && jwtRole.toUpperCase().includes('ADMIN')) {
          role = 'ADMIN';
        } else if (Array.isArray(jwtRole) && jwtRole.some(r => (r || '').toString().toUpperCase().includes('ADMIN'))) {
          role = 'ADMIN';
        }
      }

      // Save token first so API call works
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('authProvider', 'GOOGLE');
      localStorage.setItem('email', email);

      //Fetch real name + userId from DB
      API.get('/api/users/me')
        .then(res => {
          const realName = res.data.name || email.split('@')[0];
          const userId = res.data.id || res.data.userId;

          localStorage.setItem('name', realName);
          if (userId) localStorage.setItem('userId', userId);

          window.dispatchEvent(new Event('storage'));
        })
        .catch(err => {
          localStorage.setItem('name', email.split('@')[0]);
          console.warn('Could not fetch profile', err);
        })
        .finally(() => {
          showNotification('Google login successful!', 'success', 1500);
          setTimeout(() => {
            if (role === 'ADMIN') {
              navigate('/admin');
            } else {
              navigate('/books');
            }
          }, 1500);
        });

    } catch (err) {
      showNotification('OAuth login failed', 'error');
    }
  }
}, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
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
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="forgot-link">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        {/* Google OAuth2 login button */}
        <button className="btn-google" onClick={handleGoogleLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width="20"
          />
          Continue with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;