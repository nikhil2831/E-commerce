import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import Breadcrum from '../Components/Breadcrums/Breadcrums';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { all_product } = useContext(ShopContext);

  // Debug logging
  console.log("=== PRODUCT PAGE DEBUG ===");
  console.log("Product ID from URL:", productId);
  console.log("All products count:", all_product.length);
  console.log("All product IDs:", all_product.map(p => p.id));
  console.log("All products:", all_product);

  // Convert productId to number for comparison
  const product = all_product.find((e) => e.id === Number(productId));
  
  console.log("Found product:", product);

  // If product not found, show helpful debug info
  if (!product) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2>Product Not Found</h2>
        <p>Looking for product ID: <strong>{productId}</strong></p>
        <p>Available products: {all_product.length}</p>
        <p>Available IDs: {all_product.map(p => p.id).join(', ')}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Backend Products:</h3>
          {all_product.map(p => (
            <div key={p.id}>ID: {p.id} - {p.name}</div>
          ))}
        </div>
        
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts currentProduct={product} />
    </div>
  );
};

export default Product;