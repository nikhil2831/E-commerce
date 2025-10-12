import React, { useState } from 'react'
import './CSS/LoginSignup.css'

export default function LoginSignup() {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const login = async () => {
    console.log("Login Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  }

  const signup = async () => {
    console.log("Signup Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  }

  return (
    <div className='loginsignup'>
        <div className="loginsignup-container">
          <h1>{state}</h1>
          <form onSubmit={(e) => {e.preventDefault(); state === "Login" ? login() : signup();}}>
           <div className="loginsignup-fields">
            {state === "Signup" && <input type="text" name="username" placeholder="Your Name" onChange={changeHandler} />}
            <input type="email" name="email" placeholder="Email Address" onChange={changeHandler} />
            <input type="password" name="password" placeholder="Password" onChange={changeHandler} />
           </div>
           <button type="submit">Continue</button>
           <p className='loginsignup-login'>{state === "Login" ? "Don't have an account?" : "Already have an account?"} <span onClick={() => setState(state === "Login" ? "Signup" : "Login")}>{state === "Login" ? " Signup Here" : " Login Here"}</span></p>
           {state === "Signup" && 
           <div className="loginsignup-agree">
            <input type="checkbox" name='' id=''/>
            <p>I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span></p>
           </div>}
          </form>
        </div>
    </div>
  )
}
