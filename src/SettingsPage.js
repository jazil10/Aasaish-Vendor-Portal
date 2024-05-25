// SettingsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';
import Sidebar from './Sidebar'; // Import the Sidebar component

const SettingsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${BASE_URL}/User/vendorbyid`);
      setEmail(response.data.user.email);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.put(`${BASE_URL}/User/updateUser`, { oldPassword, newPassword });
      enqueueSnackbar("Password updated successfully", { variant: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update password', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', mt: 8 }}>
        <Sidebar /> {/* Add Sidebar here */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Settings
            </Typography>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              disabled
            />
            <TextField
              label="Old Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm New Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handlePasswordChange}
            >
              Update Password
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;
