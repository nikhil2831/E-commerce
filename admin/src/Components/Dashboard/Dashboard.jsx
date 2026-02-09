import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-hl6k.onrender.com';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/stats`, {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="dashboard-loading">Loading stats...</div>;

    return (
        <div className="dashboard">
            <h1>Admin Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card revenue">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>

                <div className="stat-card orders">
                    <h3>Total Orders</h3>
                    <p className="stat-value">{stats.totalOrders}</p>
                    <div className="stat-footer">
                        <span className="warning">{stats.pendingOrders} Pending</span>
                    </div>
                </div>

                <div className="stat-card users">
                    <h3>Total Users</h3>
                    <p className="stat-value">{stats.totalUsers}</p>
                </div>

                <div className="stat-card products">
                    <h3>Total Products</h3>
                    <p className="stat-value">{stats.totalProducts}</p>
                </div>
            </div>

            <div className="alerts-section">
                <h2>Stock Alerts</h2>
                <div className="alert-cards">
                    <div className={`alert-card ${stats.outOfStockProducts > 0 ? 'critical' : 'good'}`}>
                        <h3>Out of Stock</h3>
                        <p className="alert-value">{stats.outOfStockProducts}</p>
                        <span>products</span>
                    </div>

                    <div className={`alert-card ${stats.lowStockProducts > 0 ? 'warning' : 'good'}`}>
                        <h3>Low Stock</h3>
                        <p className="alert-value">{stats.lowStockProducts}</p>
                        <span>products</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
