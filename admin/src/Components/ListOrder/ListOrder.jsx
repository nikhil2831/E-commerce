import React, { useState, useEffect } from 'react';
import './ListOrder.css';
import cross_icon from '../../assets/cross_icon.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-hl6k.onrender.com';

const ListOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/orders`, {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusHandler = async (orderId, field, value) => {
        try {
            const response = await fetch(`${API_URL}/admin/order/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    [field]: value
                })
            });

            const data = await response.json();
            if (data.success) {
                await fetchOrders();
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    return (
        <div className='list-order'>
            <h1>Order List</h1>
            <div className="list-order-format-main">
                <p>Order ID</p>
                <p>User / Address</p>
                <p>Products</p>
                <p>Amount</p>
                <p>Status</p>
                <p>Payment</p>
            </div>
            <div className="list-order-allorders">
                {orders.map((order, index) => {
                    return (
                        <div key={index} className="list-order-format">
                            <div className="order-id">
                                <p>{order.orderId}</p>
                                <div className="order-date">{new Date(order.date).toLocaleDateString()}</div>
                            </div>

                            <div className="order-user-details">
                                <p className="user-name">{order.address?.name}</p>
                                <p>{order.address?.phone}</p>
                                <p className="address-text">
                                    {order.address?.address}, {order.address?.city} - {order.address?.pincode}
                                </p>
                            </div>

                            <div className="order-products">
                                {order.products.map((prod, idx) => (
                                    <div key={idx} className="order-product-item">
                                        <span>{prod.quantity}x {prod.name}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="order-amount">₹{order.totalAmount}</p>

                            <div className="status-select">
                                <select
                                    onChange={(e) => statusHandler(order.orderId, 'orderStatus', e.target.value)}
                                    value={order.orderStatus}
                                    className={`status-${order.orderStatus}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="status-select">
                                <select
                                    onChange={(e) => statusHandler(order.orderId, 'paymentStatus', e.target.value)}
                                    value={order.paymentStatus}
                                    className={`payment-${order.paymentStatus}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    )
                })}
            </div>
            {orders.length === 0 && <div className="no-orders">No orders found</div>}
        </div>
    )
}

export default ListOrder
