import React from 'react'
import './Item.css'
import { useNavigate } from 'react-router-dom'

const Item = (props) => {
  const navigate = useNavigate();
  
  // Add debug logging to see what ID is being passed
  console.log("Item component - ID:", props.id, "Name:", props.name);

  const handleImageClick = () => {
    console.log("Image clicked - navigating to product ID:", props.id);
    navigate(`/product/${props.id}`);
    window.scrollTo(0,0);
  };

  return (
    <div className="item">
      <img 
        src={props.image} 
        alt={props.name} 
        onClick={handleImageClick}
        style={{ cursor: 'pointer' }}
      />
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-prices-new">₹{props.new_price}</div>
        <div className="item-prices-old">₹{props.old_price}</div>
      </div>
    </div>
  )
}

export default Item