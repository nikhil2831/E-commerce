import React, { useState, useEffect } from 'react';
import './ListUser.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-hl6k.onrender.com';

const ListUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div className='list-user'>
            <h1>All Users</h1>
            <div className="list-user-format-main">
                <p>Name</p>
                <p>Email</p>
                <p>Joined Date</p>
                <p>Role</p>
            </div>
            <div className="list-user-allusers">
                {users.map((user, index) => {
                    return (
                        <div key={index} className="list-user-format">
                            <p className="user-name">{user.name}</p>
                            <p>{user.email}</p>
                            <p>{new Date(user.date).toLocaleDateString()}</p>
                            <p className={`role-badge ${user.role}`}>{user.role}</p>
                        </div>
                    )
                })}
            </div>
            {users.length === 0 && <div className="no-users">No users found</div>}
        </div>
    )
}

export default ListUser
