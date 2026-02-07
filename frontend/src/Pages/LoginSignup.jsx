import React, { useState, useContext } from 'react'
import './CSS/LoginSignup.css'
import { ShopContext } from '../Context/ShopContext'

// API Base URL - change this to your backend URL
const API_URL = process.env.REACT_APP_API_URL || 'https://e-commerce-hl6k.onrender.com';

export default function LoginSignup() {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useContext(ShopContext);

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (state === "Signup") {
      if (!formData.username) {
        newErrors.username = "Name is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changeHandler = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ""});
    }
  }

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const responseData = await response.json();

      if (responseData.success) {
        // Store token and user info
        login(responseData.token, responseData.user);
        
        // Role-based redirection
        if (responseData.user.role === 'admin') {
          // Redirect to admin panel
          alert('Login successful! Redirecting to Admin Dashboard...');
          window.location.href = 'http://localhost:5173'; // Admin panel URL
        } else {
          // Redirect to user e-commerce site
          alert('Login successful!');
          window.location.replace("/");
        }
      } else {
        setErrors({ general: responseData.errors || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });
      
      const responseData = await response.json();

      if (responseData.success) {
        alert('Account created successfully! Please login.');
        setFormData({ username: "", email: formData.email, password: "", confirmPassword: "" });
        setErrors({});
        setState("Login");
      } else {
        setErrors({ general: responseData.errors || 'Signup failed' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='loginsignup' style={{'--bg-image': `url(${process.env.PUBLIC_URL}/8997264.jpg)`}}>
        <div className="loginsignup-container">
          <h1>{state === "Login" ? "Welcome Back" : "Create Account"}</h1>
          <h2>{state === "Login" ? "Sign in to continue" : "Join us for the best deals"}</h2>
          
          {errors.general && <div className="error-banner">{errors.general}</div>}
          
          <form onSubmit={(e) => {e.preventDefault(); state === "Login" ? handleLogin() : handleSignup();}}>
           <div className="loginsignup-fields">
            {state === "Signup" && (
              <div className="field-wrapper">
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  placeholder="Your Name" 
                  onChange={changeHandler} 
                  className={errors.username ? 'error-input' : ''}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>
            )}
            
            <div className="field-wrapper">
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                placeholder="Email Address" 
                onChange={changeHandler}
                className={errors.email ? 'error-input' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            
            <div className="field-wrapper">
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                placeholder="Password (min 8 characters)" 
                onChange={changeHandler}
                className={errors.password ? 'error-input' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            
            {state === "Signup" && (
              <div className="field-wrapper">
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  placeholder="Confirm Password" 
                  onChange={changeHandler}
                  className={errors.confirmPassword ? 'error-input' : ''}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            )}
           </div>
           
           <button type="submit" disabled={loading}>
             {loading ? 'Please wait...' : 'Continue'}
           </button>
           
           <p className='loginsignup-login'>
             {state === "Login" ? "Don't have an account?" : "Already have an account?"} 
             <span onClick={() => {setState(state === "Login" ? "Signup" : "Login"); setErrors({});}}>
               {state === "Login" ? " Signup Here" : " Login Here"}
             </span>
           </p>
           
           {state === "Signup" && 
           <div className="loginsignup-agree">
            <input type="checkbox" name='' id='' required />
            <p>I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span></p>
           </div>}
          </form>
        </div>
    </div>
  )
}
