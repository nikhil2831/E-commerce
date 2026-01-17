import React, { useEffect, useState } from 'react'
import "./ListProduct.css"
import cross_icon from "../../assets/cross_icon.png"

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/60x60?text=No+Image";

// Helper function to get proper image URL
const getImageUrl = (image) => {
  if (!image) return PLACEHOLDER_IMAGE;
  if (typeof image === 'object') return image;
  if (image.startsWith('http')) return image;
  return `http://localhost:4000/images/${image}`;
};

const ListProduct = () => {
  const [allproducts, setAllproducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/allproducts');
      const data = await response.json();
      setAllproducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const remove_product = async (id) => {
    const adminToken = localStorage.getItem('admin-token');
    if (!adminToken) {
      alert('Admin authentication required. Please login again.');
      window.location.reload();
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'admin-token': adminToken,
        },
        body: JSON.stringify({id: id})
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Product removed successfully!');
        await fetchInfo();
      } else {
        alert(data.error || 'Failed to remove product');
      }
    } catch (error) {
      console.error("Error removing product:", error);
      alert('Failed to remove product. Please try again.');
    }
  }

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <React.Fragment key={product.id || index}>
              <div className="listproduct-format-main listproduct-format">
                <img 
                  src={getImageUrl(product.image)} 
                  alt="" 
                  className="listproduct-product-icon"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
                <p>{product.name}</p>
                <p>₹{product.old_price}</p>
                <p>₹{product.new_price}</p>
                <p>{product.category}</p>
                <img 
                  onClick={() => {remove_product(product.id)}} 
                  className='listproduct-remove-icon' 
                  src={cross_icon} 
                  alt="" 
                />
              </div>
              <hr />
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ListProduct