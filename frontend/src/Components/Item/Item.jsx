import React from 'react'
import './Item.css'
import { useNavigate } from 'react-router-dom'

const Item = (props) => {
  const navigate = useNavigate();

  const handleImageClick = () => {
    navigate(`/product/${props.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="item" onClick={handleImageClick}>
      <img 
        src={props.image} 
        alt={props.name || 'Product'}
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