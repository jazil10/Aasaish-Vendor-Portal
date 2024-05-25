import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasketOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOfferOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import EventSeatIcon from '@mui/icons-material/EventSeatOutlined'; // Icon for Reservations

function Sidebar() {
  const navigate = useNavigate(); // Create navigate function
  const location = useLocation(); // Get the current location

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Define paths corresponding to the items
  const paths = ['/dashboard', '/stores', '/product', '/inventory', '/orders', '/reservations'];

  // Define icons corresponding to the items
  const icons = [HomeIcon, StorefrontIcon, ShoppingBasketIcon, LocalOfferIcon, AssignmentIcon, EventSeatIcon];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#212121', // Dark theme background
          color: '#ffffff', // Light text for better contrast
          borderRadius: '0px 25px 25px 0px', // Rounded corners on the right
          paddingTop: '20px', // Top padding
          paddingBottom: '20px', // Bottom padding
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 'bold' }}>
          Vendor Portal
        </Typography>
      </Box>
      <List>
        {['DASHBOARD', 'STORE', 'PRODUCTS', 'INVENTORY', 'ORDERS', 'RESERVATIONS'].map((text, index) => {
          const Icon = icons[index]; // Get the corresponding icon

          return (
            <ListItem
              button
              key={text}
              onClick={() => handleNavigation(paths[index])}
              sx={{
                borderRadius: '20px', // More pronounced rounded list items
                marginBottom: '10px',
                backgroundColor: location.pathname === paths[index] ? '#333' : 'transparent', // Highlight selected item
                '&:hover': {
                  backgroundColor: '#424242', // Darker shade for hover effect
                  '& .MuiListItemIcon-root': {
                    color: '#4caf50', // Highlight icon on hover
                  },
                },
                '&.Mui-selected': {
                  backgroundColor: '#333', // Selection state
                  '&:hover': {
                    backgroundColor: '#424242',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === paths[index] ? '#4caf50' : 'gray', minWidth: '40px' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={text} sx={{ '& .MuiTypography-root': { fontWeight: 'medium', color: location.pathname === paths[index] ? '#4caf50' : 'white' } }} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
