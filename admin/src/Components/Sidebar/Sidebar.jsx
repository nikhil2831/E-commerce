import React from 'react'
import "./Sidebar.css"
import add_product_icon from "../../assets/Product_Cart.svg"
import list_product_icon from "../../assets/Product_list_icon.svg"
import user_icon from "../../assets/nav-profile.svg" // Using nav-profile for users
import order_icon from "../../assets/cart_icon.png"   // Using cart_icon for orders

const Sidebar = ({ setActive }) => {
  return (
    <div className='sidebar'>
      <div className="sidebar-item" onClick={() => setActive('dashboard')} style={{ cursor: 'pointer' }}>
        <img src={list_product_icon} alt="Dashboard" style={{ transform: 'rotate(90deg)' }} />
        <p>Dashboard</p>
      </div>
      <div className="sidebar-item" onClick={() => setActive('addproduct')} style={{ cursor: 'pointer' }}>
        <img src={add_product_icon} alt="Add Product" />
        <p>Add Product</p>
      </div>
      <div className="sidebar-item" onClick={() => setActive('listproduct')} style={{ cursor: 'pointer' }}>
        <img src={list_product_icon} alt="Product List" />
        <p>Product List</p>
      </div>
      <div className="sidebar-item" onClick={() => setActive('orders')} style={{ cursor: 'pointer' }}>
        <img src={order_icon} alt="Orders" style={{ width: '25px' }} />
        <p>Orders</p>
      </div>
      <div className="sidebar-item" onClick={() => setActive('users')} style={{ cursor: 'pointer' }}>
        <img src={user_icon} alt="Users" style={{ width: '25px' }} />
        <p>Users</p>
      </div>
    </div>
  )
}

export default Sidebar
