import './Navbar.css'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import React, { useState, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import down_arrow from '../Assets/down-arrow.png'

export const Navbar = () => {
  const [menu, setMenu] = useState("shop")
  const { getTotalCartItems, isLoggedIn, logout } = useContext(ShopContext)
  const menuRef = useRef()

  const dropdown_toggle = (e) => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("nav-menu-visible")
    }
    e.currentTarget.classList.toggle("open")
  }

  const handleLogout = () => {
    if(window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  }

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt="INDRAMART logo" />
        <p>INDRAMART</p>
      </div>

      <img className='nav-dropdown' onClick={dropdown_toggle} src={down_arrow} alt="Toggle menu" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/'>Shop</Link>{menu === "shop" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("mens")}>
          <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/mens'>Men</Link>{menu === "mens" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("womens")}>
          <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/womens'>Women</Link>{menu === "womens" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/kids'>Kids</Link>{menu === "kids" ? <hr /> : null}
        </li>
      </ul>

      <div className="nav-login-cart">
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to='/login'><button>Login</button></Link>
        )}
        <Link to='/cart'><img src={cart_icon} alt="Cart" /></Link>
        <div className="nav-cart-count">{typeof getTotalCartItems === 'function' ? getTotalCartItems() : 0}</div>
      </div>
    </div>
  )
}

export default Navbar
