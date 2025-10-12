import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import new_collection from '../Assets/new_collections'
import Item from '../Item/Item'

const NewCollections = () => {
  const [new_collections, setNew_collections] = useState(new_collection);

  useEffect(() => {
    console.log("=== NEW COLLECTIONS DEBUG ===");
    console.log("Initial local collections:", new_collection.length);
    
    fetch("http://localhost:4000/newcollections")
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend new collections:", data);
        
        if (data && data.length > 0) {
          // Use backend data
          console.log("Using backend collections:", data.map(item => ({ id: item.id, name: item.name })));
          setNew_collections(data);
        } else {
          // Fallback to local data
          console.log("Using local collections");
          setNew_collections(new_collection);
        }
      })
      .catch((error) => {
        console.error("Error fetching new collections:", error);
        setNew_collections(new_collection);
      });
  }, []);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collections.map((item, i) => {
          console.log("Rendering collection item:", { id: item.id, name: item.name });
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

export default NewCollections