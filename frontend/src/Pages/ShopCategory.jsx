import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/ShopCategory.css';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const { category: categoryFromRoute } = useParams();

  const normalize = (s) => (s ?? '').toString().trim().toLowerCase().replace(/[^a-z]/g, '');
  const isKids = (s) => {
    const n = normalize(s);
    return n === 'kid' || n === 'kids' || n === 'child' || n === 'children';
  };

  const requestedRaw = props.category ?? categoryFromRoute;
  const requested = isKids(requestedRaw) ? 'kids' : normalize(requestedRaw);

  const filteredProducts = all_product.filter((item) => {
    const itemCat = normalize(item.category);
    if (requested === 'kids') return isKids(itemCat);
    return itemCat === requested;
  });

  return (
    <div className="shop-category">
      
      <img
        className="shopcategory-banner"
        src={props.banner}
        alt={props.category || requested}
      />

      <div className="shopcategory-indexSort">
        <p>
          <span> Showing 1-{filteredProducts.length}</span> out of {all_product.length} products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="sort" />
        </div>
      </div>

      <div className="shopcategory-products">
        {filteredProducts.length === 0 ? (
          <p>No products found for this category.</p>
        ) : (
          filteredProducts.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        )}
      </div>

      <div className="shopcategory-loadmore">Explore more</div>
    </div>
  );
};

export default ShopCategory;
