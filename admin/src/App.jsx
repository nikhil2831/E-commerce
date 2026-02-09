import React, { useState, useEffect } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import AdminLogin from './Components/AdminLogin/AdminLogin'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (using unified auth-token)
    const token = localStorage.getItem('auth-token');
    const savedAdminInfo = localStorage.getItem('admin-info');

    console.log('App.jsx - Checking auth:', { token: !!token, savedAdminInfo });

    if (token && savedAdminInfo) {
      try {
        const adminData = JSON.parse(savedAdminInfo);
        console.log('App.jsx - Parsed admin data:', adminData);
        // Verify it's an admin user
        if (adminData.role === 'admin') {
          console.log('App.jsx - Admin verified, setting authenticated');
          setIsAuthenticated(true);
          setAdminInfo(adminData);
        } else {
          console.log('App.jsx - Not an admin role:', adminData.role);
          // Not an admin, clear the stored data
          localStorage.removeItem('auth-token');
          localStorage.removeItem('admin-info');
        }
      } catch (e) {
        console.error("Error parsing admin info:", e);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('admin-info');
      }
    }
    setLoading(false);
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
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="app-container" style={{ paddingTop: '60px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar adminInfo={adminInfo} onLogout={handleLogout} />
      <Admin />
    </div>
  )
}

export default App
