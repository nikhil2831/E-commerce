import React, { useContext, useState, useEffect } from 'react' 
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dull_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  
  // All hooks must be called before any early returns
  const [mainImg, setMainImg] = useState('');

  // Update main image when product changes
  useEffect(() => {
    if (product?.image) {
      setMainImg(product.image);
    }
  }, [product]);

  // Guard against undefined product AFTER all hooks
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

        <div className="productdisplay-right-discription">
          Crafted from premium quality fabric, this product offers unmatched comfort and durability. 
          Designed with a modern fit and stylish look, it is perfect for both everyday wear and special occasions. 
          Easy to wash and maintain, it keeps you looking sharp and confident all day long.
        </div>

        <div className="productdisplay-right-size">
          <h3>Select Size</h3>
          <select>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <button onClick={() => addToCart(product.id)} className='productdisplay-right-addtocart'>🛒 Add to Cart</button>

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