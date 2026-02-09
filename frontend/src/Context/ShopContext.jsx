import React, { createContext, useState, useEffect } from 'react';


export const ShopContext = createContext(null);

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'https://e-commerce-hl6k.onrender.com';

const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 1000; i++) { // Increased range for new products
        cart[i] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [allProducts, setAllProducts] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/allproducts`)
            .then((response) => response.json())
            .then((data) => setAllProducts(data))
    }, [])

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        const savedUser = localStorage.getItem('user-info');
        if (token) {
            setIsLoggedIn(true);
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    setUserInfo(user);
                    setUserRole(user.role);
                } catch (e) {
                    console.error("Error parsing user info:", e);
                }
            }
            // Load cart from backend
            loadCartFromBackend();
        }
    }, []);

    // Load cart from backend
    const loadCartFromBackend = () => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            fetch(`${API_URL}/getcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data && typeof data === 'object') {
                        setCartItems(data);
                    }
                })
                .catch((error) => console.error("Error loading cart:", error));
        }
    };

    // We're using local all_product.js which has proper images from Assets folder
    // No need to fetch from backend and override with broken image URLs

    const addToCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));

        if (localStorage.getItem('auth-token')) {
            fetch(`${API_URL}/addtocart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            })
                .catch((error) => console.error("Error adding to cart:", error));
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
        }));

        if (localStorage.getItem('auth-token')) {
            fetch(`${API_URL}/removefromcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            })
                .catch((error) => console.error("Error removing from cart:", error));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = allProducts.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    useEffect(() => {
        if (localStorage.getItem('auth-token')) {
            setIsLoggedIn(true);
            fetch(`${API_URL}/getcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: "",
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data && typeof data === 'object') {
                        setCartItems(data);
                    }
                })
                .catch((error) => console.error("Error loading cart:", error));
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-info');
        setIsLoggedIn(false);
        setUserInfo(null);
        setUserRole(null);
        setCartItems(getDefaultCart());
        window.location.replace('/login');
    };

    const login = (token, user) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user-info', JSON.stringify(user));
        setIsLoggedIn(true);
        setUserInfo(user);
        setUserRole(user.role);
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product: allProducts,
        cartItems,
        addToCart,
        removeFromCart,
        isLoggedIn,
        userInfo,
        userRole,
        logout,
        login
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;