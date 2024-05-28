import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import StoresPage from './StoresPage';
import LoginPage from './LoginPage';
import InventoryPage from './InventoryPage';
import TagsPage from './TagsPage';
import CategoriesPage from './CategoryPage';
import { SnackbarProvider } from 'notistack';
import CollectionsPage from './CollectionsPage';
import OrdersPage from './OrdersPage';
import VendorPage from './VendorPage';
import TopBar from './TopBar';
import SettingsPage from './SettingsPage'; // Import the SettingsPage component
import ReservationsPage from './ReservationsPage';
import DashboardPage from './dashboard';
import { Box } from '@mui/material';

const App = () => {
  const location = useLocation();

  return (
    <SnackbarProvider maxSnack={3}>
      <Box sx={{ display: 'flex', mt: location.pathname !== '/login' ? 8 : 0 }}>
        {location.pathname !== '/login' && <TopBar />}
        <Routes>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/product" element={<ProductsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/tag" element={<TagsPage />} />
          <Route path="/category" element={<CategoriesPage />} />
          <Route path="/collection" element={<CollectionsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/vendor" element={<VendorPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} /> {/* Add the settings route */}
          {/* Define other routes */}
        </Routes>
      </Box>
    </SnackbarProvider>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
