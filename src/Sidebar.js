import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasketOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOfferOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import EventSeatIcon from '@mui/icons-material/EventSeatOutlined';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const paths = ['/dashboard', '/stores', '/product', '/inventory', '/orders', '/reservations'];
  const icons = [HomeIcon, StorefrontIcon, ShoppingBasketIcon, LocalOfferIcon, AssignmentIcon, EventSeatIcon];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          backgroundColor: '#212121',
          color: '#ffffff',
          borderRadius: '0px 25px 25px 0px',
          paddingTop: '20px',
          paddingBottom: '20px',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 'bold' }}>
          Vendor Portal
        </Typography>
      </Box>
      <Divider sx={{ borderColor: '#424242', marginBottom: '20px' }} />
      <List>
        {['DASHBOARD', 'STORE', 'PRODUCTS', 'INVENTORY', 'ORDERS', 'RESERVATIONS'].map((text, index) => {
          const Icon = icons[index];

          return (
            <ListItem
              button
              key={text}
              onClick={() => handleNavigation(paths[index])}
              sx={{
                borderRadius: '20px',
                marginBottom: '10px',
                backgroundColor: location.pathname === paths[index] ? '#333' : 'transparent',
                '&:hover': {
                  backgroundColor: '#424242',
                  '& .MuiListItemIcon-root': {
                    color: '#4caf50',
                  },
                },
                '&.Mui-selected': {
                  backgroundColor: '#333',
                  '&:hover': {
                    backgroundColor: '#424242',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === paths[index] ? '#4caf50' : 'gray', minWidth: '40px' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 'medium',
                    color: location.pathname === paths[index] ? '#4caf50' : 'white',
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
