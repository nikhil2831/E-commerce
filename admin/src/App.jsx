import React, { useState, useEffect } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import AdminLogin from './Components/AdminLogin/AdminLogin'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('admin-token');
    const savedAdminInfo = localStorage.getItem('admin-info');
    
    if (token && savedAdminInfo) {
      setIsAuthenticated(true);
      setAdminInfo(JSON.parse(savedAdminInfo));
    }
    setLoading(false);
  }, []);

  const handleLogin = (admin) => {
    setIsAuthenticated(true);
    setAdminInfo(admin);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
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
