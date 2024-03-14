import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasketOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOfferOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToAppOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';

function Sidebar() {
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
        {['VENDORS', 'PRODUCTS', 'STORE', 'OFFERS', 'LOGOUT'].map((text, index) => (
          <ListItem
            button
            key={text}
            sx={{
              borderRadius: '20px', // More pronounced rounded list items
              marginBottom: '10px',
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
            <ListItemIcon sx={{ color: 'gray', minWidth: '40px' }}>
              {index === 0 && <HomeIcon />}
              {index === 1 && <ShoppingBasketIcon />}
              {index === 2 && <StorefrontIcon />}
              {index === 3 && <LocalOfferIcon />}
              {index === 4 && <ExitToAppIcon />}
            </ListItemIcon>
            <ListItemText primary={text} sx={{ '& .MuiTypography-root': { fontWeight: 'medium' } }} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
