import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import AddProduct from "../../Components/AddProduct/AddProduct";
import ListProduct from "../../Components/ListProduct/ListProduct";
import Dashboard from "../../Components/Dashboard/Dashboard";
import ListOrder from "../../Components/ListOrder/ListOrder";
import ListUser from "../../Components/ListUser/ListUser";
import "./Admin.css";

const Admin = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  return (
    <div className="admin">
      <Sidebar setActive={setActiveComponent} />
      <div className="main-content">
        {activeComponent === 'dashboard' && <Dashboard />}
        {activeComponent === 'addproduct' && <AddProduct />}
        {activeComponent === 'listproduct' && <ListProduct />}
        {activeComponent === 'orders' && <ListOrder />}
        {activeComponent === 'users' && <ListUser />}
      </div>
    </div>
  );
};

export default Admin;
