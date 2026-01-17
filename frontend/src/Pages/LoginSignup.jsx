import React, { useState, useContext } from 'react'
import './CSS/LoginSignup.css'
import { ShopContext } from '../Context/ShopContext'

export default function LoginSignup() {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(ShopContext);

  const changeHandler = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const handleLogin = async () => {
    if(!formData.email || !formData.password) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://e-commerce-hl6k.onrender.com/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();

      if (responseData.success) {
        login(responseData.token, responseData.user);
        alert('Login successful!');
        window.location.replace("/");
      } else {
        alert(responseData.errors || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSignup = async () => {
    if(!formData.username || !formData.email || !formData.password) {
      alert('Please fill all fields');
      return;
    }

    if(formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://e-commerce-hl6k.onrender.com/signup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();

      if (responseData.success) {
        login(responseData.token, responseData.user);
        alert('Signup successful!');
        window.location.replace("/");
      } else {
        alert(responseData.errors || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='loginsignup' style={{'--bg-image': `url(${process.env.PUBLIC_URL}/8997264.jpg)`}}>
        <div className="loginsignup-container">
          <h1>{state === "Login" ? "Welcome Back" : "Create Account"}</h1>
          <h2>{state === "Login" ? "Sign in to continue shopping" : "Join us for the best deals"}</h2>
          <form onSubmit={(e) => {e.preventDefault(); state === "Login" ? handleLogin() : handleSignup();}}>
           <div className="loginsignup-fields">
            {state === "Signup" && <input type="text" name="username" value={formData.username} placeholder="Your Name" onChange={changeHandler} required />}
            <input type="email" name="email" value={formData.email} placeholder="Email Address" onChange={changeHandler} required />
            <input type="password" name="password" value={formData.password} placeholder="Password" onChange={changeHandler} required />
           </div>
           <button type="submit" disabled={loading}>
             {loading ? 'Please wait...' : 'Continue'}
           </button>
           <p className='loginsignup-login'>{state === "Login" ? "Don't have an account?" : "Already have an account?"} <span onClick={() => setState(state === "Login" ? "Signup" : "Login")}>{state === "Login" ? " Signup Here" : " Login Here"}</span></p>
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
