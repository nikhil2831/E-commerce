import React, { createContext, useState, useEffect } from 'react';
import all_product from "../Components/Assets/all_product";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for(let i = 0; i < 1000; i++){ // Increased range for new products
        cart[i] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    const [allProducts, setAllProducts] = useState(all_product);
    const [cartItems, setCartItems] = useState(getDefaultCart());

   useEffect(() => {
    console.log("=== SHOP CONTEXT LOADING ===");
    
    fetch("http://localhost:4000/allproducts")
        .then((response) => response.json())
        .then((backendProducts) => {
            console.log("Backend products received:", backendProducts);
            
            if (backendProducts && Array.isArray(backendProducts)) {
                setAllProducts(backendProducts); // Use ONLY backend products
                console.log("Set products to:", backendProducts.map(p => ({ id: p.id, name: p.name })));
            }
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
        });
}, []);
    
    const addToCart = (itemId) => {
        console.log("Adding to cart - Item ID:", itemId);
        setCartItems((prev) => ({ 
            ...prev, 
            [itemId]: (prev[itemId] || 0) + 1 
        }));
        
        if(localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/addtocart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"itemId": itemId}),
            })
            .catch((error) => console.error("Error adding to cart:", error));
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ 
            ...prev, 
            [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
        }));

        if(localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"itemId": itemId}),
            })
            .catch((error) => console.error("Error removing from cart:", error));
        }
    }

    const getTotalCartAmount = () => { 
        let totalAmount = 0;
        for(const item in cartItems){
            if(cartItems[item] > 0) {
                let itemInfo = allProducts.find((product) => product.id === Number(item));
                if(itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => { 
        let totalItem = 0;
        for(const item in cartItems){
            if(cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    useEffect(() => {
        if(localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/getcart', {
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
                if(data && typeof data === 'object') {
                    setCartItems(data);
                }
            })
            .catch((error) => console.error("Error loading cart:", error));
        }
    }, []);

    const contextValue = {
        getTotalCartItems, 
        getTotalCartAmount,
        all_product: allProducts,
        cartItems, 
        addToCart, 
        removeFromCart 
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;