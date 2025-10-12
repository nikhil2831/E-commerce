import React, { useContext } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';

const CartItems = () => {
  const { all_product, cartItems, removeFromCart } = useContext(ShopContext);

  const subtotal = all_product.reduce((acc, product) => {
    return acc + (cartItems[product.id] > 0 ? product.new_price * cartItems[product.id] : 0);
  }, 0);

  const shipping = 50; 
  const total = subtotal + shipping;

  const productsInCart = all_product.filter((product) => cartItems[product.id] > 0);

  return (
    <div className='cartitems'>
      <div className="cartItems-format-main">
        <p>Product</p>
        <p>Name</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>

      {productsInCart.map((e) => (
        <div key={e.id} className="cartitems-format">
          <img src={e.image} alt={e.name} className='carticon-product-icon' />
          <p>{e.name}</p>
          <p>₹{e.new_price}</p>
          <button className='cartitems-quantity'>{cartItems[e.id]}</button>
          <p>₹{e.new_price * cartItems[e.id]}</p>
          <img
            src={remove_icon}
            onClick={() => removeFromCart(e.id)}
            alt="Remove from cart"
          />
        </div>
      ))}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Total:</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping</p>
              <p>₹{shipping}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h2>Total</h2>
              <h2>₹{total}</h2>
            </div>
            <button className='cartitems-checkout-btn'>Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
