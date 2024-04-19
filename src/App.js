import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import StoresPage from './StoresPage';
import LoginPage from './LoginPage';
import InventoryPage from './InventoryPage';
import TagsPage from './TagsPage';
import CategoriesPage from './CategoryPage';
import { SnackbarProvider } from 'notistack';


// Import other components

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
    <Router>
      <div className="App">
        
        <Routes>
          {/* <Route path="/products" element={<ProductsPage />} /> */}
          <Route path="/login" element = {<LoginPage/>}/>
          <Route path="/stores" element = {<StoresPage/>}/>
          <Route path="/product" element = {<ProductsPage/>}/>
          <Route path="/inventory" element = {<InventoryPage/>}/>
          <Route path="/tag" element = {<TagsPage/>}/>
          <Route path= "/category" element = {<CategoriesPage/>}/>
          {/* Define other routes */}
        </Routes>
      </div>
    </Router>
    </SnackbarProvider>

  );
}

export default App;
