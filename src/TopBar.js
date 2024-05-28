import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Typography, Box, Avatar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { BASE_URL } from './config';

const TopBar = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${BASE_URL}/User/vendorbyid`);
      setVendorDetails(response.data);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: 'black' }}>
              Vendor Portal
            </Typography>
          </Box>
          {vendorDetails && vendorDetails.user && (
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ color: 'black' }}
            >
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#00796b', color: 'white', fontSize: '24px' }}>
                {getInitial(vendorDetails.user.username)}
              </Avatar>
            </IconButton>
          )}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              style: {
                padding: '10px',
                minWidth: '200px',
              },
            }}
          >
            {vendorDetails && vendorDetails.user && (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar alt={vendorDetails.user.username} src="/broken-image.jpg" />
                  <Typography variant="body1" sx={{ ml: 1, color: '#00796b', fontWeight: 'bold' }}>
                    {vendorDetails.user.username}
                  </Typography>
                </Box>
              </MenuItem>
            )}
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ marginRight: 1, color: 'black' }} />
              <Typography variant="body1" sx={{ color: 'black' }}>
                Settings
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ marginRight: 1, color: 'black' }} />
              <Typography variant="body1" sx={{ color: 'black' }}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 8 }} /> {/* This Box adds margin-top to the main content to avoid overlap */}
    </>
  );
};

export default TopBar;
