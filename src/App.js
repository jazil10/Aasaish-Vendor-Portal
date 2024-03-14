import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import ProductsPage from './ProductsPage';
import StoresPage from './StoresPage';
import LoginPage from './LoginPage';
import InventoryPage from './InventoryPage';

// Import other components

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
          {/* <Route path="/products" element={<ProductsPage />} /> */}
          <Route path="/login" element = {<LoginPage/>}/>
          <Route path="/stores" element = {<StoresPage/>}/>
          <Route path="/product" element = {<ProductsPage/>}/>
          <Route path="/inventory" element = {<InventoryPage/>}/>

          {/* Define other routes */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
