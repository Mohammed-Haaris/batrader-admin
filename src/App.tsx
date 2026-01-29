/** @format */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductList from "./pages/ProductList";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import OrderManagement from "./pages/OrderManagement";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/orders" element={<OrderManagement />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
