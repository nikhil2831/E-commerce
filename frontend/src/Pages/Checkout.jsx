import React, { useContext, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Checkout.css';


const API_URL = process.env.REACT_APP_API_URL || 'https://e-commerce-hl6k.onrender.com';

const Checkout = () => {
    const { getTotalCartAmount, all_product, cartItems } = useContext(ShopContext);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalAmount = getTotalCartAmount();

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const placeOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (totalAmount === 0) {
            setError("Your cart is empty");
            setLoading(false);
            return;
        }

        // Prepare products array for backend
        let orderProducts = [];
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    orderProducts.push({
                        productId: itemInfo.id,
                        quantity: cartItems[item]
                    });
                }
            }
        }

        try {
            const response = await fetch(`${API_URL}/order`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: orderProducts,
                    address: formData
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Order Placed Successfully!");
                // Redirect to orders page or home
                // You might want to clear cart in context here if not handled by backend sync
                window.location.replace('/');
            } else {
                setError(data.errors || "Failed to place order");
            }
        } catch (err) {
            console.error("Order error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='checkout'>
            <div className="checkout-container">
                <div className="checkout-left">
                    <h1>Delivery Information</h1>
                    <form onSubmit={placeOrder}>
                        <div className="checkout-fields">
                            <input type="text" name='name' value={formData.name} onChange={changeHandler} placeholder='Full Name' required />
                            <input type="text" name='phone' value={formData.phone} onChange={changeHandler} placeholder='Phone Number' required />
                        </div>
                        <div className="checkout-fields">
                            <input type="text" name='pincode' value={formData.pincode} onChange={changeHandler} placeholder='Pin Code' required />
                            <input type="text" name='city' value={formData.city} onChange={changeHandler} placeholder='City' required />
                        </div>
                        <input type="text" name='address' value={formData.address} onChange={changeHandler} placeholder='Full Address' required className='address-input' />

                        {error && <p className="checkout-error">{error}</p>}

                        <button type='submit' disabled={loading}>
                            {loading ? "Processing..." : "PROCEED TO PAYMENT"}
                        </button>
                    </form>
                </div>

                <div className="checkout-right">
                    <div className="cartitems-total">
                        <h1>Cart Totals</h1>
                        <div>
                            <div className="cartitems-total-item">
                                <p>Subtotal</p>
                                <p>₹{totalAmount}</p>
                            </div>
                            <hr />
                            <div className="cartitems-total-item">
                                <p>Shipping Fee</p>
                                <p>Free</p>
                            </div>
                            <hr />
                            <div className="cartitems-total-item">
                                <h3>Total</h3>
                                <h3>₹{totalAmount}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
