import React from 'react'
import "./Navbar.css"
import navlogo from "../../assets/nav-logo.svg";
import navProfile from "../../assets/nav-profile.svg";


const Navbar = ({ adminInfo, onLogout }) => {
  return (
    <div className='navbar'>
        <img src={navlogo} alt="" className="nav-logo" />
        <div className="nav-right">
          {adminInfo && (
            <div className="admin-info">
              <span className="admin-name">{adminInfo.name}</span>
              <span className="admin-email">{adminInfo.email}</span>
            </div>
          )}
          <img src={navProfile} alt="" className="nav-profile" />
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          )}
        </div>
    </div>
  )
}

export default Navbar