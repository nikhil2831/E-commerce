import React, { useContext, useState, useEffect } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dull_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);

  const [mainImg, setMainImg] = useState('');

  useEffect(() => {
    if (product?.image) {
      setMainImg(product.image);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px'
      }}>
        Loading product...
      </div>
    );
  }

  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-thumbnails">
          <img src={product.image} alt="" onClick={() => setMainImg(product.image)} />
          <img src={product.image} alt="" onClick={() => setMainImg(product.image)} />
          <img src={product.image} alt="" onClick={() => setMainImg(product.image)} />
          <img src={product.image} alt="" onClick={() => setMainImg(product.image)} />
        </div>

        <div className="productdisplay-main">
          <img className='productdisplay-main-img' src={mainImg || product.image} alt={product.name} />
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{product.name}</h1>

        <div className="productdisplay-right-star">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>4.0</p>
          <span>(100 reviews)</span>
        </div>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">₹{product.old_price}</div>
          <div className="productdisplay-right-price-new">₹{product.new_price}</div>
        </div>

        <div className="productdisplay-right-stock">
          <p style={{ marginTop: '20px' }}>Availability: <span style={{ color: product.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span></p>
          {product.stock > 0 && <p style={{ marginTop: '5px', fontSize: '14px' }}>Quantity: {product.stock} units</p>}
        </div>

        <div className="productdisplay-right-discription">
          Crafted from premium quality fabric, this product offers unmatched comfort and durability.
          Designed with a modern fit and stylish look, it is perfect for both everyday wear and special occasions.
          Easy to wash and maintain, it keeps you looking sharp and confident all day long.
        </div>

        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>

        <button
          onClick={() => { if (product.stock > 0) addToCart(product.id) }}
          disabled={product.stock <= 0}
          className='productdisplay-right-addtocart'
          style={{ background: product.stock > 0 ? '#ff4141' : '#ccc', cursor: product.stock > 0 ? 'pointer' : 'not-allowed' }}
        >
          {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>

        <p className='productdisplay-right-category'>
          <span>Category :</span> {product.category}
        </p>
        <p className='productdisplay-right-tag'>
          <span>Tags :</span> Fashion, Casual, Summer
        </p>
      </div>
    </div>
  )
}

export default ProductDisplay