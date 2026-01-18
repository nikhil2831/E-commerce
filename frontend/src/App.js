import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import { ShopContext } from './Context/ShopContext';

// Import banner images
import banner_mens from './Components/Assets/banner_mens.png';
import banner_women from './Components/Assets/banner_women.png';
import banner_kids from './Components/Assets/banner_kids.png';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(ShopContext);
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  const { isLoggedIn } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px',
        color: '#333'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <BrowserRouter>
        {isLoggedIn && <Navbar />}
        <Routes>
          <Route path='/login' element={
            isLoggedIn ? <Navigate to="/" replace /> : <LoginSignup />
          } />
          <Route path='/' element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          } />
          <Route path='/mens' element={
            <ProtectedRoute>
              <ShopCategory category="men" banner={banner_mens} />
            </ProtectedRoute>
          } />
          <Route path='/womens' element={
            <ProtectedRoute>
              <ShopCategory category="women" banner={banner_women} />
            </ProtectedRoute>
          } />
          <Route path='/kids' element={
            <ProtectedRoute>
              <ShopCategory category="kids" banner={banner_kids} />
            </ProtectedRoute>
          } />
          <Route path='/product/:productId' element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path='/cart' element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path='*' element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
        </Routes>
        {isLoggedIn && <Footer />}
      </BrowserRouter>
    </div>
  );
}

export default App