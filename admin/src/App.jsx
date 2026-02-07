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
    
    if (token && savedAdminInfo) {
      try {
        const adminData = JSON.parse(savedAdminInfo);
        // Verify it's an admin user
        if (adminData.role === 'admin') {
          setIsAuthenticated(true);
          setAdminInfo(adminData);
        } else {
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
    setIsAuthenticated(true);
    setAdminInfo(admin);
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
    <div>
      <Navbar adminInfo={adminInfo} onLogout={handleLogout} />
      <Admin />
    </div>
  )
}

export default App
