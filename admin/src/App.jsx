import React, { useState, useEffect } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import AdminLogin from './Components/AdminLogin/AdminLogin'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for token in URL (from user site redirect)
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get('token');

      if (urlToken) {
        localStorage.setItem('auth-token', urlToken);
        // Clean URL
        window.history.replaceState({}, document.title, "/");
      }

      // Check auth
      const token = localStorage.getItem('auth-token');
      const savedAdminInfo = localStorage.getItem('admin-info');

      if (token) {
        // If we have token but no info (or just to verify), let's try to fetch dashboard/verify
        if (!savedAdminInfo) {
          const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-hl6k.onrender.com';
          try {
            const res = await fetch(`${API_URL}/admin/dashboard`, {
              method: 'GET',
              headers: {
                'auth-token': token,
                'Content-Type': 'application/json'
              }
            });
            const data = await res.json();
            if (data.success && data.admin) {
              localStorage.setItem('admin-info', JSON.stringify(data.admin));
              if (data.admin.role === 'admin') {
                setIsAuthenticated(true);
                setAdminInfo(data.admin);
              } else {
                // Not admin
                localStorage.removeItem('auth-token');
                const userUrl = import.meta.env.VITE_USER_URL || 'http://localhost:3000';
                window.location.href = `${userUrl}/login`;
                return; // Early return to avoid setLoading(false)
              }
            } else {
              // Invalid token
              localStorage.removeItem('auth-token');
            }
          } catch (err) {
            console.error("Verify token error:", err);
            localStorage.removeItem('auth-token');
          }
        } else {
          // We have both, verify role matches
          try {
            const adminData = JSON.parse(savedAdminInfo);
            if (adminData.role === 'admin') {
              setIsAuthenticated(true);
              setAdminInfo(adminData);
            } else {
              localStorage.removeItem('auth-token');
              localStorage.removeItem('admin-info');
            }
          } catch (e) {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('admin-info');
          }
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (admin) => {
    console.log('App.jsx - handleLogin called with:', admin);
    setIsAuthenticated(true);
    setAdminInfo(admin);
    console.log('App.jsx - State updated, isAuthenticated should be true now');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('admin-info');
    setIsAuthenticated(false);
    setAdminInfo(null);
    // Redirect to User Login for unified experience
    // Redirect to User Login for unified experience
    const userUrl = import.meta.env.VITE_USER_URL || 'http://localhost:3000';
    window.location.href = `${userUrl}/login`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to User Login Page (Single Entry Point)
    const userUrl = import.meta.env.VITE_USER_URL || 'http://localhost:3000';
    window.location.href = `${userUrl}/login`;
    return null;
  }

  return (
    <div className="app-container" style={{ paddingTop: '60px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar adminInfo={adminInfo} onLogout={handleLogout} />
      <Admin />
    </div>
  )
}

export default App
