import React, { useState } from 'react';
import './AdminLogin.css';


const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-hl6k.onrender.com';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Check if user has admin role
        if (data.user.role !== 'admin') {
          // Redirect regular users to the main website (unified login flow)
          alert('Logged in as standard user. Redirecting to main website...');
          window.location.href = 'http://localhost:3000/login';
          return;
        }

        console.log('AdminLogin - Login successful, storing data...');
        console.log('AdminLogin - User data:', data.user);

        // Store auth token (same token for admin and users)
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('admin-info', JSON.stringify(data.user));

        console.log('AdminLogin - Data stored, calling onLogin...');

        // Call onLogin to update parent state and show dashboard
        onLogin(data.user);
      } else {
        setError(data.errors || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <h1>Admin Login</h1>
        <p className="admin-subtitle">INDRAMART Admin Panel</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@indramart.com"
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="admin-note">
          Note: Admin accounts are created manually in the database.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;