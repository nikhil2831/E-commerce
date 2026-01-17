import React, { useState } from 'react'
import "./AddProduct.css"
import upload_area from "../../assets/upload_area.svg"

const AddProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: "",
    old_price: "",
    new_price: "",
    category: "women",
    image: null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setProductDetails(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const uploadImage = async () => {
    if (!productDetails.image) return "";
    
    const formData = new FormData();
    formData.append('product', productDetails.image);
    
    try {
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData
      });
      
      const responseData = await response.json();
      return responseData.success ? responseData.image_url : "";
    } catch (error) {
      console.error('Image upload failed:', error);
      return "";
    }
  };

  const handleSubmit = async () => {
    if (!productDetails.name || !productDetails.new_price || !productDetails.old_price) {
      alert('Please fill all required fields');
      return;
    }

    const adminToken = localStorage.getItem('admin-token');
    if (!adminToken) {
      alert('Admin authentication required. Please login again.');
      window.location.reload();
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = "";
      if (productDetails.image) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Image upload failed');
          setLoading(false);
          return;
        }
      } else {
        alert('Please select a product image');
        setLoading(false);
        return;
      }

      const product = {
        name: productDetails.name,
        image: imageUrl,
        category: productDetails.category,
        new_price: Number(productDetails.new_price),
        old_price: Number(productDetails.old_price),
      };

      const response = await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'admin-token': adminToken,
        },
        body: JSON.stringify(product)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Product added successfully!');
        setProductDetails({
          name: "",
          old_price: "",
          new_price: "",
          category: "women",
          image: null
        });
      } else {
        alert('Failed to add product: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input 
          type="text" 
          name='name' 
          placeholder='Type here'
          value={productDetails.name}
          onChange={handleChange} 
        />
      </div>
      
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input 
            type="number" 
            name='old_price' 
            placeholder='Type here'
            value={productDetails.old_price}
            onChange={handleChange} 
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input 
            type="number" 
            name='new_price' 
            placeholder='Type here'
            value={productDetails.new_price}
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select 
          name="category" 
          className="add-product-selector"
          value={productDetails.category}
          onChange={handleChange}
        > 
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select> 
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img 
            src={productDetails.image ? URL.createObjectURL(productDetails.image) : upload_area} 
            className='addproduct-thumnail-img' 
            alt="Upload Preview" 
          />
        </label>
        <input 
          type='file' 
          name='image' 
          id='file-input' 
          accept="image/*"
          hidden 
          onChange={handleFileChange}
        /> 
      </div>

      <button 
        className='addproduct-btn' 
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Adding Product...' : 'Add'}
      </button>
    </div>
  )
}

export default AddProduct
