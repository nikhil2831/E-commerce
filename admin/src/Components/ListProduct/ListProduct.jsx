import React, { useEffect, useState } from 'react'
import "./ListProduct.css"
import cross_icon from "../../assets/cross_icon.png"

const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-hl6k.onrender.com';
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/60x60?text=No+Image";

// Helper function to get proper image URL
const getImageUrl = (image) => {
  if (!image) return PLACEHOLDER_IMAGE;
  if (typeof image === 'object') return image;
  if (image.startsWith('http')) return image;
  return `${API_URL}/images/${image}`;
};

const ListProduct = () => {
  const [allproducts, setAllproducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/allproducts`);
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
    const authToken = localStorage.getItem('auth-token');
    if (!authToken) {
      alert('Admin authentication required. Please login again.');
      window.location.reload();
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/removeproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
        body: JSON.stringify({ id: id })
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

  const updateStock = async (id, newStock) => {
    const stockValue = Number(newStock);
    if (stockValue < 0) return;

    try {
      const authToken = localStorage.getItem('auth-token');
      const response = await fetch(`${API_URL}/product/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
        body: JSON.stringify({ stock: stockValue })
      });

      const data = await response.json();
      if (data.success) {
        console.log("Stock updated");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
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
        <p>Stock</p>
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
                <input
                  type="number"
                  className="listproduct-stock-input"
                  defaultValue={product.stock || 0}
                  onBlur={(e) => updateStock(product.id, e.target.value)}
                />
                <img
                  onClick={() => { remove_product(product.id) }}
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