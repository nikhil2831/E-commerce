import React, { useState, useEffect } from 'react'
import './Popular.css'
import data_product from '../Assets/data'
import Item from '../Item/Item'  

export default function Popular() {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    console.log("=== POPULAR COMPONENT DEBUG ===");
    console.log("Local data_product:", data_product.map(p => ({ id: p.id, name: p.name })));
    
    // Start with local women products as fallback
    let localWomenProducts = data_product.filter(item => {
      if (!item.category) return false;
      const category = item.category.toLowerCase();
      return category.includes('women') || category.includes('woman');
    });

    if (localWomenProducts.length === 0) {
      localWomenProducts = data_product.slice(0, 4);
    }

    console.log("Local women products:", localWomenProducts.map(p => ({ id: p.id, name: p.name })));
    setPopularProducts(localWomenProducts.slice(0, 4));
    
    // Fetch from backend
    fetch("http://localhost:4000/popularinwomen")
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend women products:", data);
        
        if (data && data.length > 0) {
          console.log("Using backend popular products:", data.map(p => ({ id: p.id, name: p.name })));
          setPopularProducts(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching popular products:", error);
      });
  }, []);

  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item, i) => {
          console.log("Rendering popular item:", { id: item.id, name: item.name });
          return (
            <Item 
              key={item.id || i} 
              id={item.id} 
              name={item.name} 
              image={item.image} 
              new_price={item.new_price} 
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  )
}