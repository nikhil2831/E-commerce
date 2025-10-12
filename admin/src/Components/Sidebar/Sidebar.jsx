import React, { useState } from 'react'
import "./Sidebar.css"
import add_product_icon from "../../assets/Product_cart.svg"
import list_product_icon from "../../assets/Product_list_icon.svg"

const Sidebar = ({ setActive }) => {
  return (
    <div className='sidebar'>
      <div className="sidebar-item" onClick={() => setActive('addproduct')} style={{ cursor: 'pointer' }}>
        <img src={add_product_icon} alt="Add Product" />
        <p>Add Product</p>
      </div>
      <div className="sidebar-item" onClick={() => setActive('listproduct')} style={{ cursor: 'pointer' }}>
        <img src={list_product_icon} alt="Product List" />
        <p>Product List</p>
      </div>
    </div>
  )
}

export default Sidebar
