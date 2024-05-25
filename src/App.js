import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import StoresPage from './StoresPage';
import LoginPage from './LoginPage';
import InventoryPage from './InventoryPage';
import TagsPage from './TagsPage';
import CategoriesPage from './CategoryPage';
import { SnackbarProvider } from 'notistack';
import CollectionsPage from './CollectionsPage';
import AnalyticsPage from './Analytics';
import OrdersPage from './OrdersPage';
import VendorPage from './VendorPage';
import TopBar from './TopBar';
import SettingsPage from './SettingsPage'; // Import the SettingsPage component
import ReservationsPage from './ReservationsPage';
import { Box } from '@mui/material';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <TopBar />
        <Box sx={{ display: 'flex', mt: 8 }}>
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/product" element={<ProductsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/tag" element={<TagsPage />} />
            <Route path="/category" element={<CategoriesPage />} />
            <Route path="/collection" element={<CollectionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />

            <Route path="/vendor" element={<VendorPage />} />
            <Route path="/settings" element={<SettingsPage />} /> {/* Add the settings route */}
            {/* Define other routes */}
          </Routes>
        </Box>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
