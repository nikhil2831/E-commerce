import React, { useContext } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { ShopContext } from '../../Context/ShopContext'

export default function RelatedProducts({ currentProduct }) {
  const { all_product } = useContext(ShopContext);
  
  // Get related products based on current product's category
  let relatedProducts = [];
  
  if (currentProduct && currentProduct.category) {
    
    relatedProducts = all_product.filter(item => 
      item.category && 
      item.category.toLowerCase() === currentProduct.category.toLowerCase() &&
      item.id !== currentProduct.id
    );
    
    if (relatedProducts.length < 4) {
      const otherProducts = all_product.filter(item => 
        item.id !== currentProduct.id && 
        !relatedProducts.find(p => p.id === item.id)
      );
      relatedProducts = [...relatedProducts, ...otherProducts];
    }
  } else {
    // Fallback: show first 4 products
    relatedProducts = all_product.slice(0, 4);
  }
  
  // Limit to 4 products
  relatedProducts = relatedProducts.slice(0, 4);

  return (
    <div className='relatedproducts'>
        <h1>Related Products</h1>
        <hr/>
        <div className="relatedproducts-item">
            {relatedProducts.map((item, i) => (
              <Item
                key={item.id || i}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            ))}
        </div>
    </div>
  )
}