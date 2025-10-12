import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import AddProduct from "../../Components/AddProduct/AddProduct";
import ListProduct from "../../Components/ListProduct/ListProduct";
import "./Admin.css";

const Admin = () => {
  const [activeComponent, setActiveComponent] = useState('addproduct');

  return (
    <div className="admin">
      <Sidebar setActive={setActiveComponent} />
      <div className="main-content">
        {activeComponent === 'addproduct' && <AddProduct />}
        {activeComponent === 'listproduct' && <ListProduct />}
      </div>
    </div>
  );
};

export default Admin;
